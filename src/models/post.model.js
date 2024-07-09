import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new mongoose.Schema({
    tilte: {
        type: String,
        text: "index"
    },
    content:{
        type: String
    },
    type: {
        type: String,
        enum: ["photo", "video", "pdf", "blog","forked"],
        default: "photo"
    },
    views: {
        type: Number,
        default: 0
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    visibility: {
        type: String,
        enum: ["public", "private", "friends"],
        default: "public"
    },
    forkedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    assetURL: {
        type: String
    }
}, {
    timestamps: true
}
);

postSchema.plugin(mongooseAggregatePaginate);

export const Post = mongoose.model('Post', postSchema);
