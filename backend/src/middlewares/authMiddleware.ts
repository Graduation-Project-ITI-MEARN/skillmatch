import { NextFunction, Request, Response } from "express";
import { promisify } from "node:util";
import User from "../models/User";
const jwt = require("jsonwebtoken");

const jwtVerify = promisify(jwt.verify);

const auth = async (req: Request, res: Response, next: NextFunction) => {
   try {
      let token;

      // 1. Check Authorization Header (Bearer token)
      if (
         req.headers.authorization &&
         req.headers.authorization.startsWith("Bearer")
      ) {
         token = req.headers.authorization.split(" ")[1];
      }
      // 2. Check Cookies (Next.js sets 'auth_token')
      else if (req.cookies && req.cookies.auth_token) {
         token = req.cookies.auth_token;
      }

      // 3. If no token found in either place
      if (!token) {
         return res.status(401).json({ message: "No token provided" });
      }

      // 4. Verify Token
      const decoded: any = await jwtVerify(token, process.env.JWT_SECRET);

      // 5. Check if user exists
      const user = await User.findById(decoded.id).select(
         "name email role type"
      );

      if (!user) {
         return res.status(401).json({ message: "User not found" });
      }

      // 6. Attach user to request
      req.user = user;
      next();
   } catch (error) {
      console.error("AUTH ERROR:", error);
      res.status(401).json({ message: "Invalid token", error });
   }
};

export default auth;
