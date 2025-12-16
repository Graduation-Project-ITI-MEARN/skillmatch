import { z } from "zod";

export const videoLinkSchema = z.object({
  videoLink: z
    .string()
    .url("Invalid video URL")
    .refine(
      (url) =>
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("vimeo.com") ||
        url.includes("drive.google.com"),
      {
        message: "Video link must be from YouTube, Vimeo, or Google Drive",
      }
    ),
});

export type VideoLinkDTO = z.infer<typeof videoLinkSchema>;
