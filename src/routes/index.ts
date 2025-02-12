import { Router } from "express";
export const router: Router = Router();
import authRoute from "./authRoute";
export default (): Router => {
  router.use("/auth", authRoute);
  router.get("/", (req, res) => {
    res.send("hello world");
  });
  return router;
};
