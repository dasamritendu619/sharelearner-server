import {Post} from '../models/post.model.js';
import {User} from '../models/user.model.js';
import {Comment} from '../models/comment.model.js';
import {Likes} from '../models/likes.model.js';
import {Reply} from '../models/reply.model.js';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponce } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandeler.js';
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"


const createPost = asyncHandler(async (req, res) => {
    const { title="",content="", type="blog", visibility="public" } = req.body;
    let post;
        switch(type){
        case "photo":
            const imageFilePath = req.file?.path;
            if(!imageFilePath){
             throw new ApiError(400, "Image is required for photo post");
            }
            const uploadedImage= await uploadOnCloudinary(imageFilePath);
            if(!uploadedImage){
                throw new ApiError(500, "Failed to upload image on cloudinary");
            }
            post = await Post.create({
                title,
                type,
                visibility:visibility || "public",
                assetURL:uploadedImage.secure_url,
                author:new mongoose.Types.ObjectId(req.user._id)
            });
            if(!post){
                throw new ApiError(500, "Failed to create post");
            }
            break;


        case "video":
            const videoFilePath = req.file?.path;
            if(!videoFilePath){
                throw new ApiError(400, "Video is required for vido post");
            }
            const uploadedVideo = await uploadOnCloudinary(videoFilePath);
            if(!uploadedVideo){
                throw new ApiError(500, "Failed to upload video on cloudinary");
            }
            post = await Post.create({
                title,
                type,
                visibility:visibility || "public",
                assetURL:uploadedVideo.secure_url,
                author:new mongoose.Types.ObjectId(req.user._id)
            });
            if(!post){
                throw new ApiError(500, "Failed to create post");
            }
            break;

        case "pdf":
            const pdfFilePath = req.file?.path;
            if(!pdfFilePath){
            throw new ApiError(400, "PDF is required for pdf post");
            }
            const uploadedPdf= await uploadOnCloudinary(pdfFilePath);
            if(!uploadedPdf){
                throw new ApiError(500, "Failed to upload Pdf on cloudinary");
            }
            post= await Post.create({
                title,
                type,
                visibility:visibility || "public",
                assetURL:uploadedPdf.secure_url,
                author:new mongoose.Types.ObjectId(req.user._id)
            });
            if(!post){
                throw new ApiError(500, "Failed to create post");
            }
            break;


        case "blog":
            if(!content){
                throw new ApiError(400, "Content is required for blog post");
            }
            if(!title){
                throw new ApiError(400, "Title is required for blog post");
            }
            if(content.length < 50){
                throw new ApiError(400, "Content is too  small for blog post");
            }
            post = await Post.create({
                title,
                content,
                type,
                visibility:visibility || "public",
                author:new mongoose.Types.ObjectId(req.user._id)
            });
            if(!post){
                throw new ApiError(500, "Failed to create post");
            }
            break;
        default:
            throw new ApiError(400, "Invalid post type");
    }
    return res
    .status(201)
    .json(new ApiResponce(201,post, "Post created successfully"));


});
    
const forkPost = asyncHandler(async (req, res) => {
    const { postId,visibility="public",title="" } = req.body;
    if(!postId){
        throw  new ApiError(400, "post id is required");
    }
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    if (req.user._id.toString() === post.author.toString()) {
        throw new ApiError(400, "You can not fork your own post");
    }
    if (post.forkedFrom) {
        const originalPost = await Post.findById(post.forkedFrom);
        if(!originalPost){
            throw new ApiError(404, "Original post not found");
        }
        if (req.user._id.toString() === originalPost.author.toString()) {
            throw new ApiError(400, "You can not fork your own post");
        }
        const forkedPost = await Post.create({
            title,
            type:"forked",
            visibility:visibility,
            author:new mongoose.Types.ObjectId(req.user._id),
            forkedFrom:originalPost._id,
        });

        if(!forkedPost){
            throw new ApiError(500, "Failed to fork post");
        }

        return res
        .status(201)
        .json(new ApiResponce(201,forkedPost, "Post forked successfully"));
    } else {
        
    const forkedPost = await Post.create({
        title,
        type:"forked",
        visibility:visibility,
        author:new mongoose.Types.ObjectId(req.user._id),
        forkedFrom:post._id,
    });
    if(!forkedPost){
        throw new ApiError(500, "Failed to fork post");
    }
    return res
    .status(201)
    .json(new ApiResponce(201,forkedPost, "Post forked successfully"));

    }
}); 

