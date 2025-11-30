import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import APIError from "../utils/APIError";

const validate =
   (schema: any) => (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = schema.parse(req.body);
         req.body = parsed; // assign the validated data back
         next();
      } catch (err) {
         if (err instanceof ZodError) {
            return next(new APIError(400, "Validation Error", err.issues));
         }
         return next(err);
      }
   };

export default validate;
