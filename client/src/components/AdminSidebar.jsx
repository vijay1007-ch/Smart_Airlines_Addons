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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                <div style={{ fontSize: '1.5rem' }}>✈️</div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>Smart Airline</h2>
            </div>

            {/* Nav Items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
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
                                padding: '0.8rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: isActive ? 'var(--primary-blue)' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--text-muted)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            <item.icon size={18} />
                            <span style={{ fontSize: '0.95rem', fontWeight: isActive ? '600' : '400' }}>
                                {item.name}
                            </span>
                        </div>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <div 
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0.8rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    <LogOut size={18} />
                    <span style={{ fontSize: '0.95rem' }}>Logout</span>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
