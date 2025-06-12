import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import auctionRouter from "./routes/auctionRoute.js";
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import addressRouter from "./routes/addressRoute.js";
import bidDetailRouter from "./routes/bidDetailRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import winningRouter from "./routes/winningsRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import webhookRouter from "./routes/webhookRouter.js";

import AppError from "./utils/AppError.js";
import globalErrorHnadler from "./controller/errorController.js";
import { auctionEnds } from "./schedulers/auctionScheduler.js";

const app = express();

auctionEnds();

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
app.use(
  "/api/v1/webhook",
  express.raw({ type: "application/json" }),
  webhookRouter
);
app.use(cookieParser());
app.use(express.json());

// ROUTES

app.use("/api/v1/auctions", auctionRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/bids", bidDetailRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/winnings", winningRouter);
app.use("/api/v1/payments", paymentRouter);

app.use("*", (req, res, next) => {
  next(new AppError("This resource is not exist in the server", 404));
});

app.use(globalErrorHnadler);

export default app;
