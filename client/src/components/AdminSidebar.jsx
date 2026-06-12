import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    ShoppingCart, 
    Package, 
    Box, 
    Receipt, 
    CreditCard, 
    BarChart3, 
    Settings, 
    LifeBuoy, 
    LogOut,
    Plane
} from 'lucide-react';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Profile', path: '/edit-profile', icon: Users },
        { name: 'User Data', path: '/admin/users', icon: Users },
        { name: 'Catalogue', path: '/admin/catalogue', icon: ShoppingCart },
        { name: 'Bundles', path: '/admin/bundles', icon: Package },
        { name: 'Seat Upgrades', path: '/admin/upgrades', icon: Plane },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 }
    ];

    return (
        <div style={{
            width: '260px',
            minHeight: '100vh',
            background: '#060b13',
            borderRight: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                <div style={{ 
                    background: '#ffffff', 
                    borderRadius: '50%', 
                    width: '32px', 
                    height: '32px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <Plane size={18} color="#0f172a" fill="#0f172a" style={{transform: 'rotate(-45deg)'}} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '0.5px' }}>SMART AIRLINES</h2>
                    <span style={{ fontSize: '0.65rem', color: '#0ea5e9', fontWeight: '700', letterSpacing: '1px' }}>ADMIN PORTAL</span>
                </div>
            </div>

            {/* Nav Items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, overflowY: 'auto' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', margin: '0.5rem 0 0.2rem 1rem', letterSpacing: '1px' }}>MAIN</div>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <div 
                            key={item.name}
                            onClick={() => { if (item.path !== '#') navigate(item.path); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: isActive ? 'linear-gradient(90deg, rgba(67, 56, 202, 0.6) 0%, rgba(67, 56, 202, 0.1) 100%)' : 'transparent',
                                color: isActive ? '#ffffff' : '#94a3b8',
                                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.color = '#94a3b8';
                            }}
                        >
                            <item.icon size={18} color={isActive ? '#818cf8' : '#94a3b8'} />
                            <span style={{ fontSize: '0.9rem', fontWeight: isActive ? '600' : '500' }}>
                                {item.name}
                            </span>
                        </div>
                    );
                })}

                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', margin: '1.5rem 0 0.2rem 1rem', letterSpacing: '1px' }}>SETTINGS</div>
                
                <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', borderLeft: '3px solid transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                    <Settings size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>General Settings</span>
                </div>
                
                <div 
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', color: '#94a3b8', borderLeft: '3px solid transparent', marginTop: 'auto' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                    <LogOut size={18} /> <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Logout</span>
                </div>
            </nav>

            {/* Promo Banner */}
            <div style={{
                marginTop: '1.5rem',
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(49, 46, 129, 0.8))',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Glow effect */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: '#818cf8', filter: 'blur(40px)', opacity: '0.5' }}></div>
                
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#ffffff' }}>Fly Smarter.<br/>Travel Better.</h3>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1.2rem', lineHeight: '1.4' }}>Manage every journey with ease.</p>
                <button style={{
                    width: '100%',
                    background: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.2s'
                }}>
                    View Website <Plane size={14} style={{transform: 'rotate(45deg)'}} />
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
