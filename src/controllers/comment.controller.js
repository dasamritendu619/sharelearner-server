import {Comment} from "../models/comment.model.js";
import {Likes} from "../models/likes.model.js";
import {Post} from "../models/post.model.js";
import {Reply} from "../models/reply.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import mongoose from "mongoose";

const createComment = asyncHandler(async (req, res) => {
    const { content, postId } = req.body;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    if(!content){
        throw new ApiError(400, "Content is required");
    }
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    const comment = await Comment.create({
        text:content, 
        post:post._id, 
        commentedBy: new mongoose.Types.ObjectId(req.user._id)
    });
    if(!comment){
        throw new ApiError(500, "Failed to create comment");
    }
    return res
    .status(201)
    .json(new ApiResponce(201, comment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if(!commentId){
        throw new ApiError(400, "Comment id is required");
    }
    if(!content){
        throw new ApiError(400, "Content is required");
    }
    
    const comment = await Comment.findById(commentId);
    
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }
    if(comment.commentedBy.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not allowed to update this comment");
    }
    comment.text = content;
    const updatedComment = await comment.save();
    if(!updatedComment){
        throw new ApiError(500, "Failed to update comment");
    }
    return res
    .status(200)
    .json(new ApiResponce(200, updateComment, "Comment updated successfully"));   


});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if(!commentId){
        throw new ApiError(400, "Comment id is required");
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }
    if(comment.commentedBy.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not allowed to delete this comment");
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if(!deletedComment){
        throw new ApiError(500, "Failed to delete comment");
    }
    return res
    .status(200)
    .json(new ApiResponce(200, deletedComment, "Comment deleted successfully"));   

});

const getallComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const {page=1, limit=20}= req.query;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    const aggregrate =Comment.aggregate([
        {
            $match: {post: post._id}
        },
        {
            $sort : {createdAt: -1}
        },
        {
            $lookup: {
                from: "users",
                localField: "commentedBy",
                foreignField: "_id",
                as: "commentedBy",
                pipeline: [
                    {
                        $project:{
                            username: 1,
                            avatar: 1,
                            fullName: 1,
                            _id: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from: "replies",
                localField: "_id",
                foreignField: "comment",
                as: "replies"
            }
        },
        {
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields:{
                totalLikes: {$size: "$likes"},
                totalReplies: {$size: "$replies"},
                isLikedByMe: {
                    $cond: {
                        if: {
                            $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                },
                commentedBy: { $arrayElemAt: ['$commentedBy', 0] }
            }
        },
        {
            $project:{
                likes: 0,
                replies: 0
            }
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };
    const comments = await Comment.aggregatePaginate(aggregrate, options);
    if(!comments){
        throw new ApiError(500, "Failed to fetch comments");
    }
    return res
    .status(200)
    .json(new ApiResponce(200, comments, "Comments fetched successfully"));

});

export {
    createComment,
    updateComment,
    deleteComment,
    getallComments,
}