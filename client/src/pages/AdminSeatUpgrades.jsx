import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import axios from 'axios';

const AdminSeatUpgrades = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [upgrades, setUpgrades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [offeringId, setOfferingId] = useState(null);
    const [offerData, setOfferData] = useState({ seat: '', price: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== "admin") {
                navigate("/dashboard");
            } else {
                setUser(parsedUser);
                fetchUpgrades();
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const fetchUpgrades = async () => {
        try {
            const upgradesRes = await axios.get(`${getApiUrl()}/upgrades`);
            setUpgrades(upgradesRes.data.reverse());
        } catch (error) {
            console.error("Failed to fetch seat upgrades:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitOffer = async (id) => {
        const { seat: newSeat, price } = offerData;
        if (!newSeat || !price || isNaN(price)) return;
        
        try {
            const res = await axios.put(`${getApiUrl()}/upgrades/${id}/offer`, { newSeat, price: Number(price) });
            if (res.status === 200 || res.status === 201) {
                setUpgrades(prev => prev.map(u => u.id === id ? { ...u, status: "Pending Payment", newSeat, price: Number(price) } : u));
                setOfferingId(null);
                setOfferData({ seat: '', price: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpgradeReject = async (id) => {
        try {
            const res = await axios.put(`${getApiUrl()}/upgrades/${id}/reject`);
            if (res.status === 200 || res.status === 201) {
                setUpgrades(prev => prev.map(u => u.id === id ? { ...u, status: "Rejected" } : u));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <AdminSidebar />
            
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Seat Upgrades</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                            Manage all passenger seat upgrade requests.
                        </p>
                    </div>
                </div>

                <div className="card glass-panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0', overflowX: 'auto', boxShadow: 'var(--shadow-card)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Request ID</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Requested Class</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Status</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td>
                                </tr>
                            ) : upgrades.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No seat upgrade requests found.</td>
                                </tr>
                            ) : (
                                upgrades.map((upg, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
                                        <td style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>{upg.id}</td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>{upg.requestedClass}</td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <span style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
                                                border: `1px solid ${upg.status === 'Approved' ? '#059669' : upg.status === 'Pending' ? '#d97706' : '#dc2626'}`,
                                                color: upg.status === 'Approved' ? '#10b981' : upg.status === 'Pending' ? '#f59e0b' : '#ef4444'
                                            }}>
                                                • {upg.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                                            {offeringId === upg.id ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <input type="text" placeholder="Seat" value={offerData.seat} onChange={e => setOfferData({...offerData, seat: e.target.value})} style={{ padding: '0.4rem', width: '80px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '0.85rem', borderRadius: '4px' }}/>
                                                        <input type="number" placeholder="₹ Price" value={offerData.price} onChange={e => setOfferData({...offerData, price: e.target.value})} style={{ padding: '0.4rem', width: '90px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '0.85rem', borderRadius: '4px' }}/>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => setOfferingId(null)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                                        <button onClick={() => submitOffer(upg.id)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: 'var(--accent-teal)', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Send Offer</button>
                                                    </div>
                                                </div>
                                            ) : upg.status === 'Pending' ? (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => { setOfferingId(upg.id); setOfferData({ seat: '', price: '' }); }} style={{ background: 'var(--accent-teal)', color: '#ffffff', padding: '0.4rem 1rem', fontSize: '0.85rem', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Offer</button>
                                                    <button onClick={() => handleUpgradeReject(upg.id)} style={{ background: 'transparent', border: '1px solid var(--border-light)', color: '#94a3b8', padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
                                                </div>
                                            ) : upg.status === 'Pending Payment' ? (
                                                <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: '500' }}>Awaiting User Payment</span>
                                            ) : upg.status === 'Approved' ? (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Assigned: {upg.newSeat}</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSeatUpgrades;
