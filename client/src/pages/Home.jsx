import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { PlaneTakeoff, ArrowRight, Sofa, Utensils, Coffee, Wifi, LogOut } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const featuredAddons = [
        { title: "Seat Upgrades", icon: <Sofa size={32} color="var(--primary-blue)" />, desc: "Stretch out with premium legroom or upgrade to first class for ultimate comfort." },
        { title: "Gourmet Meals", icon: <Utensils size={32} color="var(--accent-pink)" />, desc: "Pre-book curated meals crafted by world-class chefs to enjoy at 35,000 feet." },
        { title: "VIP Lounge", icon: <Coffee size={32} color="var(--accent-orange)" />, desc: "Relax in exclusive airport lounges with complimentary drinks and spa services." },
        { title: "High-Speed WiFi", icon: <Wifi size={32} color="var(--secondary-blue)" />, desc: "Stay connected above the clouds with our blazing fast satellite internet." }
    ];

    return (
        <div className="page" style={{ position: 'relative', overflow: 'hidden' }}>
            <Navbar />
            
            {/* Ambient Background Elements */}
            <div style={{
                position: 'absolute', top: '10%', left: '-5%', width: '500px', height: '500px',
                background: 'var(--primary-blue)', filter: 'blur(200px)', borderRadius: '50%', zIndex: -1, opacity: 0.15
            }} />
            <div style={{
                position: 'absolute', bottom: '20%', right: '-5%', width: '600px', height: '600px',
                background: 'var(--accent-pink)', filter: 'blur(250px)', borderRadius: '50%', zIndex: -1, opacity: 0.15
            }} />
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px',
                background: 'var(--secondary-blue)', filter: 'blur(300px)', borderRadius: '50%', zIndex: -1, opacity: 0.1
            }} />

            {/* Hero Section */}
            <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', textAlign: 'center', paddingTop: '4rem' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '120px', height: '120px', borderRadius: '50%', 
                    background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.2)',
                    marginBottom: '2rem', boxShadow: 'var(--glow-cyan)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <PlaneTakeoff size={60} color="var(--primary-blue)" />
                </div>
                
                <h1 className="title" style={{ fontSize: '5rem', marginBottom: '1.5rem', background: 'linear-gradient(90deg, #fff, #00e5ff, #b388ff, #fff)', backgroundSize: '300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shine 8s linear infinite' }}>
                    Redefine Your Journey
                </h1>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '1.35rem', maxWidth: '700px', marginBottom: '3.5rem', lineHeight: '1.7', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    Your flight should be as extraordinary as your destination. Personalize your travel experience with premium addons crafted for your absolute comfort.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {user ? (
                        <>
                            <button 
                                onClick={() => navigate(user.role === 'admin' ? '/admin' : '/catalogue')}
                                style={{ 
                                    padding: '1.2rem 3rem', 
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    boxShadow: '0 10px 30px rgba(0, 229, 255, 0.4)'
                                }}
                            >
                                Go to Dashboard <ArrowRight size={22} />
                            </button>
                            <button 
                                onClick={handleLogout}
                                style={{ 
                                    padding: '1.2rem 2.5rem', 
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-main)',
                                    boxShadow: 'none'
                                }}
                            >
                                Log Out <LogOut size={22} />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => navigate('/login')}
                            style={{ 
                                padding: '1.2rem 3rem', 
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                boxShadow: '0 10px 30px rgba(0, 229, 255, 0.4)'
                            }}
                        >
                            Get Started <ArrowRight size={22} />
                        </button>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <div className="container" style={{ paddingBottom: '6rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--text-muted)' }}>Experience Premium</h2>
                
                <div className="card-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    {featuredAddons.map((addon, index) => (
                        <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 2rem' }}>
                            <div style={{
                                width: '70px', height: '70px', borderRadius: '20px', 
                                background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
                            }}>
                                {addon.icon}
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#fff' }}>{addon.title}</h3>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', lineHeight: '1.6' }}>{addon.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
};

export default Home;
