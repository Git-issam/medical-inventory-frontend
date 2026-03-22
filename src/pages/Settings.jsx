import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Bell, Moon, LogOut } from "lucide-react";
import "./Settings.css";

function Settings() {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem("darkMode") === "true"
    );
    const [notifications, setNotifications] = useState(true);

    // Apply dark class to body whenever darkMode changes
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    return (
        <div className="settings-container">
            <div className="settings-card">
                <header className="settings-header">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Settings</h1>
                </header>

                <div className="settings-section">
                    <h2>
                        <User size={20} /> Profile
                    </h2>
                    <div className="profile-info">
                        <div className="profile-avatar">S</div>
                        <div className="profile-details">
                            <h3>Issam</h3>
                            <p>Chief Pharmacist</p>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h2>Preferences</h2>

                    <div className="setting-item">
                        <div className="setting-label">
                            <Moon size={18} />
                            <span>Dark Mode</span>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-label">
                            <Bell size={18} />
                            <span>Notifications</span>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={notifications}
                                onChange={() => setNotifications(!notifications)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div className="settings-section danger-zone">
                    <button className="btn-logout" onClick={() => navigate('/')}>
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
