

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldPlus, Mail, Lock } from "lucide-react";
import authService from "../services/authService";
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await authService.login(email, password);
            navigate("/welcome");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials! Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Medical Inventory</h2>
                    <p>Secure Access</p>
                </div>

                <div className="icon-container">
                    <ShieldPlus className="rx-icon" strokeWidth={1.5} />
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <Mail className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="form-control-custom"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="form-control-custom"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-login" disabled={isLoading}>
                        {isLoading ? <span className="spinner"></span> : "LOG IN"}
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password">Forgot Password?</Link>
                    <Link to="/register">Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
