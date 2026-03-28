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

export class CoverArtService {
  private static instance: CoverArtService;

  static getInstance(): CoverArtService {
    if (!CoverArtService.instance) {
      CoverArtService.instance = new CoverArtService();
    }
    return CoverArtService.instance;
  }

  /**
   * Search for cover art using MusicBrainz and Cover Art Archive
   */
  async searchCoverArt(track: Track): Promise<CoverArtSearchResult | null> {
    try {
      // Step 1: Search MusicBrainz for the release
      const releaseId = await this.findReleaseId(track);
      if (!releaseId) {
        return null;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Get cover art from Cover Art Archive
      const coverArt = await this.getCoverArtFromArchive(releaseId);
      if (!coverArt || coverArt.images.length === 0) {
        return null;
      }

      return {
        releaseId,
        artist: track.artist || "Unknown Artist",
        title: track.title,
        images: coverArt.images
      };
    } catch (error) {
      console.error("Cover art search failed:", error);
      return null;
    }
  }

  /**
   * Find the release ID from MusicBrainz
   */
  private async findReleaseId(track: Track): Promise<string | null> {
    try {
      console.log('Searching MusicBrainz for:', track.artist, '-', track.title);

      const response = await fetch(
        `https://musicbrainz.org/ws/2/release?artist=${encodeURIComponent(track.artist || "")}&title=${encodeURIComponent(track.title)}&fmt=json`,
        {
          headers: {
            'User-Agent': 'QwenMusicPlayer/1.0 (https://github.com/example/qwen-music-player; contact@example.com)',
            'Accept': 'application/json'
          }
        }
      );

      console.log('MusicBrainz response status:', response.status);

      if (!response.ok) {
        if (response.status === 403) {
          console.warn('MusicBrainz rate limit reached, using fallback');
          return null;
        }
        throw new Error(`MusicBrainz API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.releases && data.releases.length > 0) {
        // Return the first (most relevant) release
        return data.releases[0].id;
      }

      return null;
    } catch (error) {
      console.error("Failed to search MusicBrainz:", error);
      return null;
    }
  }

  /**
   * Get cover art from Cover Art Archive
   */
  private async getCoverArtFromArchive(releaseId: string): Promise<{ images: CoverArtResult[] } | null> {
    try {
      const response = await fetch(`https://coverartarchive.org/release/${releaseId}`);

      if (!response.ok) {
        // Cover art not found
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Cover Art Archive API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.images && data.images.length > 0) {
        // Process and filter cover art images
        const processedImages = data.images
          .filter((image: any) => image.image) // Only include images with URLs
          .map((image: any) => ({
            id: image.id,
            url: image.image,
            width: image.width || 0,
            height: image.height || 0,
            comment: image.comment || "",
            front: image.front || false,
            back: image.back || false,
            type: image.types || []
          }))
          .sort((a: CoverArtResult, b: CoverArtResult) => {
            // Sort by size (largest first)
            const sizeA = a.width * a.height;
            const sizeB = b.width * b.height;
            return sizeB - sizeA;
          });

        return { images: processedImages };
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch cover art:", error);
      return null;
    }
  }

  /**
   * Download and cache a cover art image locally
   */
  async downloadCoverArt(url: string, track: Track): Promise<string | null> {
    try {
      // Download the image as base64
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Create a filename based on track info
      const filename = `${encodeURIComponent(track.artist || "unknown")}_${encodeURIComponent(track.title)}_cover.jpg`;

      // Use the correct FileSystem API
      if (!documentDirectory) {
        console.error("FileSystem documentDirectory not available");
        return null;
      }

      const localPath = `${documentDirectory}${filename}`;

      // Save to local storage using correct API
      await writeAsStringAsync(localPath, base64);

      return localPath;
    } catch (error) {
      console.error("Failed to download cover art:", error);
      return null;
    }
  }

  /**
   * Check if cover art is available for a track
   */
  async hasCoverArt(track: Track): Promise<boolean> {
    const result = await this.searchCoverArt(track);
    return result !== null && result.images.length > 0;
  }
}