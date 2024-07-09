import {Likes} from '../models/likes.model.js';
import {Reply} from '../models/reply.model.js';
import {Post} from '../models/post.model.js';
import {Comment} from '../models/comment.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponce } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandeler.js';
import mongoose from 'mongoose';

const toggleLikePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    const isLiked= await Likes.findOne({post:post._id, likedBy:new mongoose.Types.ObjectId(req.user._id)});
    if(isLiked){
        await Likes.findByIdAndDelete(isLiked._id);
        return res
        .status(200)
        .json(new ApiResponce(200,{}, "Post unliked successfully"));
    }
    const like = await Likes.create({post:post._id, 
        likedBy:new mongoose.Types.ObjectId(req.user._id)}
    );
    if(!like){
        throw new ApiError(500, "Failed to like post");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,{}, "Post liked successfully"));

});


const toggleLikeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if(!commentId){
        throw new ApiError(400, "Comment id is required");
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }
    const isLiked= await Likes.findOne({comment:comment._id, likedBy:new mongoose.Types.ObjectId(req.user._id)});
    if(isLiked){
        await Likes.findByIdAndDelete(isLiked._id);
        return res
        .status(200)
        .json(new ApiResponce(200,{}, "Comment unliked successfully"));
    }
    const like = await Likes.create({comment:comment._id, 
        likedBy:new mongoose.Types.ObjectId(req.user._id)}
    );
    if(!like){
        throw new ApiError(500, "Failed to like comment");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,{}, "Comment liked successfully"));

});

const toggleLikeReply = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    if(!replyId){
        throw new ApiError(400, "Reply id is required");
    }
    const reply = await Reply.findById(replyId);
    if(!reply){
        throw new ApiError(404, "Reply not found");
    }
    const isLiked= await Likes.findOne({reply:reply._id, likedBy:new mongoose.Types.ObjectId(req.user._id)});
    if(isLiked){
        await Likes.findByIdAndDelete(isLiked._id);
        return res
        .status(200)
        .json(new ApiResponce(200,{}, "Reply unliked successfully"));
    }
    const like = await Likes.create({reply:reply._id,
        likedBy:new mongoose.Types.ObjectId(req.user._id)}
    );
    if(!like){
        throw new ApiError(500, "Failed to like reply");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,{}, "Reply liked successfully"));
});


const getProfilesWhoLikePost= asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const {page=1, limit=20} = req.query;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }

    let isFollowedByMe = false;
    if(req.user){
        isFollowedByMe = {
            $cond:{
                if:{
                    $in:[new mongoose.Types.ObjectId(req.user?._id),"$followers.followedBy"]
                },
                then:true,
                else:false
            }
        }
    }

    const aggregate = Likes.aggregate([
        {
            $match: {
                post: post._id
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedBy",
                pipeline:[
                    {
                        $lookup:{
                            from : "followers",
                            localField: "_id",
                            foreignField: "profile",
                            as : "followers"
                        }
                    },
                    {
                        $addFields:{
                            isFollowedByMe:isFollowedByMe,
                            followersCount:{
                                $size:"$followers"
                            }
                        
                        }
                    },
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullName:1,
                            avatar:1,
                            isFollowedByMe:1,
                            followersCount:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likedBy:{
                    $first:"$likedBy"                }
            }
        },
        {
            $replaceRoot:{
                newRoot:"$likedBy"
            }
        }
    ]);

    const likes = await Likes.aggregatePaginate(aggregate, {
        page:parseInt(page),
        limit:parseInt(limit)
    });
    if(!likes){
        throw new ApiError(500, "Failed to fetch post likes");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,likes, "Profile fetched successfully"));

});

export {
    toggleLikePost,
    toggleLikeComment,
    toggleLikeReply,
    getProfilesWhoLikePost,
}