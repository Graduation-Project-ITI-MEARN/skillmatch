import { getMe, login, logout, register } from "../controllers/authController";
import { loginDTO, registerDTO } from "../DTO/authDTO";
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

authRouter.get("/logout", auth, logout);

// In authRoutes.ts:
// Add GET /me (protected by authMiddleware).

authRouter.get("/me", auth, getMe);

export default authRouter;
