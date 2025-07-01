import { Server } from "socket.io";
import UserModel from "../models/user.model.js";
import getResponse from "../services/ai.services.js";
import { appendMessage, getMessages } from "../services/cache.service.js";

export default function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        const cookie = socket.handshake.headers.cookie;
        if (!cookie) {
            return next(new Error("Authentication error"));
        }
        const token = cookie?.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1];
        if (!token) {
            return next(new Error("Authentication error"));
        }
        const user = await UserModel.authToken(token);
        if (!user) {
            return next(new Error("Authentication error"));
        }
        socket.user = user;
        next();
    });

    io.on("connection", async (socket) => {
        console.log("new client connected");

        const messages =await getMessages(`connection:${socket.user._id}`);
        socket.emit("chat-history", messages);

        socket.on("message", async (data) => {
            const { message } = data;

            // Append the message to the cache (user)

            appendMessage(`connection:${socket.user._id}`, {
                role: "user",
                content: message
            })

            const messages = await getMessages(`connection:${socket.user._id}`);


            const response = await getResponse(messages, socket.user);

            // Append the response to the cache (AI)

            appendMessage(`connection:${socket.user._id}`, {
                role: "assistant",
                content: response
            })
            

            socket.emit("message", {
                message: response,
                user: socket.user.name
            });
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    return io;
}
