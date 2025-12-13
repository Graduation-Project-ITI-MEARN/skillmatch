import rateLimit from "express-rate-limit";

const createRateLimiter = function (
   limit = 200,
   windowMinutes = 120,
   message = "Too many requests. Please try again after 30 minutes."
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
