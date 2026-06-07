import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShieldCheck, Smartphone, HeadphonesIcon, Gift } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="page" style={{ 
            position: 'relative', 
            overflow: 'hidden',
            background: 'url("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop") center bottom/cover no-repeat',
            backgroundColor: 'var(--bg-main)'
        }}>
            {/* Dark overlay for the background image */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(180deg, rgba(6,11,19,0.95) 0%, rgba(6,11,19,0.85) 50%, rgba(6,11,19,0.2) 100%)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Navbar />

                {/* Hero Section */}
                <div className="container" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    minHeight: '75vh', 
                    paddingTop: '6rem',
                    gap: '2rem'
                }}>
                    {/* Left Column: Text & Buttons */}
                    <div style={{ flex: 1, maxWidth: '600px' }}>
                        <h1 style={{ 
                            fontSize: '4.5rem', 
                            marginBottom: '1.5rem', 
                            lineHeight: '1.1',
                            color: '#ffffff'
                        }}>
                            Redefine Your Journey
                        </h1>
                        
                        <p style={{ 
                            color: 'var(--text-muted)', 
                            fontSize: '1.2rem', 
                            marginBottom: '3rem', 
                            lineHeight: '1.7',
                            maxWidth: '500px'
                        }}>
                            Your flight should be as extraordinary as your destination. Personalize your travel experience with premium addons crafted for your absolute comfort.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            {user ? (
                                <>
                                    <button 
                                        onClick={() => navigate(user.role === 'admin' ? '/admin' : '/catalogue')}
                                        style={{ 
                                            padding: '12px 24px', 
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            background: 'var(--gradient-primary)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'opacity 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        Explore Add-ons
                                    </button>
                                    <button 
                                        onClick={() => navigate('/bundles')}
                                        style={{ 
                                            padding: '12px 24px', 
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            background: 'transparent',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                                    >
                                        View Bundles
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => navigate('/login')}
                                        style={{ 
                                            padding: '12px 24px', 
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            background: 'var(--gradient-primary)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'opacity 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        Explore Add-ons
                                    </button>
                                    <button 
                                        onClick={() => navigate('/bundles')}
                                        style={{ 
                                            padding: '12px 24px', 
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            background: 'transparent',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                                    >
                                        View Bundles
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Airplane Image */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                        <img 
                            src="https://img.freepik.com/free-png/flying-white-airplane-transparent-background_53876-121651.png" 
                            alt="Airplane" 
                            style={{
                                width: '120%',
                                maxWidth: '800px',
                                transform: 'translateX(20px)',
                                opacity: 1,
                                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'
                            }} 
                        />
                    </div>
                </div>

                {/* Features Section (Horizontal line of icons) */}
                <div className="container" style={{ paddingBottom: '4rem', marginTop: '2rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(6, 11, 19, 0.4)',
                        borderRadius: '0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '8px', color: '#fff' }}>
                                <Gift size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>Premium Add-ons</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Curated for you</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '8px', color: '#fff' }}>
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>Seamless Booking</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hassle-free experience</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '8px', color: '#fff' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>Secure Payments</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multiple payment options</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '8px', color: '#fff' }}>
                                <HeadphonesIcon size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>24/7 Support</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>We are here to help</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Home;
