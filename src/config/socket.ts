import { Server } from "socket.io";
import { createServer } from "http";
import { Express } from "express";
import { socketAuth } from "../middleware/socketMiddleware";
import { connectionHandler } from "../events/connectionHandler";

export const setupSocket = (app: Express) => {
  // Create an HTTP server from the Express app
  const server = createServer(app);
  // Create a Socket.IO server attached to the HTTP server
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust for your frontend URL
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  // Use JWT middleware for socket authentication
  io.use(socketAuth);


  io.on("connection", (socket) => connectionHandler(socket, io));

  // Return the HTTP server (not a new Socket.IO server)
  return server;
};
