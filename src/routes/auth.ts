import { Router } from "express";
import * as auth from "../controllers/auth";
import { verifyJWT } from "../middlewares/jwt";

const router = Router();

router.get("/ping", (req, res) => res.json({ pong: true, admin: true }));

router.post("/signin", auth.signin);

router.post("/signup", auth.signup);

router.post("/authorize", verifyJWT, auth.authenticateUser);

router.post("/auth/request-password-reset", auth.requestPasswordReset);

router.post("/auth/reset-password", auth.resetPassword);

export default router;
