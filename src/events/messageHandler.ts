import { Server, Socket } from "socket.io";

export const messageHandler = (socket: Socket, io: Server, data: string) => {
  console.log(`Received message from ${socket.id}: ${data}`);

  // Broadcast the message to all connected clients
  io.emit("message", {
    user: socket.id,
    message: data,
  });
  
};
