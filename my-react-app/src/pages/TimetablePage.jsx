import React, { useEffect, useState } from "react";
import { getTimetable, createEntry, updateEntry, deleteEntry } from "../api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetablePage() {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    const [entryDay, setEntryDay] = useState("Monday");
    const [entryTitle, setEntryTitle] = useState("");
    const [entryDesc, setEntryDesc] = useState("");
    const [entryTime, setEntryTime] = useState("");
    const [editingEntryId, setEditingEntryId] = useState(null);

    useEffect(() => {
        loadTimetable();
    }, []);

    async function loadTimetable() {
        try {
            const res = await getTimetable();
            setTimetable(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Load timetable error:", err);
            setTimetable([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateEntry(e) {
        e.preventDefault();
        if (!entryTitle.trim()) return;

        try {
            if (editingEntryId) {
                const res = await updateEntry(editingEntryId, {
                    dayOfWeek: entryDay,
                    title: entryTitle,
                    description: entryDesc,
                    time: entryTime
                });
                if (res?.data) {
                    setTimetable((p) => p.map((e) => (e._id === editingEntryId ? res.data : e)));
                }
                setEditingEntryId(null);
            } else {
                const res = await createEntry({
                    dayOfWeek: entryDay,
                    title: entryTitle,
                    description: entryDesc,
                    time: entryTime
                });
                if (res?.data) setTimetable((p) => [...p, res.data]);
            }

            setEntryDay("Monday");
            setEntryTitle("");
            setEntryDesc("");
            setEntryTime("");
        } catch (err) {
            console.error("Create/Update entry error:", err);
        }
    }

    function handleEditEntry(entry) {
        setEditingEntryId(entry._id);
        setEntryDay(entry.dayOfWeek);
        setEntryTitle(entry.title);
        setEntryDesc(entry.description || "");
        setEntryTime(entry.time || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleCancelEdit() {
        setEditingEntryId(null);
        setEntryDay("Monday");
        setEntryTitle("");
        setEntryDesc("");
        setEntryTime("");
    }

    async function handleDeleteEntry(id) {
        if (!window.confirm("Delete this class?")) return;

        try {
            await deleteEntry(id);
            setTimetable((p) => p.filter((e) => e._id !== id));
        } catch (err) {
            console.error("Delete entry error:", err);
        }
    }

    if (loading) {
        return <div className="dashboard"><div className="loading">Loading...</div></div>;
    }

    const todayIndex = new Date().getDay();
    const todayName = DAYS[todayIndex - 1] || "Monday";

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <h1>📅 Weekly Timetable</h1>
                    <p>Manage your weekly class schedule</p>
                </div>

                {/* Add Class Form */}
                <div className="add-habit-section">
                    <h2 className="section-title">
                        {editingEntryId ? "✏️ Edit Class" : "➕ Add New Class"}
                    </h2>
                    <form className="habit-form" onSubmit={handleCreateEntry}>
                        <select
                            value={entryDay}
                            onChange={(e) => setEntryDay(e.target.value)}
                        >
                            {DAYS.map((d) => (
                                <option key={d}>{d}</option>
                            ))}
                        </select>
                        <input
                            type="time"
                            placeholder="Time"
                            value={entryTime}
                            onChange={(e) => setEntryTime(e.target.value)}
                        />
                        <input
                            placeholder="Class/Activity (e.g., Mathematics)"
                            value={entryTitle}
                            onChange={(e) => setEntryTitle(e.target.value)}
                            required
                        />
                        <input
                            placeholder="Description (e.g., Room 101)"
                            value={entryDesc}
                            onChange={(e) => setEntryDesc(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit">
                                {editingEntryId ? "💾 Update" : "➕ Add"}
                            </button>
                            {editingEntryId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    style={{ background: '#f1f5f9', color: '#475569' }}
                                >
                                    ✖ Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Timetable Grid */}
                <div className="timetable-section">
                    <h2 className="section-title">📚 Your Schedule</h2>
                    {timetable.length === 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '48px',
                            textAlign: 'center',
                            color: '#64748b'
                        }}>
                            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📅</p>
                            <h3 style={{ marginBottom: '8px', color: '#0f172a' }}>No classes scheduled!</h3>
                            <p>Add your first class above to start organizing your week</p>
                        </div>
                    ) : (
                        <div className="timetable-grid">
                            {DAYS.map((day) => {
                                const entries = timetable.filter((e) => e.dayOfWeek === day);
                                const isToday = day === todayName;

                                return (
                                    <div
                                        key={day}
                                        className={`timetable-day-card ${isToday ? 'today' : ''}`}
                                    >
                                        <div className="day-header">
                                            <h3>{day}</h3>
                                            {isToday && <span className="today-badge">Today</span>}
                                        </div>

                                        {entries.length === 0 ? (
                                            <p className="no-classes">No classes</p>
                                        ) : (
                                            <div className="classes-list">
                                                {entries.map((entry) => (
                                                    <div key={entry._id} className="class-entry">
                                                        <div className="class-info">
                                                            {entry.time && (
                                                                <span className="class-time">{entry.time}</span>
                                                            )}
                                                            <div className="class-details">
                                                                <strong>{entry.title}</strong>
                                                                {entry.description && (
                                                                    <span className="class-desc">📍 {entry.description}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="class-actions">
                                                            <button
                                                                className="icon-btn edit"
                                                                onClick={() => handleEditEntry(entry)}
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                className="icon-btn delete"
                                                                onClick={() => handleDeleteEntry(entry._id)}
                                                                title="Delete"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
