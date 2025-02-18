import prisma from "../database/db.config";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

export const checkRoomRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { roomId } = req.params;
        const userId = ((req as JwtPayload) || String).data?.id;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        try {
            const roomUser = await prisma.room_member.findFirst({
                where: { room_id: roomId, user_id: userId },
            });

            if (!roomUser || !allowedRoles.includes(roomUser.role)) {
                res.status(403).json({ message: "Forbidden: Insufficient permissions your role is "+roomUser?.role });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({ message: "Error checking permissions" });
            return;
        }
    };
};