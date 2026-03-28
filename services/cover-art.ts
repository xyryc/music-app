import { Track } from "@/types/track";
import {
  documentDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";

export interface CoverArtResult {
  id: string;
  url: string;
  width: number;
  height: number;
  comment?: string;
  front: boolean;
  back: boolean;
  type: string[];
}

export interface CoverArtSearchResult {
  releaseId: string;
  artist: string;
  title: string;
  images: CoverArtResult[];
}

interface ITunesTrackResult {
  trackId?: number;
  collectionId?: number;
  artistName?: string;
  trackName?: string;
  collectionName?: string;
  artworkUrl100?: string;
}

interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesTrackResult[];
}

export class CoverArtService {
  private static instance: CoverArtService;

  static getInstance(): CoverArtService {
    if (!CoverArtService.instance) {
      CoverArtService.instance = new CoverArtService();
    }
    return CoverArtService.instance;
  }

  async searchCoverArt(track: Track): Promise<CoverArtSearchResult | null> {
    try {
      const images = await this.searchITunesCoverArt(track);
      if (images.length === 0) {
        return null;
      }

      return {
        releaseId: track.id,
        artist: track.artist || "Unknown Artist",
        title: track.title,
        images,
      };
    } catch (error) {
      console.error("Cover art search failed:", error);
      return null;
    }
  }

  private async searchITunesCoverArt(track: Track): Promise<CoverArtResult[]> {
    const artist = track.artist?.trim();
    const title = track.title.trim();
    const searchTerm = artist ? `${artist} ${title}` : title;

    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=12`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data = (await response.json()) as ITunesSearchResponse;

    if (!data.results?.length) {
      return [];
    }

    const uniqueUrls = new Set<string>();

    return data.results
      .filter((item) => item.artworkUrl100)
      .map((item, index) => {
        const url100 = item.artworkUrl100 as string;
        const highResUrl = this.upgradeArtworkUrl(url100);
        const dimensions = this.extractArtworkSize(highResUrl);
        return {
          id: String(item.trackId || item.collectionId || index),
          url: highResUrl,
          width: dimensions.width,
          height: dimensions.height,
          comment: item.collectionName || "",
          front: true,
          back: false,
          type: ["Front"],
        };
      })
      .filter((item) => {
        if (uniqueUrls.has(item.url)) {
          return false;
        }
        uniqueUrls.add(item.url);
        return true;
      });
  }

  private upgradeArtworkUrl(url: string): string {
    return url
      .replace(/100x100bb/g, "1200x1200bb")
      .replace(/100x100-75\.jpg/g, "1200x1200-75.jpg");
  }

  private extractArtworkSize(url: string): { width: number; height: number } {
    const match = url.match(/\/(\d+)x(\d+)(?:bb|-75\.jpg)/);
    if (!match) {
      return { width: 1200, height: 1200 };
    }

    return {
      width: Number(match[1]),
      height: Number(match[2]),
    };
  }

  async downloadCoverArt(url: string, track: Track): Promise<string | null> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const filename = `${encodeURIComponent(track.artist || "unknown")}_${encodeURIComponent(track.title)}_cover.jpg`;

      if (!documentDirectory) {
        console.error("FileSystem documentDirectory not available");
        return null;
      }

      const localPath = `${documentDirectory}${filename}`;
      await writeAsStringAsync(localPath, base64);

      return localPath;
    } catch (error) {
      console.error("Failed to download cover art:", error);
      return null;
    }
  }

  async hasCoverArt(track: Track): Promise<boolean> {
    const result = await this.searchCoverArt(track);
    return result !== null && result.images.length > 0;
  }
}
