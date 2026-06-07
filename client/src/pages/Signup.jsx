import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, User, Phone, AlertCircle, Smartphone, ShieldCheck, X, Plane, MapPin } from 'lucide-react';
import { getApiUrl } from '../services/apiService';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // OTP verification states
    const [verificationRequired, setVerificationRequired] = useState(false);
    const [mobileOtp, setMobileOtp] = useState('');
    const [simulatedMobileOtp, setSimulatedMobileOtp] = useState('');
    const [showSmsNotification, setShowSmsNotification] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        
        try {
            const response = await fetch(`${getApiUrl()}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name, phone })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.verificationRequired) {
                    setVerificationRequired(true);
                    setSimulatedMobileOtp(data.simulatedMobileOtp);
                    setTimeout(() => {
                        setShowSmsNotification(true);
                    }, 1200);
                } else {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    localStorage.setItem("token", data.token);

                    if (data.user.role === 'admin') {
                        navigate("/admin");
                    } else {
                        navigate("/dashboard");
                    }
                }
            } else {
                setErrorMsg(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Auth error:", error);
            setErrorMsg("Something went wrong connecting to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const response = await fetch(`${getApiUrl()}/auth/register/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    mobileOtp
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowSmsNotification(false);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);

                if (data.user.role === 'admin') {
                    navigate("/admin");
                } else {
                    navigate("/dashboard");
                }
            } else {
                setErrorMsg(data.message || "Verification failed");
            }
        } catch (error) {
            console.error("Verification error:", error);
            setErrorMsg("Server error verifying OTP code.");
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
                                        style={{ marginBottom: 0 }}
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
                                        style={{ marginBottom: 0 }}
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
                                        style={{ marginBottom: 0 }}
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
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', background: 'var(--gradient-primary)' }}
                                >
                                    {isLoading ? 'Processing...' : 'Create Account'}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Already have an account?{" "}
                                <span 
                                    onClick={() => navigate('/login')}
                                    style={{ color: 'var(--primary-blue)', cursor: 'pointer' }}
                                >
                                    Log in
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ffffff' }}>
                                    Verify Mobile
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    We sent a verification code to your SMS.
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
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>SMS verification code</label>
                                    <div style={{ position: 'relative' }}>
                                        <Smartphone size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            placeholder="Enter 6-digit SMS code" 
                                            value={mobileOtp}
                                            onChange={(e) => setMobileOtp(e.target.value)}
                                            required 
                                            style={{ paddingLeft: '48px', marginBottom: 0, letterSpacing: '1px' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                        Sent to {phone || 'your mobile number'}
                                    </span>
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
                        Your Mobile Signup OTP is: <strong style={{ fontSize: '1.1rem',  letterSpacing: '1px', color: '#ffffff' }}>{simulatedMobileOtp}</strong>
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

export default Signup;
