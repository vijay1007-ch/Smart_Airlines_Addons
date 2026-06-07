import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { TrendingUp, IndianRupee, Users, Plane, CheckCircle2, XCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [analytics, setAnalytics] = useState({
        revenue: "₹0.00", profit: "₹0.00", customers: 0, activeFlights: 142
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
            if (typeof statsData.revenue === 'string') statsData.revenue = statsData.revenue.replace('$', '₹');
            if (typeof statsData.profit === 'string') statsData.profit = statsData.profit.replace('$', '₹');
            setAnalytics(statsData);

            // Fetch orders
            const ordersRes = await fetch(`${getApiUrl()}/orders`);
            const ordersData = await ordersRes.json();
            
            // Format orders for the table, taking the 10 most recent
            const formattedOrders = ordersData.reverse().slice(0, 10).map(o => {
                let amount = "₹0.00";
                let itemsStr = "Custom Order";
                
                if (o.items && Array.isArray(o.items)) {
                    const total = o.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0);
                    amount = `₹${total.toFixed(2)}`;
                    itemsStr = o.items.map(i => i.name).join(', ') || "Unknown Item";
                } else if (o.amount) {
                    amount = typeof o.amount === 'string' && o.amount.startsWith('₹') ? o.amount : `₹${o.amount}`;
                    itemsStr = o.item || "Add-on Purchase";
                }

                return {
                    id: o.id || `#ORD-XXXX`,
                    customer: o.customerName || o.customer || "User",
                    item: itemsStr,
                    amount: amount,
                    status: o.status || "Approved" 
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
        try {
            await fetch(`${getApiUrl()}/orders/pending/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action })
            });
            setPendingPayments(prev => prev.filter(p => p.orderId !== orderId));
        } catch (err) {
            console.error("Failed to update payment action", err);
        }
    };

    if (!user) return null;

    const stats = [
        { title: "Total Revenue", value: analytics.revenue, trend: "+20.1%", icon: IndianRupee, color: "#2563eb" },
        { title: "Net Profit", value: analytics.profit, trend: "+15.3%", icon: TrendingUp, color: "#10b981" },
        { title: "Active Flights", value: analytics.activeFlights.toString(), trend: "+4.2%", icon: Plane, color: "#2563eb" },
        { title: "New Customers", value: analytics.customers.toString(), trend: "+11.4%", icon: Users, color: "#b388ff" }
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#060b13', color: 'var(--text-main)' }}>
            <AdminSidebar />
            
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Admin Dashboard</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                            Welcome back, {user.name}. Here's what's happening today.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/catalogue')}
                        style={{ 
                            background: '#2563eb', 
                            color: '#fff', 
                            padding: '0.6rem 1.2rem',   
                            borderRadius: '6px', 
                            fontSize: '0.9rem',
                            fontWeight: '600', 
                            border: 'none', 
                            cursor: 'pointer' 
                        }}
                    >
                        Manage Catalogue
                    </button>
                </div>

                {/* Stats Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '1.5rem',
                    marginBottom: '2.5rem'
                }}>
                    {stats.map((stat, idx) => (
                        <div key={idx} style={{ 
                            background: '#0f172a', 
                            border: '1px solid #1e293b', 
                            borderRadius: '12px', 
                            padding: '1.5rem', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '1rem' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stat.title}</span>
                                <div style={{ 
                                    padding: '0.4rem', 
                                    borderRadius: '8px', 
                                    background: `rgba(${stat.color === '#2563eb' ? '37,99,235' : stat.color === '#10b981' ? '16,185,129' : '179,136,255'}, 0.1)`,
                                    color: stat.color
                                }}>
                                    <stat.icon size={16} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>
                                    {isLoading ? '...' : stat.value}
                                </h2>
                                <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem' }}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    
                    {/* Recent Orders Table */}
                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Recent Add-on Orders</h3>
                            <button style={{ 
                                background: 'transparent', border: '1px solid #334155', color: '#cbd5e1',
                                padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer'
                            }}>
                                View All
                            </button>
                        </div>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #1e293b', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Order ID</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Customer</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Add-on Item</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Amount</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Status</th>
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
                                            <tr key={idx} style={{ borderBottom: '1px solid #1e293b', fontSize: '0.9rem' }}>
                                                <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{order.id}</td>
                                                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{order.customer}</td>
                                                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{order.item}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{order.amount}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>
                                                    <span style={{ 
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                                                        border: `1px solid ${order.status === 'Approved' ? '#059669' : order.status === 'Pending' ? '#d97706' : '#dc2626'}`,
                                                        color: order.status === 'Approved' ? '#10b981' : order.status === 'Pending' ? '#f59e0b' : '#ef4444'
                                                    }}>
                                                        • {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Pending Payments Table */}
                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                                    Live Payment Authorizations 
                                </h3>
                            </div>
                            
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #1e293b', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Transaction ID</th>
                                            <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Amount</th>
                                            <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Time</th>
                                            <th style={{ padding: '1rem 0.5rem', fontWeight: '500', textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingPayments.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending payments to authorize.</td>
                                            </tr>
                                        ) : (
                                            pendingPayments.map((payment, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #1e293b', fontSize: '0.85rem' }}>
                                                    <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{payment.orderId}</td>
                                                    <td style={{ padding: '1rem 0.5rem' }}>₹{payment.amount}</td>
                                                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{payment.date}</td>
                                                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button 
                                                                onClick={() => handlePaymentAction(payment.orderId, 'approved')} 
                                                                style={{ background: '#2563eb', color: '#ffffff', padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button 
                                                                onClick={() => handlePaymentAction(payment.orderId, 'declined')} 
                                                                style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                                                            >
                                                                Decline
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
                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Seat Upgrade Requests</h3>
                            </div>
                            
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #1e293b', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Request ID</th>
                                            <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Requested</th>
                                            <th style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>Status</th>
                                            <th style={{ padding: '1rem 0.5rem', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td>
                                            </tr>
                                        ) : upgrades.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No seat upgrade requests.</td>
                                            </tr>
                                        ) : (
                                            upgrades.slice(0,5).map((upg, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #1e293b', fontSize: '0.85rem' }}>
                                                    <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{upg.id}</td>
                                                    <td style={{ padding: '1rem 0.5rem' }}>{upg.requestedClass}</td>
                                                    <td style={{ padding: '1rem 0.5rem' }}>
                                                        <span style={{ 
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                            padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                                                            border: `1px solid ${upg.status === 'Approved' ? '#059669' : upg.status === 'Pending' ? '#d97706' : '#dc2626'}`,
                                                            color: upg.status === 'Approved' ? '#10b981' : upg.status === 'Pending' ? '#f59e0b' : '#ef4444'
                                                        }}>
                                                            • {upg.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                        {offeringId === upg.id ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    <input type="text" placeholder="Seat" value={offerData.seat} onChange={e => setOfferData({...offerData, seat: e.target.value})} style={{ padding: '0.3rem', width: '60px', background: '#060b13', border: '1px solid #1e293b', color: '#fff', fontSize: '0.75rem', borderRadius: '4px' }}/>
                                                                    <input type="number" placeholder="₹" value={offerData.price} onChange={e => setOfferData({...offerData, price: e.target.value})} style={{ padding: '0.3rem', width: '60px', background: '#060b13', border: '1px solid #1e293b', color: '#fff', fontSize: '0.75rem', borderRadius: '4px' }}/>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    <button onClick={() => setOfferingId(null)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid #334155', borderRadius: '4px' }}>Cancel</button>
                                                                    <button onClick={() => submitOffer(upg.id)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px' }}>Send</button>
                                                                </div>
                                                            </div>
                                                        ) : upg.status === 'Pending' ? (
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                <button onClick={() => { setOfferingId(upg.id); setOfferData({ seat: '', price: '' }); }} style={{ background: '#2563eb', color: '#ffffff', padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Offer</button>
                                                                <button onClick={() => handleUpgradeReject(upg.id)} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
                                                            </div>
                                                        ) : upg.status === 'Pending Payment' ? (
                                                            <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>Awaiting User</span>
                                                        ) : upg.status === 'Approved' ? (
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{upg.newSeat}</span>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
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
        </div>
    );
};

export default AdminDashboard;
