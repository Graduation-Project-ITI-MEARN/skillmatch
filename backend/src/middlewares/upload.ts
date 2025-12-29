import multer from "multer";
import cloudinary from "../config/cloudinary";

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
   cloudinary: cloudinary,
   params: async (req: any, file: any) => {
      return {
         folder: "skillmatch",
         resource_type: "auto",
         public_id: `${file.fieldname}-${Date.now()}`,
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

   if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
   } else {
      cb(
         new Error(
            "Invalid file type. Only PDF, PNG, JPG, ZIP, and DOCX are allowed."
         ),
         false
      );
   }
};

export const uploadDocument = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
   },
});
