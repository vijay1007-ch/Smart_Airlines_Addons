import React, { useState, useEffect } from 'react';
import { getApiUrl, is2FAEnabled } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, AlertCircle, Plane, MapPin, Smartphone, X } from 'lucide-react';
import axios from 'axios';

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
        <div className="page" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
            <div className="aurora-bg"></div>
            <div className="aurora-overlay"></div>
            <Navbar />

            <div className="container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '80vh',
                position: 'relative'
            }}>
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '10%',
                    transform: 'translateY(-50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.5
                }}>
                    <Plane size={32} color="#ffffff" style={{ transform: 'rotate(-45deg)' }} />
                    <h3 style={{ margin: '10px 0 0', color: '#fff', fontSize: '1.5rem', letterSpacing: '2px' }}>JFK</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>New York</p>
                </div>

                <div style={{
                    position: 'absolute',
                    top: '50%', right: '10%',
                    transform: 'translateY(-50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.5
                }}>
                    <MapPin size={32} color="#ffffff" />
                    <h3 style={{ margin: '10px 0 0', color: '#fff', fontSize: '1.5rem', letterSpacing: '2px' }}>LHR</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>London</p>
                </div>

                <div className="login-box" style={{ 
                    maxWidth: '420px', 
                    width: '100%', 
                    padding: '2.5rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                    
                    {!twoFactorRequired ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
                                    Welcome Back
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Sign in to continue your journey
                                </p>
                            </div>

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

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                            style={{ marginBottom: 0, paddingLeft: '1rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="password" 
                                            placeholder="Enter your password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required 
                                            style={{ marginBottom: 0, paddingLeft: '1rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                        <span onClick={() => navigate('/forgot-password')} style={{ fontSize: '0.75rem', color: 'var(--gradient-primary)', cursor: 'pointer' }}>Forgot Password?</span>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    style={{ width: '100%', padding: '12px', marginTop: '1rem', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600' }}
                                >
                                    {isLoading ? 'Authenticating...' : 'Sign In'}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Don't have an account?{" "}
                                <span 
                                    onClick={() => navigate('/signup')}
                                    style={{ color: 'var(--gradient-primary)', cursor: 'pointer' }}
                                >
                                    Sign up
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* 2-Step Authentication View */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
                                    2-Step Verification
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    For security, we sent a code to your Email.
                                </p>
                            </div>

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

                            <form onSubmit={handleVerify2FA} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Email Code</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            placeholder="Enter 6-digit code" 
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value)}
                                            required 
                                            style={{ paddingLeft: '48px', marginBottom: 0, letterSpacing: '1px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => setTwoFactorRequired(false)}
                                    className="secondary"
                                    style={{ width: '100%', padding: '1rem' }}
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
