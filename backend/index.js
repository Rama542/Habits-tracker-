import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);


// ===== Connect to MongoDB =====
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("✖ MONGODB_URI not set in .env");
  process.exit(1);
}

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("✖ MongoDB connection error:", err);
    process.exit(1);
  });

// ===== Mongoose Schemas & Models =====
const { Schema, model } = mongoose;

const HabitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    frequency: { type: String, default: "daily" },
    streak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    lastDoneDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const TimetableEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dayOfWeek: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Habit = model("Habit", HabitSchema);
const TimetableEntry = model("TimetableEntry", TimetableEntrySchema);

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// ===== HABIT ROUTES (Protected) =====

// GET all habits
app.get("/api/habits", authMiddleware, async (req, res) => {
  try {
    // req.user.id comes from Firebase Admin verification
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// / ===== HABIT ROUTES (Protected) =====

// GET all habits
app.get("/api/habits", authMiddleware, async (req, res) => {
  try {
    // req.user.id comes from Firebase Admin verification
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
