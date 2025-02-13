import express from "express";
import createRoute from "./routes/index";
import logger from "./config/logger";
import morgan from "morgan";
const app = express();

// Middleware
app.use(express.json()); // Allows JSON parsing
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

app.listen(5000, () => console.log("Server is running on port 5000"));
