import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import bgImage from "../assets/mountain-bg.jpg";
import { login, register } from "../api";

function AuthPage() {
    const [mode, setMode] = useState("login");

    return (
        <div className="auth-page">
            <div
                className="bg-blur"
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            <div className="auth-card">
                <div className="auth-header">
                    <h1>{mode === "login" ? "Welcome Back 👋" : "Join the Climb 🚀"}</h1>
                    <p>
                        {mode === "login"
                            ? "Log in to continue building your golden habits."
                            : "Create an account and start mastering your habits today."}
                    </p>
                </div>

                {/* Toggle Buttons */}
                <div className="auth-toggle">
                    <button
                        className={`toggle-btn ${mode === "login" ? "active" : ""}`}
                        onClick={() => setMode("login")}
                    >
                        Login
                    </button>
                    <button
                        className={`toggle-btn ${mode === "signup" ? "active" : ""}`}
                        onClick={() => setMode("signup")}
                    >
                        Sign Up
                    </button>
                </div>