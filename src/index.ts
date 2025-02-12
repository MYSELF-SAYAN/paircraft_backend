import express from "express"
const app = express()
import createRoute from "./routes/index.js"
app.listen(5000, () => console.log("server is running on port 5000"))