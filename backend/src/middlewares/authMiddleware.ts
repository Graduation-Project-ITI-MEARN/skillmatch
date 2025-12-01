import { NextFunction, Request, Response } from "express";
import { promisify } from "node:util";
import User from "../models/User";
const jwt = require("jsonwebtoken");

const jwtVerify = promisify(jwt.verify);

const auth = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
         return res.status(401).json({ message: "No token provided" });
      }

      const decoded: any = await jwtVerify(token, process.env.JWT_SECRET);

      // FIX: decoded.id, not decoded.userId
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

export default auth;
