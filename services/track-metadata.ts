export interface ParsedTrackMetadata {
  title?: string;
  artist?: string;
  album?: string;
}

export const parseFilenameMetadata = (name: string): ParsedTrackMetadata => {
  const cleanedName = name
    .replace(/\.[^/.]+$/, "")
    .replace(/[_]+/g, " ")
    .trim();

  const separatorIndex = cleanedName.indexOf(" - ");

  if (separatorIndex === -1) {
    return { title: cleanedName || undefined };
  }

  const artist = cleanedName.slice(0, separatorIndex).trim();
  const title = cleanedName.slice(separatorIndex + 3).trim();

  return {
    title: title || undefined,
    artist: artist || undefined,
  };
};
