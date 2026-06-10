import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../services/apiService';
import './Signup.css';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [verificationRequired, setVerificationRequired] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${getApiUrl()}/auth/register`, {
                email,
                password,
                name
            });

            const data = response.data;

            if (data.verificationRequired) {
                setVerificationRequired(true);
            } else {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);

                if (data.user.role === 'admin') navigate("/admin");
                else navigate("/dashboard");
            }
        } catch (error) {
            console.error("Auth error:", error);
            if (error.response && error.response.data) {
                setErrorMsg(error.response.data.message || "Registration failed");
            } else {
                setErrorMsg("Something went wrong connecting to the server.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const response = await axios.post(`${getApiUrl()}/auth/register/verify`, {
                email,
                emailOtp
            });

            const data = response.data;

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);

            if (data.user.role === 'admin') navigate("/admin");
            else navigate("/dashboard");
        } catch (error) {
            console.error("Verification error:", error);
            if (error.response && error.response.data) {
                setErrorMsg(error.response.data.message || "Verification failed");
            } else {
                setErrorMsg("Server error verifying OTP code.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="hero-section">
                <h1>SMART AIRLINE ADD-ONS PLATFORM</h1><br></br>
                <p>A Modern, Sleek, and Professional Airline Addon Platform</p>

                <div className="logo-box">
                    <h2>Smart Airline</h2>
                    <h3>Premium Travel Experience</h3>
                    <p>DIGITAL AIRLINE ECOSYSTEM</p>
                    <p>Passenger & Admin Management Suite</p>
                </div>
            </div>

            <div className="signup-card">
                {!verificationRequired ? (
                    <>
                        <h2>Create Your Acco<span className="highlight-cyan">unt</span></h2>
                        <p>Join Smart Airlines Addons</p>

                        {errorMsg && (
                            <div className="auth-error-box">
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

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

                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="signup-btn"
                            >
                                {isLoading ? 'Signing up...' : 'Sign up'}
                            </button>
                        </form>

                        <div className="bottom-links">
                            Already have an account?
                            <a
                                href="#!"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/login');
                                }}
                            >
                                {" "}Login
                            </a>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>Verify Your Email</h2>
                        <p style={{marginBottom: '2rem'}}>We've sent a 6-digit code to<br/>{email || 'vijaykoushik@gmail.com'}</p>

                        {errorMsg && (
                            <div className="auth-error-box">
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerifyOtp}>
                            <div className="otp-container">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <input
                                        key={index}
                                        id={`otp-input-${index}`}
                                        type="text"
                                        maxLength="1"
                                        className="otp-box"
                                        value={emailOtp[index] || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^[0-9]$/.test(val) || val === '') {
                                                const newOtp = emailOtp.split('');
                                                newOtp[index] = val;
                                                setEmailOtp(newOtp.join(''));
                                                if (val !== '' && index < 5) {
                                                    document.getElementById(`otp-input-${index + 1}`).focus();
                                                }
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
                                                document.getElementById(`otp-input-${index - 1}`).focus();
                                            }
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="resend-text">
                                Didn't receive the code? <a href="#!">Resend (00:45)</a>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || emailOtp.length < 6}
                                className="signup-btn"
                            >
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>

                            <div className="bottom-links" style={{marginTop: '20px'}}>
                                <a
                                    href="#!"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setVerificationRequired(false);
                                    }}
                                >
                                    Back to Login
                                </a>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Signup;