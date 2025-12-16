import Activity from "../models/Activity";
import mongoose from "mongoose";

export const logActivity = async (
   userId: string | mongoose.Types.ObjectId,
   action: string,
   details: string,
   type: "info" | "success" | "warning" | "error",
   targetId?: mongoose.Types.ObjectId
) => {
   try {
      await Activity.create({
         userId,
         action,
         targetId,
         type,
         details,
      });
   } catch (error) {
      console.error("Failed to log activity:", error);
      // Fail silently so we don't stop the main user action
   }
};
