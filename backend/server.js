import dotenv from "dotenv"
// Load env vars
dotenv.config()

import express from "express"
import cors from "cors"
import connectDB from "./config/db.js"
import { errorHandler, notFound } from "./middleware/error.js"
import authRoutes from "./routes/auth.js"
import itemRoutes from "./routes/items.js"
import disputeRoutes from "./routes/disputes.js"
import adminRoutes from "./routes/admin.js"
import uploadRoutes from "./routes/upload.js"
import http from "http"
import { Server } from "socket.io"

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/items", itemRoutes)
app.use("/api/disputes", disputeRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/upload", uploadRoutes)

// Error handling
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

// Set up Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected")

  // Join a room (e.g., for a specific conversation or admin dashboard)
  socket.on("join", (room) => {
    socket.join(room)
    console.log(`Socket ${socket.id} joined room: ${room}`)
  })

  // Leave a room
  socket.on("leave", (room) => {
    socket.leave(room)
    console.log(`Socket ${socket.id} left room: ${room}`)
  })

  // Send a message
  socket.on("message", (data) => {
    io.to(data.room).emit("message", data)
  })

  // Admin notifications
  socket.on("admin-notification", (data) => {
    io.to("admin").emit("admin-notification", data)
  })

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

