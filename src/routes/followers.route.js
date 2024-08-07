import { Router } from "express";
import { verifyJWT, checkCurrentUser } from "../middlewares/auth.middleware.js";
import {
    toggleFollowUser,
    getAllFollowers,
    getAllFollowings,
    getSuggestedProfiles,
} from '../controllers/followers.controller.js'


const router = Router();

router.route('/toggle-follow/:profileId').post(verifyJWT, toggleFollowUser);
router.route('/followers/:username').get(checkCurrentUser, getAllFollowers);
router.route('/followings/:username').get(checkCurrentUser, getAllFollowings);
router.route('/suggested').get(verifyJWT,getSuggestedProfiles);



export default router;