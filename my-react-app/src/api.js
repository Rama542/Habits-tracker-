// src/api.js
import axios from "axios";

// ❗ VITE uses import.meta.env, NOT process.env
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE,
});

// Add a request interceptor to include the user ID
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("authUser") || "{}");
    if (user.id) {
      config.headers["X-User-Id"] = user.id;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AUTH
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);

// HABITS
export const getHabits = () => api.get("/habits");
export const createHabit = (data) => api.post("/habits", data);
export const updateHabit = (id, data) => api.put(`/habits/${id}`, data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);
export const markHabitDone = (id) => api.put(`/habits/${id}/done`);

// TIMETABLE
export const getTimetable = () => api.get("/timetable");
export const createEntry = (data) => api.post("/timetable", data);
export const updateEntry = (id, data) => api.put(`/timetable/${id}`, data);
export const deleteEntry = (id) => api.delete(`/timetable/${id}`);

