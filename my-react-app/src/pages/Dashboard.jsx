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