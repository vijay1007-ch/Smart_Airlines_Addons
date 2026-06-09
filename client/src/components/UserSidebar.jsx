import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    User, 
    ShoppingCart, 
    Package, 
    Clock, 
    Globe, 
    LogOut,
    CreditCard
} from 'lucide-react';

const UserSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/edit-profile', icon: User },
        { name: 'My Orders', path: '/history', icon: Clock },
        { name: 'Catalogue', path: '/catalogue', icon: ShoppingCart },
        { name: 'Bundles', path: '/bundles', icon: Package },
        { name: 'Travel Apps', path: '/travelled', icon: Globe },
        { name: 'Cart', path: '/cart', icon: CreditCard }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
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
                                paddingLeft: isActive ? 'calc(1rem - 3px)' : '1rem',
                                borderRadius: '0 8px 8px 0',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent'
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

export default UserSidebar;
