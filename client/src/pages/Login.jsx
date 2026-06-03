import React, { useState, useEffect } from 'react';
import { getApiUrl, is2FAEnabled } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, ArrowRight, PlaneTakeoff, Smartphone, ShieldCheck, X, AlertCircle } from 'lucide-react';

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
                    twoFactorEnabled: is2FAEnabled() // Check if user turned on 2FA in settings
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.twoFactorRequired) {
                    // Transition to 2-Step Authentication view
                    setTwoFactorRequired(true);
                } else {
                    // Standard login (2FA disabled)
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
                // Success: save profile
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
            
            
            

            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="login-box" style={{ 
                    maxWidth: '440px', 
                    width: '100%', 
                    padding: '3rem 2.5rem',
                    borderRadius: '24px',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    border: twoFactorRequired ? '1px solid rgba(179, 136, 255, 0.4)' : '1px solid var(--border-light)'
                }}>
                    
                    {!twoFactorRequired ? (
                        <>
                            {/* Standard Login Header */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ 
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: '60px', height: '60px', borderRadius: '50%', 
                                    background: 'rgba(0, 229, 255, 0.1)', border: '1px solid var(--border-light)',
                                    marginBottom: '1rem', boxShadow: 'var(--glow-cyan)'
                                }}>
                                    <PlaneTakeoff size={32} color="var(--primary-blue)" />
                                </div>
                                <h2 style={{ 
                                    fontSize: '2rem', fontWeight: '800', 
                                    
                                    marginBottom: '0.5rem'
                                }}>
                                    Welcome Back
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                    Enter your credentials to continue
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
                                <div style={{ position: 'relative' }}>
                                    <Mail size={20} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                        style={{ paddingLeft: '48px', marginBottom: 0 }}
                                    />
                                </div>
                                
                                <div style={{ position: 'relative' }}>
                                    <Lock size={20} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="password" 
                                        placeholder="Password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        style={{ paddingLeft: '48px', marginBottom: 0 }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <span 
                                        onClick={() => navigate('/forgot-password')}
                                        style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', textDecoration: 'none', cursor: 'pointer' }}
                                    >
                                        Forgot Password?
                                    </span>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    style={{ 
                                        width: '100%', 
                                        padding: '1rem', 
                                        marginTop: '1rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '1.05rem',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    {isLoading ? 'Processing...' : 'Sign In'}
                                    {!isLoading && <ArrowRight size={20} />}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Don't have an account?{" "}
                                <span 
                                    onClick={() => navigate('/signup')}
                                    style={{ 
                                        color: 'var(--primary-blue)', 
                                        cursor: 'pointer', 
                                        fontWeight: '600',
                                        transition: 'color 0.3s ease'
                                    }}
                                >
                                    Sign up
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* 2-Step Authentication View */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ 
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: '60px', height: '60px', borderRadius: '50%', 
                                    background: 'rgba(179, 136, 255, 0.1)', border: '1px solid rgba(179, 136, 255, 0.3)',
                                    marginBottom: '1rem' }}>
                                    <ShieldCheck size={32} color="#b388ff" />
                                </div>
                                <h2 style={{ 
                                    fontSize: '1.8rem', fontWeight: '800', 
                                    
                                    marginBottom: '0.5rem'
                                }}>
                                    2-Step Verification
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                    For security, we sent a 6-digit code to your **Email**.
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
                                
                                {/* Email OTP field */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold' }}>
                                        Email verification code
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            placeholder="Enter 6-digit email code" 
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value)}
                                            required 
                                            style={{ paddingLeft: '48px', marginBottom: 0, letterSpacing: '1px' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                        Sent to {email} (Check your real mailbox!)
                                    </span>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    style={{ 
                                        width: '100%', 
                                        padding: '1rem', 
                                        marginTop: '1rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '1.05rem',
                                        background: 'var(--gradient-primary)',
                                        color: '#ffffff',
                                        opacity: isLoading ? 0.7 : 1,
                                        borderRadius: '30px'
                                    }}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                                    {!isLoading && <ArrowRight size={20} />}
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => setTwoFactorRequired(false)}
                                style={{ 
                                    width: '100%', 
                                    background: 'var(--bg-main)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border-light)',
                                    padding: '0.75rem',
                                    fontSize: '0.9rem',
                                    borderRadius: '30px',
                                    boxShadow: 'none',
                                    cursor: 'pointer'
                                }}
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
