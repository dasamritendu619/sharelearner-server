import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { sendMail } from "../utils/resend.js";
import { DEFAULT_AVATAR,DEFAULT_COVER_PHOTO} from "../constants.js" 
import {deleteFromCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

function isStrongPassword(password) {
    // Check if password length is at least 8 characters
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }

    // Regular expressions to check if password contains required characters
    const lowerCaseRegex = /[a-z]/;
    const upperCaseRegex = /[A-Z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*]/;

    // Check if password contains at least one lowercase letter
    if (!lowerCaseRegex.test(password)) {
        return "Password must contain at least one lowercase letter";
    }

    // Check if password contains at least one uppercase letter
    if (!upperCaseRegex.test(password)) {
        return "Password must contain at least one uppercase letter";
    }

    // Check if password contains at least one digit
    if (!digitRegex.test(password)) {
        return "Password must contain at least one digit";
    }

    // Check if password contains at least one special character
    if (!specialCharRegex.test(password)) {
        return "Password must contain at least one special character";
    }

    // If all conditions pass, password is strong
    return true;
}


function validateEmail(email) {
    // Regular expression for a basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test the email against the regular expression
    return emailRegex.test(email);
}

function isValidUsername(inputString) {
    // Check if the string starts or ends with "-"
    if (inputString.startsWith('-') || inputString.endsWith('-')) {
        return "Username cannot start or end with '-'";
    }
    // Check if the string contains spaces, special characters (except "-"), or capital letters
    if (/[\sA-Z!@#$%^&*()_+={}[\]:;<>,.?~\\\/]/.test(inputString)) {
        return "Username can only contain lowercase letters, numbers, and hyphens";
    }
    // Check if the string starts with a number
    if (/^\d/.test(inputString)) {
        return "Username cannot start with a number";
    }
    // If all conditions are met, return true
    return true;
}

function generateUserVerificationToken({ email, fullName, _id }) {
    const token = jwt.sign({ email, fullName, _id }, process.env.USER_VERIFICATION_TOKEN_SECRET, { expiresIn: process.env.USER_VERIFICATION_TOKEN_EXPIRY });
    return token;
}

function generateOTP() {
    // Generate a random 6-digit number
    return String(Math.floor(100000 + Math.random() * 900000));
}

const registerUser = asyncHandler(async (req, res) => {
    // get username,email,password,fullName from req.body
    const { username, email, password, fullName } = req.body;
    // check if username,email,password,fullName exists or not
    if (!username || !email || !password || !fullName) {
        throw new ApiError(400, "All fields are required");
    }
    // validate password
    const passwordError = isStrongPassword(password);
    // if password is not strong
    if (passwordError !== true) {
        throw new ApiError(400, passwordError);
    }
    // validate email
    if (!validateEmail(email)) throw new ApiError(400, "Invalid email address");
    // validate username
    const usernameError = isValidUsername(username);
    if (usernameError !== true) {
        throw new ApiError(400, usernameError);
    }
    // check if user already exists
    const existeduser = await User.findOne({ $or: [{ username: username }, { email: email }] });

    if (existeduser) {
        throw new ApiError(400, "User already exists");
    }

    const otp = generateOTP();
    // create user
    const user = await User.create({
        username,
        email,
        password,
        fullName,
        loginOTP: otp,
        loginExpires: Date.now() + 10 * 60 * 1000,
    });

    if (!user) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    const newUser = {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        _id: user._id
    }

    // send verification email

    await sendMail("welcomeUser", user.email, user.fullName, otp);

    // send response
    return res
        .status(201)
        .json(new ApiResponce(201, newUser, "User created successfully"));
})


const verifyUser = asyncHandler(async (req, res) => {
    // get otp from req.body
    const { otp, identifier } = req.body;
    // check if otp exists or not
    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }
    // check if email exists or not
    if (!identifier) {
        throw new ApiError(400, "Identifier is required");
    }
    // find user by otp
    const user = await User.findOne({ loginOTP: otp, $or: [{ email: identifier }, { username: identifier }]}).select("-password");
    // if user not found
    if (!user) {
        throw new ApiError(404, "Invalid OTP ");
    }
    // check if otp is expired
    if (user.loginExpires < Date.now()) {
        throw new ApiError(400, "OTP expired");
    }
    // generate access token and refresh token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    const refreshTokenArray = user.refreshToken;
    // update refresh token
    if (refreshTokenArray.length >= 5) {
        refreshTokenArray.shift();
    }
    refreshTokenArray.push(refreshToken);
    // set cookie options
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }

    // update user
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            isVerified: true,
            refreshToken: refreshTokenArray,
            $unset: {
                loginOTP: "",
                loginExpires: ""
            }
        }, { new: true });
    // if user not updated
    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while verifying user");
    }

    updatedUser.refreshToken = undefined;
    updatedUser.password = undefined;
    // send response
    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...options, maxAge: 86400000 })
        .cookie("refreshToken", refreshToken, { ...options, maxAge: 86400000 * 180 })
        .json(new ApiResponce(200, { accessToken, refreshToken, updatedUser }, "User logged in successfully"));
})

