import React, { useState, useEffect } from 'react';
import { getApiUrl, is2FAEnabled } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, AlertCircle, Plane, MapPin, Smartphone, X } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // 2FA Flow states
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [mobileOtp, setMobileOtp] = useState('');
    const [simulatedMobileOtp, setSimulatedMobileOtp] = useState('');
    const [showSmsNotification, setShowSmsNotification] = useState(false);
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
                    setSimulatedMobileOtp(data.simulatedMobileOtp);
                    setTimeout(() => {
                        setShowSmsNotification(true);
                    }, 1200);
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
                    emailOtp,
                    mobileOtp
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowSmsNotification(false);
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
        <div className="page" style={{ 
            position: 'relative', 
            overflow: 'hidden',
            backgroundColor: 'var(--bg-main)',
            backgroundImage: 'radial-gradient(circle at center, rgba(0, 102, 255, 0.05) 0%, transparent 70%)'
        }}>
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
                    maxWidth: '400px', 
                    width: '100%', 
                    padding: '2.5rem',
                    borderRadius: '16px',
                    position: 'relative',
                    zIndex: 1,
                    background: '#0f172a', /* Dark solid color */
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
                                    style={{ width: '100%', padding: '12px', marginTop: '1rem', background: 'var(--gradient-primary)', borderRadius: '8px', fontWeight: '600' }}
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
                                    For security, we sent codes to your Email and SMS.
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
                                            placeholder="Enter 6-digit Email code" 
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value)}
                                            required 
                                            style={{ paddingLeft: '48px', marginBottom: 0, letterSpacing: '1px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SMS Code</label>
                                    <div style={{ position: 'relative' }}>
                                        <Smartphone size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            placeholder="Enter 6-digit SMS code" 
                                            value={mobileOtp}
                                            onChange={(e) => setMobileOtp(e.target.value)}
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

            {/* Virtual SMS Toast Overlay */}
            {showSmsNotification && (
                <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '320px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--accent-orange)',
                    boxShadow: '0 0 30px rgba(255, 144, 0, 0.1)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    zIndex: 99999,
                    animation: 'slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Smartphone size={18} color="var(--accent-orange)" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                SMS Simulator
                            </span>
                        </div>
                        <X size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowSmsNotification(false)} />
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.4', color: '#ffffff' }}>
                        <strong style={{ color: 'var(--accent-orange)' }}>From:</strong> Smart Airline<br/>
                        Your Login OTP is: <strong style={{ fontSize: '1.1rem',  letterSpacing: '1px', color: '#ffffff' }}>{simulatedMobileOtp}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button 
                            onClick={() => {
                                setMobileOtp(simulatedMobileOtp);
                                setShowSmsNotification(false);
                            }}
                            style={{
                                background: 'var(--accent-orange)',
                                color: '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Auto-Fill SMS
                        </button>
                    </div>
                    <style>{`
                        @keyframes slideUp {
                            from { transform: translateY(100px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default Login;
