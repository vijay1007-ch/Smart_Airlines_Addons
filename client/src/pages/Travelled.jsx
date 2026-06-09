import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Plane, Calendar, MapPin, CheckCircle, Link as LinkIcon, Loader2 } from 'lucide-react';

const Travelled = () => {
    const [linkedApps, setLinkedApps] = useState({});
    const [isLinking, setIsLinking] = useState(null); // stores the name of the app currently linking
    const [importedTrips, setImportedTrips] = useState([]);

    const travelApps = [
        { id: 'redbus', name: 'RedBus', color: '#D84E55', icon: '🚌' },
        { id: 'abhibus', name: 'AbhiBus', color: '#00529B', icon: '🚍' },
        { id: 'cleartrip', name: 'ClearTrip', color: '#F77728', icon: '✈️' }
    ];

    const mockTripsData = {
        redbus: [
            { id: "RB-821", date: "Jan 12, 2026", from: "SFO", fromCity: "San Francisco", to: "LAX", toCity: "Los Angeles", status: "Imported via RedBus", seat: "14B" }
        ],
        abhibus: [
            { id: "AB-405", date: "Nov 05, 2025", from: "JFK", fromCity: "New York", to: "BOS", toCity: "Boston", status: "Imported via AbhiBus", seat: "2A" }
        ],
        cleartrip: [
            { id: "CT-992", date: "Aug 22, 2025", from: "ORD", fromCity: "Chicago", to: "MIA", toCity: "Miami", status: "Imported via ClearTrip", seat: "22F" }
        ]
    };

    const handleLinkApp = (appId) => {
        setIsLinking(appId);
        // Simulate API call to link app
        setTimeout(() => {
            setLinkedApps(prev => ({ ...prev, [appId]: true }));
            setImportedTrips(prev => [...prev, ...mockTripsData[appId]]);
            setIsLinking(null);
        }, 1500);
    };

    return (
        <div className="page" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>
                        My Trips
                    </h1>
                </div>

                {/* Third Party Link Section */}
                <div className="card" style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px' }}>
                    <h2 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LinkIcon size={24} color="var(--primary-blue)" /> Link Travel Apps
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Connect your other travel accounts to automatically import your past and upcoming trips.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {travelApps.map(app => (
                            <button
                                key={app.id}
                                disabled={linkedApps[app.id] || isLinking === app.id}
                                onClick={() => handleLinkApp(app.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: `1px solid ${linkedApps[app.id] ? 'var(--border-light)' : app.color}`,
                                    background: linkedApps[app.id] ? 'var(--bg-main)' : `${app.color}15`,
                                    color: linkedApps[app.id] ? 'var(--text-muted)' : '#fff',
                                    cursor: linkedApps[app.id] || isLinking ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: 'bold',
                                    boxShadow: linkedApps[app.id] ? 'none' : `0 0 15px ${app.color}30`
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{app.icon}</span>
                                {isLinking === app.id ? (
                                    <><Loader2 size={18} className="spin" /> Linking...</>
                                ) : linkedApps[app.id] ? (
                                    <>Linked to {app.name}</>
                                ) : (
                                    <>Link {app.name}</>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {importedTrips.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-light)' }}>
                        <Plane size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Trips Found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Link a travel app above to import your history.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {importedTrips.map((flight, index) => (
                            <div key={index} className="card" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '1.5rem 2rem',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                                borderLeft: '4px solid var(--primary-blue)',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ minWidth: '80px' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Booking ID</p>
                                        <h3 style={{ margin: 0, color: 'var(--primary-blue)', fontSize: '1.2rem' }}>{flight.id}</h3>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{flight.from}</h2>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{flight.fromCity}</p>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1rem' }}>
                                            <Plane size={20} color="var(--text-muted)" style={{ marginBottom: '5px' }} />
                                            <div style={{ width: '50px', height: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                                        </div>

                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{flight.to}</h2>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{flight.toCity}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '2rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem' }}>
                                        <div>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} /> Date
                                            </p>
                                            <p style={{ margin: 0, fontWeight: '600' }}>{flight.date}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '0.3rem 0.8rem', 
                                        borderRadius: '20px', 
                                        background: 'rgba(0, 229, 255, 0.1)', 
                                        color: '#00e5ff', 
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <CheckCircle size={14} /> {flight.status}
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Seat: <strong>{flight.seat}</strong></p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default Travelled;
