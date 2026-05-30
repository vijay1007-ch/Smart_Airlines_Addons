import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, Lock, ArrowRight, PlaneTakeoff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
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
        
        try {
            const response = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Save token and user to localStorage
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);

                if (data.user.role === 'admin') {
                    navigate("/admin");
                } else {
                    navigate("/dashboard");
                }
            } else {
                alert(data.message || "Authentication failed");
            }
        } catch (error) {
            console.error("Auth error:", error);
            alert("Something went wrong connecting to the server.");
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
                            Welcome Back
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Enter your credentials to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

                </div>
            </div>
        </div>
    );
};

export default Login;
