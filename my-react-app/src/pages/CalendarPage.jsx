import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
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
    const [editingEventId, setEditingEventId] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // Load tasks from backend on mount
    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        try {
            console.log('🔵 CalendarPage: Loading tasks from backend...');
            const res = await getTasks();
            console.log('🔵 CalendarPage: Received tasks:', res.data);

            // Convert backend tasks to frontend event format
            const tasksAsEvents = res.data.map(task => ({
                id: task._id,
                date: new Date(task.date),
                title: task.title,
                time: task.time,
                category: task.category,
                note: task.handwrittenNote
            }));

            console.log('🔵 CalendarPage: Converted to events:', tasksAsEvents);
            setEvents(tasksAsEvents);
        } catch (err) {
            console.error('❌ CalendarPage: Error loading tasks:', err);
        } finally {
            setLoading(false);
        }
    }

    // Load existing note on canvas when editing
    useEffect(() => {
        if (showModal && handwrittenNote && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = handwrittenNote;
        }
    }, [showModal]);

    function handleDateClick(date) {
        setSelectedDate(date);
        setEditingEventId(null);
        setEventTitle('');
        setEventTime('');
        setEventCategory('personal');
        setHandwrittenNote(null);
        setShowModal(true);
    }

    function handleEditEvent(event) {
        setSelectedDate(new Date(event.date));
        setEventTitle(event.title);
        setEventTime(event.time);
        setEventCategory(event.category);
        setHandwrittenNote(event.note);
        setEditingEventId(event.id);
        setShowModal(true);
    }

    async function handleSaveEvent() {
        if (!eventTitle.trim()) return;

        try {
            // Ensure date is in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
            const dateISO = selectedDate.toISOString();
            console.log('🔵 CalendarPage: Saving event with date:', dateISO);

            if (editingEventId) {
                // Update existing event
                console.log('🔵 CalendarPage: Updating event ID:', editingEventId);
                const updateData = {
                    title: eventTitle,
                    time: eventTime,
                    category: eventCategory,
                    handwrittenNote: handwrittenNote,
                    date: dateISO
                };

                const res = await updateTask(editingEventId, updateData);
                console.log('🔵 CalendarPage: Update response:', res.data);

                setEvents(events.map(e =>
                    e.id === editingEventId
                        ? { id: res.data._id, date: new Date(res.data.date), title: res.data.title, time: res.data.time, category: res.data.category, note: res.data.handwrittenNote }
                        : e
                ));
            } else {
                // Create new event
                console.log('🔵 CalendarPage: Creating new event');
                const newTaskData = {
                    title: eventTitle,
                    description: '',
                    date: dateISO,
                    time: eventTime,
                    category: eventCategory,
                    handwrittenNote: handwrittenNote
                };

                const res = await createTask(newTaskData);
                console.log('🔵 CalendarPage: Create response:', res.data);

                const newEvent = {
                    id: res.data._id,
                    date: new Date(res.data.date),
                    title: res.data.title,
                    time: res.data.time,
                    category: res.data.category,
                    note: res.data.handwrittenNote
                };

                console.log('🔵 CalendarPage: Adding event to state:', newEvent);
                setEvents([...events, newEvent]);
            }

            closeModal();
        } catch (err) {
            console.error('❌ CalendarPage: Error saving event:', err);
            alert('Failed to save event. Please try again.');
        }
    }

    function closeModal() {
        setShowModal(false);
        setEventTitle('');
        setEventTime('');
        setEventCategory('personal');
        setHandwrittenNote(null);
        setEditingEventId(null);
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
        const filtered = events.filter(event => {
            const eventDate = new Date(event.date);
            return isSameDay(eventDate, date);
        });
        return filtered;
    };

    async function handleDeleteEvent(eventId) {
        try {
            console.log('🔵 CalendarPage: Deleting event ID:', eventId);
            await deleteTask(eventId);
            console.log('🔵 CalendarPage: Delete successful');
            setEvents(events.filter(e => e.id !== eventId));
        } catch (err) {
            console.error('❌ CalendarPage: Error deleting event:', err);
            alert('Failed to delete event. Please try again.');
        }
    }

    if (loading) {
        return (
            <div className="calendar-page">
                <div className="calendar-container">
                    <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                        <p>Loading tasks...</p>
                    </div>
                </div>
            </div>
        );
    }

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

                {/* Events List */}
                {events.length > 0 && (
                    <div className="events-list-section">
                        <h2>📋 All Events</h2>
                        <div className="events-list">
                            {events.map(event => (
                                <motion.div
                                    key={event.id}
                                    className="event-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ borderLeft: `4px solid ${categories[event.category].color}` }}
                                >
                                    <div className="event-card-content">
                                        <div className="event-header">
                                            <h3>{event.title}</h3>
                                            <span className="event-category" style={{ background: categories[event.category].color }}>
                                                {categories[event.category].label}
                                            </span>
                                        </div>
                                        <div className="event-details">
                                            <span>📅 {format(new Date(event.date), 'MMM d, yyyy')}</span>
                                            {event.time && <span>🕐 {event.time}</span>}
                                        </div>
                                        {event.note && (
                                            <div className="event-note-preview">
                                                <p>✍️ Handwritten Note:</p>
                                                <img src={event.note} alt="Handwritten note" className="note-thumbnail" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="event-actions">
                                        <button
                                            className="edit-event-btn"
                                            onClick={() => handleEditEvent(event)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="delete-event-btn"
                                            onClick={() => handleDeleteEvent(event.id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

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
                                <h2>{editingEventId ? 'Edit Event' : 'Add Event'} - {selectedDate && format(selectedDate, 'MMM d, yyyy')}</h2>

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
                                    <button onClick={handleSaveEvent} className="save-btn">
                                        {editingEventId ? 'Update Event' : 'Save Event'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}































// import React, { useState, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
// import './CalendarPage.css';

// export default function CalendarPage() {
//     const [currentDate, setCurrentDate] = useState(new Date());
//     const [events, setEvents] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [selectedDate, setSelectedDate] = useState(null);
//     const [eventTitle, setEventTitle] = useState('');
//     const [eventTime, setEventTime] = useState('');
//     const [eventCategory, setEventCategory] = useState('personal');
//     const [isDrawing, setIsDrawing] = useState(false);

//     const canvasRef = useRef(null);
//     const [handwrittenNote, setHandwrittenNote] = useState(null);

//     const monthStart = startOfMonth(currentDate);
//     const monthEnd = endOfMonth(currentDate);
//     const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

//     const categories = {
//         personal: { color: '#667eea', label: 'Personal' },
//         work: { color: '#10b981', label: 'Work' },
//         study: { color: '#f97316', label: 'Study' },
//         health: { color: '#ec4899', label: 'Health' }
//     };

//     function handleDateClick(date) {
//         setSelectedDate(date);
//         setShowModal(true);
//     }

//     function handleAddEvent() {
//         if (!eventTitle.trim()) return;

//         const newEvent = {
//             id: Date.now(),
//             date: selectedDate,
//             title: eventTitle,
//             time: eventTime,
//             category: eventCategory,
//             note: handwrittenNote
//         };

//         setEvents([...events, newEvent]);
//         closeModal();
//     }

//     function closeModal() {
//         setShowModal(false);
//         setEventTitle('');
//         setEventTime('');
//         setEventCategory('personal');
//         setHandwrittenNote(null);
//         if (canvasRef.current) {
//             const ctx = canvasRef.current.getContext('2d');
//             ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//         }
//     }

//     function startDrawing(e) {
//         setIsDrawing(true);
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext('2d');
//         const rect = canvas.getBoundingClientRect();
//         ctx.beginPath();
//         ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
//     }

//     function draw(e) {
//         if (!isDrawing) return;
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext('2d');
//         const rect = canvas.getBoundingClientRect();
//         ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
//         ctx.strokeStyle = '#1a1f36';
//         ctx.lineWidth = 2;
//         ctx.lineCap = 'round';
//         ctx.stroke();
//     }

//     function stopDrawing() {
//         if (isDrawing) {
//             setIsDrawing(false);
//             const canvas = canvasRef.current;
//             setHandwrittenNote(canvas.toDataURL());
//         }
//     }

//     function clearCanvas() {
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext('2d');
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         setHandwrittenNote(null);
//     }

//     const getEventsForDate = (date) => {
//         return events.filter(event => isSameDay(new Date(event.date), date));
//     };

//     return (
//         <div className="calendar-page">
//             <div className="calendar-container">
//                 <div className="calendar-header">
//                     <h1>{format(currentDate, 'MMMM yyyy')}</h1>
//                     <div className="month-nav">
//                         <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
//                             ← Prev
//                         </button>
//                         <button onClick={() => setCurrentDate(new Date())}>Today</button>
//                         <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
//                             Next →
//                         </button>
//                     </div>
//                 </div>

//                 <div className="calendar-grid">
//                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//                         <div key={day} className="calendar-day-header">{day}</div>
//                     ))}

//                     {daysInMonth.map(date => {
//                         const dayEvents = getEventsForDate(date);
//                         const today = isToday(date);

//                         return (
//                             <motion.div
//                                 key={date.toString()}
//                                 className={`calendar-day ${today ? 'today' : ''}`}
//                                 onClick={() => handleDateClick(date)}
//                                 whileHover={{ scale: 1.02 }}
//                                 whileTap={{ scale: 0.98 }}
//                             >
//                                 <div className="day-number">{format(date, 'd')}</div>
//                                 <div className="day-events">
//                                     {dayEvents.slice(0, 2).map(event => (
//                                         <div
//                                             key={event.id}
//                                             className="event-dot"
//                                             style={{ background: categories[event.category].color }}
//                                             title={event.title}
//                                         />
//                                     ))}
//                                     {dayEvents.length > 2 && (
//                                         <span className="more-events">+{dayEvents.length - 2}</span>
//                                     )}
//                                 </div>
//                             </motion.div>
//                         );
//                     })}
//                 </div>

//                 {/* Event Modal */}
//                 <AnimatePresence>
//                     {showModal && (
//                         <motion.div
//                             className="modal-overlay"
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             onClick={closeModal}
//                         >
//                             <motion.div
//                                 className="modal-content"
//                                 initial={{ scale: 0.9, y: 20 }}
//                                 animate={{ scale: 1, y: 0 }}
//                                 exit={{ scale: 0.9, y: 20 }}
//                                 onClick={(e) => e.stopPropagation()}
//                             >
//                                 <h2>Add Event - {selectedDate && format(selectedDate, 'MMM d, yyyy')}</h2>

//                                 <input
//                                     type="text"
//                                     placeholder="Event title"
//                                     value={eventTitle}
//                                     onChange={(e) => setEventTitle(e.target.value)}
//                                     className="modal-input"
//                                 />

//                                 <input
//                                     type="time"
//                                     value={eventTime}
//                                     onChange={(e) => setEventTime(e.target.value)}
//                                     className="modal-input"
//                                 />

//                                 <select
//                                     value={eventCategory}
//                                     onChange={(e) => setEventCategory(e.target.value)}
//                                     className="modal-input"
//                                 >
//                                     {Object.entries(categories).map(([key, cat]) => (
//                                         <option key={key} value={key}>{cat.label}</option>
//                                     ))}
//                                 </select>

//                                 <div className="handwriting-section">
//                                     <h3>✍️ Handwritten Note</h3>
//                                     <canvas
//                                         ref={canvasRef}
//                                         width={400}
//                                         height={200}
//                                         className="drawing-canvas"
//                                         onMouseDown={startDrawing}
//                                         onMouseMove={draw}
//                                         onMouseUp={stopDrawing}
//                                         onMouseLeave={stopDrawing}
//                                     />
//                                     <button onClick={clearCanvas} className="clear-btn">Clear</button>
//                                 </div>

//                                 <div className="modal-actions">
//                                     <button onClick={closeModal} className="cancel-btn">Cancel</button>
//                                     <button onClick={handleAddEvent} className="save-btn">Save Event</button>
//                                 </div>
//                             </motion.div>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//             </div>
//         </div>
//     );
// }
