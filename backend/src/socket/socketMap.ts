const userSocketMap = new Map<string, string>();

const addUserSocket = (userId: string, socketId: string) => {
  userSocketMap.set(userId, socketId);
};

const removeUserSocket = (socketId: string) => {
  for (const [userId, sId] of userSocketMap.entries()) {
    if (sId === socketId) {
      userSocketMap.delete(userId);
      break;
    }
  }
};

const getUserSocket = (userId: string) => {
  return userSocketMap.get(userId);
};

export { addUserSocket, removeUserSocket, getUserSocket };
