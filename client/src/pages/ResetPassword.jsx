import React, { useState, useEffect } from 'react';
import { getApiUrl, is2FAEnabled } from '../services/apiService';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    Lock,
    ArrowRight,
    PlaneTakeoff,
    CheckCircle2,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import axios from 'axios';
import './ResetPassword.css';

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
        <div className="reset-page">
            <Navbar />

            <div className="reset-card">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: !isVerified ? 'rgba(255, 65, 108, 0.1)' : 'rgba(53, 215, 211, 0.12)',
                        border: !isVerified ? '1px solid rgba(255, 65, 108, 0.24)' : '1px solid rgba(53, 215, 211, 0.24)',
                        marginBottom: '1rem'
                    }}>
                        <PlaneTakeoff size={28} color={!isVerified ? '#ff416c' : '#35d7d3'} />
                    </div>
                    <h2>
                        {!isVerified ? "2-Step Identity Check" : "Create New Password"}
                    </h2>
                    <p>
                        {isSubmitted ? "Password reset successful!" :
                            !isVerified ? "Verify email code to unlock password reset form." :
                                "Verification successful! Please enter your new password below."}
                    </p>
                </div>

                {error && (
                    <div className="error-box">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Step 1: 2FA Identity Verification Form */}
                {!isVerified && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="input-group">
                            <input
                                type="text"
                                maxLength="6"
                                placeholder="Enter 6-digit email code"
                                value={emailOtp}
                                onChange={(e) => setEmailOtp(e.target.value)}
                                required
                                style={{ letterSpacing: '1px', paddingLeft: '16px' }}
                            />
                            <span className="helper-text">
                                Sent to {email} (Check your real mailbox!)
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otpLoading}
                            className="reset-btn"
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code & Unlock'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>

                        <button
                            type="button"
                            onClick={sendResetOtps}
                            disabled={otpLoading}
                            className="secondary-reset-btn"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <RefreshCw size={14} className={otpLoading ? "spin" : ""} />
                            {otpLoading ? 'Resending...' : 'Resend Verification Code'}
                        </button>
                    </form>
                )}

                {/* Step 2: Set New Password Form (Unlocked only when verified) */}
                {isVerified && !isSubmitted && (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="reset-btn"
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                            {isLoading ? 'Updating...' : 'Reset Password'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}

                {/* Success Message Screen */}
                {isSubmitted && (
                    <div className="success-box">
                        <CheckCircle2 size={56} color="#35d7d3" style={{ margin: '0 auto 1rem auto' }} />
                        <p>
                            Your password has been successfully reset. You can now log in with your new password.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="reset-btn"
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                            Go to Login <ArrowRight size={18} />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResetPassword;
