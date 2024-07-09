import { Router } from "express";
import { 
    toggleAdminRole,
    addGroupMember,
    addUserUsingAdminId,
    leftGroup,
    removeMember
 } from "../controllers/member.controller.js"
 import {verifyJWT} from "../middlewares/auth.middleware.js"


const router = Router();
router.use(verifyJWT);

router.route("/toggle-admin-role/:groupId/:userId").patch(toggleAdminRole);
router.route("/add-member/:groupId/:userId").post(addGroupMember);
router.route("/join-group/:groupId/:adminId").post(addUserUsingAdminId);
router.route("/leave-group/:groupId").delete(leftGroup);
router.route("/remove-member/:groupId/:userId").delete(removeMember);


export default router;