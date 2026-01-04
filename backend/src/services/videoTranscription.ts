// src/services/videoTranscriptionService.ts
import { AssemblyAI } from "assemblyai";
import axios from "axios";

const client = new AssemblyAI({
   apiKey: process.env.ASSEMBLYAI_API_KEY || "",
});

interface TranscriptionResult {
   text: string;
   confidence: number;
   words?: Array<{
      text: string;
      start: number;
      end: number;
      confidence: number;
   }>;
}

/**
 * IMPORTANT: AssemblyAI Free Tier Limitations
 * - ✅ Works with: Direct video URLs (.mp4, .webm, etc.) from S3, Cloudflare, any CDN
 * - ❌ Does NOT work with: YouTube, Vimeo (requires downloading first)
 *
 * SOLUTION 1: Ask candidates to upload videos directly to your storage
 * SOLUTION 2: Use YouTube Data API + Whisper for YouTube videos
 */
export const transcribeVideo = async (
   videoUrl: string
): Promise<TranscriptionResult> => {
   try {
      console.log("Starting transcription for:", videoUrl);

      // Check if it's a YouTube or Vimeo URL
      if (isYouTubeUrl(videoUrl) || isVimeoUrl(videoUrl)) {
         console.log(
            "⚠️  YouTube/Vimeo detected. Using fallback transcription..."
         );
         // For now, return mock data or skip transcription
         // In production, you'd download the video first
         return {
            text: "Video transcription skipped for YouTube/Vimeo. Candidate uploaded video link.",
            confidence: 0,
         };
      }

      // For direct video URLs (Cloudinary, S3, etc.)
      const transcript = await client.transcripts.transcribe({
         audio: videoUrl,
         language_code: "en",
      });

      if (transcript.status === "error") {
         throw new Error(`Transcription failed: ${transcript.error}`);
      }

      return {
         text: transcript.text || "",
         confidence: transcript.confidence || 0,
         words: transcript.words || [],
      };
   } catch (error: any) {
      console.error("Transcription Error:", error);

      // If it fails, continue without transcript rather than blocking evaluation
      return {
         text: "Transcription unavailable. Video was provided but could not be processed.",
         confidence: 0,
      };
   }
};

/**
 * Check if URL is YouTube
 */
const isYouTubeUrl = (url: string): boolean => {
   return url.includes("youtube.com") || url.includes("youtu.be");
};

/**
 * Check if URL is Vimeo
 */
const isVimeoUrl = (url: string): boolean => {
   return url.includes("vimeo.com");
};

/**
 * RECOMMENDED: Check if URL is a direct video file
 * This is what AssemblyAI can transcribe
 */
export const isDirectVideoUrl = (url: string): boolean => {
   const videoExtensions = [
      ".mp4",
      ".webm",
      ".mov",
      ".avi",
      ".mkv",
      ".m4a",
      ".wav",
   ];
   const urlLower = url.toLowerCase();

   return (
      videoExtensions.some((ext) => urlLower.includes(ext)) ||
      urlLower.includes("cloudinary.com") ||
      urlLower.includes("s3.amazonaws.com") ||
      urlLower.includes("cloudflare")
   );
};

/**
 * ALTERNATIVE: Use OpenAI Whisper for YouTube videos
 * This requires downloading the video first using youtube-dl or similar
 */
export const transcribeWithWhisper = async (
   audioFilePath: string
): Promise<TranscriptionResult> => {
   try {
      const OpenAI = require("openai");
      const openai = new OpenAI({
         apiKey: process.env.OPENAI_API_KEY,
      });

      const fs = require("fs");

      const transcription = await openai.audio.transcriptions.create({
         file: fs.createReadStream(audioFilePath),
         model: "whisper-1",
         language: "en",
      });

      return {
         text: transcription.text,
         confidence: 0.95,
      };
   } catch (error) {
      console.error("Whisper Error:", error);
      throw new Error("Failed to transcribe with Whisper");
   }
};

/**
 * BEST SOLUTION: Get YouTube video info without transcribing
 * This way you still validate the video exists
 */
export const validateYouTubeVideo = async (
   url: string
): Promise<{ valid: boolean; title?: string; duration?: number }> => {
   try {
      const videoId = extractYouTubeId(url);
      if (!videoId) return { valid: false };

      // Use YouTube oEmbed API (no API key needed!)
      const response = await axios.get(
         `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      return {
         valid: true,
         title: response.data.title,
      };
   } catch (error) {
      return { valid: false };
   }
};

/**
 * Extract YouTube video ID from URL
 */
const extractYouTubeId = (url: string): string | null => {
   const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
   ];

   for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
   }

   return null;
};

/**
 * Analyze video sentiment (only works with direct URLs)
 */
export const analyzeVideoSentiment = async (
   videoUrl: string
): Promise<{
   sentiment: "positive" | "neutral" | "negative";
   sentimentScore: number;
}> => {
   try {
      // Skip for YouTube/Vimeo
      if (isYouTubeUrl(videoUrl) || isVimeoUrl(videoUrl)) {
         return { sentiment: "neutral", sentimentScore: 0.5 };
      }

      const transcript = await client.transcripts.transcribe({
         audio: videoUrl,
         sentiment_analysis: true,
      });

      if (transcript.status === "error") {
         throw new Error(`Sentiment analysis failed: ${transcript.error}`);
      }

      const sentimentResults = transcript.sentiment_analysis_results || [];

      if (sentimentResults.length === 0) {
         return { sentiment: "neutral", sentimentScore: 0.5 };
      }

      const avgConfidence =
         sentimentResults.reduce((sum, result) => {
            return sum + (result.confidence || 0);
         }, 0) / sentimentResults.length;

      const dominantSentiment = sentimentResults[0].sentiment || "NEUTRAL";

      return {
         sentiment: dominantSentiment.toLowerCase() as
            | "positive"
            | "neutral"
            | "negative",
         sentimentScore: avgConfidence,
      };
   } catch (error) {
      console.error("Sentiment Analysis Error:", error);
      return { sentiment: "neutral", sentimentScore: 0.5 };
   }
};
