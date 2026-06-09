// Force reload
import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, Clock, ArrowRight, ShoppingBag, ArrowUpCircle, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../services/apiService';

const UserDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user ? user.name : 'Passenger';
    const userEmail = user ? user.email : '';

    const [upgradeStatus, setUpgradeStatus] = useState(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const [selectedClass, setSelectedClass] = useState('Business Class');

    // Mock flight details
    const [flightDetails, setFlightDetails] = useState({
        flightNumber: "SA-1024",
        from: "JFK",
        to: "LHR",
        fromCity: "New York",
        toCity: "London",
        departureDate: "Oct 24, 2026",
        departureTime: "18:45 PM",
        seat: "14B (Economy)",
        status: "On Time"
    });

    useEffect(() => {
        if (userEmail) {
            axios.get(`${getApiUrl()}/upgrades/user/${userEmail}`)
                .then(res => res.data)
                .then(data => {
                    if (data && data.length > 0) {
                        // Get the most recent request
                        const latest = data[data.length - 1];
                        setUpgradeStatus(latest);
                        if (latest.status === 'Approved' && latest.newSeat) {
                            setFlightDetails(prev => ({ ...prev, seat: latest.newSeat }));
                        }
                    }
                })
                .catch(err => console.error(err));
        }
    }, [userEmail]);

    const requestUpgrade = async () => {
        if (!selectedClass) return;

        setIsRequesting(true);
        try {
            const res = await axios.post(`${getApiUrl()}/upgrades`, {
                email: userEmail,
                customerName: userName,
                currentSeat: flightDetails.seat,
                requestedClass: selectedClass
            });
            const data = res.data;
            if (res.status === 200 || res.status === 201) {
                setUpgradeStatus(data.upgrade);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error requesting upgrade", error);
        } finally {
            setIsRequesting(false);
        }
    };

    const handlePayUpgrade = () => {
        const upgradeItem = {
            id: 'upg-' + Date.now(),
            name: `Seat Upgrade to ${upgradeStatus.newSeat}`,
            price: upgradeStatus.price,
            type: 'upgrade',
            upgradeId: upgradeStatus.id,
            details: 'Upgrade'
        };
        const cart = JSON.parse(localStorage.getItem('airline_cart') || '[]');
        localStorage.setItem('airline_cart', JSON.stringify([...cart, upgradeItem]));
        navigate('/payment');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <UserSidebar />

            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem', maxWidth: '1200px' }}>
                
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Welcome back, {userName}! <Plane size={24} color="var(--accent-cyan)" style={{ transform: 'rotate(45deg)' }} />
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
                    Here's your itinerary and account overview.
                </p>

                {/* Flight Details Section */}
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Upcoming Flight</h2>
                <div className="card" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '2rem',
                    marginBottom: '2.5rem',
                    border: '1px solid var(--border-light)'
                }}>
                    <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ padding: '0.5rem 1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                            <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontSize: '1.2rem' }}>{flightDetails.flightNumber}</h3>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{flightDetails.from}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{flightDetails.fromCity}</p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0.5rem' }}>
                                <ArrowRight size={24} color="var(--text-muted)" />
                            </div>

                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{flightDetails.to}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{flightDetails.toCity}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{flightDetails.departureDate}</p>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{flightDetails.departureTime}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
                        <div style={{ 
                            display: 'inline-block', 
                            padding: '0.3rem 0.8rem', 
                            borderRadius: '20px', 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: '#10b981', 
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                        }}>
                            {flightDetails.status}
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Seat: <strong style={{ color: upgradeStatus?.status === 'Approved' ? 'var(--accent-cyan)' : 'var(--text-main)' }}>{flightDetails.seat}</strong></p>
                    
                        <div style={{ marginTop: '0.5rem', width: '100%' }}>
                            {!upgradeStatus || upgradeStatus.status === 'Rejected' ? (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <select 
                                        value={selectedClass} 
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        style={{
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid var(--border-light)',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontFamily: 'inherit',
                                            color: 'var(--text-main)',
                                            width: 'auto'
                                        }}
                                    >
                                        <option value="Business Class" style={{color: 'var(--text-main)', background: 'var(--bg-main)'}}>Business Class</option>
                                        <option value="First Class" style={{color: 'var(--text-main)', background: 'var(--bg-main)'}}>First Class</option>
                                        <option value="Premium Economy" style={{color: 'var(--text-main)', background: 'var(--bg-main)'}}>Premium Economy</option>
                                    </select>
                                    <button 
                                        onClick={requestUpgrade}
                                        disabled={isRequesting}
                                        style={{ 
                                            background: 'var(--gradient-primary)', 
                                            border: 'none', 
                                            color: '#ffffff',
                                            padding: '0.4rem 1rem',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <ArrowUpCircle size={14} />
                                        {isRequesting ? 'Req...' : 'Upgrade'}
                                    </button>
                                </div>
                        ) : upgradeStatus.status === 'Pending' ? (
                            <span style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                                <Clock size={14} /> Upgrade Pending
                            </span>
                        ) : upgradeStatus.status === 'Pending Payment' ? (
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>
                                    Offered: {upgradeStatus.newSeat} (₹{upgradeStatus.price})
                                </span>
                                <button 
                                    onClick={handlePayUpgrade}
                                    style={{ background: 'var(--accent-cyan)', color: '#060b13', padding: '0.3rem 0.8rem', fontSize: '0.8rem', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                >
                                    <ShoppingBag size={12} /> Pay ₹{upgradeStatus.price}
                                </button>
                            </div>
                        ) : (
                            <span style={{ color: '#00e5ff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', fontWeight: 'bold' }}>
                                <CheckCircle size={14} /> Upgrade Approved
                            </span>
                        )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                    <div className="card glass-panel" onClick={() => navigate('/catalogue')} style={{ flex: '1', minWidth: '300px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '1.5rem 2rem', border: '1px solid var(--border-light)' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '1.5rem' }}>
                            <ShoppingBag size={24} color="var(--accent-cyan)" />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem' }}>Browse Catalogue</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Explore add ons</p>
                        </div>
                    </div>

                    <div className="card glass-panel" onClick={() => navigate('/history')} style={{ flex: '1', minWidth: '300px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '1.5rem 2rem', border: '1px solid var(--border-light)' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '1.5rem' }}>
                            <Clock size={24} color="var(--accent-teal)" />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem' }}>My Orders</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>View your past add-on orders</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats Panel */}
                <div className="card glass-panel" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '2rem', border: '1px solid var(--border-light)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>SkyPoints</p>
                        <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>2,450</h2>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--border-light)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Trips</p>
                        <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>12</h2>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--border-light)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Add-ons Used</p>
                        <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>18</h2>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--border-light)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Bundles</p>
                        <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>3</h2>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserDashboard;
