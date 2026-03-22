import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pharmetixLogo from "../assets/pharmetix_logo.svg";
import "./SplashScreen.css";

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // After 2.8s, check auth and route accordingly
        const timer = setTimeout(() => {
            navigate("/login", { replace: true });
        }, 2800);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="splash-container">
            <div className="splash-logo-wrapper">
                <img
                    src={pharmetixLogo}
                    alt="Pharmetix Logo"
                    className="splash-logo"
                />
                <div className="splash-divider" />
            </div>

            <div className="splash-spinner-wrapper">
                <div className="splash-spinner" />
                <span className="splash-loading-text">Loading…</span>
            </div>

            <p className="splash-tagline">Where Medicine Meets Management</p>
        </div>
    );
};

export default SplashScreen;
