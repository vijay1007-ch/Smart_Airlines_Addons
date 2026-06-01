import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Settings, ShieldAlert, Wifi, Globe, Smartphone, HelpCircle } from 'lucide-react';
import { getApiUrl, setApiUrl, is2FAEnabled, set2FAEnabled } from '../services/apiService';

const SidebarRow = ({ icon, title, subtitle, onClick, color }) => (
    <div 
        onClick={onClick}
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '15px 20px',
            borderBottom: '1px solid var(--glass-border)',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            color: color || 'var(--text-main)',
            textDecoration: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(150,150,150,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '1.5rem' }}>{icon}</div>
            <div>
                <div style={{ fontWeight: '600', fontSize: '1rem', color: color || 'var(--text-main)' }}>{title}</div>
                {subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</div>}
            </div>
        </div>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>›</div>
    </div>
);

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLightMode, setIsLightMode] = useState(localStorage.getItem('theme') === 'light');
    
    // Connection and 2FA states
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [serverUrl, setServerUrlState] = useState(getApiUrl());
    const [is2fa, setIs2fa] = useState(is2FAEnabled());
    const [pingStatus, setPingStatus] = useState('unknown'); // 'unknown', 'connected', 'offline'
    const [isTestingPing, setIsTestingPing] = useState(false);

    useEffect(() => {
        if (isLightMode) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    }, [isLightMode]);

    // Live Connection Tester Ping logic
    const testConnection = async (urlToTest) => {
        setIsTestingPing(true);
        setPingStatus('unknown');
        
        const url = urlToTest || serverUrl;
        
        try {
            // Setup a 4-second timeout for the ping request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            
            const response = await fetch(`${url}/auth/health`, { 
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                setPingStatus('connected');
            } else {
                setPingStatus('offline');
            }
        } catch (err) {
            setPingStatus('offline');
            console.error("Ping connection failure:", err);
        } finally {
            setIsTestingPing(false);
        }
    };

    // Run connection test automatically when modal opens or URL changes
    useEffect(() => {
        if (isSettingsOpen) {
            testConnection(serverUrl);
        }
    }, [isSettingsOpen]);

    const handleSaveSettings = () => {
        setApiUrl(serverUrl);
        set2FAEnabled(is2fa);
        setIsSettingsOpen(false);
        // Refresh page to make all components adapt to the new API URL
        window.location.reload();
    };

    // Calculate mock SkyPoints from order history
    const history = JSON.parse(localStorage.getItem('airline_history') || '[]');
    const earnedPoints = history.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0) * 10;
    const tier = earnedPoints >= 10000 ? 'Platinum' : earnedPoints >= 5000 ? 'Gold' : 'Silver';
    const nextTier = earnedPoints >= 10000 ? 20000 : earnedPoints >= 5000 ? 10000 : 5000;
    const progress = Math.min((earnedPoints / nextTier) * 100, 100);

    // Check Shuu Pass logic for Sidebar Badge
    let hasActiveShuuPass = false;
    if (user && user.hasShuuPass) {
        if (user.shuuPassDate) {
            const passDate = new Date(user.shuuPassDate);
            const oneYearLater = new Date(passDate.setFullYear(passDate.getFullYear() + 1));
            if (new Date() <= oneYearLater) {
                hasActiveShuuPass = true;
            }
        } else {
            hasActiveShuuPass = true;
        }
    }
    const hasHistoryShuuPass = history.some(order => order.items && order.items.some(i => i.name === 'Shuu Pass'));
    const isShuuPassActive = hasActiveShuuPass || hasHistoryShuuPass;

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const showLinks = location.pathname !== '/' && location.pathname !== '/login';

    return (
        <>
            {/* The actual top navbar */}
            <div className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Hamburger Area (triggers sidebar on hover) */}
                    {showLinks && user && (
                        <div 
                            onMouseEnter={() => setIsSidebarOpen(true)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '10px 10px 10px 0' }}
                        >
                            <Menu size={28} color="var(--text-main)" />
                        </div>
                    )}
                    <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', margin: 0 }}>✈️ Smart Airline</div>
                </div>

                <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Connection and Security Settings Gear Icon */}
                    <div 
                        onClick={() => setIsSettingsOpen(true)}
                        title="Connection & Security Settings"
                        style={{ 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            transition: 'all 0.3s ease',
                            color: 'var(--text-main)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)';
                            e.currentTarget.style.boxShadow = 'var(--glow-cyan)';
                            e.currentTarget.style.borderColor = 'var(--primary-blue)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                        }}
                    >
                        <Settings size={20} />
                    </div>

                    {showLinks && !user && <Link to="/login">Login</Link>}
                </div>
            </div>
            
            {/* The Sidebar Drawer */}
            {showLinks && user && (
                <>
                    {/* Backdrop for auto-hide effect */}
                    <div 
                        onMouseEnter={() => setIsSidebarOpen(false)} // Close if mouse enters backdrop
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: isSidebarOpen ? 'rgba(0,0,0,0.4)' : 'transparent',
                            backdropFilter: isSidebarOpen ? 'blur(3px)' : 'none',
                            pointerEvents: isSidebarOpen ? 'auto' : 'none',
                            transition: 'all 0.3s ease',
                            zIndex: 9998
                        }}
                    />

                    {/* Drawer Content */}
                    <div 
                        onMouseLeave={() => setIsSidebarOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            height: '100vh',
                            width: '320px',
                            background: isLightMode ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.98)',
                            backdropFilter: 'blur(20px)',
                            borderRight: '1px solid var(--glass-border)',
                            boxShadow: '2px 0 20px rgba(0,0,0,0.5)',
                            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto'
                        }}
                    >
                        {/* Sidebar Header (Profile Info) */}
                        <div style={{ padding: '30px 20px', borderBottom: '1px solid var(--glass-border)', background: isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>My Profile</h2>
                                <X size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setIsSidebarOpen(false)} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-blue)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-main)' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ 
                                            display: 'inline-block', 
                                            marginTop: '5px',
                                            background: user.role === 'admin' ? 'rgba(255, 65, 108, 0.2)' : 'rgba(46, 213, 115, 0.2)', 
                                            color: user.role === 'admin' ? '#ff416c' : '#2ed573', 
                                            padding: '2px 10px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold', 
                                            border: `1px solid ${user.role === 'admin' ? '#ff416c' : '#2ed573'}` 
                                        }}>
                                            {user.role.toUpperCase()}
                                        </div>
                                        
                                        {isShuuPassActive && (
                                            <div style={{ 
                                                display: 'inline-block', 
                                                marginTop: '5px',
                                                background: 'rgba(0, 119, 255, 0.2)', 
                                                color: '#0077ff', 
                                                padding: '2px 10px', 
                                                borderRadius: '12px', 
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold', 
                                                border: '1px solid #0077ff',
                                                boxShadow: '0 0 10px rgba(0, 119, 255, 0.3)'
                                            }}>
                                                ⭐ SHUU PASS
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {user.role === 'user' && (
                                <div style={{ marginTop: '20px', padding: '15px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>SKYPOINTS ({tier})</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{earnedPoints} pts</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #ff416c, #ff9000)', transition: 'width 1s ease' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <span>Current Tier</span>
                                        <span>Next Tier ({nextTier})</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Links */}
                        <div style={{ flex: 1, padding: '10px 0' }}>
                            {user.role === 'admin' ? (
                                <>
                                    <div style={{ padding: '15px 20px 5px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Controls</div>
                                    <SidebarRow icon="📊" title="Dashboard" subtitle="System analytics & overview" onClick={() => { setIsSidebarOpen(false); navigate('/admin'); }} />
                                    <SidebarRow icon="📋" title="Catalogue" subtitle="Manage available add-ons" onClick={() => { setIsSidebarOpen(false); navigate('/admin/catalogue'); }} />
                                    <SidebarRow icon="📦" title="Bundles" subtitle="Configure combo packages" onClick={() => { setIsSidebarOpen(false); navigate('/admin/bundles'); }} />
                                </>
                            ) : (
                                <>
                                    <div style={{ padding: '15px 20px 5px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Passenger Services</div>
                                    <SidebarRow icon="🏠" title="Dashboard" subtitle="Flight overview & bookings" onClick={() => { setIsSidebarOpen(false); navigate('/dashboard'); }} />
                                    <SidebarRow icon="✈️" title="My Flights" subtitle="Past & upcoming travels" onClick={() => { setIsSidebarOpen(false); navigate('/travelled'); }} />
                                    <SidebarRow icon="🎁" title="Bundles" subtitle="Exclusive combo offers" onClick={() => { setIsSidebarOpen(false); navigate('/bundles'); }} />
                                    <SidebarRow icon="🛍️" title="Catalogue" subtitle="Explore available add-ons" onClick={() => { setIsSidebarOpen(false); navigate('/catalogue'); }} />
                                    <SidebarRow icon="🛒" title="Cart" subtitle="View selected items" onClick={() => { setIsSidebarOpen(false); navigate('/cart'); }} />
                                    <SidebarRow icon="🧾" title="Orders" subtitle="Purchase history & receipts" onClick={() => { setIsSidebarOpen(false); navigate('/history'); }} />
                                </>
                            )}
                        </div>

                        {/* Footer / Logout */}
                        <div style={{ borderTop: '1px solid var(--glass-border)', padding: '10px 0' }}>
                            <div 
                                onClick={() => setIsLightMode(!isLightMode)}
                                style={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid var(--glass-border)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(150,150,150,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-main)' }}>
                                    {isLightMode ? <Moon size={24} color="var(--primary-blue)" /> : <Sun size={24} color="#ff9000" />}
                                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{isLightMode ? 'Dark Mode' : 'Light Mode'}</div>
                                </div>
                            </div>
                            <SidebarRow icon="✏️" title="Edit Profile" onClick={() => { setIsSidebarOpen(false); navigate('/edit-profile'); }} />
                            <SidebarRow icon="🔐" title="Reset Password" onClick={() => { setIsSidebarOpen(false); navigate('/forgot-password'); }} />
                            <SidebarRow icon="🚪" title="Logout" onClick={handleLogout} color="#ff416c" />
                        </div>
                    </div>
                </>
            )}

            {/* Connection & Security Settings Modal */}
            {isSettingsOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(5, 2, 15, 0.75)',
                    backdropFilter: 'blur(15px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="login-box" style={{
                        maxWidth: '500px',
                        width: '100%',
                        padding: '2.5rem',
                        borderRadius: '24px',
                        border: '1px solid var(--glass-border)',
                        boxShadow: pingStatus === 'connected' ? '0 0 40px rgba(0, 229, 255, 0.2)' : pingStatus === 'offline' ? '0 0 40px rgba(255, 65, 108, 0.2)' : 'var(--shadow-card)',
                        transition: 'all 0.5s ease',
                        position: 'relative'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Settings size={28} color="var(--primary-blue)" style={{ animation: isTestingPing ? 'spin 2s linear infinite' : 'none' }} />
                                <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '800', background: 'linear-gradient(90deg, #fff, #b388ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Network Settings
                                </h2>
                            </div>
                            <X size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setIsSettingsOpen(false)} />
                        </div>

                        {/* Connection Status Badge */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '10px 15px',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            marginBottom: '1.5rem'
                        }}>
                            <Wifi size={18} color={pingStatus === 'connected' ? '#00e5ff' : pingStatus === 'offline' ? '#ff416c' : '#a0aec0'} />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status:</span>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                color: pingStatus === 'connected' ? '#00e5ff' : pingStatus === 'offline' ? '#ff416c' : '#a0aec0',
                                textShadow: pingStatus === 'connected' ? '0 0 10px rgba(0,229,255,0.4)' : pingStatus === 'offline' ? '0 0 10px rgba(255,65,108,0.4)' : 'none'
                            }}>
                                {isTestingPing ? 'Testing Connection...' : pingStatus === 'connected' ? 'Connected 🟢' : pingStatus === 'offline' ? 'Offline 🔴' : 'Checking...'}
                            </span>
                            
                            <button 
                                onClick={() => testConnection(serverUrl)}
                                disabled={isTestingPing}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    boxShadow: 'none',
                                    border: '1px solid var(--glass-border)'
                                }}
                            >
                                Re-Test
                            </button>
                        </div>

                        {/* API Server URL Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                                Backend Express Server API URL
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={18} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                <input 
                                    type="text" 
                                    value={serverUrl} 
                                    onChange={(e) => {
                                        setServerUrlState(e.target.value);
                                    }}
                                    placeholder="http://localhost:5000"
                                    style={{ paddingLeft: '48px', marginBottom: 0, width: '100%' }}
                                />
                            </div>
                            
                            {/* Preset Buttons */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <button 
                                    onClick={() => { setServerUrlState("http://localhost:5000"); testConnection("http://localhost:5000"); }}
                                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px solid var(--glass-border)', cursor: 'pointer', borderRadius: '8px' }}
                                >
                                    Localhost (5000)
                                </button>
                                <button 
                                    onClick={() => {
                                        alert("To connect your phone, find your PC's local IP (e.g. http://192.168.1.10:5000) by typing 'ipconfig' in Command Prompt on Windows. Make sure your phone is on the same WiFi network as your PC!");
                                    }}
                                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', borderRadius: '8px' }}
                                >
                                    <HelpCircle size={12} /> Mobile LAN IP Help
                                </button>
                            </div>
                        </div>

                        {/* 2-Step Authentication Toggle */}
                        <div style={{
                            background: 'rgba(255, 65, 108, 0.05)',
                            border: '1px solid rgba(255, 65, 108, 0.2)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <ShieldAlert size={20} color="var(--accent-pink)" />
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>2-Step Authentication</h4>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
                                Enforce 6-digit verification code dispatch to both registered **Email** and **Mobile SMS** during Login and Password Resets.
                            </p>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={is2fa} 
                                    onChange={(e) => setIs2fa(e.target.checked)}
                                    style={{ width: '20px', height: '20px', margin: 0, cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                    Enable Email & Mobile SMS 2FA System
                                </span>
                            </label>
                        </div>

                        {/* Save & Cancel Buttons */}
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                onClick={() => setIsSettingsOpen(false)}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    border: '1px solid var(--glass-border)',
                                    boxShadow: 'none',
                                    borderRadius: '30px'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveSettings}
                                style={{
                                    flex: 1,
                                    background: 'var(--gradient-primary)',
                                    borderRadius: '30px'
                                }}
                            >
                                Save Settings
                            </button>
                        </div>

                        {/* Keyframe animation for spinner */}
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
