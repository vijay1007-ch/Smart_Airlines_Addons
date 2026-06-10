import React from 'react';
import UserSidebar from '../components/UserSidebar';
import { Headset, MessageSquare, Mail, PhoneCall, ChevronRight } from 'lucide-react';
import './UserDashboard.css';

const Support = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19' }}>
            <UserSidebar />
            <div className="ud-container">
                <div className="ud-header">
                    <div className="ud-header-left">
                        <h1>Support Center</h1>
                        <p>We're here to help 24/7</p>
                    </div>
                </div>

                <div className="ud-middle-section" style={{ gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div className="ud-glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
                            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                <MessageSquare size={32} color="var(--accent-cyan)" />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Live Chat</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Chat instantly with our support team.</p>
                            <button className="ud-btn-outline" style={{ width: '100%' }}>Start Chat</button>
                        </div>
                        
                        <div className="ud-glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                <PhoneCall size={32} color="#10b981" />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Call Us</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Available 24/7 for urgent inquiries.</p>
                            <button className="ud-btn-outline" style={{ width: '100%', borderColor: 'rgba(16, 185, 129, 0.5)', color: '#10b981' }}>+1 800 AIRLINE</button>
                        </div>

                        <div className="ud-glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
                            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                <Mail size={32} color="#a855f7" />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Email Support</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>We typically reply within 24 hours.</p>
                            <button className="ud-btn-outline" style={{ width: '100%', borderColor: 'rgba(168, 85, 247, 0.5)', color: '#a855f7' }}>Send Email</button>
                        </div>
                    </div>

                    <div className="ud-glass-card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Headset size={24} color="var(--accent-cyan)" /> Frequently Asked Questions
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                "How do I upgrade my seat?",
                                "What is the baggage allowance for Economy?",
                                "How do I use my Shuu Pass?",
                                "Can I cancel my add-on purchase?",
                                "How are SkyPoints calculated?"
                            ].map((q, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontWeight: '500' }}>{q}</span>
                                    <ChevronRight size={20} color="var(--text-muted)" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Support;
