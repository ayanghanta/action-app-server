const express = require("express");

const authController = require("./../controller/authController");
const winningController = require("./../controller/winningController");

const router = express.Router();

router.use(authController.protect);

router.route("/").get(winningController.getMyWinnings);

module.exports = router;
