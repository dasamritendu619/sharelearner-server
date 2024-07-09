import mongoose from "mongoose";
import { DB_NAME, PORT, DB_URL } from "../constants.js";

const connectDb = async () => {
    mongoose.connect(`${DB_URL}/${DB_NAME}`).then(() => {
        console.log(`MONGODB connected to ${DB_NAME} on port ${PORT}`);
    }).catch((err) => {
        console.log(`MONGODB connection failed with error: ${err}`);
        process.exit(1);
    })
}
export default connectDb;