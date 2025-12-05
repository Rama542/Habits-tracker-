import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profile: {
            age: { type: Number, min: 13, max: 120 },
            gender: {
                type: String,
                enum: ['male', 'female', 'other', 'prefer-not-to-say'],
                default: 'prefer-not-to-say'
            },
            bio: { type: String, maxlength: 500 },
            avatar: { type: String, default: '😊' }, // Emoji or URL
            timezone: { type: String, default: 'UTC' },
            goals: { type: String, maxlength: 200 }
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);
