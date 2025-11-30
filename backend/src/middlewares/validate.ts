import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import APIError from "../utils/APIError";

const validate =
   (schema: any) => (req: Request, res: Response, next: NextFunction) => {
      try {
         schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
         });
         next();
      } catch (err) {
         if (err instanceof ZodError) {
            // ZodError.issues contains the array of validation problems
            return next(new APIError(400, "Validation Error", err.issues));
         }
         return next(err);
      }
   };

export default validate;
