import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, User, Phone, ArrowRight, PlaneTakeoff, Smartphone, ShieldCheck, X, AlertCircle } from 'lucide-react';
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
            
            
            

            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <div className="login-box" style={{ 
                    maxWidth: '440px', 
                    width: '100%', 
                    padding: '3rem 2.5rem',
                    borderRadius: '24px',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    border: verificationRequired ? '1px solid rgba(179, 136, 255, 0.4)' : '1px solid var(--border-light)'
                }}>
                    
                    {!verificationRequired ? (
                        <>
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
                                    Join the Journey
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
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
                                
                                <div style={{ position: 'relative' }}>
                                    <User size={20} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        style={{ paddingLeft: '48px', marginBottom: 0 }}
                                    />
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <Mail size={20} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
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
                                    <Phone size={20} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                    <input 
                                        type="tel" 
                                        placeholder="Mobile Number" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required 
                                        style={{ paddingLeft: '48px', marginBottom: 0 }}
                                    />
                                </div>
                                
                                <div style={{ position: 'relative' }}>
                                    <Lock size={20} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                    <input 
                                        type="password" 
                                        placeholder="Password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                    {isLoading ? 'Processing...' : 'Create Account'}
                                    {!isLoading && <ArrowRight size={20} />}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Already have an account?{" "}
                                <span 
                                    onClick={() => navigate('/login')}
                                    style={{ 
                                        color: 'var(--primary-blue)', 
                                        cursor: 'pointer', 
                                        fontWeight: '600',
                                        transition: 'color 0.3s ease'
                                    }}
                                >
                                    Log in
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
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
                                    Verify Mobile
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                    We sent a 6-digit verification code to your Mobile SMS.
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
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold' }}>
                                        SMS verification code
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Smartphone size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
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
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', display: 'block' }}>
                                        Sent to {phone || 'your mobile number'} (Simulated below)
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
                                        background: 'var(--gradient-purple)',
                                        opacity: isLoading ? 0.7 : 1,
                                        borderRadius: '30px'
                                    }}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                                    {!isLoading && <ArrowRight size={20} />}
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => setVerificationRequired(false)}
                                    style={{ 
                                        width: '100%', 
                                        background: 'transparent',
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        border: '1px solid var(--border-light)',
                                        padding: '0.75rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '30px',
                                        boxShadow: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Back to Signup
                                </button>
                            </form>
                        </>
                    )}

                </div>
            </div>

            {/* Virtual SMS Toast Overlay (Mobile Phone Simulator) */}
            {showSmsNotification && (
                <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '320px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid var(--accent-orange)',
                    boxShadow: '0 0 30px rgba(255, 144, 0, 0.3)',
                    borderRadius: '20px',
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
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px', fontSize: '0.85rem', lineHeight: '1.4' }}>
                        <strong style={{ color: 'var(--accent-orange)' }}>From:</strong> Smart Airline Security<br/>
                        Your Mobile Signup OTP is: <strong style={{ fontSize: '1.1rem',  letterSpacing: '1px' }}>{simulatedMobileOtp}</strong>
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
                                boxShadow: 'none',
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
