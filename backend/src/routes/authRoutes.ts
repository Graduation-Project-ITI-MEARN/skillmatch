import {
   // forgotPassword,
   getMe,
   login,
   logout,
   register,
   // resetPassword,
} from "../controllers/authController";
import {
   forgotPasswordDTO,
   loginDTO,
   registerDTO,
   resetPasswordDTO,
} from "../DTO/authDTO";

import auth from "../middlewares/authMiddleware";
import createRateLimiter from "../middlewares/rateLimiter";
import validate from "../middlewares/validate";

const authRouter = require("express").Router();

const authRateLimit = createRateLimiter(
   50,
   150,
   "Too many login/register attempts."
);

authRouter.post("/register", authRateLimit, validate(registerDTO), register);

authRouter.post("/login", authRateLimit, validate(loginDTO), login);

// authRouter.post(
//   "/forgot-password",
//   authRateLimit,
//   validate(forgotPasswordDTO),
//   forgotPassword
// );

// authRouter.post(
//   "/reset-password",
//   authRateLimit,
//   validate(resetPasswordDTO),
//   resetPassword
// );

authRouter.post("/logout", auth, logout);

// In authRoutes.ts:
// Add GET /me (protected by authMiddleware).

authRouter.get("/me", auth, getMe);

export default authRouter;
