import express from "express";
import {verifyJWT,checkCurrentUser} from "../middlewares/auth.middleware.js";
import { getMessage, sendMessage } from "../controllers/message.contrller.js";

const router = express.Router();

router.route("/send/:id").post(verifyJWT,sendMessage)
router.route("/:id").get(verifyJWT,getMessage)

export default router