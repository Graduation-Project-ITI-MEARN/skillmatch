import { NextFunction, Request, Response } from "express";
import { promisify } from "node:util";
import User from "../models/User";
const jwt = require("jsonwebtoken");

const jwtVerify = promisify(jwt.verify);

const auth = async (req: Request, res: Response, next: NextFunction) => {
   const token = req.headers.authorization?.split(" ")[1];
   const { userId } = await jwtVerify(token, process.env.JWT_SECRET);
   const user = await User.findById(userId).select("name email role");

   if (!user) {
      throw new Error("User not found");
   } else {
      req.user = user;
      next();
   }
};

export default auth;
