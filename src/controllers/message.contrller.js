import { ApiError } from '../utils/ApiError.js';
import { ApiResponce } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { Conversation} from "../models/conversation.model.js"
import { Message } from "../models/message.model.js"
import { getReceiverSocketId, io } from "../socket/socket.js";

const sendMessage = asyncHandler(async(req,res)=>{
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const {message} = req.body;
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
    const receiverId = req.params.id;
    const senderId = req.user._id;

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