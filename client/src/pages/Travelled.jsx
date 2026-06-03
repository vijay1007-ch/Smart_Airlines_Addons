import React from 'react';
import Navbar from '../components/Navbar';
import { Plane, Calendar, MapPin, CheckCircle } from 'lucide-react';

const Travelled = () => {
    // Mock data for past flights
    const pastFlights = [
        { 
            id: "SA-821", 
            date: "Jan 12, 2026", 
            from: "SFO", fromCity: "San Francisco",
            to: "JFK", toCity: "New York",
            status: "Completed", 
            seat: "14B (Economy)" 
        },
        { 
            id: "SA-405", 
            date: "Nov 05, 2025", 
            from: "LAX", fromCity: "Los Angeles",
            to: "ORD", toCity: "Chicago",
            status: "Completed", 
            seat: "2A (Business)" 
        },
        { 
            id: "SA-992", 
            date: "Aug 22, 2025", 
            from: "JFK", fromCity: "New York",
            to: "MIA", toCity: "Miami",
            status: "Completed", 
            seat: "22F (Economy)" 
        }
    ];

    return (
        <div className="page" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            <Navbar />
            
            

            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                    <h1 style={{ 
                        fontSize: '2.5rem', fontWeight: '800', 
                        
                        margin: 0
                    }}>
                        Travelled History
                    </h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {pastFlights.map((flight, index) => (
                        <div key={index} className="card" style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '1.5rem 2rem',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                            borderLeft: '4px solid #4ade80',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ minWidth: '80px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Flight</p>
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
                                    background: 'rgba(74, 222, 128, 0.1)', 
                                    color: '#4ade80', 
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <CheckCircle size={14} /> {flight.status}
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Seat: <strong >{flight.seat}</strong></p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Travelled;
