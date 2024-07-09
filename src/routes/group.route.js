import { Router } from "express";
import  {
    createGroup,
    updateGroup,
    updateGroupIcon,
    updateGroupBanner,
    deleteGroup,
} from "../controllers/group.controller.js";

import {verifyJWT} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route('/create').post(upload.single('image'),createGroup);
router.route('/update/:groupId').patch(updateGroup);
router.route('/update-icon/:groupId').patch(updateGroupIcon);
router.route('/update-banner/:groupId').patch(updateGroupBanner);
router.route('/delete/:groupId').delete(deleteGroup);


export default router;