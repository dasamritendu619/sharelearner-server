import express from "express";
import {verifyJWT,checkCurrentUser} from "../middlewares/auth.middleware.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.route("/send/:receiverId").post(checkCurrentUser,sendMessage)
router.route("/:receiverId").get(checkCurrentUser,getMessage)

export default router