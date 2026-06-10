import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Home, 
    List, 
    ArrowUpCircle, 
    PlusSquare, 
    Award, 
    Star, 
    Tag,
    User, 
    Headset,
    LogOut,
    Plane
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
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'My Orders', path: '/history', icon: List },
        { name: 'Seat Upgrade', path: '/dashboard', icon: ArrowUpCircle },
        { name: 'Add-ons', path: '/catalogue', icon: PlusSquare },
        { name: 'Shuu Pass', path: '/dashboard', icon: Award },
        { name: 'SkyPoints', path: '/dashboard', icon: Star },
        { name: 'Coupons', path: '/dashboard', icon: Tag },
        { name: 'Profile', path: '/edit-profile', icon: User },
        { name: 'Support', path: '/dashboard', icon: Headset }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                <div style={{ background: 'var(--text-main)', padding: '5px', borderRadius: '50%', display: 'flex' }}>
                    <Plane size={24} color="#060b13" style={{ transform: 'rotate(45deg)' }} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, color: 'var(--text-main)', letterSpacing: '1px' }}>SMART AIRLINES</h2>
                    <p style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>Addons</p>
                </div>
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
                                padding: '0.7rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--text-muted)',
                                border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            <item.icon size={18} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
                            <span style={{ fontSize: '0.9rem', fontWeight: isActive ? '500' : '400' }}>
                                {item.name}
                            </span>
                            {isActive && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />}
                        </div>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ marginTop: '0.5rem' }}>
                <div 
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0.7rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    <LogOut size={18} />
                    <span style={{ fontSize: '0.9rem' }}>Logout</span>
                </div>
            </div>

            {/* Ad Banner */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem 1rem',
                borderRadius: '12px',
                background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(6, 182, 212, 0.15))',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center'
            }}>
                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(46, 214, 212, 0.15) 0%, transparent 70%)', zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff', fontWeight: '600', lineHeight: 1.3 }}>Fly Smarter.<br/>Travel Better.</h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Premium Add-ons for a seamless journey.</p>
                    <button onClick={() => navigate('/catalogue')} style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        background: 'rgba(6, 182, 212, 0.2)',
                        border: '1px solid rgba(6, 182, 212, 0.5)',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-cyan)'; e.currentTarget.style.color = '#000'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                    >
                        Explore Add-ons
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSidebar;
