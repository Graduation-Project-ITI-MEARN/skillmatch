import { NextFunction, Request, Response } from "express";
import { logActivity } from "./activityLogger";

export function catchError(
   callBack: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
   return (req: Request, res: Response, next: NextFunction) => {
      callBack(req, res, next).catch((err: any) => {
         res.status(500).json({ err: err.message });
      });
   };
}
