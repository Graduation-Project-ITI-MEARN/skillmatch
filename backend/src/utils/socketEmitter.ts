import { getIo } from "../socket";

export const notifyUser = (
  userId: string,
  payload: { title: string; message: string }
) => {
  const io = getIo();
  io.emit(`notification_${userId}`, payload);
};
