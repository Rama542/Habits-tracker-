
import express from "express";
import Habit from "../models/Habit.js";

const router = express.Router();

// GET all habits
router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: 1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: "Error fetching habits" });
  }
});

// POST create habit
router.post("/", async (req, res) => {
  try {
    const habit = new Habit(req.body);
    const saved = await habit.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Error creating habit" });
  }
});

// PUT update habit
router.put("/:id", async (req, res) => {
  try {
    const updated = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Error updating habit" });
  }
});

// PUT mark habit as done (increment streak/total)
router.put("/:id/done", async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (!habit.lastDoneDate) {
      // first completion
      habit.streak = 1;
    } else {
      const last = new Date(habit.lastDoneDate);
      const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const diffDays = (todayDate - lastDate) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        habit.streak += 1;   // continue streak
      } else if (diffDays > 1) {
        habit.streak = 1;    // streak broken, restart
      } // if diffDays === 0 we already marked today; keep streak
    }

    habit.totalCompletions += 1;
    habit.lastDoneDate = today;

    const saved = await habit.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error marking habit done" });
  }
});

// DELETE habit
router.delete("/:id", async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "Habit deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting habit" });
  }
});

export default router;
