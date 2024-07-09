import { Reply} from '../models/reply.model.js';
import { Comment } from '../models/comment.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponce } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandeler.js';
import mongoose from 'mongoose';

const createReply = asyncHandler(async (req, res) => {
    const { content, commentId } = req.body;
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
    const reply = await Reply.create({
        text:content,
        comment:comment._id,
        repliedBy: new mongoose.Types.ObjectId(req.user._id),
        post : comment.post
    });
    if(!reply){
        throw new ApiError(500, "Failed to create reply");
    }
    return res
    .status(201)
    .json(new ApiResponce(201, reply, "Reply created successfully"));
});

const updateReply = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const { content } = req.body;
    if(!replyId){
        throw new ApiError(400, "Reply id is required");
    }
    if(!content){
        throw new ApiError(400, "Content is required");
    }
    const reply = await Reply.findById(replyId);
    if(!reply){
        throw new ApiError(404, "Reply not found");
    }
    if(reply.repliedBy.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not allowed to update this reply");
    }
    reply.text = content;
    const updatedReply = await reply.save();
    if(!updatedReply){
        throw new ApiError(500, "Failed to update reply");
    }
    return res
    .status(200)
    .json(new ApiResponce(200, updatedReply, "Reply updated successfully"));
});

const deleteReply = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    if(!replyId){
        throw new ApiError(400, "Reply id is required");
    }
    const reply = await Reply.findById(replyId);
    if(!reply){
        throw new ApiError(404, "Reply not found");
    }
    if(reply.repliedBy.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not allowed to delete this reply");
    }
    const deletedReply = await Reply.findByIdAndDelete(replyId);
    if(!deletedReply){
        throw new ApiError(500, "Failed to delete reply");
    }
    return res
    .status(200)
    .json(new ApiResponce(200, {}, "Reply deleted successfully"));
});

const getAllReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page=1, limit=20 } = req.query;
    if(!commentId){
        throw new ApiError(400, "Comment id is required");
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }
    const aggregate = Reply.aggregate([
        {
            $match: {
                comment: comment._id
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'repliedBy',
                foreignField: '_id',
                as: 'repliedBy',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from: 'likes',
                localField: '_id',
                foreignField: 'reply',
                as: 'likes'
            }
        },
        {
            $addFields: {
                likesCount: { $size: '$likes' },
                isLikedByMe: {
                    $cond: {
                        if: {
                            $in: [new mongoose.Types.ObjectId(req.user._id), '$likes.likedBy']
                        },
                        then: true,
                        else: false
                    }
                
                },
                repliedBy: { $arrayElemAt: ['$repliedBy', 0] }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ]); 
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };
    const replies = await Reply.aggregatePaginate(aggregate, options);
    if(!replies){
        throw new ApiError(500, "Failed to fetch replies");
    }
    return res
    .status(200)
    .json(new ApiResponce(200, replies, "Replies fetched successfully"));
    
});



export { 
    createReply,
    updateReply,
    deleteReply,
    getAllReplies,
};