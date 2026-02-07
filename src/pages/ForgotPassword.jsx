import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";
import "./Login.css"; // Reuse Login styles

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleReset = (e) => {
        e.preventDefault();
        // Simulate API call
        alert("Password reset link sent to your email!");
        navigate("/");
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email to reset</p>
                </div>

                <div className="icon-container">
                    <KeyRound className="rx-icon" strokeWidth={1.5} />
                </div>

                <form onSubmit={handleReset}>
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

                    <button type="submit" className="btn-login">
                        SEND RESET LINK
                    </button>
                </form>

                <div className="login-links" style={{ justifyContent: 'center' }}>
                    <Link to="/">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
