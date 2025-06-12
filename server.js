import "./config.js";

import mongoose from "mongoose";
import http from "http";

import app from "./app.js";
import initializeWebSocket from "./sockets/socket.js";

// Load environment variables
const PORT = process.env.PORT || 3000;

const CONNECTION_STRING = process.env.DATABASE.replace(
  "<DBPASSWORD>",
  process.env.DB_PASSWORD
);

mongoose.connect(CONNECTION_STRING).then(() => {
  console.log("DB connection successfull ✅");
});

const server = http.createServer(app);

initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}...`);
});
