import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
        { path: '/calendar', label: '📅 Calendar', icon: '📅' },
        { path: '/timetable', label: '📚 Timetable', icon: '📚' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="antigravity-navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon">🚀</span>
                    <span className="brand-text">Habit Tracker</span>
                </div>

                <div className="navbar-links">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label.replace(/^.+ /, '')}</span>
                            {isActive(item.path) && (
                                <motion.div
                                    className="nav-indicator"
                                    layoutId="nav-indicator"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>

                <button
                    className="logout-btn-nav"
                    onClick={() => {
                        localStorage.removeItem("authToken");
                        localStorage.removeItem("authUser");
                        window.location.href = "/auth";
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
