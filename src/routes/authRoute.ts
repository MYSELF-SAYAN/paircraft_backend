import  { Router } from "express";
import { createUser } from "../controllers/authController";
const router:Router = Router();
router.post("/signup",createUser )
export default router