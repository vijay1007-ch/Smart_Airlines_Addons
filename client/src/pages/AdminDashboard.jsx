import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { TrendingUp, IndianRupee, Users, Plane, CheckCircle2, XCircle, Clock, Bell, Search, Maximize, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

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
        
        const paymentInterval = setInterval(async () => {
            try {
                const res = await axios.get(`${getApiUrl()}/orders/pending`);
                if (res.status === 200 || res.status === 201) {
                    setPendingPayments(res.data.filter(p => p.status === 'pending'));
                }
            } catch (err) { }
        }, 1500);

        return () => clearInterval(paymentInterval);
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await axios.get(`${getApiUrl()}/orders/stats`);
            const statsData = statsRes.data;
            if (typeof statsData.revenue === 'string') statsData.revenue = statsData.revenue.replace('$', '₹');
            if (typeof statsData.profit === 'string') statsData.profit = statsData.profit.replace('$', '₹');
            setAnalytics(statsData);

            const ordersRes = await axios.get(`${getApiUrl()}/orders`);
            const formattedOrders = ordersRes.data.reverse().slice(0, 10).map(o => {
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

            const upgradesRes = await axios.get(`${getApiUrl()}/upgrades`);
            setUpgrades(upgradesRes.data.reverse());
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
            const res = await axios.put(`${getApiUrl()}/upgrades/${id}/offer`, { newSeat, price: Number(price) });
            if (res.status === 200 || res.status === 201) {
                setUpgrades(prev => prev.map(u => u.id === id ? { ...u, status: "Pending Payment", newSeat, price: Number(price) } : u));
                setOfferingId(null);
                setOfferData({ seat: '', price: '' });
            }
        } catch (err) { }
    };

    const handleUpgradeReject = async (id) => {
        try {
            const res = await axios.put(`${getApiUrl()}/upgrades/${id}/reject`);
            if (res.status === 200 || res.status === 201) {
                setUpgrades(prev => prev.map(u => u.id === id ? { ...u, status: "Rejected" } : u));
            }
        } catch (err) { }
    };

    const handlePaymentAction = async (orderId, action) => {
        try {
            await axios.put(`${getApiUrl()}/orders/pending/${orderId}`, { status: action });
            setPendingPayments(prev => prev.filter(p => p.orderId !== orderId));
        } catch (err) { }
    };

    if (!user) return null;

    // Dummy Chart Data based on screenshot
    const overviewData = [
        { name: '18 May', value: 500 },
        { name: '19 May', value: 1300 },
        { name: '20 May', value: 900 },
        { name: '21 May', value: 1300 },
        { name: '22 May', value: 1700 },
        { name: '23 May', value: 1500 },
        { name: '24 May', value: 2400 }
    ];

    const pieData = [
        { name: 'Confirmed', value: 8562, color: '#6366f1' }, // Purple
        { name: 'Completed', value: 2305, color: '#10b981' }, // Green
        { name: 'Pending', value: 730, color: '#f59e0b' },    // Yellow
        { name: 'Cancelled', value: 1245, color: '#ef4444' }  // Red
    ];

    const stats = [
        { title: "Total Bookings", value: "12,842", trend: "+ 18.6%", trendUp: true, icon: TrendingUp, color: "#6366f1" },
        { title: "Total Revenue", value: "₹24,58,300", trend: "+ 23.4%", trendUp: true, icon: IndianRupee, color: "#3b82f6" },
        { title: "Total Passengers", value: "18,753", trend: "+ 15.2%", trendUp: true, icon: Users, color: "#10b981" },
        { title: "Active Flights", value: "128", trend: "+ 8.7%", trendUp: true, icon: Plane, color: "#f59e0b" },
        { title: "Cancellation Rate", value: "2.35%", trend: "↓ 1.2%", trendUp: true, icon: XCircle, color: "#ef4444" } // Treated as good decrease
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            <AdminSidebar />
            
            <div style={{ flex: 1, marginLeft: '260px' }}>
                
                {/* Top Nav Bar */}
                <div style={{ 
                    height: '70px', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0 2rem'
                }}>
                    <div style={{ color: '#94a3b8' }}>
                        {/* Empty space or hamburger menu logic could go here */}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Search Bar */}
                        <div style={{ 
                            background: 'rgba(15, 23, 42, 0.6)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '8px', 
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '300px'
                        }}>
                            <Search size={16} color="#64748b" />
                            <input 
                                type="text" 
                                placeholder="Search anything..." 
                                style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '0.85rem', width: '100%', outline: 'none' }}
                            />
                        </div>

                        {/* Icons */}
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={20} color="#cbd5e1" />
                            <div style={{ position: 'absolute', top: '-4px', right: '-2px', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></div>
                        </div>
                        <Maximize size={20} color="#cbd5e1" style={{ cursor: 'pointer' }} />
                        
                        {/* User Profile */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '0.5rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                                {user.name.charAt(0)}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.name}</span>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Super Admin</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.3rem 0', letterSpacing: '0.5px' }}>Dashboard</h1>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                                Welcome back, {user.name}! Here's what's happening today.
                            </p>
                        </div>
                        <div style={{ 
                            background: 'rgba(15, 23, 42, 0.6)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '8px', 
                            padding: '0.6rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.85rem',
                            color: '#cbd5e1',
                            cursor: 'pointer'
                        }}>
                            <Calendar size={16} color="#94a3b8" />
                            24 May 2025 - 24 May 2025
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(5, 1fr)', 
                        gap: '1.25rem',
                        marginBottom: '1.5rem'
                    }}>
                        {stats.map((stat, idx) => (
                            <div key={idx} style={{ 
                                background: 'rgba(15, 23, 42, 0.4)', 
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.05)', 
                                borderRadius: '12px', 
                                padding: '1.25rem', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '1rem',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{ 
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px', 
                                        background: `rgba(${stat.color === '#6366f1' ? '99,102,241' : stat.color === '#3b82f6' ? '59,130,246' : stat.color === '#10b981' ? '16,185,129' : stat.color === '#f59e0b' ? '245,158,11' : '239,68,68'}, 0.15)`,
                                        color: stat.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{stat.title}</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.4rem' }}>{stat.value}</div>
                                        <div style={{ fontSize: '0.75rem', color: stat.trendUp ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <TrendingUp size={12} style={{ transform: stat.trendUp ? 'none' : 'rotate(180deg)' }} /> {stat.trend} <span style={{color:'#64748b'}}>vs yesterday</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Middle Row: Charts & Sidebar */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        
                        {/* Area Chart */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Bookings Overview</h3>
                                <select style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', outline: 'none' }}>
                                    <option>This Week</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, minHeight: '220px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={overviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}K` : val} />
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                        <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Donut Chart */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Bookings by Status</h3>
                            </div>
                            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>12,842</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings List */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Recent Orders</h3>
                                <span style={{ color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer' }}>View All</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '250px' }}>
                                {orders.slice(0, 4).map((order, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ShoppingCart size={18} color="#94a3b8" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{order.id}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{order.customer}</div>
                                            </div>
                                        </div>
                                        <span style={{ 
                                            padding: '0.2rem 0.5rem', 
                                            borderRadius: '4px', 
                                            fontSize: '0.65rem', 
                                            fontWeight: '600',
                                            background: order.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: order.status === 'Approved' ? '#10b981' : '#f59e0b',
                                            border: `1px solid ${order.status === 'Approved' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Bottom Tables for existing Add-on data (Adapted beautifully) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
                        
                        {/* Live Authorizations table matching Top Routes style */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Live Payment Authorizations</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                        <th style={{ paddingBottom: '1rem', fontWeight: '500' }}>Transaction ID</th>
                                        <th style={{ paddingBottom: '1rem', fontWeight: '500' }}>Amount</th>
                                        <th style={{ paddingBottom: '1rem', fontWeight: '500' }}>Time</th>
                                        <th style={{ paddingBottom: '1rem', fontWeight: '500', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingPayments.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No pending payments to authorize.</td></tr>
                                    ) : pendingPayments.map((payment, idx) => (
                                        <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                            <td style={{ padding: '1rem 0', fontWeight: '500' }}>{payment.orderId}</td>
                                            <td style={{ padding: '1rem 0' }}>₹{payment.amount}</td>
                                            <td style={{ padding: '1rem 0', color: '#94a3b8' }}>{payment.date}</td>
                                            <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handlePaymentAction(payment.orderId, 'approved')} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Accept</button>
                                                    <button onClick={() => handlePaymentAction(payment.orderId, 'declined')} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Decline</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Seat Upgrade Requests matching System Notifications style */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Seat Upgrade Requests</h3>
                                <span style={{ color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer' }}>View All</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {upgrades.length === 0 ? (
                                    <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No upgrade requests.</div>
                                ) : upgrades.slice(0, 4).map((upg, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Plane size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>
                                                Request <span style={{color: '#818cf8'}}>{upg.id}</span> for {upg.requestedClass}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                    Status: {upg.status}
                                                </span>
                                                {offeringId === upg.id ? (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <input type="text" placeholder="Seat" value={offerData.seat} onChange={e => setOfferData({...offerData, seat: e.target.value})} style={{ padding: '0.2rem 0.4rem', width: '45px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.7rem', borderRadius: '4px' }}/>
                                                        <input type="number" placeholder="₹" value={offerData.price} onChange={e => setOfferData({...offerData, price: e.target.value})} style={{ padding: '0.2rem 0.4rem', width: '50px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.7rem', borderRadius: '4px' }}/>
                                                        <button onClick={() => submitOffer(upg.id)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px' }}>Send</button>
                                                    </div>
                                                ) : upg.status === 'Pending' ? (
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => { setOfferingId(upg.id); setOfferData({ seat: '', price: '' }); }} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', cursor: 'pointer' }}>Offer</button>
                                                        <button onClick={() => handleUpgradeReject(upg.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
