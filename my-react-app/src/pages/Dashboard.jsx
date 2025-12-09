import React, { useEffect, useState } from "react";
import { getHabits, createHabit, deleteHabit, markHabitDone, getTasks } from "../api";
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [habitName, setHabitName] = useState("");
  const [habitDesc, setHabitDesc] = useState("");
  const [habitFreq, setHabitFreq] = useState("daily");

  useEffect(() => {
    loadHabits();
    loadTasks();
  }, []);

  async function loadHabits() {
    try {
      console.log('🔵 Dashboard: Loading habits...');
      const res = await getHabits();
      setHabits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load habits error:", err);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks() {
    try {
      console.log('🔵 Dashboard: Loading tasks...');
      const res = await getTasks();
      console.log('🔵 Dashboard: Received tasks:', res.data);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Load tasks error:", err);
      setTasks([]);
    }
  }

  async function handleCreateHabit(e) {
    e.preventDefault();
    if (!habitName.trim()) return;

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

        {/* Progress Graphs */}
        {habits.length > 0 && (
          <div className="progress-section">
            <h2 className="section-title">📈 Progress Trends</h2>
            <div className="graphs-grid">
              {habits.slice(0, 3).map((habit) => (
                <ProgressGraph
                  key={habit._id}
                  data={generateProgressData(habit)}
                  habitName={habit.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Habits List */}
        <div className="habits-section">
          <h2 className="section-title">
            ✅ My Habits ({habits.length})
          </h2>
          {habits.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</p>
              <h3 style={{ marginBottom: '8px', color: '#0f172a' }}>No habits yet!</h3>
              <p>Add your first habit above to start tracking your progress</p>
            </div>
          ) : (
            <div className="habits-grid">
              {habits.map((habit) => (
                <HabitCard
                  key={habit._id}
                  habit={habit}
                  onMarkDone={handleMarkDone}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks Section */}
        {tasks.length > 0 && (
          <div className="progress-section" style={{ marginTop: '32px' }}>
            <h2 className="section-title">📅 Upcoming Tasks ({tasks.length})</h2>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {tasks.slice(0, 5).map((task) => {
                const taskDate = new Date(task.date);
                const isToday = taskDate.toDateString() === new Date().toDateString();
                const isPast = taskDate < new Date() && !isToday;

                return (
                  <div
                    key={task._id}
                    style={{
                      padding: '16px',
                      borderLeft: `4px solid ${isToday ? '#10b981' : isPast ? '#94a3b8' : '#667eea'}`,
                      marginBottom: '12px',
                      background: isToday ? '#f0fdf4' : '#f8fafc',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '16px' }}>
                          {task.title}
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                          📅 {taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {task.time && ` • 🕐 ${task.time}`}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: task.category === 'work' ? '#dcfce7' :
                          task.category === 'study' ? '#fed7aa' :
                            task.category === 'health' ? '#fce7f3' : '#e0e7ff',
                        color: task.category === 'work' ? '#166534' :
                          task.category === 'study' ? '#9a3412' :
                            task.category === 'health' ? '#9f1239' : '#3730a3'
                      }}>
                        {task.category}
                      </span>
                    </div>
                  </div>
                );
              })}
              {tasks.length > 5 && (
                <p style={{ textAlign: 'center', color: '#64748b', marginTop: '16px', fontSize: '14px' }}>
                  + {tasks.length - 5} more tasks. View all in Calendar.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





























// import React, { useEffect, useState } from "react";
// import { getHabits, createHabit, deleteHabit, markHabitDone } from "../api";
// import ProgressGraph from "../components/ProgressGraph";
// import HabitCard from "../components/HabitCard";

// export default function Dashboard() {
//     const [userName] = useState(() => {
//         try {
//             const u = JSON.parse(localStorage.getItem("authUser"));
//             return u?.username || u?.name || "User";
//         } catch {
//             return "User";
//         }
//     });

//     const [habits, setHabits] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const [habitName, setHabitName] = useState("");
//     const [habitDesc, setHabitDesc] = useState("");
//     const [habitFreq, setHabitFreq] = useState("daily");

//     useEffect(() => {
//         loadHabits();
//     }, []);

//     async function loadHabits() {
//         try {
//             const res = await getHabits();
//             setHabits(Array.isArray(res.data) ? res.data : []);
//         } catch (err) {
//             console.error("Load habits error:", err);
//             setHabits([]);
//         } finally {
//             setLoading(false);
//         }
//     }

//     async function handleCreateHabit(e) {
//         e.preventDefault();
//         if (!habitName.trim()) return;

//         try {
//             const res = await createHabit({
//                 name: habitName,
//                 description: habitDesc,
//                 frequency: habitFreq
//             });

//             if (res?.data) {
//                 setHabits((p) => [...p, res.data]);
//             }

//             setHabitName("");
//             setHabitDesc("");
//             setHabitFreq("daily");
//         } catch (err) {
//             console.error("Create habit error:", err);
//         }
//     }

//     async function handleMarkDone(id) {
//         try {
//             const res = await markHabitDone(id);
//             if (res?.data) {
//                 setHabits((p) => p.map((h) => (h._id === id ? res.data : h)));
//             }
//         } catch (err) {
//             console.error("Mark done error:", err);
//         }
//     }

//     async function handleDeleteHabit(id) {
//         if (!window.confirm("Delete this habit?")) return;

//         try {
//             await deleteHabit(id);
//             setHabits((p) => p.filter((h) => h._id !== id));
//         } catch (err) {
//             console.error("Delete habit error:", err);
//         }
//     }

//     function handleEditHabit(habit) {
//         setHabitName(habit.name);
//         setHabitDesc(habit.description || "");
//         setHabitFreq(habit.frequency || "daily");
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     }

//     // Generate sample progress data for graphs
//     function generateProgressData(habit) {
//         const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//         const streak = habit.streak || 0;
//         const total = habit.totalCompletions || 0;

//         // Simulate weekly data based on current stats
//         return days.map((day, index) => ({
//             day,
//             completions: Math.max(0, streak - (6 - index) + Math.floor(Math.random() * 2))
//         }));
//     }

//     if (loading) {
//         return <div className="dashboard"><div className="loading">Loading...</div></div>;
//     }

//     return (
//         <div className="dashboard">
//             <div className="dashboard-container">
//                 {/* Header */}
//                 <div className="dashboard-header">
//                     <h1>Welcome back, {userName}! 👋</h1>
//                     <p>Track your habits and watch your progress grow</p>
//                     <button
//                         className="logout-btn"
//                         style={{
//                             position: 'absolute',
//                             top: '24px',
//                             right: '24px',
//                             padding: '10px 20px',
//                             borderRadius: '10px',
//                             border: 'none',
//                             background: '#f1f5f9',
//                             color: '#475569',
//                             fontWeight: '600',
//                             cursor: 'pointer'
//                         }}
//                         onClick={() => {
//                             localStorage.removeItem("authToken");
//                             localStorage.removeItem("authUser");
//                             window.location.href = "/auth";
//                         }}
//                     >
//                         Logout
//                     </button>
//                 </div>

//                 {/* Add Habit Form */}
//                 <div className="add-habit-section">
//                     <h2 className="section-title">➕ Add New Habit</h2>
//                     <form className="habit-form" onSubmit={handleCreateHabit}>
//                         <input
//                             placeholder="Habit name (e.g., Morning Exercise)"
//                             value={habitName}
//                             onChange={(e) => setHabitName(e.target.value)}
//                             required
//                         />
//                         <input
//                             placeholder="Description (optional)"
//                             value={habitDesc}
//                             onChange={(e) => setHabitDesc(e.target.value)}
//                         />
//                         <select
//                             value={habitFreq}
//                             onChange={(e) => setHabitFreq(e.target.value)}
//                         >
//                             <option value="daily">Daily</option>
//                             <option value="weekly">Weekly</option>
//                         </select>
//                         <button type="submit">Add Habit</button>
//                     </form>
//                 </div>

//                 {/* Progress Graphs */}
//                 {habits.length > 0 && (
//                     <div className="progress-section">
//                         <h2 className="section-title">📈 Progress Trends</h2>
//                         <div className="graphs-grid">
//                             {habits.slice(0, 3).map((habit) => (
//                                 <ProgressGraph
//                                     key={habit._id}
//                                     data={generateProgressData(habit)}
//                                     habitName={habit.name}
//                                 />
//                             ))}
//                         </div>
//                     </div>
//                 )}

//                 {/* Habits List */}
//                 <div className="habits-section">
//                     <h2 className="section-title">
//                         ✅ My Habits ({habits.length})
//                     </h2>
//                     {habits.length === 0 ? (
//                         <div style={{
//                             background: 'white',
//                             borderRadius: '16px',
//                             padding: '48px',
//                             textAlign: 'center',
//                             color: '#64748b'
//                         }}>
//                             <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</p>
//                             <h3 style={{ marginBottom: '8px', color: '#0f172a' }}>No habits yet!</h3>
//                             <p>Add your first habit above to start tracking your progress</p>
//                         </div>
//                     ) : (
//                         <div className="habits-grid">
//                             {habits.map((habit) => (
//                                 <HabitCard
//                                     key={habit._id}
//                                     habit={habit}
//                                     onMarkDone={handleMarkDone}
//                                     onEdit={handleEditHabit}
//                                     onDelete={handleDeleteHabit}
//                                 />
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }
