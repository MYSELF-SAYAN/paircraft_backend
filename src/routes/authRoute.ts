import { Router } from "express";
import { createUser,loginUser,getUser, verifyEmail } from "../controllers/authController";
import { authenticateUser } from "../middleware/authMiddleware";
const router: Router = Router();
router.post("/signup", createUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.get("/user",authenticateUser,getUser)
export default router;
