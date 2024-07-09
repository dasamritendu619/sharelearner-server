import {Group} from '../models/group.model.js';
import {Member} from '../models/members.model.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponce} from '../utils/ApiResponse.js';
import {asyncHandler} from "../utils/asyncHandeler.js";
import {uploadOnCloudinary,deleteFromCloudinary} from '../utils/cloudinary.js';
import {DEFAULT_GROUP_ICON,DEFAULT_GROUP_BANNER} from '../constants.js';
import mongoose from 'mongoose';

const createGroup = asyncHandler(async (req, res) => {
    const {groupName, description} = req.body;
    let groupIconUrl;
    if (!groupName ){
        throw new ApiError(400,'Group name is required');
    };
    if(description && description.length > 200){
        throw new ApiError(400,'Description should not exceed 200 characters');
    };
    if(groupName.length > 50){
        throw new  ApiError(400,'Group name should not exceed 50 characters');
    };
    const groupIconPath = req.file?.path;
    if(groupIconPath){
        const uploadedImage = uploadOnCloudinary(groupIconPath);
        if(!uploadedImage){
            throw new ApiError(400,'Error uploading group icon');
        };
        groupIconUrl = uploadedImage.secure_url;
    }
    const createdBy = new mongoose.Types.ObjectId(req.user._id);
    const group = await Group.create({
        groupName,
        description, 
        createdBy,
        groupIcon: groupIconUrl? groupIconUrl: DEFAULT_GROUP_ICON,
    });
    if(!group){
        throw new ApiError(500,'Error creating group');
    };
    const member= await Member.create({
        group: group._id,
        member: createdBy,
        role: 'admin'
    });
    if(!member){
        await Group.findByIdAndDelete(group._id);
        throw new ApiError(500,'Error creating group');
    };

    res
    .status(201)
    .json(new ApiResponce(201,group,'Group created successfully'));
});


const updateGroup = asyncHandler(async (req, res) => {
    const {groupName, description} = req.body;
    const {groupId} = req.params;
    if(!groupId){
        throw new ApiError(400,'Invalid group id');
    };
    if (!groupName && !description ){
        throw new ApiError(400,'Group name or description is required');
    };
    if(description && description.length > 200){
        throw new ApiError(400,'Description should not exceed 200 characters');
    };
    if(groupName && groupName.length > 50){
        throw new  ApiError(400,'Group name should not exceed 50 characters');
    };
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(500,'Group not found');
    };
    const member= await Member.findOne({
        group: new mongoose.Types.ObjectId(groupId), 
        member:new mongoose.Types.ObjectId( req.user._id)
    });
    if(!member){
        throw new ApiError(403,'You are Unauthorized to make this request');
    };
    if (member.role === 'user') {
        if (group.onlyAdminCanEditGroupSettings) {
            throw new ApiError(403, 'You are Unauthorized to make this request'); 
        }
    }
    group.groupName = groupName? groupName: group.groupName;
    group.description = description? description: group.description;
    const upDatedGroup=await group.save();

    if(!upDatedGroup){
        throw new ApiError(500,'Error updating group');
    };
    
    res
    .status(200)
    .json(new ApiResponce(200,upDatedGroup,'Group updated successfully'));

});

const updateGroupIcon = asyncHandler(async (req, res) => {
    const {groupId} = req.params;
    const {iconUrl} = req.body;
    
    if(!groupId){
        throw new ApiError(400,'Invalid group id');
    }
    if(!iconUrl){
        throw new ApiError(400,'Group icon is required');
    };
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(500,'Group not found');
    };
    const member= await Member.findOne({
        group: new mongoose.Types.ObjectId(groupId), 
        member:new mongoose.Types.ObjectId( req.user._id)
    });
    if(!member){
        throw new ApiError(403,'You are Unauthorized to make this request');
    };
    if (member.role === 'user') {
        if (group.onlyAdminCanEditGroupSettings) {
            throw new ApiError(403, 'You are Unauthorized to make this request'); 
        }
    }
    if (group.groupIcon !== DEFAULT_GROUP_ICON) {
        const deletedImage = deleteFromCloudinary(group.groupIcon.split("upload/")[1].split(".")[0]);
        if(!deletedImage){
            throw new ApiError(500,'Error deleting group icon');
        };
    }
    group.groupIcon = iconUrl;
    const upDatedGroup=await group.save();
    if(!upDatedGroup){
        throw new ApiError(500,'Error updating group icon');
    };
    res
    .status(200)
    .json(new ApiResponce(200,upDatedGroup,'Group icon updated successfully'));
});

const updateGroupBanner = asyncHandler(async (req, res) => {
    const {groupId} = req.params;
    const {bannerUrl} = req.body;

    if(!groupId){
        throw new ApiError(400,'Invalid group id');
    }
    if(!bannerUrl){
        throw new ApiError(400,'Group banner is required');
    };
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(500,'Group not found');
    };
    const member= await Member.findOne({
        group: new mongoose.Types.ObjectId(groupId), 
        member:new mongoose.Types.ObjectId( req.user._id)
    });
    if(!member){
        throw new ApiError(403,'You are Unauthorized to make this request');
    };
    if (member.role === 'user') {
        if (group.onlyAdminCanEditGroupSettings) {
            throw new ApiError(403, 'You are Unauthorized to make this request'); 
        }
    }
    if (group.groupBanner !== DEFAULT_GROUP_BANNER) {
        const deletedImage = deleteFromCloudinary(group.groupBanner.split("upload/")[1].split(".")[0]);
        if(!deletedImage){
            throw new ApiError(500,'Error deleting group banner');
        };
    }
    group.groupBanner = bannerUrl;
    const upDatedGroup=await group.save();
    if(!upDatedGroup){
        throw new ApiError(500,'Error updating group banner');
    };
    res
    .status(200)
    .json(new ApiResponce(200,upDatedGroup,'Group banner updated successfully'));
});

const deleteGroup = asyncHandler(async (req, res) => {
    const {groupId} = req.params;
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(500,'Group not found');
    };
    const member= await Member.findOne({
        group: new mongoose.Types.ObjectId(groupId), 
        member:new mongoose.Types.ObjectId( req.user._id)
    });
    if(!member){
        throw new ApiError(403,'You are Unauthorized to make this request');
    };
    if (member.role === 'user') {
        throw new ApiError(403, 'You are Unauthorized to make this request'); 
    }
    const groupIcon = group.groupIcon;
    const groupBanner = group.groupBanner;
    const deletedGroup = await Group.findByIdAndDelete(groupId);
    if(!deletedGroup){
        throw new ApiError(500,'Error deleting group');
    };
    await Member.deleteMany({group: group._id});
    await deleteFromCloudinary(groupIcon.split("upload/")[1].split(".")[0]);
    await deleteFromCloudinary(groupBanner.split("upload/")[1].split(".")[0]);
    res
    .status(200)
    .json(new ApiResponce(200,{},'Group deleted successfully'));
});

// const getGroup = asyncHandler(async (req, res) => {
//     const {groupId} = req.params;
//     if(!mongoose.Types.ObjectId.isValid(groupId)){
//         throw new ApiError(400,'Invalid group id');
//     };
//     const group= await Group.findById(groupId);
//     if(!group){
//         throw new ApiError(404,'Group not found');
//     };
    
// });

export {

    createGroup,
    updateGroup,
    updateGroupIcon,
    updateGroupBanner,
    deleteGroup,
}