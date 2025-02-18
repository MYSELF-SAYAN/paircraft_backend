import { Router } from "express";
import { createUser,loginUser } from "../controllers/authController";
const router: Router = Router();
router.post("/signup", createUser);
router.post("/login", loginUser);
export default router;
