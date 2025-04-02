import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { moderateContent } from "../middlewares/textModeration.middleware.js";
import {
    createComment,
    updateComment,
    deleteComment,
    getallComments,
} from "../controllers/comment.controller.js";


const router = Router();
router.use(verifyJWT);

router.route("/create").post(moderateContent,createComment);
router.route("/update/:commentId").patch(moderateContent,updateComment);
router.route("/delete/:commentId").delete(deleteComment);
router.route("/getall/:postId").get(getallComments);

export default router;