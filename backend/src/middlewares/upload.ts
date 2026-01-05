import multer from "multer";
import cloudinary from "../config/cloudinary"; // Assuming this imports your Cloudinary config

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
   cloudinary: cloudinary,
   params: async (req: any, file: any) => {
      let folderName = "skillmatch"; // Default folder
      if (file.fieldname === "videoExplanationFile") {
         folderName = "skillmatch-videos"; // Separate folder for videos if desired
      } else if (file.fieldname === "file") {
         folderName = "skillmatch-projects"; // Separate folder for project files
      }
      return {
         folder: folderName,
         resource_type: "auto",
         public_id: `${file.fieldname}-${Date.now()}-${Math.round(
            Math.random() * 1e9
         )}`, // Add random to ensure uniqueness
      };
   },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
   const allowedMimeTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/zip",
      "application/x-zip-compressed",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
   ];

   const videoMimeTypes = ["video/mp4", "video/webm", "video/ogg"];

   if (file.fieldname === "videoExplanationFile") {
      if (videoMimeTypes.includes(file.mimetype)) {
         cb(null, true);
      } else {
         cb(
            new Error(
               "Invalid video file type. Only MP4, WebM, OGG are allowed."
            ),
            false
         );
      }
   } else if (file.fieldname === "file") {
      // For the main project file
      if (allowedMimeTypes.includes(file.mimetype)) {
         cb(null, true);
      } else {
         cb(
            new Error(
               "Invalid project file type. Only PDF, PNG, JPG, ZIP, DOCX are allowed."
            ),
            false
         );
      }
   } else {
      // For any other unexpected file fields, reject or allow by default
      cb(new Error("Unexpected file field provided."), false);
   }
};

// Existing middleware for single document uploads (e.g., resumes, general files)
export const uploadDocument = multer({
   storage: storage,
   fileFilter: fileFilter, // This filter will apply to single uploads as well
   limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for general documents
   },
});

// NEW: Middleware for submission files (project file + video explanation)
export const uploadSubmissionFiles = multer({
   storage: storage, // Uses the same Cloudinary storage
   fileFilter: fileFilter, // Uses the same intelligent file filter
   limits: {
      fileSize: 100 * 1024 * 1024, // Increased limit for videos (100MB example)
   },
}).fields([
   { name: "file", maxCount: 1 }, // For the main project file (e.g., zip, pdf)
   { name: "videoExplanationFile", maxCount: 1 }, // For the video explanation file
]);
