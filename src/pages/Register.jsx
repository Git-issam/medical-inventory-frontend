import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import authService from "../services/authService";
import "./Login.css"; // Reuse Login styles

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            await authService.register({ fullName: name, email, password });
            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Create Account</h2>
                    <p>Join Medical Inventory</p>
                </div>

                <div className="icon-container">
                    <UserPlus className="rx-icon" strokeWidth={1.5} />
                </div>

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <User className="input-icon" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="form-control-custom"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                    {success && <div className="success-message">{success}</div>}

                    <button type="submit" className="btn-login" disabled={isLoading}>
                        {isLoading ? <span className="spinner"></span> : "REGISTER"}
                    </button>
                </form>

                <div className="login-links" style={{ justifyContent: 'center' }}>
                    <Link to="/">Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
