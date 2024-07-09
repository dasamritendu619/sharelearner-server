import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likesSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    reply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply'
    },
}, {
    timestamps: true
});

likesSchema.plugin(mongooseAggregatePaginate);
export const Likes = mongoose.model('Likes', likesSchema);