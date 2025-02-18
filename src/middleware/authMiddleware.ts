import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader){
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            // res.status(200).json(decoded);
            console.log(decoded);
            (req as any).data = decoded;
            next();
        });
    }
    catch(err){
        res.status(500).json({ message: "Internal server error" });
    }
}