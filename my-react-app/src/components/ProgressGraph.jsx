import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressGraph({ data, habitName }) {
    // Calculate if trend is up or down
    const isImproving = data.length >= 2 &&
        data[data.length - 1].completions > data[data.length - 2].completions;

    const lineColor = isImproving ? '#10b981' : '#f97316'; // Green up, Orange down

    return (
        <div className="progress-graph-card">
            <div className="graph-header">
                <h3>{habitName}</h3>
                <span className={`trend-indicator ${isImproving ? 'up' : 'down'}`}>
                    {isImproving ? '📈 Improving' : '📉 Needs Attention'}
                </span>
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="day"
                        stroke="rgba(255,255,255,0.6)"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.6)"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(0,0,0,0.8)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="completions"
                        stroke={lineColor}
                        strokeWidth={3}
                        dot={{ fill: lineColor, r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="graph-stats">
                <div className="stat-item">
                    <span className="stat-label">This Week</span>
                    <span className="stat-value">{data[data.length - 1]?.completions || 0}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Last Week</span>
                    <span className="stat-value">{data[data.length - 2]?.completions || 0}</span>
                </div>
            </div>
        </div>
    );
}
