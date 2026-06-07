import React, { useState, useEffect } from 'react';
import { getApiUrl, is2FAEnabled } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, AlertCircle, Plane, MapPin } from 'lucide-react';

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
            const response = await fetch(`${getApiUrl()}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email, 
                    password,
                    twoFactorEnabled: is2FAEnabled() 
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.twoFactorRequired) {
                    setTwoFactorRequired(true);
                } else {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    localStorage.setItem("token", data.token);

                    if (data.user.role === 'admin') navigate("/admin");
                    else navigate("/dashboard");
                }
            } else {
                setErrorMsg(data.message || "Authentication failed");
            }
        } catch (error) {
            console.error("Auth error:", error);
            setErrorMsg("Something went wrong connecting to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const response = await fetch(`${getApiUrl()}/auth/verify-2fa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    emailOtp
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);

                if (data.user.role === 'admin') navigate("/admin");
                else navigate("/dashboard");
            } else {
                setErrorMsg(data.message || "2FA Verification failed");
            }
        } catch (error) {
            console.error("2FA verify error:", error);
            setErrorMsg("Server error verifying 2FA codes.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page" style={{ position: 'relative', overflow: 'hidden' }}>
            <Navbar />

            <div className="container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '80vh',
                position: 'relative'
            }}>
                {/* Decorative Flight Path Background */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%', maxWidth: '800px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.6
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <Plane size={32} color="var(--accent-cyan)" style={{ transform: 'rotate(45deg)' }} />
                        <h3 style={{ margin: '10px 0 0', color: '#fff' }}>JFK</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>New York</p>
                    </div>

                    <div style={{
                        flex: 1, height: '2px',
                        background: 'repeating-linear-gradient(90deg, var(--text-muted) 0, var(--text-muted) 10px, transparent 10px, transparent 20px)',
                        margin: '0 40px', opacity: 0.3
                    }} />

                    <div style={{ textAlign: 'center' }}>
                        <MapPin size={32} color="var(--primary-blue)" />
                        <h3 style={{ margin: '10px 0 0', color: '#fff' }}>LHR</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>London</p>
                    </div>
                </div>

                <div className="login-box" style={{ 
                    maxWidth: '400px', 
                    width: '100%', 
                    padding: '2.5rem',
                    borderRadius: '24px',
                    position: 'relative',
                    zIndex: 1,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
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
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="Enter your password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' }}>
                                    <span 
                                        onClick={() => navigate('/forgot-password')}
                                        style={{ color: 'var(--primary-blue)', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        Forgot Password?
                                    </span>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', background: 'var(--gradient-primary)' }}
                                >
                                    {isLoading ? 'Processing...' : 'Sign In'}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Don't have an account?{" "}
                                <span 
                                    onClick={() => navigate('/signup')}
                                    style={{ color: 'var(--primary-blue)', cursor: 'pointer' }}
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
                                            style={{ paddingLeft: '48px', marginBottom: 0, letterSpacing: '1px' }}
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
