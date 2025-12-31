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
 * YES! AssemblyAI can transcribe YouTube and Vimeo videos directly!
 * Just pass the URL - no need to download the video first.
 *
 * @param videoUrl - Can be:
 *  - YouTube URL: https://www.youtube.com/watch?v=xxxxx OR https://youtu.be/xxxxx
 *  - Vimeo URL: https://vimeo.com/xxxxx
 *  - Direct video URL: https://your-s3-bucket.com/video.mp4
 *  - Any publicly accessible video URL
 */
export const transcribeVideo = async (
   videoUrl: string
): Promise<TranscriptionResult> => {
   try {
      console.log("Starting transcription for:", videoUrl);

      let processedUrl = videoUrl;

      // Convert YouTube shortened URLs to full URLs for better consistency, though AssemblyAI often handles both
      if (videoUrl.includes("youtu.be/")) {
         const videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0];
         if (videoId) {
            processedUrl = `https://www.youtube.com/watch?v=${videoId}`;
            console.log("Converted shortened URL to:", processedUrl);
         }
      }

      // Basic check for common non-video file types that might cause issues
      // This is a heuristic and not foolproof, but can catch obvious errors
      const contentType = await getUrlContentType(processedUrl);
      if (contentType && contentType.includes("text/html")) {
         throw new Error(
            "Provided URL appears to be an HTML page, not a direct video or audio file. Please provide a direct video link (e.g., .mp4, YouTube, Vimeo)."
         );
      }

      // AssemblyAI automatically handles YouTube/Vimeo/direct URLs
      const transcript = await client.transcripts.transcribe({
         audio: processedUrl, // Works with YouTube, Vimeo, S3, Cloudflare, etc.
         language_code: "en",
         // Optional: Auto-detect language
         // language_detection: true,
      });

      if (transcript.status === "error") {
         throw new Error(`Transcription failed: ${transcript.error}`);
      }

      return {
         text: transcript.text || "",
         confidence: transcript.confidence || 0,
         words: transcript.words || [],
      };
   } catch (error) {
      console.error("Transcription Error:", error);
      // Re-throw specific error message if it's from our content type check
      if (error instanceof Error && error.message.includes("HTML page")) {
         throw error;
      }
      throw new Error("Failed to transcribe video");
   }
};

/**
 * Helper to get content type of a URL without downloading full content
 */
const getUrlContentType = async (url: string): Promise<string | null> => {
   try {
      const response = await axios.head(url);
      return response.headers["content-type"] || null;
   } catch (error) {
      console.warn(`Could not determine content type for ${url}:`, error);
      return null;
   }
};

/**
 * Alternative: Use FREE Whisper API from OpenAI
 * Note: Requires downloading video first, then converting to audio
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
         confidence: 0.95, // Whisper doesn't provide confidence
      };
   } catch (error) {
      console.error("Whisper Error:", error);
      throw new Error("Failed to transcribe with Whisper");
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
 * Extract Vimeo video ID from URL
 */
const extractVimeoId = (url: string): string | null => {
   const match = url.match(/vimeo\.com\/(\d+)/);
   return match ? match[1] : null;
};

/**
 * Check if URL is a supported video platform
 */
export const isSupportedVideoUrl = (url: string): boolean => {
   return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      url.includes(".mp4") ||
      url.includes(".webm") ||
      url.includes(".mov") ||
      url.includes("s3.amazonaws.com") ||
      url.includes("cloudflare")
   );
};

/**
 * Get video metadata (duration, title)
 * Useful for validation before transcription
 */
export const getVideoMetadata = async (
   url: string
): Promise<{ duration?: number; title?: string }> => {
   try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
         const videoId = extractYouTubeId(url);
         if (!videoId) throw new Error("Invalid YouTube URL");

         // Use YouTube Data API (optional - requires API key)
         // For now, just validate URL
         return {
            title: "YouTube Video",
            duration: undefined,
         };
      }

      if (url.includes("vimeo.com")) {
         const videoId = extractVimeoId(url);
         if (!videoId) throw new Error("Invalid Vimeo URL");

         // Get Vimeo metadata (public API, no auth needed)
         const response = await axios.get(
            `https://vimeo.com/api/v2/video/${videoId}.json`
         );

         return {
            title: response.data[0]?.title || "Vimeo Video",
            duration: response.data[0]?.duration,
         };
      }

      return {};
   } catch (error) {
      console.error("Metadata fetch error:", error);
      return {};
   }
};

/**
 * Analyze video sentiment (uses AssemblyAI)
 */
export const analyzeVideoSentiment = async (
   videoUrl: string
): Promise<{
   sentiment: "positive" | "neutral" | "negative";
   sentimentScore: number;
}> => {
   try {
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

/**
 * FREE Alternative: Use Gemini for video analysis
 * Gemini can analyze video directly!
 */
export const analyzeVideoWithGemini = async (
   videoUrl: string,
   challengeContext: string
): Promise<{
   transcript: string;
   analysis: string;
   confidence: number;
}> => {
   try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      // Gemini 1.5 Pro can analyze videos directly (FREE!)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `Analyze this video where a candidate explains their solution to: ${challengeContext}

Provide:
1. Transcript of what they said
2. Analysis of their explanation quality
3. Whether they demonstrate real understanding

Format as JSON:
{
  "transcript": "...",
  "analysis": "...",
  "confidence": 0-100
}`;

      const result = await model.generateContent([
         prompt,
         {
            inlineData: {
               mimeType: "video/mp4", // Assuming mp4, adjust if other types are expected
               data: videoUrl, // Gemini can fetch public videos
            },
         },
      ]);

      const response = result.response.text();
      const parsed = JSON.parse(response.replace(/```json|```/g, "").trim());

      return {
         transcript: parsed.transcript || "",
         analysis: parsed.analysis || "",
         confidence: parsed.confidence || 0,
      };
   } catch (error) {
      console.error("Gemini video analysis error:", error);
      throw new Error("Could not analyze video with Gemini");
   }
};