const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { title, content, visibility } = req.body;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    if(!title && !content && !visibility){
        throw new ApiError(400, "At least one field is required to update post");
    }
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    if(post.author.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this post");
    }
    post.title = title || post.title;
    if(post.type === "blog"){
        post.content = content || post.content;
    }
    post.visibility = visibility || post.visibility;
    const updatedPost = await post.save();
    if(!updatedPost){
        throw new ApiError(500, "Failed to update post");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,updatedPost, "Post updated successfully"));

});

const deletePost = asyncHandler(async (req, res) => {   
    const { postId } = req.params;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    if(post.author.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this post");
    }
    if(post.type === "photo" || post.type === "video" || post.type === "pdf"){
        const deletedPost= await deleteFromCloudinary(post.assetURL.split("upload/")[1].split(".")[0]);
        console.log(deletedPost);
        if(!deletedPost){
            throw new ApiError(500, "Failed to delete post");
        }
    }
    const deletedPost = await Post.findByIdAndDelete(postId);
    if(!deletedPost){
        throw new ApiError(500, "Failed to delete post");
    }

    await Comment.deleteMany({post:new mongoose.Types.ObjectId(postId)}); // delete all comments of this post
    await Post.deleteMany({forkedFrom:new mongoose.Types.ObjectId(postId)}); // delete all forked post of this post      
    await Likes.deleteMany({post:new mongoose.Types.ObjectId(postId)}); // delete all likes of this post
    await Reply.deleteMany({post:new mongoose.Types.ObjectId(postId)}); // delete all replies of this post
    
    return res
    .status(200)
    .json(new ApiResponce(200,{}, "Post deleted successfully"));

});

const getPostDetailsForUpdate = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found");
    }
    if(post.author.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this post");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,post, "Post fetched successfully"));
});

const getPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if(!postId){
        throw new ApiError(400, "Post id is required");
    }
    let isFollowedByMe = false;
    let isLikedByMe = false;
    let isSavedByMe = false;
    if(req.user){
        isFollowedByMe = {
            $cond:{
                if:{
                    $in:[new mongoose.Types.ObjectId(req.user?._id),"$followers.followedBy"]
                },
                then:true,
                else:false
            }
        };
        isLikedByMe = {
            $cond: {
                if: {
                    $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                },
                then: true,
                else: false
            }
        }
        isSavedByMe = {
            $cond: {
                if: {
                    $in: [new mongoose.Types.ObjectId(req.user._id), "$saved.savedBy"]
                },
                then: true,
                else: false
            }
        }
    }

    const post = await Post.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(postId)
            }
        },
        {
            $lookup:{
                from:"saveds",
                localField:"_id",
                foreignField:"post",
                as:"saved"
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"author",
                foreignField:"_id",
                as:"author",
                pipeline:[
                    {
                        $lookup:{
                            from:"followers",
                            localField:"_id",
                            foreignField:"profile",
                            as:"followers"
                        }
                    },
                    {
                        $addFields:{
                            followersCount:{
                                $size:"$followers"
                            },
                            isFollowedByMe:isFollowedByMe

                        }
                    },
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullName:1,
                            avatar:1,
                            followersCount:1,
                            isFollowedByMe:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"post",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"post",
                as:"comments"
            }
        },
        {
            $lookup:{
                from:"posts",
                localField:"_id",
                foreignField:"forkedFrom",
                as:"share"
            }
        },
        {
            $lookup:{
                from:"posts",
                localField:"forkedFrom",
                foreignField:"_id",
                as:"forkedFrom",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"author",
                            foreignField:"_id",
                            as:"author",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avatar:1,
                                        fullName:1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $addFields:{
                            author:{
                                $arrayElemAt:["$author",0]
                            }
                        }
                    },
                    {
                        $project:{
                            assetURL:1,
                            title:1,
                            content:1,
                            type:1,
                            author:1,
                            visibility:1,
                            createdAt:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                },
                commentsCount:{
                    $size:"$comments"
                },
                sharesCount:{
                    $size:"$share"
                },
                savedCount:{
                    $size:"$saved"
                },
                author:{
                    $arrayElemAt:["$author",0]
                },
                isLikedByMe:isLikedByMe,
                isSavedByMe:isSavedByMe
            }
        },
        {
            $project:{
                likes:0,
                comments:0,
                share:0,
                saved:0
            }
        }
    ]);
    if(!post || post.length === 0){
        throw new ApiError(404, "Post not found");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,post[0], "Post fetched successfully"));

});

