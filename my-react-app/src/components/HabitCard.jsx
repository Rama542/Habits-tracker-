import React from 'react';

export default function HabitCard({ habit, onMarkDone, onEdit, onDelete }) {
    const isCompletedToday = habit.lastDoneDate &&
        new Date(habit.lastDoneDate).toDateString() === new Date().toDateString();

    const completionRate = habit.totalCompletions > 0
        ? Math.round((habit.streak / habit.totalCompletions) * 100)
        : 0;

    return (
        <div className="modern-habit-card">
            <div className="habit-card-header">
                <div className="habit-info">
                    <h3 className="habit-title">{habit.name}</h3>
                    <p className="habit-description">{habit.description}</p>
                </div>
                <div className="habit-status">
                    {isCompletedToday ? (
                        <span className="status-badge done">✓ Done Today</span>
                    ) : (
                        <span className="status-badge pending">○ Not Done</span>
                    )}
                </div>
            </div>

            <div className="habit-metrics">
                <div className="metric">
                    <span className="metric-icon">🔥</span>
                    <div>
                        <div className="metric-value">{habit.streak || 0}</div>
                        <div className="metric-label">Day Streak</div>
                    </div>
                </div>
                <div className="metric">
                    <span className="metric-icon">✅</span>
                    <div>
                        <div className="metric-value">{habit.totalCompletions || 0}</div>
                        <div className="metric-label">Total</div>
                    </div>
                </div>
                <div className="metric">
                    <span className="metric-icon">📊</span>
                    <div>
                        <div className="metric-value">{completionRate}%</div>
                        <div className="metric-label">Rate</div>
                    </div>
                </div>
            </div>

            <div className="habit-actions">
                {!isCompletedToday && (
                    <button className="action-btn primary" onClick={() => onMarkDone(habit._id)}>
                        <span>✓</span> Mark as Done
                    </button>
                )}
                <button className="action-btn secondary" onClick={() => onEdit(habit)}>
                    <span>✏️</span> Edit
                </button>
                <button className="action-btn danger" onClick={() => onDelete(habit._id)}>
                    <span>🗑️</span> Delete
                </button>
            </div>
        </div>
    );
}
