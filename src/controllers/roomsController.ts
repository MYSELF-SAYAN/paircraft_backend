import { Request, Response, RequestHandler } from "express";
import prisma from "../database/db.config";
import { JwtPayload } from "jsonwebtoken";
import { create } from "domain";

export const createRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = ((req as JwtPayload) || String).data;
    if (!data) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const userId = data.id;
    const room = await prisma.room.create({
      data: {
        name,
        creator_id: userId,
        members: {
          create: {
            user_id: userId,
            role: "OWNER",
          },
        },
      },
    });
    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = ((req as JwtPayload) || String).data?.id;
    if (!id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const rooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            user_id: id,
          },
        },
      },
    });
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getRoomRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { roomId } = req.params;
  try {
    const requests = await prisma.joinRequest.findMany({
      where: {
        room_id: roomId,
        status: "PENDING", 
      },
    });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getRoom = async (req: Request, res: Response): Promise<void> => {
  const { roomId } = req.params;
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const joinRoomRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { roomId } = req.params;
  const userId = ((req as JwtPayload) || String).data?.id;
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    const isMember = await prisma.room_member.findFirst({
      where: {
        user_id: userId,
        room_id: roomId,
      },
    });
    if (isMember) {
      res
        .status(400)
        .json({ message: "You are already a member of this room" });
      return;
    }
    const request = await prisma.joinRequest.create({
      data: {
        user_id: userId,
        room_id: roomId,
      },
    });
    res
      .status(200)
      .json({ message: "Join request sent successfully", request });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const approveJoinRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { roomId, requestId } = req.params;
  const userId = ((req as JwtPayload) || String).data?.id;
  try {
    const checkRoomExists = await prisma.room.findFirst({
      where: {
        id: roomId,
      },
    });
    if (!checkRoomExists) {
      res.status(401).json({ message: "Room does not exists" });
    }
    const alreadyJoined = await prisma.room_member.findFirst({
      where: {
        room_id: roomId,
        user_id: userId,
      },
    });
    if (alreadyJoined) {
      res
        .status(400)
        .json({ message: "You are already a member of this room" });
    }
    await prisma.joinRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "ACCEPTED",
      },
    });
    await prisma.room_member.create({
      data: {
        user_id: userId,
        room_id: roomId,
      },
    });
    res.status(200).json({ message: "Join request approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const rejectJoinRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { roomId, requestId } = req.params;
  const userId = ((req as JwtPayload) || String).data?.id;
  try {
    const checkRoomExists = await prisma.room.findFirst({
      where: {
        id: roomId,
      },
    });
    if (!checkRoomExists) {
      res.status(401).json({ message: "Room does not exists" });
    }
    const alreadyJoined = await prisma.room_member.findFirst({
      where: {
        room_id: roomId,
        user_id: userId,
      },
    });
    if (alreadyJoined) {
      res
        .status(400)
        .json({ message: "You are already a member of this room" });
    }
    await prisma.joinRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: "REJECTED",
      },
    });
    res.status(200).json({ message: "Join request rejected" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const leaveRoom = async (req: Request, res: Response): Promise<void> => {
  const { roomId } = req.params;
  const userId = ((req as JwtPayload) || String).data?.id;
  try {
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteRoom = async (
  req: Request,
  res: Response
): Promise<void> => {};

export const updateRoom = async (
  req: Request,
  res: Response
): Promise<void> => {};
