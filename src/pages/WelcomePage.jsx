import React from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import pharmetixLogo from "../assets/pharmetix_logo.svg";
import "./WelcomePage.css";

const WelcomePage = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleGoToDashboard = () => {
        navigate("/dashboard", { replace: true });
    };

    return (
        <div className="welcome-container">
            <div className="welcome-card">
                {/* Mini Pharmetix logo */}
                <img
                    src={pharmetixLogo}
                    alt="Pharmetix"
                    className="welcome-mini-logo"
                />

                {/* Badge */}
                <div className="welcome-badge">✦ Welcome Back ✦</div>

                {/* Greeting */}
                <h1 className="welcome-title">
                    {user?.name ? `Hello, ${user.name}!` : "Hello!"}
                </h1>

                {/* Pharmacy name highlighted */}
                <div className="welcome-pharmacy-name">HealthHub</div>

                <div className="welcome-divider" />

                <p className="welcome-subtitle">
                    Your pharmacy dashboard is ready.<br />
                    Manage inventory, billing, and more — all in one place.
                </p>

                <button className="welcome-btn" onClick={handleGoToDashboard}>
                    Go to Dashboard <span className="btn-arrow">→</span>
                </button>
            </div>

            <p className="welcome-version">Pharmetix v1.0 · HealthHub</p>
        </div>
    );
};

export default WelcomePage;
