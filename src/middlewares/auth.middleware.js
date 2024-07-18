import jwt from 'jsonwebtoken';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {asyncHandler} from '../utils/asyncHandeler.js';
import mongoose from 'mongoose';

const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        // get token from header or cookie
        const accessToken=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","").split(" ")[0];
        const refreshToken=req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ","").split(" ")[1];
        // check if accessToken exists
        if (!accessToken || accessToken === "null") {
            throw new ApiError(401,"Unauthorized request");
        }
        // check if refreshToken exists
        if (!refreshToken || refreshToken === "null") {
            throw new ApiError(401,"Unauthorized request");
        }
        // verify token
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
        // check if token is valid
        if (!decodedToken) throw new ApiError(403,"Unauthorized request");
        // find user
        const user = await User.findOne({$and:[{_id:new mongoose.Types.ObjectId(decodedToken?._id)},{refreshToken:refreshToken}]}).select("email username fullName _id avatar");
        // check if user exists
        if (!user) {
            throw new ApiError(403,"Unauthorized request");
        }
        // set user to req.user
        req.user = user;
        req.refreshToken = refreshToken;
        return next();

    } catch (error) {
        // check if token is expired or invalid
        if (error.message === "jwt expired") {
            throw new ApiError(401,"Token expired");  
        }else{
            throw new ApiError(403,"Unauthorized request");
        }
    }
})

const checkCurrentUser = asyncHandler(async(req,res,next)=>{
    try {
        // get token from header or cookie
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","").split(" ")[0];
        // check if token exists
        if (!token || token === "null") {
            return next();
        }
        // verify token
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        // check if token is valid
        if (!decodedToken) return next();
        // find user
        const user = await User.findOne({$and:[{_id:new mongoose.Types.ObjectId(decodedToken?._id)},{refreshToken:{$exists:true}}]})
        .select("_id username email fullname");
        // check if user exists
        if (!user) {
           return next()
        }
        // set user to req.user
        req.user = user;
        return next();

    } catch (error) {
        next();
    }
})


export {verifyJWT , checkCurrentUser}