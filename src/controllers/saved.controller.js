import {Saved} from '../models/saved.model.js';
import {Post} from '../models/post.model.js';
import mongoose from 'mongoose';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponce} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandeler.js';


const toggleSavedPosts = asyncHandler(async(req,res)=>{
    const {postId} = req.params;
    if (!postId) {
        throw new ApiError(400,"Post id is required");
    }
    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404,"Post not found");
    }
    const saved = await Saved.findOne({$and:[
        {post:post._id},
        {savedBy: new mongoose.Types.ObjectId(req.user._id)}
    ]});
    if(saved){
        const deletesavedPost=await Saved.findByIdAndDelete(saved._id);
        if(!deletesavedPost){
            throw new ApiError(500,"Failed to remove post from saved");
        }
        return res
        .status(200)
        .json(new ApiResponce(200,{}, "Post removed from saved successfully"));
    }
    const newSavedPost = await Saved.create({
        post:post._id,
        savedBy:new mongoose.Types.ObjectId(req.user._id)
    })
    if(!newSavedPost){
        throw new ApiError(500,"Failed to save post");
    }

    return res
    .status(201)
    .json(new ApiResponce(201, newSavedPost, "Post saved successfully"));

});


const getSavedPosts = asyncHandler(async(req,res)=>{
    const {page=1,limit=10}=req.query;
    const aggregrate=Saved.aggregate([
        {
            $match:{savedBy:new mongoose.Types.ObjectId(req.user._id)}
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $lookup:{
                from:"posts",
                localField:"post",
                foreignField:"_id",
                as:"post",
                pipeline:[
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
                                        isFollowedByMe:{
                                            $cond:{
                                                if:{
                                                    $in:[new mongoose.Types.ObjectId(req.user?._id),"$followers.followedBy"]
                                                },
                                                then:true,
                                                else:false
                                            }
                                        },
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
                            isLikedByMe:{
                                $cond: {
                                    if: {
                                        $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"]
                                    },
                                    then: true,
                                    else: false
                                }
                            },
                            isSavedByMe:true,
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
                ]
            }
        },
        {
            $addFields:{
                post:{
                    $arrayElemAt:["$post",0]
                }
            }
        },
        {
            $replaceRoot:{
                newRoot:"$post"
            }
        },
    ]);


    const posts= await Saved.aggregatePaginate(aggregrate,{
        page:parseInt(page),
        limit:parseInt(limit)
    });

    if(!posts){
        throw new ApiError(404,"No saved posts found");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,posts,"Saved posts fetched successfully"));
   

});


export {
    toggleSavedPosts,
    getSavedPosts,
}

