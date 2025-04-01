import { ApiError } from '../utils/ApiError.js';
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { Conversation} from "../models/conversation.model.js"
import { Message } from "../models/message.model.js"
import { getReceiverSocketId, io } from "../socket/socket.js";
import mongoose from 'mongoose';

const sendMessage = asyncHandler(async(req,res)=>{
    const loggedInUserId = req.user._id;
    const { receiverId } = req.params;
    const { message } = req.body;

    const senderId = new mongoose.Types.ObjectId(loggedInUserId);

    let gotConversation = await Conversation.findOne({
        participants:{$all:[senderId,receiverId]},
    })

    if(!gotConversation){
        gotConversation = await Conversation.create({
            participants:[senderId,receiverId]
        })
    }

    const newMessage = await Message.create({
        senderId,
        receiverId,
        message
    });

    if(newMessage){
        gotConversation.messages.push(newMessage._id);
    }
    await Promise.all([gotConversation.save(), newMessage.save()]);

    // Socket Io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId){
        io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    return res.status(201).json(
        new ApiResponce(201,newMessage,"Message send successfully")
    )
})

const getMessage = asyncHandler(async(req,res)=>{
    const { receiverId } = req.params;
    const loggedInUserId = req.user._id;

    const senderId = new mongoose.Types.ObjectId(loggedInUserId);

    let gotConversation = await Conversation.findOne({
        participants:{$all : [senderId, receiverId]},
    });

    if(!gotConversation){
        return res.status(201).json(
            new ApiResponce(201,[],"message fetch successfully")
        )
    };
    const conversation = await Conversation.findOne({
        participants:{$all:[senderId,receiverId]}
    }).populate("messages")

    return res.status(201).json(
        new ApiResponce(201,conversation.messages,"message fetch successfully")
    )
})

export {
    sendMessage,
    getMessage
}