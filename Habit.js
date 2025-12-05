
import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    frequency: { type: String, default: "daily" },
    streak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    lastDoneDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
