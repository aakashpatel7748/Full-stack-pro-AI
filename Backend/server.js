import app from "./src/app.js"
import config from "./src/config/config.js"
import connectDB from "./src/db/db.js"
import http from "http"
import initSocket from "./src/socket/socket.js"

// Create the HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with the server
initSocket(server);

connectDB()

server.listen(config.PORT, () => {
    console.log(`server is raning on port ${config.PORT}`)
})