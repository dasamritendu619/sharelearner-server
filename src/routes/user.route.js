import { Router } from "express";
import { verifyJWT,checkCurrentUser} from "../middlewares/auth.middleware.js";
import {
    registerUser,
    verifyUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    changePassword,
    sendForgotPasswordByEmail,
    verifyResetPassword,
    sendEmailForUpdateEmailRequest,
    verifyChangeEmail,
    updateUserDetails,
    updateAvatar,
    updateCoverPhoto,
    checkUserNameAvialability,
    getCurrentUserDetails,
    getProfile,
} 
from "../controllers/user.controller.js";


const router = Router();
router.route("/register").post(registerUser);
router.route("/verify").post(verifyUser);
router.route("/login").post(loginUser); 
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/me").get(verifyJWT,getCurrentUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/change-password").patch(verifyJWT,changePassword);
router.route("/forgot-password").post(sendForgotPasswordByEmail);
router.route("/verify-reset-password").patch(verifyResetPassword);
router.route("/update-email").post(verifyJWT,sendEmailForUpdateEmailRequest);
router.route("/verify-change-email").post(verifyJWT,verifyChangeEmail);
router.route("/update-details").patch(verifyJWT,updateUserDetails);
router.route("/update-avatar").patch(verifyJWT,updateAvatar);
router.route("/update-cover-photo").patch(verifyJWT,updateCoverPhoto);
router.route("/check-username/:username").get(checkUserNameAvialability);
router.route("/me/details").get(verifyJWT,getCurrentUserDetails);
router.route("/:username").get(checkCurrentUser,getProfile);

export default router;