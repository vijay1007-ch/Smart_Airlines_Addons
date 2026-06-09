import React, { useState, useEffect } from 'react';
import { getApiUrl, is2FAEnabled } from '../services/apiService';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Lock, ArrowRight, PlaneTakeoff, CheckCircle2, ShieldCheck, Smartphone, X, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // 2FA Reset States
    const is2faActive = is2FAEnabled();
    const [isVerified, setIsVerified] = useState(!is2faActive); // True if 2FA is disabled, else false until verified
    const [emailOtp, setEmailOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    // Trigger OTP sending on component mount if 2FA is active and email exists
    useEffect(() => {
        if (is2faActive && email && !otpSent) {
            sendResetOtps();
        }
    }, [email, is2faActive]);

    const sendResetOtps = async () => {
        setOtpLoading(true);
        setError('');
        try {
            const res = await axios.post(`${getApiUrl()}/auth/forgot-password/request-otp`, { email });
            
            if (res.status === 200 || res.status === 201) {
                setOtpSent(true);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Failed to dispatch reset OTP code");
            } else {
                setError("Error connecting to server to send OTP code.");
            }
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${getApiUrl()}/auth/forgot-password/verify-otp`, { email, emailOtp });
            if (res.status === 200 || res.status === 201) {
                setIsVerified(true);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Incorrect verification code.");
            } else {
                setError("Server error verifying reset OTP.");
            }
        } finally {
            setIsLoading(false);
        }
    };

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
            const res = await axios.post(`${getApiUrl()}/auth/reset-password`, {
                email, 
                password,
                bypass2fa: !is2faActive
            });
            
            if (res.status === 200 || res.status === 201) {
                setIsSubmitted(true);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Failed to reset password");
            } else {
                setError("An error occurred while resetting the password");
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

            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="login-box glass-panel" style={{ 
                    maxWidth: '440px', 
                    width: '100%', 
                    padding: '3rem 2.5rem',
                    position: 'relative',
                    border: !isVerified ? '1px solid rgba(255, 65, 108, 0.4)' : '1px solid var(--border-light)'
                }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ 
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '60px', height: '60px', borderRadius: '50%', 
                            background: !isVerified ? 'rgba(255, 65, 108, 0.1)' : 'rgba(0, 229, 255, 0.1)', 
                            border: !isVerified ? '1px solid rgba(255, 65, 108, 0.3)' : '1px solid var(--border-light)',
                            marginBottom: '1rem', 
                            boxShadow: !isVerified ? '0 0 20px rgba(255, 65, 108, 0.3)' : 'var(--glow-cyan)'
                        }}>
                            <PlaneTakeoff size={32} color={!isVerified ? '#ff416c' : 'var(--primary-blue)'} />
                        </div>
                        <h2 style={{ 
                            fontSize: '1.8rem', fontWeight: '800', 
                            background: !isVerified ? 'linear-gradient(90deg, #fff, #ff7b90)' : 'linear-gradient(90deg, #fff, #b388ff)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: '0.5rem'
                        }}>
                            {!isVerified ? "2-Step Identity Check" : "Create New Password"}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {isSubmitted ? "Password reset successful!" : 
                             !isVerified ? "Verify email code to unlock password reset form." : 
                             "Verification successful! Please enter your new password below."}
                        </p>
                    </div>

                    {error && (
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '10px 15px', background: 'rgba(255, 65, 108, 0.1)', 
                            border: '1px solid rgba(255, 65, 108, 0.3)', borderRadius: '12px', 
                            color: '#ff416c', fontSize: '0.85rem', marginBottom: '1.25rem' 
                        }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Step 1: 2FA Identity Verification Form */}
                    {!isVerified && (
                        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold' }}>
                                    Email Verification Code
                                </label>
                                <input 
                                    type="text" 
                                    maxLength="6"
                                    placeholder="Enter 6-digit email code" 
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value)}
                                    required 
                                    style={{ letterSpacing: '1px' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', display: 'block' }}>
                                    Sent to {email} (Check your real mailbox!)
                                </span>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading || otpLoading}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    marginTop: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '1.05rem',
                                    background: 'var(--accent-teal)',
                                    color: '#fff',
                                    border: 'none',
                                    opacity: (isLoading || otpLoading) ? 0.7 : 1,
                                    borderRadius: '8px'
                                }}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Code & Unlock'}
                                {!isLoading && <ArrowRight size={20} />}
                            </button>

                            <button 
                                type="button" 
                                onClick={sendResetOtps}
                                disabled={otpLoading}
                                style={{ 
                                    width: '100%', 
                                    background: 'transparent',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    border: '1px solid var(--border-light)',
                                    padding: '0.75rem',
                                    fontSize: '0.9rem',
                                    borderRadius: '30px',
                                    boxShadow: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <RefreshCw size={14} className={otpLoading ? "spin" : ""} />
                                {otpLoading ? 'Resending...' : 'Resend Verification Code'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Set New Password Form (Unlocked only when verified) */}
                    {isVerified && !isSubmitted && (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                                    background: 'var(--accent-teal)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    opacity: isLoading ? 0.7 : 1
                                }}
                            >
                                {isLoading ? 'Updating...' : 'Reset Password'}
                                {!isLoading && <ArrowRight size={20} />}
                            </button>
                        </form>
                    )}

                    {/* Success Message Screen */}
                    {isSubmitted && (
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
                                    fontSize: '1.05rem',
                                    background: 'var(--accent-teal)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px'
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
