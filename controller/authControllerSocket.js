import jwt from "jsonwebtoken";
import User from "./../model/userModel.js";
import cookie from "cookie";

export const protect = async (socket, next) => {
  try {
    socket.emit("hello", { hello: 1 });
    let jwtToken;

    const authHeader =
      socket.handshake.headers.authorization?.startsWith("Bearer");
    if (authHeader) {
      jwtToken = socket.handshake.headers.authorization.split(" ").at(1);
    } else if (socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      jwtToken = cookies.jwt;
    }

    // console.log(jwtToken);
    if (!jwtToken) throw new Error("Login to access this route");

    const decodeToken = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const currentUser = await User.findById(decodeToken.id);
    if (!currentUser)
      throw new Error("Token belongs to a user that no longer exists");

    if (currentUser.isPasswordChangeAfter(decodeToken.iat))
      throw new Error("User recently changed password, login again");

    socket.user = currentUser;
    next();
  } catch (err) {
    socket.emit("authError", {
      status: "fail",
      message: err.message || "Authentication error",
    });
    next();
  }
};
