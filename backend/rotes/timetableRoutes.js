
import express from "express";
import TimetableEntry from "../models/TimetableEntry.js";

const router = express.Router();

// GET all entries
router.get("/", async (req, res) => {
  try {
    const entries = await TimetableEntry.find().sort({ createdAt: 1 });
    res.json(entries);
  } catch {
    res.status(500).json({ message: "Error fetching timetable" });
  }
});

// POST create entry
router.post("/", async (req, res) => {
  try {
    const entry = new TimetableEntry(req.body);
    const saved = await entry.save();
    res.status(201).json(saved);
  } catch {
    res.status(400).json({ message: "Error creating entry" });
  }
});

// PUT update entry
router.put("/:id", async (req, res) => {
  try {
    const updated = await TimetableEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(400).json({ message: "Error updating entry" });
  }
});

// DELETE entry
router.delete("/:id", async (req, res) => {
  try {
    await TimetableEntry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted" });
  } catch {
    res.status(400).json({ message: "Error deleting entry" });
  }
});

export default router;
