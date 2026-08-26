import React, { useState } from "react";
import "./Auth.css";
import sxLogo from "./assets/sx-logo.svg";
import sxSymbol from "./assets/sx-symbol.svg";
import { API_BASE_URL } from "./config.js";

function Auth({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const payload = isLogin ? { email, password } : { name, email, password };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Authentication failed.");
                setLoading(false);
                return;
            }

            localStorage.setItem("sanchitx_token", data.token);
            onAuthSuccess(data.user, data.token);
        } catch (err) {
            console.error("Auth error:", err);
            setError("Unable to connect to authentication server.");
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "sanchit@sanchitx.ai", password: "demo1234" })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("sanchitx_token", data.token);
                onAuthSuccess(data.user, data.token);
            } else {
                setError(data.error || "Demo login failed.");
            }
        } catch (err) {
            setError("Could not log in with demo credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="authContainer">
            <div className="authCard">
                <div className="authHeader">
                    <img src={sxLogo} alt="sanchitX" className="authLogo" />
                </div>

                <div className="authTabs">
                    <button 
                        className={isLogin ? "authTab active" : "authTab"}
                        onClick={() => { setIsLogin(true); setError(""); }}
                    >
                        Sign In
                    </button>
                    <button 
                        className={!isLogin ? "authTab active" : "authTab"}
                        onClick={() => { setIsLogin(false); setError(""); }}
                    >
                        Create Account
                    </button>
                </div>

                {error && <div className="authError">{error}</div>}

                <form onSubmit={handleSubmit} className="authForm">
                    {!isLogin && (
                        <div className="inputGroup">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                placeholder="Sanchit Kaushik"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="inputGroup">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="inputGroup">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="authSubmitBtn" disabled={loading}>
                        {loading ? "Processing..." : isLogin ? "Sign In to SanchitX" : "Create Account"}
                    </button>
                </form>

                <div className="authDivider">
                    <span>or continue with</span>
                </div>

                <button type="button" className="demoAuthBtn" onClick={handleDemoLogin} disabled={loading}>
                    <img src={sxSymbol} alt="SX" className="demoIcon" /> Continue as Demo User
                </button>
            </div>
        </div>
    );
}

export default Auth;
