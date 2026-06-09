import React, { useState, useEffect } from 'react';
import { getApiUrl, is2FAEnabled } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, AlertCircle, Plane, MapPin, Smartphone, X } from 'lucide-react';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 2FA Flow states
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const response = await axios.post(`${getApiUrl()}/auth/login`, {
                email,
                password,
                twoFactorEnabled: is2FAEnabled()
            });

            const data = response.data;

            if (data.twoFactorRequired) {
                setTwoFactorRequired(true);
            } else {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);

                if (data.user.role === 'admin') navigate("/admin");
                else navigate("/dashboard");
            }
        } catch (error) {
            console.error("Auth error:", error);
            if (error.response && error.response.data) {
                setErrorMsg(error.response.data.message || "Authentication failed");
            } else {
                setErrorMsg("Something went wrong connecting to the server.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const response = await axios.post(`${getApiUrl()}/auth/verify-2fa`, {
                email,
                emailOtp
            });

            const data = response.data;

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);

            if (data.user.role === 'admin') navigate("/admin");
            else navigate("/dashboard");
        } catch (error) {
            console.error("2FA verify error:", error);
            if (error.response && error.response.data) {
                setErrorMsg(error.response.data.message || "2FA Verification failed");
            } else {
                setErrorMsg("Server error verifying 2FA codes.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10 }}>
                <Navbar />
            </div>

            <div className="hero-section">
                <h1>SMART AIRLINE ADD-ONS PLATFORM</h1>
                <p>A Modern, Sleek, and Professional Airline Addon Platform</p>

                <div className="logo-box">
                    <h2>Smart Airline</h2>
                    <h3>Premium Travel Experience</h3>
                    <p>DIGITAL AIRLINE ECOSYSTEM</p>
                    <p>Passenger & Admin Management Suite</p>
                    <span>Add-Ons</span>
                </div>
            </div>



            <div className="login-card">

                {!twoFactorRequired ? (
                    <>
                        <h2>Welcome Back</h2>
                        <p>Login to your account</p>

                        {errorMsg && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 15px', background: 'rgba(255, 65, 108, 0.1)',
                                border: '1px solid rgba(255, 65, 108, 0.3)', borderRadius: '12px',
                                color: '#ff416c', fontSize: '0.85rem', marginBottom: '1.25rem'
                            }}>
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                                <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} style={{ color: '#b8c1cc', fontSize: '13px', textDecoration: 'none' }}>Forgot Password?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="login-btn"
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="bottom-links">
                            Don't have an account?
                            <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}> Sign Up</a>
                        </div>
                    </>
                ) : (
                    <>
                        {/* 2-Step Authentication View */}
                        <h2>2-Step Verification</h2>
                        <p>For security, we sent a code to your Email.</p>

                        {errorMsg && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 15px', background: 'rgba(255, 65, 108, 0.1)',
                                border: '1px solid rgba(255, 65, 108, 0.3)', borderRadius: '12px',
                                color: '#ff416c', fontSize: '0.85rem', marginBottom: '1.25rem'
                            }}>
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerify2FA}>
                            <div className="input-group" style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="Enter 6-digit code"
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value)}
                                    required
                                    style={{ paddingLeft: '48px' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="login-btn"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setTwoFactorRequired(false)}
                                className="login-btn"
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', marginTop: '10px', boxShadow: 'none' }}
                            >
                                Back to Login
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
