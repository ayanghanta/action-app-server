import { Server } from "socket.io";
import { protect } from "./../controller/authControllerSocket.js";
import { createNewBid } from "./../controller/bidController.js";

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
    await createNewBid(socket, data);
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
  io.use(protect);
  // io.use(errorHandler);

  io.on("connection", (socket) => {
    socket.io = io;
    handleEvents(socket);
  });

  return io;
}

export default initializeWebSocket;
