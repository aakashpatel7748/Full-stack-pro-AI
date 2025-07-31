// import { Redis } from 'ioredis';


// const redis = new Redis({})


// redis.on("connect", () => {
//     console.log("Redis connected")
// })

// redis.on("ready", () => {
//     console.log("Redis ready")
// })

// redis.on("error", (err) => {
//     console.error("Redis error --->>", err)
// })

// export const appendMessage = async (key, messageData) => {
//     await redis.rpush(key, JSON.stringify(messageData))
// }

// export const getMessages = async (key) => {
//     const messages = await redis.lrange(key, 0, -1);
//     return messages.map(message => {
//         const tempMessage = JSON.parse(message)
//         return {
//             role: tempMessage.role === 'assistant' ? 'model' : 'user',
//             parts: [
//                 {
//                     text: tempMessage.content,
//                 }
//             ]
//         }
//     });
// }

// export default redis;




// chatStore.js
import ChatMessage from "../models/ChatMessage.js";

// Save message to MongoDB
export const appendMessage = async (key, messageData) => {
    await ChatMessage.create({
        key,
        role: messageData.role,
        content: messageData.content
    });
};

// Get messages from MongoDB
export const getMessages = async (key) => {
    const messages = await ChatMessage.find({ key }).sort({ timestamp: 1 }); // sorted oldest first

    return messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [
            {
                text: msg.content,
            }
        ]
    }));
};
