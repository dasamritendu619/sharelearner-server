import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import {DEFAULT_GROUP_ICON,DEFAULT_GROUP_BANNER} from "../constants.js"

const groupSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupName: {
        type: String,
        required: true,
        index: "text",
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    groupIcon:{
        type: String,
        trim: true,
        default:DEFAULT_GROUP_ICON
    },
    groupBanner:{
        type: String,
        trim: true,
        default:DEFAULT_GROUP_BANNER
    },
    onlyAdminCanSendMessage: {
        type: Boolean,
        default: false
    },
    onlyAdminCanEditGroupSettings: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true
});

groupSchema.plugin(mongooseAggregatePaginate);

export const Group = mongoose.model('Group', groupSchema);