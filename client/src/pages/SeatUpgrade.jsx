import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import { Plane, ArrowRight, ArrowUpCircle } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../services/apiService';
import './UserDashboard.css';

const SeatUpgrade = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user ? user.email : '';
    const userName = user ? user.name : 'Passenger';

    const [upgradeStatus, setUpgradeStatus] = useState(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const [selectedClass, setSelectedClass] = useState('Business Class');

    const flightDetails = {
        flightNumber: "SA-1024",
        from: "HYD",
        to: "DEL",
        fromCity: "Hyderabad",
        toCity: "Delhi",
        departureDate: "24 May 2025",
        departureTime: "08:45 AM",
        seat: "12A (Economy)",
        status: "On Time"
    };

    useEffect(() => {
        if (userEmail) {
            axios.get(`${getApiUrl()}/upgrades/user/${userEmail}`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setUpgradeStatus(res.data[res.data.length - 1]);
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
            if (res.status === 200 || res.status === 201) {
                setUpgradeStatus(res.data.upgrade);
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error("Error requesting upgrade", error);
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19' }}>
            <UserSidebar />
            <div className="ud-container">
                <div className="ud-header">
                    <div className="ud-header-left">
                        <h1>Seat Upgrade</h1>
                        <p>Enhance your flying experience</p>
                    </div>
                </div>

                <div className="ud-glass-card ud-trip-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="ud-trip-content">
                        <div className="ud-trip-header">
                            <div className="ud-trip-title">
                                <Plane size={18} color="var(--accent-cyan)" />
                                <span>Upcoming Trip</span>
                            </div>
                        </div>

                        <div className="ud-trip-cities">
                            <div className="ud-city">
                                <h2>{flightDetails.from}</h2>
                                <p>{flightDetails.fromCity}</p>
                            </div>
                            <ArrowRight size={24} color="rgba(255,255,255,0.3)" />
                            <div className="ud-city">
                                <h2>{flightDetails.to}</h2>
                                <p>{flightDetails.toCity}</p>
                            </div>
                            <div className="ud-trip-flight-info" style={{ marginLeft: 'auto' }}>
                                <p>{flightDetails.departureDate}</p>
                                <p>{flightDetails.flightNumber}</p>
                            </div>
                        </div>

                        <div className="ud-trip-footer" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="ud-trip-footer-item">
                                <p>Current Seat</p>
                                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{flightDetails.seat}</p>
                            </div>
                            <div className="ud-trip-footer-item">
                                <p>Status</p>
                                <p style={{ color: upgradeStatus?.status === 'Approved' ? 'var(--accent-cyan)' : '#fff' }}>
                                    {upgradeStatus ? upgradeStatus.status : 'Eligible for Upgrade'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Request an Upgrade</h3>
                            {(!upgradeStatus || upgradeStatus.status === 'Rejected') ? (
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <select 
                                        value={selectedClass} 
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        style={{
                                            background: 'rgba(0,0,0,0.4)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            outline: 'none',
                                            flex: 1,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option style={{ background: '#0b0f19' }} value="Business Class">Business Class</option>
                                        <option style={{ background: '#0b0f19' }} value="First Class">First Class</option>
                                        <option style={{ background: '#0b0f19' }} value="Premium Economy">Premium Economy</option>
                                    </select>
                                    <button 
                                        onClick={requestUpgrade}
                                        disabled={isRequesting}
                                        style={{ 
                                            background: 'var(--gradient-primary)', 
                                            border: 'none', 
                                            color: '#ffffff',
                                            padding: '0.8rem 2rem',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <ArrowUpCircle size={18} />
                                        {isRequesting ? 'Requesting...' : 'Request Upgrade'}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ margin: 0 }}>Your upgrade request is currently: <strong style={{ color: upgradeStatus.status === 'Approved' ? 'var(--accent-cyan)' : '#f59e0b' }}>{upgradeStatus.status}</strong></p>
                                    {upgradeStatus.status === 'Approved' && upgradeStatus.newSeat && (
                                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--accent-cyan)' }}>You have been assigned seat <strong>{upgradeStatus.newSeat}</strong>.</p>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatUpgrade;
