import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { 
    createPost,
    forkPost,
    updatePost,
    deletePost,
    getPost,
    getAllPosts,
    getPostDetailsForUpdate,
    getProfilePosts,
 } from "../controllers/post.controller.js";
import { verifyJWT , checkCurrentUser} from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/create").post(verifyJWT,upload.single("asset"), createPost);
router.route("/fork").post(verifyJWT, forkPost);
router.route("/update/:postId").patch(verifyJWT, updatePost);
router.route("/delete/:postId").delete(verifyJWT, deletePost);
router.route("/get/:postId").get(checkCurrentUser, getPost);
router.route("/get-all").get(checkCurrentUser, getAllPosts);
router.route("/get-update/:postId").get(verifyJWT, getPostDetailsForUpdate);
router.route("/profile/:username").get(checkCurrentUser, getProfilePosts);

export default router;