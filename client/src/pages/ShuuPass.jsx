import React from 'react';
import UserSidebar from '../components/UserSidebar';
import { useNavigate } from 'react-router-dom';
import { Crown, Percent, Coffee, UserCheck, Gift, ArrowRight } from 'lucide-react';
import './UserDashboard.css';

const ShuuPass = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user ? user.name : 'Passenger';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19' }}>
            <UserSidebar />
            <div className="ud-container">
                <div className="ud-header">
                    <div className="ud-header-left">
                        <h1>Shuu Pass</h1>
                        <p>Your premium travel membership</p>
                    </div>
                </div>

                <div className="ud-glass-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                            <Crown size={48} color="#eab308" />
                        </div>
                    </div>
                    
                    <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>Shuu Pass <span style={{ color: '#eab308' }}>Gold</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                        Welcome to the exclusive club, {userName}. Enjoy unlimited premium perks for the next 12 months.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left', marginBottom: '3rem' }}>
                        <div className="ud-glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <Percent size={24} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>20% OFF Extra Baggage</h3>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Never worry about packing light again. Enjoy massive discounts on all baggage.</p>
                        </div>
                        <div className="ud-glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <Coffee size={24} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Free Lounge Access</h3>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Relax in our premium lounges across 50+ airports globally.</p>
                        </div>
                        <div className="ud-glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <UserCheck size={24} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Priority Check-in</h3>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Skip the lines. Get a dedicated check-in counter and priority boarding.</p>
                        </div>
                        <div className="ud-glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <Gift size={24} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Exclusive Member Deals</h3>
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Get access to flash sales and partner discounts only available to pass holders.</p>
                        </div>
                    </div>

                    <button className="ud-btn-primary" style={{ maxWidth: '300px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '10px' }} onClick={() => navigate('/catalogue')}>
                        Use Your Benefits <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShuuPass;
