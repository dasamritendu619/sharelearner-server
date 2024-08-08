import {Follower} from '../models/followers.model.js';
import {User}  from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponce } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandeler.js';
import mongoose from 'mongoose';


const toggleFollowUser = asyncHandler(async (req, res) => {
    const { profileId } = req.params;
    if(!profileId){
        throw new ApiError(400, "Profile id is required");
    }
    if (profileId === req.user._id.toString()) {
        throw new ApiError(400, "You can't follow yourself");   
    }
    const profile = await User.findById(profileId);
    if(!profile){
        throw new ApiError(404, "Profile not found");
    }
    const isFollowed= await Follower.findOne({profile:profile._id, followedBy:new mongoose.Types.ObjectId(req.user._id)});
    if(isFollowed){
        await Follower.findByIdAndDelete(isFollowed._id);
        return res
        .status(200)
        .json(new ApiResponce(200,{}, "Profile unfollowed successfully"));
    }
    const follow = await Follower.create({profile:profile._id, 
        followedBy:new mongoose.Types.ObjectId(req.user._id)}
    );
    if(!follow){
        throw new ApiError(500, "Failed to follow profile");
    }
    return res
    .status(200)
    .json(new ApiResponce(200,{}, "Profile followed successfully"));
});

const getAllFollowers = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const {page=1, limit=20} = req.query;

    if(!username){
        throw new ApiError(400, "Username is required");
    }

    const profile = await User.findOne({username:username});

    if(!profile){
        throw new ApiError(404, "Profile not found");
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

    const aggregate = Follower.aggregate([
        {
            $match: {
                profile: profile._id
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'followedBy',
                foreignField: '_id',
                as: 'followedBy',
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
                            isFollowedByMe:isFollowedByMe,
                        }
                    },
                    {
                        $project:{
                            _id:1,
                            fullName:1,
                            username:1,
                            avatar:1,
                            followersCount:1,
                            isFollowedByMe:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                followedBy:{
                    $first:"$followedBy"
                }
            }
        },
        {
            $replaceRoot:{
                newRoot:"$followedBy"
            }
        },
    ])

    const followers = await Follower.aggregatePaginate(aggregate, {
        page:parseInt(page),
        limit:parseInt(limit)
    });

        // check if followers are fetched or not
        if (!followers) {
            throw new ApiError(500, 'Something went wrong while fetching followers');
        }
        // return response
        return res
            .status(200)
            .json(new ApiResponce(200,followers, 'Followers fetched successfully'));

});

const getAllFollowings = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const {page=1, limit=20} = req.query;

    if(!username){
        throw new ApiError(400, "Username is required");
    }

    const profile = await User.findOne({username:username});

    if(!profile){
        throw new ApiError(404, "Profile not found");
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

    const aggregate = Follower.aggregate([
        {
            $match: {
                followedBy: profile._id
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'profile',
                foreignField: '_id',
                as: 'profile',
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
                            isFollowedByMe:isFollowedByMe,
                        }
                    },
                    {
                        $project:{
                            _id:1,
                            fullName:1,
                            username:1,
                            avatar:1,
                            followersCount:1,
                            isFollowedByMe:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                profile:{
                    $first:"$profile"
                }
            }
        },
        {
            $replaceRoot:{
                newRoot:"$profile"
            }
        },
    ])

    const following = await Follower.aggregatePaginate(aggregate, {
        page:parseInt(page),
        limit:parseInt(limit)
    });

        // check if following are fetched or not
        if (!following) {
            throw new ApiError(500, 'Something went wrong while fetching following');
        }
        // return response
        return res
            .status(200)
            .json(new ApiResponce(200,following, 'Following fetched successfully'));
});

const getSuggestedProfiles = asyncHandler(async (req, res) => {
    const {page=1, limit=20} = req.query;
   
    const aggregate = User.aggregate([
        {
            $match:{
                _id:{$ne:new mongoose.Types.ObjectId(req.user?._id)}
            }
        },
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
                followersCount:1,
                username:1,
                fullName:1,
                avatar:1,
                isFollowedByMe:1
            }
        },
        {
            $match:{
                isFollowedByMe:false,
            }
        },
        {
            $sort:{
                followersCount:-1,
            }
        }
    ]);

    const following = await User.aggregatePaginate(aggregate, {
        page:parseInt(page),
        limit:parseInt(limit)
    });

        // check if following are fetched or not
        if (!following) {
            throw new ApiError(500, 'Something went wrong while fetching following');
        }
        // return response
        return res
            .status(200)
            .json(new ApiResponce(200,following, 'Following fetched successfully'));

})

export {
    toggleFollowUser,
    getAllFollowers,
    getAllFollowings,
    getSuggestedProfiles,
}