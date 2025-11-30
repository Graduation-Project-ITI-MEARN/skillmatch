import rateLimit from "express-rate-limit";

const createRateLimiter = function (
   limit = 5,
   windowMinutes = 15,
   message = "Too many requests. Please try again after 15 minutes."
) {
   return rateLimit({
      windowMs: windowMinutes * 60 * 1000,
      limit,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
         status: "failure",
         message:
            message ||
            `Too many requests. Please try again after ${windowMinutes} minutes.`,
      },
   });
};

export default createRateLimiter;
