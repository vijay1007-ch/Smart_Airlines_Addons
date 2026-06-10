import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Bell, Wallet, ShoppingBag, Star, Crown, 
    Plane, ArrowRight, Briefcase, Clock, Coffee, 
    ArrowUpCircle, Wifi, Utensils, Percent, UserCheck, Gift
} from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../services/apiService';
import './UserDashboard.css';

const UserDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user ? user.name : 'Vijay Ganesh';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19' }}>
            <UserSidebar />

            <div className="ud-container">
                
                {/* Header */}
                <div className="ud-header">
                    <div className="ud-header-left">
                        <h1>Welcome back, {userName} 👋</h1>
                        <p>Here's your travel overview</p>
                    </div>
                    <div className="ud-header-right">
                        <div className="ud-search-bar">
                            <Search size={18} color="var(--text-muted)" />
                            <input type="text" placeholder="Search anything..." />
                        </div>
                        <div className="ud-header-icon">
                            <Bell size={24} />
                            <div className="ud-notification-dot"></div>
                        </div>
                        <img 
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vijay" 
                            alt="User Avatar" 
                            className="ud-avatar"
                        />
                    </div>
                </div>

                {/* Top Stat Cards */}
                <div className="ud-top-stats">
                    <div className="ud-glass-card ud-stat-card">
                        <div className="ud-stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                            <Wallet size={24} />
                        </div>
                        <div className="ud-stat-content">
                            <p className="ud-stat-title">Total Spent</p>
                            <h3 className="ud-stat-value">₹24,680</h3>
                            <div className="ud-stat-trend ud-stat-trend-up">
                                <span>^ 18%</span> <span style={{color: 'var(--text-muted)', fontWeight: 'normal'}}>vs last month</span>
                            </div>
                        </div>
                        {/* Mini Sparkline mock */}
                        <svg width="60" height="30" viewBox="0 0 60 30" style={{ position: 'absolute', right: '1rem', bottom: '1.5rem' }}>
                            <path d="M0,25 Q10,25 15,15 T30,20 T45,5 T60,10" fill="none" stroke="#10b981" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="ud-glass-card ud-stat-card">
                        <div className="ud-stat-icon-wrapper" style={{ background: 'rgba(217, 70, 239, 0.1)', color: '#d946ef' }}>
                            <ShoppingBag size={24} />
                        </div>
                        <div className="ud-stat-content">
                            <p className="ud-stat-title">Total Orders</p>
                            <h3 className="ud-stat-value">12</h3>
                            <div className="ud-stat-trend ud-stat-trend-up">
                                <span>^ 20%</span> <span style={{color: 'var(--text-muted)', fontWeight: 'normal'}}>vs last month</span>
                            </div>
                        </div>
                        <svg width="60" height="30" viewBox="0 0 60 30" style={{ position: 'absolute', right: '1rem', bottom: '1.5rem' }}>
                            <path d="M0,20 Q10,10 20,25 T40,15 T60,5" fill="none" stroke="#10b981" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="ud-glass-card ud-stat-card">
                        <div className="ud-stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <Star size={24} />
                        </div>
                        <div className="ud-stat-content">
                            <p className="ud-stat-title">SkyPoints</p>
                            <h3 className="ud-stat-value">2,540</h3>
                            <div className="ud-stat-trend ud-stat-trend-up">
                                <span>^ 16%</span> <span style={{color: 'var(--text-muted)', fontWeight: 'normal'}}>vs last month</span>
                            </div>
                        </div>
                        <svg width="60" height="30" viewBox="0 0 60 30" style={{ position: 'absolute', right: '1rem', bottom: '1.5rem' }}>
                            <path d="M0,25 Q15,5 30,20 T60,5" fill="none" stroke="#10b981" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="ud-glass-card ud-stat-card">
                        <div className="ud-stat-icon-wrapper" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                            <Crown size={24} />
                        </div>
                        <div className="ud-stat-content">
                            <p className="ud-stat-title">Shuu Pass</p>
                            <h3 className="ud-stat-value">Active</h3>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#eab308', fontSize: '0.8rem', fontWeight: '500' }}>1 year left</p>
                        </div>
                    </div>
                </div>

                {/* Middle Section */}
                <div className="ud-middle-section">
                    
                    {/* Upcoming Trip */}
                    <div className="ud-glass-card ud-trip-card">
                        <div className="ud-trip-content">
                            <div className="ud-trip-header">
                                <div className="ud-trip-title">
                                    <Plane size={18} color="var(--accent-cyan)" />
                                    <span>Upcoming Trip</span>
                                </div>
                                <button className="ud-btn-outline">View Ticket</button>
                            </div>

                            <div className="ud-trip-cities">
                                <div className="ud-city">
                                    <h2>HYD</h2>
                                    <p>Hyderabad</p>
                                </div>
                                <ArrowRight size={24} color="rgba(255,255,255,0.3)" />
                                <div className="ud-city">
                                    <h2>DEL</h2>
                                    <p>Delhi</p>
                                </div>
                                <div className="ud-trip-flight-info" style={{ marginLeft: 'auto' }}>
                                    <p>24 May 2025</p>
                                    <p>6E 1023</p>
                                </div>
                            </div>

                            <div className="ud-trip-footer">
                                <div className="ud-trip-footer-item">
                                    <p>Boarding Time</p>
                                    <p>08:45 AM</p>
                                </div>
                                <div className="ud-trip-footer-item">
                                    <p>Gate</p>
                                    <p>B12</p>
                                </div>
                                <div className="ud-trip-footer-item">
                                    <p>Seat</p>
                                    <p>12A</p>
                                </div>
                                <div className="ud-trip-footer-item">
                                    <p>Terminal</p>
                                    <p>T2</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="ud-glass-card">
                        <div className="ud-section-header">
                            <h3 className="ud-section-title">Recent Orders</h3>
                            <button className="ud-btn-outline" style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem' }} onClick={() => navigate('/history')}>View All</button>
                        </div>
                        <div className="ud-orders-list">
                            {[
                                { name: 'Extra Baggage (20kg)', date: '24 May 2025', price: '₹660', icon: Briefcase },
                                { name: 'Priority Boarding', date: '24 May 2025', price: '₹440', icon: Clock },
                                { name: 'Lounge Access', date: '24 May 2025', price: '₹660', icon: Coffee },
                                { name: 'Seat Upgrade', date: '24 May 2025', price: '₹1,760', icon: ArrowUpCircle }
                            ].map((order, i) => (
                                <div className="ud-order-item" key={i}>
                                    <div className="ud-order-left">
                                        <div className="ud-order-icon"><order.icon size={18} /></div>
                                        <div className="ud-order-details">
                                            <h4>{order.name}</h4>
                                            <p>{order.date}</p>
                                        </div>
                                    </div>
                                    <div className="ud-order-right">
                                        <span className="ud-order-price">{order.price}</span>
                                        <span className="ud-badge-success">Completed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SkyPoints Overview */}
                    <div className="ud-glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 className="ud-section-title" style={{ marginBottom: '1.5rem' }}>SkyPoints Overview</h3>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>2,540</h2>
                                <span style={{ color: '#10b981', fontSize: '0.8rem' }}>^ 150</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>this month</span>
                            </div>
                            
                            {/* Circular Ring */}
                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: 'auto' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent-cyan)" strokeWidth="10" strokeDasharray="314" strokeDashoffset="114" strokeLinecap="round" transform="rotate(-90 60 60)" />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: '#eab308', fontWeight: 'bold', fontSize: '1.1rem' }}>Gold</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tier</span>
                                </div>
                            </div>

                            <div style={{ width: '100%', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Next Tier: Platinum</span>
                                    <span>1,480 / 4,000</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '37%', height: '100%', background: 'var(--accent-cyan)' }}></div>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Earn 2,520 more points</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="ud-bottom-section">
                    
                    {/* Spending Overview */}
                    <div className="ud-glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="ud-section-header">
                            <h3 className="ud-section-title">Spending Overview</h3>
                            <select style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '8px', outline: 'none', fontSize: '0.8rem' }}>
                                <option style={{ background: '#0b0f19' }}>This Year</option>
                            </select>
                        </div>
                        <div className="ud-chart-container">
                            {/* Dummy SVG Area Chart matching mockup */}
                            <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                <line x1="40" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.05)" />
                                <line x1="40" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.05)" />
                                <line x1="40" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.05)" />
                                <line x1="40" y1="140" x2="400" y2="140" stroke="rgba(255,255,255,0.05)" />
                                
                                {/* Y-axis Labels */}
                                <text x="30" y="25" fill="var(--text-muted)" fontSize="10" textAnchor="end">₹25K</text>
                                <text x="30" y="65" fill="var(--text-muted)" fontSize="10" textAnchor="end">₹20K</text>
                                <text x="30" y="105" fill="var(--text-muted)" fontSize="10" textAnchor="end">₹15K</text>
                                <text x="30" y="145" fill="var(--text-muted)" fontSize="10" textAnchor="end">₹0</text>
                                
                                {/* X-axis Labels */}
                                <text x="60" y="150" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Nov</text>
                                <text x="120" y="150" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Dec</text>
                                <text x="180" y="150" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Jan</text>
                                <text x="240" y="150" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Feb</text>
                                <text x="300" y="150" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Mar</text>
                                <text x="360" y="150" fill="var(--text-muted)" fontSize="10" textAnchor="middle">Apr</text>
                                <text x="400" y="150" fill="var(--text-muted)" fontSize="10" textAnchor="middle">May</text>

                                {/* Area Path */}
                                <path d="M40,140 C80,120 100,100 140,110 C180,120 200,60 240,70 C280,80 300,110 340,90 C380,70 400,40 400,30 L400,140 L40,140 Z" fill="url(#gradientArea)" />
                                {/* Line Path */}
                                <path d="M40,140 C80,120 100,100 140,110 C180,120 200,60 240,70 C280,80 300,110 340,90 C380,70 400,40 400,30" fill="none" stroke="var(--accent-cyan)" strokeWidth="3" />
                                
                                {/* Active Data Point */}
                                <circle cx="400" cy="30" r="4" fill="var(--accent-cyan)" />
                            </svg>
                            <div className="ud-chart-tooltip">
                                <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem' }}>₹24,680</h4>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>May 2025</p>
                            </div>
                        </div>
                    </div>

                    {/* Popular Add-ons */}
                    <div className="ud-glass-card">
                        <div className="ud-section-header">
                            <h3 className="ud-section-title">Popular Add-ons</h3>
                            <button className="ud-btn-outline" style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem' }} onClick={() => navigate('/catalogue')}>View All</button>
                        </div>
                        <div className="ud-addons-grid">
                            <div className="ud-addon-card" onClick={() => navigate('/catalogue')}>
                                <Briefcase size={28} color="#60a5fa" />
                                <h4>Extra Baggage</h4>
                                <p>From ₹660</p>
                            </div>
                            <div className="ud-addon-card" onClick={() => navigate('/catalogue')}>
                                <ArrowUpCircle size={28} color="#e879f9" />
                                <h4>Priority Boarding</h4>
                                <p>From ₹440</p>
                            </div>
                            <div className="ud-addon-card" onClick={() => navigate('/catalogue')}>
                                <Coffee size={28} color="#38bdf8" />
                                <h4>Lounge Access</h4>
                                <p>From ₹660</p>
                            </div>
                            <div className="ud-addon-card" onClick={() => navigate('/catalogue')}>
                                <Briefcase size={28} color="#3b82f6" />
                                <h4>Seat Upgrade</h4>
                                <p>From ₹110</p>
                            </div>
                            <div className="ud-addon-card" onClick={() => navigate('/catalogue')}>
                                <Wifi size={28} color="#60a5fa" />
                                <h4>WiFi Access</h4>
                                <p>From ₹550</p>
                            </div>
                            <div className="ud-addon-card" onClick={() => navigate('/catalogue')}>
                                <Utensils size={28} color="#94a3b8" />
                                <h4>In-flight Meal</h4>
                                <p>From ₹220</p>
                            </div>
                        </div>
                    </div>

                    {/* Shuu Pass Benefits */}
                    <div className="ud-glass-card">
                        <div className="ud-section-header">
                            <h3 className="ud-section-title">Shuu Pass Benefits</h3>
                            <span className="ud-badge-success" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>Active</span>
                        </div>
                        <div className="ud-benefits-list">
                            <div className="ud-benefit-item">
                                <Percent size={18} className="ud-benefit-icon" />
                                <span>20% OFF on Extra Baggage</span>
                            </div>
                            <div className="ud-benefit-item">
                                <Coffee size={18} className="ud-benefit-icon" />
                                <span>Free Lounge Access</span>
                            </div>
                            <div className="ud-benefit-item">
                                <UserCheck size={18} className="ud-benefit-icon" />
                                <span>Priority Check-in</span>
                            </div>
                            <div className="ud-benefit-item">
                                <Gift size={18} className="ud-benefit-icon" />
                                <span>Exclusive Member Deals</span>
                            </div>
                        </div>
                        <button className="ud-btn-primary" onClick={() => navigate('/catalogue')}>
                            Explore Shuu Pass
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
