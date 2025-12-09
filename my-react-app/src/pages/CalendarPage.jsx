import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import './CalendarPage.css';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventTitle, setEventTitle] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventCategory, setEventCategory] = useState('personal');
    const [isDrawing, setIsDrawing] = useState(false);

    const canvasRef = useRef(null);
    const [handwrittenNote, setHandwrittenNote] = useState(null);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const categories = {
        personal: { color: '#667eea', label: 'Personal' },
        work: { color: '#10b981', label: 'Work' },
        study: { color: '#f97316', label: 'Study' },
        health: { color: '#ec4899', label: 'Health' }
    };

    function handleDateClick(date) {
        setSelectedDate(date);
        setShowModal(true);
    }

    function handleAddEvent() {
        if (!eventTitle.trim()) return;

        const newEvent = {
            id: Date.now(),
            date: selectedDate,
            title: eventTitle,
            time: eventTime,
            category: eventCategory,
            note: handwrittenNote
        };

        setEvents([...events, newEvent]);
        closeModal();
    }

    function closeModal() {
        setShowModal(false);
        setEventTitle('');
        setEventTime('');
        setEventCategory('personal');
        setHandwrittenNote(null);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }

    function startDrawing(e) {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    function draw(e) {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = '#1a1f36';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function stopDrawing() {
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            setHandwrittenNote(canvas.toDataURL());
        }
    }

    function clearCanvas() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHandwrittenNote(null);
    }

    const getEventsForDate = (date) => {
        return events.filter(event => isSameDay(new Date(event.date), date));
    };

    return (
        <div className="calendar-page">
            <div className="calendar-container">
                <div className="calendar-header">
                    <h1>{format(currentDate, 'MMMM yyyy')}</h1>
                    <div className="month-nav">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                            ← Prev
                        </button>
                        <button onClick={() => setCurrentDate(new Date())}>Today</button>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                            Next →
                        </button>
                    </div>
                </div>

                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-day-header">{day}</div>
                    ))}

                    {daysInMonth.map(date => {
                        const dayEvents = getEventsForDate(date);
                        const today = isToday(date);

                        return (
                            <motion.div
                                key={date.toString()}
                                className={`calendar-day ${today ? 'today' : ''}`}
                                onClick={() => handleDateClick(date)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="day-number">{format(date, 'd')}</div>
                                <div className="day-events">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            className="event-dot"
                                            style={{ background: categories[event.category].color }}
                                            title={event.title}
                                        />
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <span className="more-events">+{dayEvents.length - 2}</span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Event Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                        >
                            <motion.div
                                className="modal-content"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2>Add Event - {selectedDate && format(selectedDate, 'MMM d, yyyy')}</h2>

                                <input
                                    type="text"
                                    placeholder="Event title"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    className="modal-input"
                                />

                                <input
                                    type="time"
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                    className="modal-input"
                                />

                                <select
                                    value={eventCategory}
                                    onChange={(e) => setEventCategory(e.target.value)}
                                    className="modal-input"
                                >
                                    {Object.entries(categories).map(([key, cat]) => (
                                        <option key={key} value={key}>{cat.label}</option>
                                    ))}
                                </select>

                                <div className="handwriting-section">
                                    <h3>✍️ Handwritten Note</h3>
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={200}
                                        className="drawing-canvas"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                    />
                                    <button onClick={clearCanvas} className="clear-btn">Clear</button>
                                </div>

                                <div className="modal-actions">
                                    <button onClick={closeModal} className="cancel-btn">Cancel</button>
                                    <button onClick={handleAddEvent} className="save-btn">Save Event</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
