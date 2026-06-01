// Force reload
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, Clock, ArrowRight, ShoppingBag, ArrowUpCircle, CheckCircle, XCircle } from 'lucide-react';
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
        seat: "12A (Economy)",
        status: "On Time"
    });

    useEffect(() => {
        if (userEmail) {
            fetch(`${getApiUrl()}/upgrades/user/${userEmail}`)
                .then(res => res.json())
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
            const res = await fetch(`${getApiUrl()}/upgrades`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    customerName: userName,
                    currentSeat: flightDetails.seat,
                    requestedClass: selectedClass
                })
            });
            const data = await res.json();
            if (res.ok) {
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
        <div className="page" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
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

            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '100px' }}>
                
                <h1 style={{ 
                    fontSize: '2.5rem', fontWeight: '800', 
                    background: 'linear-gradient(90deg, #fff, #b388ff)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                }}>
                    User Dashboard
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
                    Welcome back, <span style={{ color: 'var(--accent-cyan)' }}>{userName}</span>. Here is your itinerary.
                </p>

                {/* Flight Details Section */}
                <div className="card" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '2.5rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                    borderLeft: '4px solid var(--accent-cyan)',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Flight</p>
                            <h3 style={{ margin: 0, color: 'var(--primary-blue)', fontSize: '1.4rem' }}>{flightDetails.flightNumber}</h3>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ margin: 0, fontSize: '2rem' }}>{flightDetails.from}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{flightDetails.fromCity}</p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1rem' }}>
                                <Plane size={28} color="var(--accent-cyan)" style={{ marginBottom: '5px' }} />
                                <div style={{ width: '80px', height: '2px', background: 'rgba(0, 229, 255, 0.3)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: 0, top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div>
                                </div>
                            </div>

                            <div>
                                <h2 style={{ margin: 0, fontSize: '2rem' }}>{flightDetails.to}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{flightDetails.toCity}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={16} color="var(--primary-blue)" /> Date
                                </p>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '1.05rem' }}>{flightDetails.departureDate}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={16} color="var(--primary-blue)" /> Time
                                </p>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '1.05rem' }}>{flightDetails.departureTime}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
                            <div style={{ 
                                display: 'inline-block', 
                                padding: '0.4rem 1rem', 
                                borderRadius: '20px', 
                                background: 'rgba(74, 222, 128, 0.1)', 
                                border: '1px solid rgba(74, 222, 128, 0.2)',
                                color: '#4ade80', 
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {flightDetails.status}
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem' }}>Seat: <strong style={{ color: upgradeStatus?.status === 'Approved' ? '#00e5ff' : '#fff' }}>{flightDetails.seat}</strong></p>
                        
                            <div style={{ marginTop: '0.5rem', width: '100%' }}>
                                {!upgradeStatus || upgradeStatus.status === 'Rejected' ? (
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <select 
                                            value={selectedClass} 
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                color: '#fff',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                padding: '0.6rem 1rem',
                                                borderRadius: '20px',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease',
                                                fontFamily: 'inherit',
                                                width: '100%',
                                                maxWidth: '200px'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-cyan)'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                        >
                                            <option value="Business Class" style={{color: '#000'}}>Business Class</option>
                                            <option value="First Class" style={{color: '#000'}}>First Class</option>
                                            <option value="Premium Economy" style={{color: '#000'}}>Premium Economy</option>
                                        </select>
                                        <button 
                                            onClick={requestUpgrade}
                                            disabled={isRequesting}
                                            style={{ 
                                                background: 'var(--accent-cyan)', 
                                                border: 'none', 
                                                color: '#000',
                                                padding: '0.6rem 1.5rem',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                cursor: 'pointer',
                                                borderRadius: '20px',
                                                boxShadow: '0 4px 15px rgba(255, 75, 43, 0.4)',
                                                transition: 'all 0.3s ease',
                                                whiteSpace: 'nowrap'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <ArrowUpCircle size={18} />
                                            {isRequesting ? 'Requesting...' : 'Request'}
                                        </button>
                                    </div>
                            ) : upgradeStatus.status === 'Pending' ? (
                                <span style={{ color: '#fbbf24', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                                    <Clock size={16} /> Upgrade Request Sent to Admin
                                </span>
                            ) : upgradeStatus.status === 'Pending Payment' ? (
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ color: '#fbbf24', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
                                        Admin offered: {upgradeStatus.newSeat} (₹{upgradeStatus.price})
                                    </span>
                                    <button 
                                        onClick={handlePayUpgrade}
                                        style={{ 
                                            background: 'var(--accent-cyan)', 
                                            color: '#000',
                                            padding: '0.4rem 1rem',
                                            fontSize: '0.85rem',
                                            border: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        <ShoppingBag size={14} /> Pay ₹{upgradeStatus.price} Now
                                    </button>
                                </div>
                            ) : (
                                <span style={{ color: '#00e5ff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', fontWeight: 'bold' }}>
                                    <CheckCircle size={16} /> Upgrade Approved
                                </span>
                            )}
                            {upgradeStatus?.status === 'Rejected' && (
                                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>Request Rejected</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div className="card" onClick={() => navigate('/catalogue')} style={{ flex: '1', minWidth: '300px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2rem', transition: 'all 0.3s ease', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '1.5rem' }}>
                            <ShoppingBag size={28} color="var(--accent-cyan)" />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Browse Catalogue</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add premium meals, wifi, and more</p>
                        </div>
                        <ArrowRight style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                    </div>

                    <div className="card" onClick={() => navigate('/history')} style={{ flex: '1', minWidth: '300px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2rem', transition: 'all 0.3s ease', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(179, 136, 255, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '1.5rem' }}>
                            <Clock size={28} color="#b388ff" />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>Purchase History</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>View your past add-on orders</p>
                        </div>
                        <ArrowRight style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserDashboard;