const getAllPosts = asyncHandler(async (req, res) => {
    const { page=1,limit=10,type='all',visibility='public' } = req.query;
    let isFollowedByMe = false;
    let isLikedByMe = false;
    let isSavedByMe = false;
    let match = {
        $match:{
            type:{
                $in:["photo","video","pdf","blog","forked"]
            },
            visibility:visibility
        }
    };
    if(req.user){
        isFollowedByMe = {
            $cond:{
                if:{
                    $in:[new mongoose.Types.ObjectId(req.user?._id),"$followers.followedBy"]
                },
                then:true,
                else:false
            }
        };
        isLikedByMe = {
            $cond: {
                if: {
                    $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                },
                then: true,
                else: false
            }
        };
        isSavedByMe = {
            $cond: {
                if: {
                    $in: [new mongoose.Types.ObjectId(req.user._id), "$saved.savedBy"]
                },
                then: true,
                else: false
            }
        }
    }

    if(type === "photo" || type === "video" || type === "pdf" || type === "blog" || type === "forked"){
        match = {
            $match:{
                type:type,
                visibility:visibility
            }
        };
    }
        
    const aggregrate = Post.aggregate([
        match,
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $lookup:{
                from:"saveds",
                localField:"_id",
                foreignField:"post",
                as:"saved"
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"author",
                foreignField:"_id",
                as:"author",
                pipeline:[
                    {
                        $lookup:{
                            from:"followers",
                            localField:"_id",
                            foreignField:"profile",
                            as:"followers"
                        }
                    },
                    {
                        $addFields:{
                            followersCount:{
                                $size:"$followers"
                            },
                            isFollowedByMe:isFollowedByMe

                        }
                    },
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullName:1,
                            avatar:1,
                            followersCount:1,
                            isFollowedByMe:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"post",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"post",
                as:"comments"
            }
        },
        {
            $lookup:{
                from:"posts",
                localField:"_id",
                foreignField:"forkedFrom",
                as:"share"
            }
        },
        {
            $lookup:{
                from:"posts",
                localField:"forkedFrom",
                foreignField:"_id",
                as:"forkedFrom",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"author",
                            foreignField:"_id",
                            as:"author",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avatar:1,
                                        fullName:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            author:{
                                $arrayElemAt:["$author",0]
                            }
                        }
                    },
                    {
                        $project:{
                            assetURL:1,
                            title:1,
                            content:1,
                            type:1,
                            author:1,
                            visibility:1,
                            createdAt:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                },
                commentsCount:{
                    $size:"$comments"
                },
                sharesCount:{
                    $size:"$share"
                },
                savedCount:{
                    $size:"$saved"
                },
                author:{
                    $arrayElemAt:["$author",0]
                },
                isLikedByMe:isLikedByMe,
                isSavedByMe:isSavedByMe,
                forkedFrom:{
                    $arrayElemAt:["$forkedFrom",0]
                }
            }
        },
        {
            $project:{
                likes:0,
                comments:0,
                share:0,
                saved:0
            }
        }
        
    ]);
    const options = {
        page:parseInt(page,10),
        limit:parseInt(limit,10)
    };
    const posts = await Post.aggregatePaginate(aggregrate,options);
    if(!posts){
        throw new ApiError(404, "Posts not found");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,posts, "Posts fetched successfully"));
});



export {
    createPost,
    forkPost,
    updatePost,
    deletePost,
    getPost,
    getAllPosts,
    getPostDetailsForUpdate,
}