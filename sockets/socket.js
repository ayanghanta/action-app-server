const { Server } = require("socket.io");
const authControllerSocket = require("./../controller/authControllerSocket");
const bidController = require("./../controller/bidController");

function handleEvents(socket) {
  console.log("A user connected");

  socket.on("joinRoom", (productId) => {
    socket.join(productId);
    // console.log(`User joined room 🌐: ${productId}`);
  });

  socket.on("placeBid", async (data) => {
    if (!socket.user) {
      return socket.emit("AuthError", {
        ok: false,
        message: "Login to place a bid",
      });
    }
    await bidController.createNewBid(socket, data);
  });
}

function initializeWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Middleware
  io.use(authControllerSocket.protect);
  // io.use(errorHandler);

  io.on("connection", (socket) => {
    socket.io = io;
    handleEvents(socket);
  });

  return io;
}

module.exports = initializeWebSocket;
