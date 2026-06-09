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
            <div className="overlay"></div>
            <Navbar />

            <div className="login-container">
                <div className="logo-section">
                    <h2>SKY WINGS</h2>
                    <p>PREMIUM ADD-ONS</p>
                </div>

                <div className="login-card">
                    
                    {!twoFactorRequired ? (
                        <>
                            <h1>Welcome Back</h1>
                            <p>Sign in to continue your journey</p>

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
                                <div>
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                        className="input-field"
                                    />
                                </div>
                                
                                <div>
                                    <input 
                                        type="password" 
                                        placeholder="Password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        className="input-field"
                                    />
                                </div>
                                <div className="bottom-links">
                                    <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>Forgot Password?</a>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="login-btn"
                                >
                                    {isLoading ? 'Authenticating...' : 'Sign In'}
                                </button>
                            </form>

                            <div className="signup-text" style={{ textAlign: 'center' }}>
                                Don't have an account?{" "}
                                <a href="#!" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Sign up</a>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* 2-Step Authentication View */}
                            <h1>2-Step Verification</h1>
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
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#aaa', marginTop: '9px' }} />
                                    <input 
                                        type="text" 
                                        maxLength="6"
                                        placeholder="Enter 6-digit code" 
                                        value={emailOtp}
                                        onChange={(e) => setEmailOtp(e.target.value)}
                                        required 
                                        className="input-field"
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
                                    style={{ background: 'transparent', border: '1px solid #34f5c5', color: '#34f5c5', marginTop: '10px' }}
                                >
                                    Back to Login
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
