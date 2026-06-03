import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const ProfileRow = ({ icon, title, subtitle, onClick, color }) => (
    <div 
        onClick={onClick}
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '15px 0',
            borderBottom: '1px solid var(--border-light)',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            color: color || 'white'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingLeft: '20px' }}>
            <div style={{ fontSize: '1.8rem' }}>{icon}</div>
            <div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: color || 'white' }}>{title}</div>
                {subtitle && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{subtitle}</div>}
            </div>
        </div>
        <div style={{ paddingRight: '20px', fontSize: '1.5rem', color: 'var(--text-muted)' }}>›</div>
    </div>
);

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(storedUser);

        if (storedUser.role === 'user') {
            const savedHistory = localStorage.getItem('airline_history');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingBottom: '100px', maxWidth: '900px', margin: '0 auto' }}>
                <h1 className="title" style={{ textAlign: 'center', marginBottom: '2rem' }}>My Account</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {/* Left Column: Personal Details */}
                    <div className="card" style={{ alignSelf: 'start', borderTop: '4px solid var(--accent-cyan)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%',  display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem' }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{user.name}</h2>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Account Type</label>
                            <div style={{ display: 'inline-block', background: user.role === 'admin' ? 'rgba(255, 65, 108, 0.2)' : 'rgba(46, 213, 115, 0.2)', color: user.role === 'admin' ? '#ff416c' : '#2ed573', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', border: `1px solid ${user.role === 'admin' ? '#ff416c' : '#2ed573'}` }}>
                                {user.role.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dynamic Content based on Role */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {user.role === 'admin' ? (
                            <div className="card" style={{ borderTop: '4px solid #ff416c', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 20px 10px 20px' }}>
                                    <h2 style={{ color: '#ff416c', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                                        <span style={{ fontSize: '1.5rem' }}>⚙️</span> Admin Controls
                                    </h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <ProfileRow icon="📊" title="Dashboard" subtitle="System analytics and overview" onClick={() => navigate('/admin')} />
                                    <ProfileRow icon="📋" title="Catalogue" subtitle="Manage available add-ons" onClick={() => navigate('/admin/catalogue')} />
                                    <ProfileRow icon="📦" title="Bundles" subtitle="Configure combo packages" onClick={() => navigate('/admin/bundles')} />
                                </div>
                            </div>
                        ) : (
                            <div className="card" style={{ borderTop: '4px solid var(--primary-blue)', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 20px 10px 20px' }}>
                                    <h2 style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                                        <span style={{ fontSize: '1.5rem' }}>🛫</span> Passenger Services
                                    </h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <ProfileRow icon="🏠" title="Dashboard" subtitle="Flight overview & bookings" onClick={() => navigate('/dashboard')} />
                                    <ProfileRow icon="✈️" title="My Flights" subtitle="View past and upcoming travels" onClick={() => navigate('/travelled')} />
                                    <ProfileRow icon="🎁" title="Bundles" subtitle="Exclusive combo offers" onClick={() => navigate('/bundles')} />
                                    <ProfileRow icon="🛍️" title="Catalogue" subtitle="Explore available add-ons" onClick={() => navigate('/catalogue')} />
                                    <ProfileRow icon="🛒" title="Cart" subtitle="View selected items" onClick={() => navigate('/cart')} />
                                    <ProfileRow icon="🧾" title="Orders" subtitle="Purchase history and receipts" onClick={() => navigate('/history')} />
                                </div>
                            </div>
                        )}
                        
                        <div className="card" style={{ borderTop: '4px solid var(--border-light)', padding: 0, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <ProfileRow icon="🔐" title="Reset Password" subtitle="Keep your account secure" onClick={() => navigate('/forgot-password')} />
                                <ProfileRow icon="🚪" title="Logout" subtitle="Sign out of your account" onClick={handleLogout} color="#ff416c" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
