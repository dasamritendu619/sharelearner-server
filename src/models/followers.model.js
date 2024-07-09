import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const followerSchema = new mongoose.Schema({
    followedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, {
    timestamps: true
});

followerSchema.plugin(mongooseAggregatePaginate);
export const Follower = mongoose.model('Follower', followerSchema);