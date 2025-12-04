import React, { useEffect, useState } from "react";
import { getHabits, createHabit, deleteHabit, markHabitDone } from "../api";
import ProgressGraph from "../components/ProgressGraph";
import HabitCard from "../components/HabitCard";

export default function Dashboard() {
    const [userName] = useState(() => {
        try {
            const u = JSON.parse(localStorage.getItem("authUser"));
            return u?.username || u?.name || "User";
        } catch {
            return "User";
        }
    });

    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    const [habitName, setHabitName] = useState("");
    const [habitDesc, setHabitDesc] = useState("");
    const [habitFreq, setHabitFreq] = useState("daily");

    useEffect(() => {
        loadHabits();
    }, []);

    async function loadHabits() {
        try {
            const res = await getHabits();
            setHabits(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Load habits error:", err);
            setHabits([]);
        } finally {
            setLoading(false);
        }
    }

    try {
        const res = await createHabit({
            name: habitName,
            description: habitDesc,
            frequency: habitFreq
        });

        if (res?.data) {
            setHabits((p) => [...p, res.data]);
        }

        setHabitName("");
        setHabitDesc("");
        setHabitFreq("daily");
    } catch (err) {
        console.error("Create habit error:", err);
    }
}

async function handleMarkDone(id) {
    try {
        const res = await markHabitDone(id);
        if (res?.data) {
            setHabits((p) => p.map((h) => (h._id === id ? res.data : h)));
        }
    } catch (err) {
        console.error("Mark done error:", err);
    }
}

async function handleDeleteHabit(id) {
    if (!window.confirm("Delete this habit?")) return;

    try {
        await deleteHabit(id);
        setHabits((p) => p.filter((h) => h._id !== id));
    } catch (err) {
        console.error("Delete habit error:", err);
    }
}

function handleEditHabit(habit) {
    setHabitName(habit.name);
    setHabitDesc(habit.description || "");
    setHabitFreq(habit.frequency || "daily");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Generate sample progress data for graphs
function generateProgressData(habit) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const streak = habit.streak || 0;
    const total = habit.totalCompletions || 0;

    // Simulate weekly data based on current stats
    return days.map((day, index) => ({
        day,
        completions: Math.max(0, streak - (6 - index) + Math.floor(Math.random() * 2))
    }));
}

if (loading) {
    return <div className="dashboard"><div className="loading">Loading...</div></div>;
}

return (
    <div className="dashboard">
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1>Welcome back, {userName}! 👋</h1>
                <p>Track your habits and watch your progress grow</p>
                <button
                    className="logout-btn"
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        localStorage.removeItem("authToken");
                        localStorage.removeItem("authUser");
                        window.location.href = "/auth";
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Add Habit Form */}
            <div className="add-habit-section">
                <h2 className="section-title">➕ Add New Habit</h2>
                <form className="habit-form" onSubmit={handleCreateHabit}>
                    <input
                        placeholder="Habit name (e.g., Morning Exercise)"
                        value={habitName}
                        onChange={(e) => setHabitName(e.target.value)}
                        required
                    />
                    <input
                        placeholder="Description (optional)"
                        value={habitDesc}
                        onChange={(e) => setHabitDesc(e.target.value)}
                    />
                    <select
                        value={habitFreq}
                        onChange={(e) => setHabitFreq(e.target.value)}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
                    <button type="submit">Add Habit</button>
                </form>
            </div>
