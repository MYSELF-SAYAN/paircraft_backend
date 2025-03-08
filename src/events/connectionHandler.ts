// src/events/connectionHandler.ts
import { Server, Socket } from "socket.io";
import { messageHandler } from "./messageHandler";
import prisma from "../database/db.config";
interface DecodedUser {
  id: string;
  email: string;
}

// Extend the Socket type to include the user property
interface AuthSocket extends Socket {
  user?: DecodedUser;
}
export const connectionHandler = (socket: Socket, io: Server) => {
  console.log("✅ User connected:", socket.id);

  socket.on("first", () => {
    console.log("📡 Received 'first' event from client", socket.id);
    socket.emit("first_response", { message: "Hello from server!" });
  });
  socket.on("join_room", async ({ roomId }) => {
    const userId = (socket as AuthSocket).user?.id;
    console.log(`👤 User ID: ${userId}`);
    if (!userId) {
      console.log("❌ User is not authenticated!");
      return socket.emit("error", "Authentication required.");
    }
    try {
      // Check if the user is a member of the room
      const membership = await prisma.room_member.findFirst({
        where: {
          room_id: roomId,
          user_id: userId,
        },
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!membership) {
        console.log(`❌ User ${userId} is not a member of room ${roomId}`);
        socket.emit("error", "You are not a member of this room.");
        return;
      }

      socket.join(roomId);
      console.log(`✅ User ${membership.user.name} joined room: ${roomId}`);

      io.to(roomId).emit("user_joined", {
        userId,
        roomId,
        membership,
        message: `${membership.user.name} has joined the room.`,
      });
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", "Failed to join the room.");
    }
  });

  // 💬 SEND MESSAGE
  socket.on("send_message", async ({ roomId, userId, content }) => {
    console.log("Received message data:", roomId, userId, content);
    try {
      // Check if the user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        socket.emit("error", "User does not exist.");
        return;
      }

      // Check if the room exists
      const roomExists = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!roomExists) {
        socket.emit("error", "Room does not exist.");
        return;
      }

      // Create and save the message
      const message = await prisma.message.create({
        data: {
          user_id: userId,
          room_id: roomId,
          content,
        },
        select: {
          id: true,
          content: true,
          created_at: true,
          room_id: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      console.log(`📩 Message from ${userId} in room ${roomId}: ${content}`);

      // Broadcast the message to the room
      io.to(roomId).emit("receive_message", {
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        user: {
          id: message.user.id,
          name: message.user.name,
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Failed to send the message.");
    }
  });

  socket.on("language_change", async ({ roomId, language }) => {
    try {
      io.to(roomId).emit("language_changed", { language });
    } catch (error) {
      console.error("Error changing language:", error);
      socket.emit("error", "Failed to change the language.");
    }
  });
  socket.on("output_change", async ({ roomId, output,error }) => {
    try {
      io.to(roomId).emit("output_changed", { output,error });
    } catch (e) {
      console.error("Error changing output:", e);
      socket.emit("error", "Failed to change the output.");
    }
  })
  // 🔄 CODE UPDATE (for collaborative coding)
  socket.on("code_update", async ({ roomId, code }) => {
    try {
      // Update the code snapshot for the room
      await prisma.codeSnapshot.upsert({
        where: { room_id: roomId },
        update: { code },
        create: {
          room_id: roomId,
          code,
        },
      });

      console.log(`📝 Code update in room ${roomId} and code is ${code}`);

      // Broadcast code update to others in the room
      socket.to(roomId).emit("code_updated", { code });
    } catch (error) {
      console.error("Error updating code snapshot:", error);
      socket.emit("error", "Failed to update code.");
    }
  });
  socket.on("cursor_movement", ({ roomId, username, position }) => {
    socket.to(roomId).emit("cursor_updated", { username, position });
  });
  // 🏁 LEAVE ROOM
  socket.on("leave_room", ({ roomId, userId }) => {
    console.log(`🚪 User ${userId} left room: ${roomId}`);

    // Remove socket from the room
    socket.leave(roomId);

    // Notify others in the room
    io.to(roomId).emit("user_left", {
      userId,
      roomId,
      message: `User ${userId} has left the room.`,
    });
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
};