const loginUser = asyncHandler(async (req, res) => {
    // get email,password from req.body
    const { identifier, password } = req.body;
    // check if email,password exists or not
    if (!identifier || !password) {
        throw new ApiError(400, "Email or username and password are required");
    }
    // find user by email or username
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    // if user not found
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // check if password is correct
    const isPasswordMatch = await user.isPasswordMatch(password);
    if (!isPasswordMatch) {
        throw new ApiError(400, "Invalid password");
    }

    const otp = generateOTP();
    // update user
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            loginOTP: otp,
            loginExpires: Date.now() + 10 * 60 * 1000
        }, { new: true }
    );

    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating user");
    }

    // send verification email
    await sendMail("login_account", user.email, user.fullName, otp);

    // send response
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "OTP sent to your email"));    
});

const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user || ! req.refreshToken) {
        throw new ApiError(401, "Unauthorized");
    }
    const { fromAllDervice = "" } = req.query;
    if (fromAllDervice) {
        await User.findByIdAndUpdate(req.user._id, { refreshToken: [] });

    } else {
        await User.findByIdAndUpdate(req.user._id, { $pull: { refreshToken: req.refreshToken } });
    }
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }
    // send response
    return res
        .status(200)
        .clearCookie("refreshToken", { ...options, maxAge: (86400000 * 180) })
        .clearCookie("accessToken", { ...options, maxAge: 86400000 })
        .json(new ApiResponce(200, {}, "User logged out successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, req.user, "User found"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken=req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ","").split(" ")[1];
    if (!refreshToken) {
        throw new ApiError(401, "Unauthorized");
    }
    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) {
        throw new ApiError(403, "Unauthorized request");
    }
    const user=await User.findOne({$and:[{_id:new mongoose.Types.ObjectId(decodedToken?._id)},{refreshToken:refreshToken}]}).select("-password -refreshToken");
    // check if user exists
    if (!user) {
        throw new ApiError(403, "Unauthorized request");
    }
    const accessToken = user.generateAccessToken();
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...options, maxAge: 86400000 })
        .json(new ApiResponce(200, { accessToken }, "Token refreshed successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }
    if(oldPassword===newPassword){
        throw new ApiError(400, "Old password and new password cannot be same");
    }
    const passwordError = isStrongPassword(newPassword);
    if (passwordError !== true) {
        throw new ApiError(400, passwordError);
    }
    const user = await User.findById(req.user._id);
    const isPasswordMatch = await user.isPasswordMatch(oldPassword);
    if (!isPasswordMatch) {
        throw new ApiError(400, "Invalid password");
    }
    user.password = newPassword;
    user.refreshToken = [req.refreshToken];
    const savedUser=await user.save();
    if (!savedUser) {
        throw new ApiError(500, "Something went wrong while changing password");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Password changed successfully"));
});


const sendForgotPasswordByEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    const user=await User.findOne({email});
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    const updatedUser = await user.save();
    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating user");
    }
    await sendMail("reset_password", user.email, user.fullName, otp);
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "OTP sent to your email"));

});

const verifyResetPassword = asyncHandler(async (req, res) => {
    const { otp, email, newPassword } = req.body;
    if (!otp || !email || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }
    const passwordError = isStrongPassword(newPassword);
    if (passwordError !== true) {
        throw new ApiError(400, passwordError);
    }
    const user = await User.findOne({ email, resetPasswordOTP: otp });
    if (!user) {
        throw new ApiError(404, "Invalid OTP");
    }
    if (user.resetPasswordExpires < Date.now()) {
        throw new ApiError(400, "OTP expired");
    }
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating user");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Password reset successfully"));

});


const sendEmailForUpdateEmailRequest= asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    const user=await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const existed=await User.findOne({email});
    if (existed) {
        throw new ApiError(400, "User with Same Email already exists");
    }
    const otp = generateOTP();
    user.emailVerificationOTP = otp;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    user.changedEmail = email;
    const updatedUser = await user.save();
    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating user");
    }
    await sendMail("changeEmail", email, user.fullName, otp);
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "OTP sent to your new email"));
});

const verifyChangeEmail = asyncHandler(async (req, res) => {
    const { otp, email } = req.body;
    if (!otp || !email) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await User.findOne({ emailVerificationOTP: otp, changedEmail: email,email: req.user?.email});
    if (!user) {
        throw new ApiError(404, "Invalid OTP");
    }
    if (user.emailVerificationExpires < Date.now()) {
        throw new ApiError(400, "OTP expired");
    }
    
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            email: email,
            $unset: {
                emailVerificationOTP: "",
                emailVerificationExpires: "",
                changedEmail: ""
            }
        }, { new: true }
    );
    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating user");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Email changed successfully"));
});

