import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET user profile
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// UPDATE user profile
router.put("/", authMiddleware, async (req, res) => {
    try {
        const { age, gender, bio, avatar, timezone, goals } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update profile fields
        if (age !== undefined) user.profile.age = age;
        if (gender) user.profile.gender = gender;
        if (bio !== undefined) user.profile.bio = bio;
        if (avatar) user.profile.avatar = avatar;
        if (timezone) user.profile.timezone = timezone;
        if (goals !== undefined) user.profile.goals = goals;

        await user.save();

        // Return user without password
        const updatedUser = await User.findById(req.user.id).select("-password");
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;

