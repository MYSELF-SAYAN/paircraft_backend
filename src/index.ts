import express from "express";
import createRoute from "./routes/index";
import logger from "./config/logger";
import morgan from "morgan";
import cors from "cors";
import { setupSocket } from "./config/socket";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Logging with morgan
const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// Routes
app.use("/v1", createRoute);

// Create HTTP server and setup socket.io
const server = setupSocket(app);

// Start the server (not app.listen, but server.listen)
server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
