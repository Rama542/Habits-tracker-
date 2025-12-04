import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import bgImage from "../assets/mountain-bg.jpg";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <section className="hero-bg">
            <img src={bgImage} alt="mountain background" className="hero-bg-img" />
            <div className="hero-content">
                <h1>
                    Build Golden Habits,
                    <br /> Unlock your Potential
                </h1>
                <p>Focus on what truly matters. Build the best version of yourself by mastering your habits.</p>
                <button className="hero-btn" onClick={() => navigate("/auth")}>
                    Get Started
                </button>
            </div>
        </section>
    );
}
