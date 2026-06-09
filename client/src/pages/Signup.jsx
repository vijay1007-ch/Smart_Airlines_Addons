import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, User, Phone, AlertCircle, Smartphone, ShieldCheck, X, Plane, MapPin } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../services/apiService';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // OTP verification states
    const [verificationRequired, setVerificationRequired] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        
        try {
            const response = await axios.post(`${getApiUrl()}/auth/register`, { email, password, name, phone });

            const data = response.data;

            if (data.verificationRequired) {
                setVerificationRequired(true);
            } else {
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);

                if (data.user.role === 'admin') {
                    navigate("/admin");
                } else {
                    navigate("/dashboard");
                }
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

            if (data.user.role === 'admin') {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
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
                    
                    {!verificationRequired ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
                                    Join the Journey
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Create an account to book your addons
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
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Full Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter your full name" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        style={{ marginBottom: 0, paddingLeft: '1rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                        style={{ marginBottom: 0, paddingLeft: '1rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        placeholder="Enter your mobile number" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required 
                                        style={{ marginBottom: 0, paddingLeft: '1rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="Create a password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required 
                                        style={{ marginBottom: 0, paddingLeft: '1rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    style={{ width: '100%', padding: '12px', marginTop: '1rem', background: 'var(--gradient-primary)', borderRadius: '8px', fontWeight: '600' }}
                                >
                                    {isLoading ? 'Processing...' : 'Create Account'}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Already have an account?{" "}
                                <span 
                                    onClick={() => navigate('/login')}
                                    style={{ color: 'var(--gradient-primary)', cursor: 'pointer' }}
                                >
                                    Log in
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
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

                            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Email verification code</label>
                                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
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
                                    style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', background: 'var(--gradient-primary)' }}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => setVerificationRequired(false)}
                                    className="secondary"
                                    style={{ width: '100%', padding: '1rem' }}
                                >
                                    Back to Signup
                                </button>
                            </form>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Signup;
