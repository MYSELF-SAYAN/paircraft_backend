// src/types/express/index.d.ts
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      data?: string | JwtPayload; // Adjust the type based on your JWT payload
    }
  }
}
