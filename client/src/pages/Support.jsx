import React, { useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import { Headset, Mail, ChevronRight, ChevronDown } from 'lucide-react';
import './UserDashboard.css';

const faqs = [
    {
        q: "How do I upgrade my seat?",
        a: "You can upgrade your seat by navigating to the 'Seat Upgrade' section in the sidebar. Choose your preferred class and place a bid, which our admins will review in real-time."
    },
    {
        q: "What is the baggage allowance for Economy?",
        a: "Economy class passengers are allowed 1 cabin bag (up to 7kg) and 1 checked bag (up to 15kg). You can purchase 'Extra Baggage' from the Add-ons catalogue if you need more."
    },
    {
        q: "How do I use my Shuu Pass?",
        a: "Your Shuu Pass automatically applies a 15% discount to all your add-on purchases at checkout. Make sure you purchase the pass from the 'Shuu Pass' page first!"
    },
    {
        q: "Can I cancel my add-on purchase?",
        a: "Yes, you can manage your bookings and cancel unused add-ons from the 'My Orders' section up to 24 hours before your flight departure."
    },
    {
        q: "How are SkyPoints calculated?",
        a: "You earn 10 SkyPoints for every ₹100 spent on tickets or add-ons. You can redeem these points later for discounts on future bookings!"
    }
];

const Support = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                        <div className="ud-glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
                            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                <Mail size={40} color="#a855f7" />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Email Support</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>Reach out to us directly at</p>
                            <a href="mailto:bikkinavijay0@gmail.com" style={{ textDecoration: 'none', width: '100%', maxWidth: '300px' }}>
                                <button className="ud-btn-outline" style={{ width: '100%', borderColor: 'rgba(168, 85, 247, 0.5)', color: '#a855f7', padding: '10px 30px', fontSize: '1.1rem', cursor: 'pointer' }}>
                                    bikkinavijay0@gmail.com
                                </button>
                            </a>
                        </div>
                    </div>

                    <div className="ud-glass-card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Headset size={24} color="var(--accent-cyan)" /> Frequently Asked Questions
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {faqs.map((faq, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => toggleFaq(i)}
                                    style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                                        <span style={{ fontWeight: '500', color: openIndex === i ? 'var(--accent-cyan)' : '#fff' }}>{faq.q}</span>
                                        {openIndex === i ? <ChevronDown size={20} color="var(--accent-cyan)" /> : <ChevronRight size={20} color="var(--text-muted)" />}
                                    </div>
                                    {openIndex === i && (
                                        <div style={{ padding: '0 1rem 1rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                            {faq.a}
                                        </div>
                                    )}
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
