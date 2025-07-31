import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["user", "assistant"]
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
