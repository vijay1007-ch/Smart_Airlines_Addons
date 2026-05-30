import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Lock, ArrowRight, PlaneTakeoff, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError("Invalid password reset link. Please request a new one.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        
        try {
            const res = await fetch("http://localhost:5000/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setIsSubmitted(true);
            } else {
                setError(data.message || "Failed to reset password");
            }
        } catch (err) {
            setError("An error occurred while resetting the password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page" style={{ position: 'relative', overflow: 'hidden' }}>
            <Navbar />
            
            {/* Ambient Background Elements */}
            <div style={{
                position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px',
                background: 'var(--primary-blue)', filter: 'blur(150px)', borderRadius: '50%', zIndex: -1, opacity: 0.3
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '15%', width: '350px', height: '350px',
                background: 'var(--accent-pink)', filter: 'blur(150px)', borderRadius: '50%', zIndex: -1, opacity: 0.3
            }} />

            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="login-box" style={{ 
                    maxWidth: '440px', 
                    width: '100%', 
                    padding: '3rem 2.5rem',
                    borderRadius: '24px',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '60px', height: '60px', borderRadius: '50%', 
                            background: 'rgba(0, 229, 255, 0.1)', border: '1px solid var(--glass-border)',
                            marginBottom: '1rem', boxShadow: 'var(--glow-cyan)'
                        }}>
                            <PlaneTakeoff size={32} color="var(--primary-blue)" />
                        </div>
                        <h2 style={{ 
                            fontSize: '2rem', fontWeight: '800', 
                            background: 'linear-gradient(90deg, #fff, #b388ff)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: '0.5rem'
                        }}>
                            Create New Password
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            {!isSubmitted 
                                ? "Please enter your new password below." 
                                : "Password reset successful!"}
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            
                            {error && (
                                <div style={{ color: '#ff4b2b', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(255, 75, 43, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                <input 
                                    type="password" 
                                    placeholder="New Password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    style={{ paddingLeft: '48px', marginBottom: 0 }}
                                />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                <input 
                                    type="password" 
                                    placeholder="Confirm New Password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required 
                                    style={{ paddingLeft: '48px', marginBottom: 0 }}
                                />
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
                                {isLoading ? 'Updating...' : 'Reset Password'}
                                {!isLoading && <ArrowRight size={20} />}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <CheckCircle2 size={64} color="var(--primary-blue)" style={{ margin: '0 auto 1.5rem auto' }} />
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                                Your password has been successfully reset. You can now log in with your new password.
                            </p>
                            <button 
                                onClick={() => navigate('/login')}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1.05rem'
                                }}
                            >
                                Go to Login <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
