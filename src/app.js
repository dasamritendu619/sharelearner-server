import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/errorHendeler.meddleware.js";
import {app,server} from './socket/socket.js'
import dotenv from "dotenv";
import connectDB from './DB/index.js';

//const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    optionsSuccessStatus:200,
    credentials:true
}))
app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({extended:true,limit:"10mb"}));
app.use(cookieParser());
app.use(express.static("public"));

// import routes
import userRoute from "./routes/user.route.js";
import healthCheckRoute from "./routes/healthCheck.route.js";
import postRoute from "./routes/post.route.js";
import likesRoute from "./routes/likes.route.js";
import followerRoute from "./routes/followers.route.js";
import commentRoute from "./routes/comment.route.js";
import replyRoute from "./routes/reply.route.js";
import savedRoute from "./routes/saved.route.js";
import groupRoute from "./routes/group.route.js";
import memberRoute from "./routes/member.route.js";
import  searchRoute from "./routes/search.route.js";
import messageRoute from "./routes/message.route.js";


// use routes
app.use("/api/v1/user",userRoute);
app.use("/api/v1/healthCheck",healthCheckRoute);
app.use("/api/v1/post",postRoute);
app.use("/api/v1/likes",likesRoute);
app.use("/api/v1/followers",followerRoute);
app.use("/api/v1/comment",commentRoute);
app.use("/api/v1/reply",replyRoute);
app.use("/api/v1/saved",savedRoute);
app.use("/api/v1/group",groupRoute);
app.use("/api/v1/member",memberRoute);
app.use("/api/v1/search",searchRoute);
app.use("/api/v1/message",messageRoute)

app.use(errorHandler);
//export default app;

dotenv.config({ path: "./.env" });

// connect to database
connectDB()
.then(()=>{
    server.on("error",(error)=>{
        console.error("Error on express server:"+error);
        throw error;
    })

    server.listen(process.env.PORT||8080,()=>{
        console.log("Server is running on port no " + process.env.PORT||8080)
    })
})
.catch((err)=>{
    console.error("Error on connect Express:"+err);
    throw err;
})