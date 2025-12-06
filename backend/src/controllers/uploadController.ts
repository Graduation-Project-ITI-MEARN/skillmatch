import { Request, Response } from "express";

/**
 * @desc    Upload a file to Cloudinary
 * @route   POST /api/upload/file
 * @access  Private
 */
export const uploadFile = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  // Cloudinary returns the URL in 'path'
  res.status(200).json({
    success: true,
    url: req.file.path,
    type: "file",
    originalName: req.file.originalname,
  });
};
