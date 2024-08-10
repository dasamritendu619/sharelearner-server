import { Search } from "../models/search.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";


const getSearchSuggestions = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        throw new ApiError(400, "Please provide a search query");
    }

    const search = await Search.aggregate([
        {
            $match: {
                $text: {
                    $search: query,
                },
            },
        },
        {
            $addFields: {
                "score": { "$meta": "textScore" }
            }
        },
        {
            $sort: { score: -1 },
        },
        {
            $project: {
                query: 1
            },
        },
        {
            $limit: 10,
        },
    ])

    if (!search) {
        throw new ApiError(500, "An error occurred while fetching search suggestions");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, search, "Search suggestions fetched successfully"));
});


const searchUser = asyncHandler(async (req, res) => {

    const { query, page = 1, limit = 20 } = req.query;

    if (!query) {
        throw new ApiError(400, "Please provide a search query");
    };

    const existedQuiry = await Search.findOne({ query: query.trim().toLowerCase() });
    
    if (!existedQuiry){
        await Search.create({ query: query.trim().toLowerCase() });
    }

    let isFollowedByMe = false;
    if (req.user) {
        isFollowedByMe = {
            $cond: {
                if: {
                    $in: [new mongoose.Types.ObjectId(req.user?._id), "$followers.followedBy"]
                },
                then: true,
                else: false
            }
        }
    }

    const aggregate = User.aggregate([
        {
            $match: {
                $or: [
                    {
                        $text: {
                            $search: query
                        },
                    },
                    {
                        username: {
                            $regex: query,
                            $options: "i",
                        },
                    },
                ],
            },

        },
        {
            $lookup: {
                from: "followers",
                localField: "_id",
                foreignField: "profile",
                as: "followers"
            }
        },
        {
            $addFields: {
                followersCount: {
                    $size: "$followers"
                },
                isFollowedByMe: isFollowedByMe,
                "score": { "$meta": "textScore" }
            }
        },
        {
            $sort: { score: -1 },
        },
        {
            $project: {
                followersCount: 1,
                username: 1,
                fullName: 1,
                avatar: 1,
                isFollowedByMe: 1
            }
        },

    ]);

    const profiles = await User.aggregatePaginate(aggregate, {
        page: parseInt(page),
        limit: parseInt(limit)
    });

    if (!profiles) {
        throw new ApiError(500, "An error occurred while fetching search suggestions");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, profiles, "Search suggestions fetched successfully"));
})


const searchPosts = asyncHandler(async (req, res) => {

    const { query, page = 1, limit = 20 } = req.query;

    if (!query) {
        throw new ApiError(400, "Please provide a search query");
    };

    const existedQuiry = await Search.findOne({ query: query.trim().toLowerCase() });
    
    if (!existedQuiry){
        await Search.create({ query: query.trim().toLowerCase() });
    }

    let isFollowedByMe = false;
    let isLikedByMe = false;
    let isSavedByMe = false;

    if (req.user) {
        isFollowedByMe = {
            $cond: {
                if: {
                    $in: [new mongoose.Types.ObjectId(req.user?._id), "$followers.followedBy"]
                },
                then: true,
                else: false
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

    const aggregate = Post.aggregate([
        {
            $match: {
                $and: [
                    {
                        $text: {
                            $search: query
                        },
                    },
                    {
                        visibility: "public"
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "saveds",
                localField: "_id",
                foreignField: "post",
                as: "saved"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    {
                        $lookup: {
                            from: "followers",
                            localField: "_id",
                            foreignField: "profile",
                            as: "followers"
                        }
                    },
                    {
                        $addFields: {
                            followersCount: {
                                $size: "$followers"
                            },
                            isFollowedByMe: isFollowedByMe
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            followersCount: 1,
                            isFollowedByMe: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "post",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "post",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "forkedFrom",
                as: "share"
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "forkedFrom",
                foreignField: "_id",
                as: "forkedFrom",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "author",
                            foreignField: "_id",
                            as: "author",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        fullName: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            author: {
                                $arrayElemAt: ["$author", 0]
                            }
                        }
                    },
                    {
                        $project: {
                            assetURL: 1,
                            title: 1,
                            content: 1,
                            type: 1,
                            author: 1,
                            visibility: 1,
                            createdAt: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                commentsCount: {
                    $size: "$comments"
                },
                sharesCount: {
                    $size: "$share"
                },
                savedCount: {
                    $size: "$saved"
                },
                author: {
                    $arrayElemAt: ["$author", 0]
                },
                isLikedByMe: isLikedByMe,
                isSavedByMe: isSavedByMe,
                forkedFrom: {
                    $arrayElemAt: ["$forkedFrom", 0]
                },
                "score": { "$meta": "textScore" }
            }
        },
        {
            $project: {
                likes: 0,
                comments: 0,
                share: 0,
                saved: 0
            }
        },
        {
            $sort: { score: -1 },
        }
    ]);

    const posts = await Post.aggregatePaginate(aggregate, {
        page: parseInt(page),
        limit: parseInt(limit)
    });

    if (!posts) {
        throw new ApiError(500, "An error occurred while fetching search suggestions");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, posts, "Search suggestions fetched successfully"));
});


export {
    searchUser,
    getSearchSuggestions,
    searchPosts,
}

