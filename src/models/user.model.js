import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {DEFAULT_AVATAR,DEFAULT_COVER_PHOTO} from "../constants.js";


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        index: "text",
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        loawercase: true,
        trim: true
    },
    username: {
        type: String,
        minLength: 4,
        unique: true,
        index: true,
        required: true,
        loawercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minLength: 8,
    },
    refreshToken: [
        {
            type: String,
        }
    ],
    dob: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['F', 'M', 'O']
    },
    avatar: {
        type: String,
        default: DEFAULT_AVATAR
    },
    coverPhoto: {
        type: String,
        default: DEFAULT_COVER_PHOTO
    },
    education: {
        type: String
    },
    about: {
        type: String
    },
    address: {
        type: String
    },
    links: [
        {
            type: String
        }
    ],
    interest: [
        {
            type: String
        }
    ],
    loginOTP: {
        type: String
    },
    loginExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordOTP: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    emailVerificationOTP: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
    changedEmail: {
        type: String,
        loawercase: true,
        trim: true
    },
}, {
    timestamps: true
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordMatch = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.plugin(mongooseAggregatePaginate);
export const User = mongoose.model('User', userSchema);