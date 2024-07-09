import {Member} from '../models/members.model.js'
import { asyncHandler } from '../utils/asyncHandeler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponce } from '../utils/ApiResponse.js'
import mongoose from 'mongoose'

const toggleAdminRole = asyncHandler(async (req, res) => {
    const { userId, groupId } = req.params;
    if (!userId) {
        throw new ApiError(400, "Admin id is required");
    }
    if (!groupId) {
        throw new ApiError(400, "Group id is required");
    }
    const member = await Member.findOne({ $and: [
        { member: new mongoose.Types.ObjectId(userId) }, 
        { group: new mongoose.Types.ObjectId(groupId) }
    ] });

    if (!member) {
        throw new ApiError(404, "no member found with this id");
    }

    const currentAdmin = await Member.findOne({ $and: [
        { member: new mongoose.Types.ObjectId(req.user._id) }, 
        { group: new mongoose.Types.ObjectId(groupId) }
    ] });

    if (!currentAdmin || currentAdmin.role !== "admin") {
        throw new ApiError(403, "You are not authorized to make this request");
    }

    if (member.role === "admin") {
        member.role = "user";
    } else {
        member.role = "admin";
    }

    const updatedMember = await member.save();
    if (!updatedMember) {
        throw new ApiError(500, "Failed to update member role");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, updatedMember, "Member role updated successfully"));
});

const addGroupMember = asyncHandler(async (req, res) => {
    const { groupId, userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User id is required");
    }
    if (!groupId) {
        throw new ApiError(400, "Group id is required");
    }
    const isMember = await Member.findOne({ $and: [
        { member: new mongoose.Types.ObjectId(userId) }, 
        { group: new mongoose.Types.ObjectId(groupId) }
    ] });

    if (isMember) {
        throw new ApiError(400, "User is already a member of this group");
    }

    const currentAdmin = await Member.findOne({ $and: [
        { member: new mongoose.Types.ObjectId(req.user._id) }, 
        { group: new mongoose.Types.ObjectId(groupId) }
    ] });

    if (!currentAdmin || currentAdmin.role !== "admin") {
        throw new ApiError(403, "You are not authorized to make this request");
    }

    const newMember = await Member.create({
        member: new mongoose.Types.ObjectId(userId),
        group: new mongoose.Types.ObjectId(groupId),
        role: "user"
    });

    if (!newMember) {
        throw new ApiError(500, "Failed to add member to group");
    }

    return res
        .status(201)
        .json(new ApiResponce(201, newMember, "Member added to group successfully"));
});

const addUserUsingAdminId = asyncHandler(async (req, res) => {
    const { adminId, groupId } = req.params;

    if (!adminId) {
        throw new ApiError(400, "Admin id is required");
    }
    if (!groupId) {
        throw new ApiError(400, "Group id is required");
    }
    const isAdmin = await Member.findOne({ $and: [
        { member: new mongoose.Types.ObjectId(adminId) }, 
        { group: new mongoose.Types.ObjectId(groupId) },
        { role: "admin" }
    ] });

    if (!isAdmin) {
        throw new ApiError(403, "You are not authorized to make this request");
    }

    const isAlreadyMember = await Member.findOne({ $and: [
        { member: new mongoose.Types.ObjectId(req.user._id) }, 
        { group: new mongoose.Types.ObjectId(groupId) }
    ] });

    if (isAlreadyMember) {
        throw new ApiError(400, "User is already a member of this group");
    }

    const newMember = await Member.create({
        member: new mongoose.Types.ObjectId(req.user._id),
        group: new mongoose.Types.ObjectId(groupId),
        role: "user"
    });

    if (!newMember) {
        throw new ApiError(500, "Failed to add member to group");
    }

    return res
        .status(201)
        .json(new ApiResponce(201, newMember, "You added to this group successfully"));
});

const leftGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    if (!groupId) {
        throw new ApiError(400, "Group id is required");
    }

    const member = await Member.findOne({ $and: [
        { member: new mongoose.Types.ObjectId(req.user._id) }, 
        { group: new mongoose.Types.ObjectId(groupId) }
    ] });

    if (!member) {
        throw new ApiError(404, "You are not a member of this group");
    }

    const deletedMember = await Member.findByIdAndDelete(member._id);

    if (!deletedMember) {
        throw new ApiError(500, "Failed to remove member from group");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "You left this group successfully"));
});

const removeMember = asyncHandler(async (req, res) => {
    const { groupId, userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User id is required");
    }
    if (!groupId) {
        throw new ApiError(400, "Group id is required");
    }

    const member = await Member.findOne({ $and: [
        { member: new mongoose.Types.ObjectId(userId) }, 
        { group: new mongoose.Types.ObjectId(groupId) }
    ] });

    if (!member) {
        throw new ApiError(404, "No member found with this id");
    }

    const currentAdmin = await Member.findOne({ $and: [
        { member: new mongoose.Types.ObjectId(req.user._id) }, 
        { group: new mongoose.Types.ObjectId(groupId) }
    ] });

    if (!currentAdmin || currentAdmin.role !== "admin") {
        throw new ApiError(403, "You are not authorized to make this request");
    }

    const deletedMember = await Member.findByIdAndDelete(member._id);

    if (!deletedMember) {
        throw new ApiError(500, "Failed to remove member from group");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Member removed from group successfully"));
});

export {
    toggleAdminRole,
    addGroupMember,
    addUserUsingAdminId,
    leftGroup,
    removeMember,
}