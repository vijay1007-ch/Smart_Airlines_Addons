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
            background: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop") center/cover no-repeat',
        }}>
            {/* Dark overlay for the background image */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(180deg, rgba(6,11,19,0.8) 0%, rgba(6,11,19,0.95) 100%)',
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
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {user ? (
                                <button 
                                    onClick={() => navigate(user.role === 'admin' ? '/admin' : '/catalogue')}
                                    style={{ 
                                        padding: '1rem 2.5rem', 
                                        fontSize: '1.1rem',
                                        background: 'var(--gradient-primary)',
                                        boxShadow: 'var(--glow-cyan)'
                                    }}
                                >
                                    Explore Add-ons
                                </button>
                            ) : (
                                <button 
                                    onClick={() => navigate('/login')}
                                    style={{ 
                                        padding: '1rem 2.5rem', 
                                        fontSize: '1.1rem',
                                        background: 'var(--gradient-primary)',
                                        boxShadow: 'var(--glow-cyan)'
                                    }}
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Airplane Image */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                        <img 
                            src="https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1000&auto=format&fit=crop" 
                            alt="Airplane" 
                            style={{
                                width: '100%',
                                maxWidth: '600px',
                                borderRadius: '24px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                opacity: 0.8,
                                filter: 'brightness(0.9) contrast(1.1)',
                                mixBlendMode: 'screen'
                            }} 
                        />
                        {/* Optional subtle glow behind airplane */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '300px',
                            height: '300px',
                            background: 'rgba(0, 229, 255, 0.2)',
                            filter: 'blur(100px)',
                            zIndex: -1
                        }} />
                    </div>
                </div>

                {/* About the Site Section */}
                <div className="container" style={{ paddingBottom: '4rem' }}>
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '16px',
                        padding: '3rem',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        maxWidth: '800px',
                        margin: '0 auto'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#ffffff' }}>Why Choose Smart Airline?</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                            Welcome to the next generation of flight personalization. Our platform allows you to seamlessly upgrade your travel experience before you even step foot in the airport. From requesting a priority seat upgrade to pre-ordering gourmet meals and securing high-speed Wi-Fi, we put the power of choice in your hands.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                            Whether you are a frequent flyer aiming for the coveted Platinum tier or a vacationer looking for that extra bit of comfort, our curated add-ons and exclusive bundles guarantee a hassle-free, premium journey.
                        </p>
                    </div>
                </div>

                {/* Features Section (Horizontal line of icons) */}
                <div className="container" style={{ paddingBottom: '4rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '2rem',
                        padding: '2rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-light)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '12px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '12px' }}>
                                <Gift size={24} color="var(--accent-cyan)" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Premium Add-ons</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>Curated for you</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '12px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '12px' }}>
                                <Smartphone size={24} color="var(--accent-cyan)" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Seamless Booking</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>Hassle-free experience</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '12px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '12px' }}>
                                <ShieldCheck size={24} color="var(--accent-cyan)" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Secure Payments</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>Multiple payment options</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '12px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '12px' }}>
                                <HeadphonesIcon size={24} color="var(--accent-cyan)" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>24/7 Support</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>We are here to help</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
