import { Request, Response } from "express";

export const searchTalent = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    count: res.advancedResults?.count,
    pagination: res.advancedResults?.pagination,
    data: res.advancedResults?.data,
  });
};
