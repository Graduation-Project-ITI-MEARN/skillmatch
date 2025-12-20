import { getUserSocket } from "./socketMap";
import { io } from "../index";

interface NotificationPayload {
  title: string;
  message: string;
}

export const emitToUser = (userId: string, payload: NotificationPayload) => {
  const socketId = getUserSocket(userId);

  if (!socketId) {
    console.log(` User ${userId} not connected`);
    return;
  }

  io.to(socketId).emit("notification_received", payload);
};
