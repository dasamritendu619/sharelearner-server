import mongoose from 'mongoose';

const searchSchema= new mongoose.Schema({
    query:{
        type: String,
        required: true,
        index:"text",
        trim: true,
    },

    searchTimes:{
        type: Number,
        default: 1,
    },
})


export const Search = mongoose.model('Search', searchSchema);
