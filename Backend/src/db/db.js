import mongoose from "mongoose";
import config from "../config/config.js";

function connectDB() {
    mongoose.connect(config.MONGODB_URI)

        .then(() => {
            console.log("MongoDB Connected")
        })
        .catch((err) => {
            console.error("MongoDB Connection error", err)
        })
}

export default connectDB