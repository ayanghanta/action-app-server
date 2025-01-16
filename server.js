const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const mongoose = require("mongoose");
const http = require("http");
const initializeWebSocket = require("./sockets/socket");

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
