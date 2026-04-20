const path = require('path');
const Jimp = require('jimp-compact');

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function toHexByte(value) {
  return clampByte(value).toString(16).padStart(2, '0');
}

async function main() {
  const repoRoot = path.join(__dirname, '..');
  const inputPath = path.join(repoRoot, 'assets', 'images', 'app-icon.png');

  const outForeground = path.join(
    repoRoot,
    'assets',
    'images',
    'android-adaptive-foreground.png'
  );
  const outMonochrome = path.join(
    repoRoot,
    'assets',
    'images',
    'android-adaptive-monochrome.png'
  );
  const outSplash = path.join(repoRoot, 'assets', 'images', 'splash-icon.png');
  const outNotification = path.join(
    repoRoot,
    'assets',
    'images',
    'notification_icon.png'
  );

  const canvasSize = 1024;
  const safeScale = 0.66;
  const alphaLow = 18;
  const alphaHigh = 78;
  const alphaKeepThreshold = 10;

  const source = await Jimp.read(inputPath);
  source.contain(canvasSize, canvasSize, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

  const width = source.bitmap.width;
  const height = source.bitmap.height;

  // Estimate a reasonable background color from corners.
  const sampleSize = 40;
  const corners = [
    { x: 0, y: 0 },
    { x: width - sampleSize, y: 0 },
    { x: 0, y: height - sampleSize },
    { x: width - sampleSize, y: height - sampleSize },
  ];
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  let bgCount = 0;
  for (const { x, y } of corners) {
    for (let yy = y; yy < y + sampleSize; yy++) {
      for (let xx = x; xx < x + sampleSize; xx++) {
        const { r, g, b } = Jimp.intToRGBA(source.getPixelColor(xx, yy));
        bgR += r;
        bgG += g;
        bgB += b;
        bgCount++;
      }
    }
  }
  bgR /= bgCount;
  bgG /= bgCount;
  bgB /= bgCount;
  const backgroundColor = `#${toHexByte(bgR)}${toHexByte(bgG)}${toHexByte(bgB)}`;

  const extracted = source.clone();
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  extracted.scan(0, 0, width, height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max - min;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    let alpha = ((luma - alphaLow) / (alphaHigh - alphaLow)) * 255;
    // Keep saturated logo pixels even if the luma threshold is aggressive.
    if (saturation > 20 && luma > alphaLow) {
      alpha = Math.max(alpha, (saturation - 20) * 10);
    }

    alpha = clampByte(alpha);
    this.bitmap.data[idx + 3] = alpha;

    if (alpha > alphaKeepThreshold) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  });

  if (minX >= maxX || minY >= maxY) {
    throw new Error('Failed to extract a non-empty foreground from app-icon.png');
  }

  const margin = 6;
  minX = Math.max(0, minX - margin);
  minY = Math.max(0, minY - margin);
  maxX = Math.min(width - 1, maxX + margin);
  maxY = Math.min(height - 1, maxY + margin);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const cropped = extracted.clone().crop(minX, minY, cropW, cropH);

  // Splash icon: extracted logo, centered on transparent 1024x1024.
  {
    const splashMax = Math.round(canvasSize * 0.5);
    const splashScale = splashMax / Math.max(cropW, cropH);
    const splashW = Math.max(1, Math.round(cropW * splashScale));
    const splashH = Math.max(1, Math.round(cropH * splashScale));
    const splashLogo = cropped.clone().resize(splashW, splashH, Jimp.RESIZE_BICUBIC);
    const splashCanvas = new Jimp(canvasSize, canvasSize, 0x00000000);
    splashCanvas.composite(
      splashLogo,
      Math.round((canvasSize - splashW) / 2),
      Math.round((canvasSize - splashH) / 2)
    );
    await splashCanvas.writeAsync(outSplash);
  }

  const targetMax = Math.round(canvasSize * safeScale);
  const scale = targetMax / Math.max(cropW, cropH);
  const outW = Math.max(1, Math.round(cropW * scale));
  const outH = Math.max(1, Math.round(cropH * scale));
  cropped.resize(outW, outH, Jimp.RESIZE_BICUBIC);

  const canvas = new Jimp(canvasSize, canvasSize, 0x00000000);
  const offsetX = Math.round((canvasSize - outW) / 2);
  const offsetY = Math.round((canvasSize - outH) / 2);
  canvas.composite(cropped, offsetX, offsetY);

  await canvas.writeAsync(outForeground);

  const mono = canvas.clone();
  mono.scan(0, 0, canvasSize, canvasSize, function (_x, _y, idx) {
    const a = this.bitmap.data[idx + 3];
    if (a === 0) return;
    this.bitmap.data[idx + 0] = 255;
    this.bitmap.data[idx + 1] = 255;
    this.bitmap.data[idx + 2] = 255;
  });
  await mono.writeAsync(outMonochrome);

  // Generate a small, padded notification icon (transparent bg, white glyph).
  let nMinX = canvasSize;
  let nMinY = canvasSize;
  let nMaxX = 0;
  let nMaxY = 0;
  mono.scan(0, 0, canvasSize, canvasSize, function (x, y, idx) {
    const a = this.bitmap.data[idx + 3];
    if (a > alphaKeepThreshold) {
      if (x < nMinX) nMinX = x;
      if (y < nMinY) nMinY = y;
      if (x > nMaxX) nMaxX = x;
      if (y > nMaxY) nMaxY = y;
    }
  });
  if (nMinX < nMaxX && nMinY < nMaxY) {
    const iconCrop = mono
      .clone()
      .crop(nMinX, nMinY, nMaxX - nMinX + 1, nMaxY - nMinY + 1);

    const notificationSize = 96;
    const glyphMax = 64;
    const glyphScale = glyphMax / Math.max(iconCrop.bitmap.width, iconCrop.bitmap.height);
    iconCrop.resize(
      Math.max(1, Math.round(iconCrop.bitmap.width * glyphScale)),
      Math.max(1, Math.round(iconCrop.bitmap.height * glyphScale)),
      Jimp.RESIZE_BICUBIC
    );

    const notificationCanvas = new Jimp(notificationSize, notificationSize, 0x00000000);
    notificationCanvas.composite(
      iconCrop,
      Math.round((notificationSize - iconCrop.bitmap.width) / 2),
      Math.round((notificationSize - iconCrop.bitmap.height) / 2)
    );
    await notificationCanvas.writeAsync(outNotification);
  } else {
    throw new Error('Failed to generate notification icon from monochrome image');
  }

  process.stdout.write(
    JSON.stringify(
      {
        input: path.relative(repoRoot, inputPath),
        foreground: path.relative(repoRoot, outForeground),
        monochrome: path.relative(repoRoot, outMonochrome),
        splash: path.relative(repoRoot, outSplash),
        notification: path.relative(repoRoot, outNotification),
        backgroundColor,
      },
      null,
      2
    ) + '\n'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
