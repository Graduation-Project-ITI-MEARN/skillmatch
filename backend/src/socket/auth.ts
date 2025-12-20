import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
}

export const socketAuth = (socket: Socket, next: any) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    (socket as any).userId = decoded.id;

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};
