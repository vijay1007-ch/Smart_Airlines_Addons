import React from 'react';
import UserSidebar from '../components/UserSidebar';
import { Star, ArrowRight, Gift, Trophy, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const SkyPoints = () => {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19' }}>
            <UserSidebar />
            <div className="ud-container">
                <div className="ud-header">
                    <div className="ud-header-left">
                        <h1>SkyPoints Rewards</h1>
                        <p>Track your loyalty progress</p>
                    </div>
                </div>

                <div className="ud-middle-section" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    
                    {/* Status Card */}
                    <div className="ud-glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem' }}>
                        <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '2rem' }}>
                            <svg width="180" height="180" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent-cyan)" strokeWidth="10" strokeDasharray="314" strokeDashoffset="114" strokeLinecap="round" transform="rotate(-90 60 60)" />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Star size={32} color="#eab308" style={{ marginBottom: '5px' }} />
                                <span style={{ color: '#eab308', fontWeight: 'bold', fontSize: '1.5rem' }}>Gold</span>
                            </div>
                        </div>
                        
                        <h2 style={{ fontSize: '3rem', margin: '0 0 0.5rem 0' }}>2,540 <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>pts</span></h2>
                        <p style={{ color: '#10b981', margin: '0 0 1.5rem 0', fontWeight: '500' }}>+150 points earned this month</p>
                        
                        <div style={{ width: '100%', maxWidth: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Next Tier: Platinum</span>
                                <span>1,480 / 4,000</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '37%', height: '100%', background: 'var(--accent-cyan)' }}></div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.8rem' }}>Earn 2,520 more points to upgrade</p>
                        </div>
                    </div>

                    {/* How to earn / use */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="ud-glass-card">
                            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={20} color="var(--accent-cyan)" /> How to Earn</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                    <span>Book a Flight</span>
                                    <span style={{ color: '#10b981' }}>+500 pts</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                    <span>Purchase Add-ons</span>
                                    <span style={{ color: '#10b981' }}>+50 pts / ₹1,000</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                    <span>Upgrade Seat</span>
                                    <span style={{ color: '#10b981' }}>+200 pts</span>
                                </div>
                            </div>
                        </div>

                        <div className="ud-glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}><Trophy size={20} color="#eab308" /> Rewards Available</h3>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
                                <Gift size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0' }}>You have enough points to redeem exciting rewards in our catalogue!</p>
                                <button className="ud-btn-primary" onClick={() => navigate('/catalogue')} style={{ width: 'auto', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Redeem Points <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkyPoints;
