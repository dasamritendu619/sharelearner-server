import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const replySchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
},{
    timestamps: true
});

replySchema.plugin(mongooseAggregatePaginate);

export const Reply = mongoose.model('Reply', replySchema);

