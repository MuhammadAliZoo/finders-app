import express from "express"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Apply middleware to all routes
router.use(protect)

// Placeholder for upload routes
router.post("/", (req, res) => {
  res.json({ message: "Upload API" })
})

export default router

