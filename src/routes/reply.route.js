import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import { moderateContent } from "../middlewares/textModeration.middleware.js";
import {
    createReply,
    updateReply,
    deleteReply,
    getAllReplies
} from "../controllers/reply.controller.js";


const router = Router();

router.route("/create").post(verifyJWT,moderateContent, createReply);
router.route("/update/:replyId").patch(verifyJWT,moderateContent, updateReply);
router.route("/delete/:replyId").delete(verifyJWT, deleteReply);
router.route("/getAll/:commentId").get(verifyJWT, getAllReplies);


export default router;