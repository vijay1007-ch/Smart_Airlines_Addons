import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { TrendingUp, DollarSign, Users, Plane, CheckCircle2, XCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [analytics, setAnalytics] = useState({
        revenue: "$0.00", profit: "$0.00", customers: 0, activeFlights: 142
    });
    const [orders, setOrders] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [offeringId, setOfferingId] = useState(null);
    const [offerData, setOfferData] = useState({ seat: '', price: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== "admin") {
                navigate("/catalogue");
            } else {
                setUser(parsedUser);
                fetchDashboardData();
            }
        } else {
            navigate("/login");
        }
        
        // Poll for pending payments from backend API
        const paymentInterval = setInterval(async () => {
            try {
                const res = await fetch(`${getApiUrl()}/orders/pending`);
                if (res.ok) {
                    const data = await res.json();
                    setPendingPayments(data.filter(p => p.status === 'pending'));
                }
            } catch (err) {
                console.error("Failed to fetch pending payments", err);
            }
        }, 1500);

        return () => clearInterval(paymentInterval);
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            // Fetch stats
            const statsRes = await fetch(`${getApiUrl()}/orders/stats`);
            const statsData = await statsRes.json();
            setAnalytics(statsData);

            // Fetch orders
            const ordersRes = await fetch(`${getApiUrl()}/orders`);
            const ordersData = await ordersRes.json();
            
            // Format orders for the table, taking the 10 most recent
            const formattedOrders = ordersData.reverse().slice(0, 10).map(o => {
                // If it's a real order with items
                let amount = "$0.00";
                let itemsStr = "Custom Order";
                
                if (o.items && Array.isArray(o.items)) {
                    const total = o.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0);
                    amount = `$${total.toFixed(2)}`;
                    itemsStr = o.items.map(i => i.name).join(', ') || "Unknown Item";
                } else if (o.amount) {
                    amount = typeof o.amount === 'string' && o.amount.startsWith('$') ? o.amount : `$${o.amount}`;
                    itemsStr = o.item || "Add-on Purchase";
                }

                return {
                    id: o.id || `#ORD-XXXX`,
                    customer: o.customerName || o.customer || "User",
                    item: itemsStr,
                    amount: amount,
                    status: o.status || "Approved" // Defaulting to approved if no status exists
                };
            });
            
            setOrders(formattedOrders);

            // Fetch upgrades
            const upgradesRes = await fetch(`${getApiUrl()}/upgrades`);
            const upgradesData = await upgradesRes.json();
            setUpgrades(upgradesData.reverse());
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitOffer = async (id) => {
        const { seat: newSeat, price } = offerData;
        if (!newSeat || !price || isNaN(price)) return;
        
        try {
            const res = await fetch(`${getApiUrl()}/upgrades/${id}/offer`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newSeat, price: Number(price) })
            });
            if (res.ok) {
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
            const res = await fetch(`${getApiUrl()}/upgrades/${id}/reject`, { method: 'PUT' });
            if (res.ok) {
                setUpgrades(prev => prev.map(u => u.id === id ? { ...u, status: "Rejected" } : u));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePaymentAction = async (orderId, action) => {
        // action is 'approved' or 'declined'
        try {
            await fetch(`${getApiUrl()}/orders/pending/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action })
            });
            // Optimistically remove it from the UI
            setPendingPayments(prev => prev.filter(p => p.orderId !== orderId));
        } catch (err) {
            console.error("Failed to update payment action", err);
        }
    };

    if (!user) return null;

    const stats = [
        { title: "Total Revenue", value: analytics.revenue, trend: "+20.1%", icon: DollarSign, color: "#00e5ff" },
        { title: "Net Profit", value: analytics.profit, trend: "+15.3%", icon: TrendingUp, color: "#b388ff" },
        { title: "Active Flights", value: analytics.activeFlights.toString(), trend: "+4.2%", icon: Plane, color: "#00e5ff" },
        { title: "New Customers", value: analytics.customers.toString(), trend: "+11.4%", icon: Users, color: "#b388ff" }
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case "Approved": return <CheckCircle2 size={16} color="#4ade80" />;
            case "Pending": return <Clock size={16} color="#fbbf24" />;
            case "Rejected": return <XCircle size={16} color="#ef4444" />;
            default: return <CheckCircle2 size={16} color="#4ade80" />;
        }
    };

    return (
        <div className="page" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '3rem' }}>
            <Navbar />

            
            

            <div className="container" style={{ marginTop: '2rem' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="title">
                            Admin Dashboard
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            Welcome back, {user.name}. Here's what's happening today.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/catalogue')}
                        style={{ padding: '0.75rem 1.5rem',   borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                    >
                        Manage Catalogue
                    </button>
                </div>

                {/* Stats Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    {stats.map((stat, idx) => (
                        <div key={idx} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
                                    {stat.title}
                                </span>
                                <div style={{ 
                                    padding: '0.5rem', 
                                    borderRadius: '12px', 
                                    background: `rgba(${stat.color === '#00e5ff' ? '0,229,255' : '179,136,255'}, 0.1)`,
                                    border: `1px solid ${stat.color}30`
                                }}>
                                    <stat.icon size={20} color={stat.color} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                                    {isLoading ? '...' : stat.value}
                                </h2>
                                <span style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    
                    {/* Recent Orders Table */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Recent Add-on Orders</h3>
                            <button style={{ 
                                background: 'transparent', 
                                border: '1px solid var(--primary-blue)', 
                                color: 'var(--primary-blue)',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}>
                                View All
                            </button>
                        </div>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Order ID</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Customer</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Add-on Item</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Amount</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</td>
                                        </tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent orders found.</td>
                                        </tr>
                                    ) : (
                                        orders.map((order, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem 0', fontWeight: '500' }}>{order.id}</td>
                                                <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{order.customer}</td>
                                                <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{order.item}</td>
                                                <td style={{ padding: '1rem 0', fontWeight: '600' }}>{order.amount}</td>
                                                <td style={{ padding: '1rem 0' }}>
                                                    <div style={{ 
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                        padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                                                        background: order.status === 'Approved' ? 'rgba(74, 222, 128, 0.1)' 
                                                                : order.status === 'Pending' ? 'rgba(251, 191, 36, 0.1)' 
                                                                : 'rgba(239, 68, 68, 0.1)',
                                                        color: order.status === 'Approved' ? '#4ade80' 
                                                                : order.status === 'Pending' ? '#fbbf24' 
                                                                : '#ef4444'
                                                    }}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pending Payments Table */}
                    <div className="card" style={{ padding: '1.5rem', border: pendingPayments.length > 0 ? '1px solid #4ade80' : 'none', boxShadow: pendingPayments.length > 0 ? '0 0 15px rgba(74, 222, 128, 0.2)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                                Live Payment Authorizations 
                                {pendingPayments.length > 0 && (
                                    <span style={{ marginLeft: '10px', background: '#4ade80', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                        {pendingPayments.length} Pending
                                    </span>
                                )}
                            </h3>
                        </div>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Transaction ID</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Amount</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Time</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pending payments to authorize.</td>
                                        </tr>
                                    ) : (
                                        pendingPayments.map((payment, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem 0', fontWeight: '500' }}>{payment.orderId}</td>
                                                <td style={{ padding: '1rem 0', fontWeight: '600', color: 'var(--accent-cyan)' }}>₹{payment.amount}</td>
                                                <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{payment.date}</td>
                                                <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            onClick={() => handlePaymentAction(payment.orderId, 'approved')} 
                                                            style={{ background: 'linear-gradient(90deg, #2ed573, #2ecc71)', color: '#ffffff', padding: '0.4rem 1rem', fontSize: '0.85rem', border: 'none', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                        >
                                                            <CheckCircle2 size={14} /> Accept
                                                        </button>
                                                        <button 
                                                            onClick={() => handlePaymentAction(payment.orderId, 'declined')} 
                                                            style={{ background: 'transparent', border: '1px solid #ff416c', color: '#ff416c', padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                        >
                                                            <XCircle size={14} /> Decline
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Seat Upgrades Table */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Seat Upgrade Requests</h3>
                        </div>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Request ID</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Customer</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Current Seat</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Requested</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500' }}>Status</th>
                                        <th style={{ padding: '1rem 0', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td>
                                        </tr>
                                    ) : upgrades.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No upgrade requests found.</td>
                                        </tr>
                                    ) : (
                                        upgrades.map((upg, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem 0', fontWeight: '500' }}>{upg.id}</td>
                                                <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{upg.customerName}</td>
                                                <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{upg.currentSeat}</td>
                                                <td style={{ padding: '1rem 0', fontWeight: '600', color: 'var(--accent-cyan)' }}>{upg.requestedClass}</td>
                                                <td style={{ padding: '1rem 0' }}>
                                                    <div style={{ 
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                        padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                                                        background: upg.status === 'Approved' ? 'rgba(74, 222, 128, 0.1)' 
                                                                : upg.status === 'Pending' ? 'rgba(251, 191, 36, 0.1)' 
                                                                : 'rgba(239, 68, 68, 0.1)',
                                                        color: upg.status === 'Approved' ? '#4ade80' 
                                                                : upg.status === 'Pending' ? '#fbbf24' 
                                                                : '#ef4444'
                                                    }}>
                                                        {getStatusIcon(upg.status)}
                                                        {upg.status}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                    {offeringId === upg.id ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Seat (e.g., 2A)" 
                                                                    value={offerData.seat} 
                                                                    onChange={e => setOfferData({...offerData, seat: e.target.value})}
                                                                    style={{ padding: '0.5rem', width: '130px', marginBottom: 0, borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',  fontSize: '0.85rem' }}
                                                                    autoFocus
                                                                />
                                                                <input 
                                                                    type="number" 
                                                                    placeholder="Price (₹)" 
                                                                    value={offerData.price} 
                                                                    onChange={e => setOfferData({...offerData, price: e.target.value})}
                                                                    style={{ padding: '0.5rem', width: '100px', marginBottom: 0, borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',  fontSize: '0.85rem' }}
                                                                />
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => setOfferingId(null)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px' }}>Cancel</button>
                                                                <button onClick={() => submitOffer(upg.id)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem',  color: '#ffffff', border: 'none', borderRadius: '20px', fontWeight: '600' }}>Send Offer</button>
                                                            </div>
                                                        </div>
                                                    ) : upg.status === 'Pending' ? (
                                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                            <button onClick={() => { setOfferingId(upg.id); setOfferData({ seat: '', price: '' }); }} style={{  color: '#ffffff', padding: '0.4rem 1rem', fontSize: '0.85rem', border: 'none', borderRadius: '20px', fontWeight: '600' }}>Offer Seat</button>
                                                            <button onClick={() => handleUpgradeReject(upg.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '20px', fontWeight: '600' }}>Reject</button>
                                                        </div>
                                                    ) : upg.status === 'Pending Payment' ? (
                                                        <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>Awaiting User Payment (₹{upg.price})</span>
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
            </div>
        </div>
    );
};

export default AdminDashboard;
