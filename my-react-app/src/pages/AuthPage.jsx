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

                {/* Forms */}
                {mode === "login" ? <LoginForm /> : <SignupForm />}

                {/* Footer Switch */}
                <p className="auth-footer">
                    {mode === "login" ? (
                        <>
                            Don't have an account?{" "}
                            <button
                                type="button"
                                className="link-btn"
                                onClick={() => setMode("signup")}
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                type="button"
                                className="link-btn"
                                onClick={() => setMode("login")}
                            >
                                Log in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}


// LOGIN FORM

function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            const res = await login({ email, password });
            localStorage.setItem("authUser", JSON.stringify(res.data.user));
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Login failed");
        }
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="form-extra">
                <label className="checkbox">
                    <input type="checkbox" />
                    <span>Remember me</span>
                </label>
                <button type="button" className="link-btn">
                    Forgot password?
                </button>
            </div>

            <button type="submit" className="primary-btn">
                Login
            </button>
        </form>
    );
}


//  SIGNUP FORM

function SignupForm() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await register({ username, email, password });
            localStorage.setItem("authUser", JSON.stringify(res.data.user));
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Signup failed");
        }
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
                <label>Username</label>
                <input
                    type="text"
                    placeholder="johndoe"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Create a password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Confirm Password</label>
                <input
                    type="password"
                    placeholder="Repeat your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            <button type="submit" className="primary-btn">
                Create Account
            </button>
        </form>
    );
}

export default AuthPage;