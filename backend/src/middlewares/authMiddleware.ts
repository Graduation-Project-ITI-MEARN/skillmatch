import { NextFunction, Request, Response } from "express";
import { promisify } from "node:util";
import User from "../models/User";
const jwt = require("jsonwebtoken");

const jwtVerify = promisify(jwt.verify);

const auth = async (req: Request, res: Response, next: NextFunction) => {
   try {
      let token;

      if (
         req.headers.authorization &&
         req.headers.authorization.startsWith("Bearer")
      ) {
         token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies && req.cookies.auth_token) {
         token = req.cookies.auth_token;
      }

      if (!token) {
         return res.status(401).json({ message: "No token provided" });
      }

      const decoded: any = await jwtVerify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select(
         "name email role type"
      );

      if (!user) {
         return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
   } catch (error) {
      console.error("AUTH ERROR:", error);
      res.status(401).json({ message: "Invalid token", error });
   }
};

export const restrictTo = (...roles: string[]) => {
   return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
         return res.status(401).json({ message: "Not authenticated" });
      }

      if (!roles.includes(req.user.role)) {
         return res.status(403).json({
            message: "You do not have permission to perform this action",
         });
      }

      next();
   };
};

export default auth;
