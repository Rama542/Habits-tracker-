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


// POST create habit
app.post("/api/habits", authMiddleware, async (req, res) => {
  try {
    const { name, description, frequency } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const newHabit = await Habit.create({
      userId: req.user.id,
      name,
      description: description || "",
      frequency: frequency || "daily",
    });

    res.status(201).json(newHabit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update habit
app.put("/api/habits/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Habit.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Habit not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT mark habit as done
app.put("/api/habits/:id/done", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findOne({ _id: id, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (!habit.lastDoneDate) {
      habit.streak = 1;
    } else {
      const last = new Date(habit.lastDoneDate);
      const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) habit.streak += 1;
      else if (diffDays > 1) habit.streak = 1;
    }

    const last = habit.lastDoneDate ? new Date(habit.lastDoneDate) : null;
    const lastDateOnly = last
      ? new Date(last.getFullYear(), last.getMonth(), last.getDate())
      : null;
    const alreadyMarkedToday =
      lastDateOnly && lastDateOnly.getTime() === todayDate.getTime();

    if (!alreadyMarkedToday) {
      habit.totalCompletions += 1;
      habit.lastDoneDate = today;
      await habit.save();
    } else {
      await habit.save();
    }

    res.json(habit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE habit
app.delete("/api/habits/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Habit.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Habit not found" });
    res.json({ message: "Habit deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

