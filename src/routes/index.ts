import { Router } from "express";
import authRoute from "./authRoute";
import roomsRoute from "./roomsRoute";
const router: Router = Router();

router.use("/auth", authRoute);
router.use("/rooms", roomsRoute);
router.get("/", (req, res) => {
  res.send("hello world");
});

export default router; 
