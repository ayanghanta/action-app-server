const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const app = express();

const auctionRouter = require("./routes/auctionRoute");
const productRouter = require("./routes/productRoute");
const userRouter = require("./routes/userRoute");
const addressRouter = require("./routes/addressRoute");
const bidDetailRouter = require("./routes/bidDetailRouter");
const notificationRouter = require("./routes/notificationRouter");
const winningRouter = require("./routes/winningsRouter");

const AppError = require("./utils/AppError");

// GLOBAL ERROR HANDLER
const globalErrorHnadler = require("./controller/errorController");

// SCHEDULAR TASK
const auctionSchedular = require("./schedulers/auctionScheduler");
auctionSchedular.auctionEnds();

// GLOBAL MIDDLEWARE
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// SECURUTY HTTP HEADERS
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// 'public' is the folder where images are stored
app.use(express.static("public"));

// BODY PERSER
app.use(express.json());
app.use(cookieParser());

// ROUTES

app.use("/api/v1/auctions", auctionRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/bids", bidDetailRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/winnings", winningRouter);

app.use("*", (req, res, next) => {
  next(new AppError("This resource is not exist in the server", 404));
});

app.use(globalErrorHnadler);

module.exports = app;
