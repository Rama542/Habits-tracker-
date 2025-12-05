
import mongoose from "mongoose";

const timetableEntrySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      required: true
    },
    title: { type: String, required: true },
    description: String,
    time: String   // e.g. "10:00 AM - 11:00 AM"
  },
  { timestamps: true }
);

export default mongoose.model("TimetableEntry", timetableEntrySchema);