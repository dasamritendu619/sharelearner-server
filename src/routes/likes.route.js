import { Router } from "express";
import {
    toggleLikeComment,
    toggleLikeReply,
    toggleLikePost,
    getProfilesWhoLikePost,
} from "../controllers/likes.controller.js";
import {verifyJWT,checkCurrentUser} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggle-post/:postId").post(verifyJWT,toggleLikePost);
router.route("/toggle-comment/:commentId").post(verifyJWT,toggleLikeComment);
router.route("/toggle-reply/:replyId").post(verifyJWT,toggleLikeReply);
router.route("/profiles/:postId").get(checkCurrentUser,getProfilesWhoLikePost);


export default router;