const updateUserDetails=asyncHandler(async (req,res)=>{
    const {fullName,dob,gender,education,about,address,links,interest}=req.body;
    if (!fullName && !dob && !gender && !education && !about && !address && !links && !interest) {
        throw new ApiError(400, "Atleast one field is required");
    }
    
    const user=await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.fullName=fullName || user.fullName;
    user.dob=dob ? new Date(dob) : user.dob;
    user.gender=gender || user.gender;
    user.education=education || user.education;
    user.about=about || user.about;
    user.address=address || user.address;
    user.links=links || user.links;
    user.interest=interest || user.interest;

    const updatedUser = await user.save();
    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating user");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, updatedUser, "User details updated successfully"));
});

const updateAvatar=asyncHandler(async (req,res)=>{
    const {avatarUrl}=req.body;
    if (!avatarUrl) {
        throw new ApiError(400, "Avatar URL is required");
    }
    const user=await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // img.split("upload/")[1].split(".")[0]
    if(user.avatar!==DEFAULT_AVATAR){
        const deletedImage=await deleteFromCloudinary(user.avatar.split("upload/")[1].split(".")[0]);
        if (!deletedImage) {
            throw new ApiError(500, "Something went wrong while deleting image");
        }
    }
    user.avatar=avatarUrl;
    const updatedUser = await user.save();
    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating user");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Avatar updated successfully"));
});

const updateCoverPhoto=asyncHandler(async (req,res)=>{
    const {coverPhotoUrl}=req.body;
    if (!coverPhotoUrl) {
        throw new ApiError(400, "Cover Photo URL is required");
    }
    const user=await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if(user.coverPhoto!==DEFAULT_COVER_PHOTO){
        const deletedImage=await deleteFromCloudinary(user.coverPhoto.split("upload/")[1].split(".")[0]);
        if (!deletedImage) {
            throw new ApiError(500, "Something went wrong while deleting image");
        }
    }
    user.coverPhoto=coverPhotoUrl;
    const updatedUser = await user.save();
    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating user");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Cover photo updated successfully"));

});

// const deleteUser=asyncHandler(async (req,res)=>{
//     const {password}  = req.query;
//     if (!password) {
//         throw new ApiError(400, "Password is required");
//     }
//     const user=await User.findById(req.user._id);
//     if (!user) {
//         throw new ApiError(404, "User not found");
//     }
//     const isPasswordMatch = await user.isPasswordMatch(password);
//     if (!isPasswordMatch) {
//         throw new ApiError(400, "Invalid password");
//     }
//     const deletedUser=await User.findByIdAndDelete(user._id);
//     if (!deletedUser) {
//         throw new ApiError(500, "Something went wrong while deleting user");
//     }
    
// });

const checkUserNameAvialability=asyncHandler(async (req,res)=>{
    const {username}  = req.params;
    if (!username) {
        throw new ApiError(400, "Username is required");
    }
    const user=await User.findOne({username});
    if (user) {
        throw new ApiError(400, "Username already taken");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Username available"));
});

const getCurrentUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    user.refreshToken = undefined;
    user.password = undefined;
    return res
        .status(200)
        .json(new ApiResponce(200, user, "User found"));
})

const getProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    let isFollowedByMe = false;
    if (req.user) {
        isFollowedByMe = {
            $cond:{
                if:{
                    $in:[new mongoose.Types.ObjectId(req.user?._id),"$followers.followedBy"]
                },
                then:true,
                else:false
            }
        };
    }

    const user = await User.aggregate([
        {
            $match: { username: username }
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "author",
                as: "posts"
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
            $lookup:{
                from:"followers",
                localField:"_id",
                foreignField:"followedBy",
                as:"followings"
            }
        },
        {
            $addFields:{
                followersCount:{
                    $size:"$followers"
                },
                followingsCount:{
                    $size:"$followings"
                },
                postsCount:{
                    $size:"$posts"
                },
                isFollowedByMe:isFollowedByMe
            }
        },
        {
            $project:{
                username:1,
                fullName:1,
                dob:1,
                interest:1,
                links:1,
                avatar:1,
                coverPhoto:1,
                education:1,
                about:1,
                address:1,
                followersCount:1,
                followingsCount:1,
                postsCount:1,
                isFollowedByMe:1,
                gender:1,
                createdAt:1,
            }
        }
    ])

    if (!user || user.length === 0) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, user[0], "User found"));

});

export {
    registerUser,
    verifyUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    changePassword,
    sendForgotPasswordByEmail,
    verifyResetPassword,
    sendEmailForUpdateEmailRequest,
    verifyChangeEmail,
    updateUserDetails,
    updateAvatar,
    updateCoverPhoto,
    checkUserNameAvialability,
    getCurrentUserDetails,
    getProfile,
}