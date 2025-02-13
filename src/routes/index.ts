import { Router } from "express";
import authRoute from "./authRoute";

const router: Router = Router();

router.use("/auth", authRoute);
router.get("/", (req, res) => {
  res.send("hello world");
});

export default router; // ✅ Export the router directly
