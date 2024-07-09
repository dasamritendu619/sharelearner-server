import { Router } from "express";
import { verifyJWT, checkCurrentUser } from "../middlewares/auth.middleware.js";
import {
    toggleFollowUser,
    getAllFollowers,
    getAllFollowings,
} from '../controllers/followers.controller.js'


const router = Router();

router.route('/toggle-follow/:profileId').post(verifyJWT, toggleFollowUser);
router.route('/followers/:username').get(checkCurrentUser, getAllFollowers);
router.route('/followings/:username').get(checkCurrentUser, getAllFollowings);



export default router;