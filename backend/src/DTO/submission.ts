import { z } from "zod";

const SubmissionTypeEnum = z.enum(["link", "file", "text"]);

const createSubmissionDTO = z
   .object({
      challengeId: z.string().min(1, "Challenge ID is required"),
      candidateId: z.string().min(1, "Candidate ID is required"),

      videoExplanationUrl: z
         .string()
         .refine(
            (val) => {
               try {
                  new URL(val);
                  return true;
               } catch {
                  return false;
               }
            },
            { message: "Video URL must be a valid link" }
         )
         .optional(),

      submissionType: SubmissionTypeEnum,
      linkUrl: z.string().optional(),
      fileUrls: z.array(z.string()).optional(),
      textContent: z.string().optional(),

      aiScore: z.number().min(0).max(100).default(0).optional(),
   })

   .superRefine((data, ctx) => {
      if (data.submissionType === "link") {
         if (!data.linkUrl || data.linkUrl.trim().length === 0) {
            ctx.addIssue({
               path: ["linkUrl"],
               code: "custom",
               message: 'linkUrl is required when submissionType is "link"',
            });
         }
      }

      if (data.submissionType === "file") {
         if (!data.fileUrls || data.fileUrls.length === 0) {
            ctx.addIssue({
               path: ["fileUrls"],
               code: "custom",
               message:
                  'At least one file is required when submissionType is "file"',
            });
         }
      }

      if (data.submissionType === "text") {
         if (!data.textContent || data.textContent.trim().length === 0) {
            ctx.addIssue({
               path: ["textContent"],
               code: "custom",
               message: 'textContent is required when submissionType is "text"',
            });
         }
      }
   });

type CreateSubmissionDTO = z.infer<typeof createSubmissionDTO>;

export { SubmissionTypeEnum, createSubmissionDTO, CreateSubmissionDTO };
