import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Phone, Mail, Calendar, Shield, CreditCard, Search, Download, File, FileSpreadsheet, FileText } from 'lucide-react';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== "admin") {
                navigate("/catalogue");
            } else {
                setUser(parsedUser);
                fetchUsersData();
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const fetchUsersData = async () => {
        try {
            const res = await fetch(`${getApiUrl()}/auth/users`);
            if (res.ok) {
                const data = await res.json();
                setUsersList(data);
            }
        } catch (error) {
            console.error("Failed to fetch users data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    const filteredUsers = usersList.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    const getRoleBadge = (role) => (
        <span style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
            background: role === 'admin' ? 'rgba(255, 65, 108, 0.1)' : 'rgba(46, 213, 115, 0.1)',
            color: role === 'admin' ? '#ff416c' : '#2ed573',
            border: `1px solid ${role === 'admin' ? '#ff416c30' : '#2ed57330'}`
        }}>
            <Shield size={14} />
            {role.toUpperCase()}
        </span>
    );

    const getShuuPassBadge = (hasPass) => {
        if (!hasPass) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
        return (
            <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                background: 'rgba(0, 229, 255, 0.1)',
                color: '#00e5ff',
                border: '1px solid rgba(0, 229, 255, 0.3)'
            }}>
                ⭐ Active
            </span>
        );
    };

    return (
        <div className="page" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '3rem' }}>
            <Navbar />

            <div className="container" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="title" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ 
                                padding: '0.8rem', 
                                background: 'rgba(179, 136, 255, 0.1)', 
                                borderRadius: '15px',
                                border: '1px solid rgba(179, 136, 255, 0.3)'
                            }}>
                                <Users size={28} color="#b388ff" />
                            </div>
                            User Data
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                            Manage and view all registered passenger details
                        </p>
                    </div>

                    {/* Search and Export */}
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* Search Bar */}
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                placeholder="Search by name, email, phone..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.8rem 1rem 0.8rem 2.5rem', 
                                    borderRadius: '12px', 
                                    background: 'rgba(0,0,0,0.3)', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    marginBottom: 0
                                }}
                            />
                        </div>

                        {/* Export Button */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: 'var(--primary-blue)', color: '#fff',
                                    padding: '0.8rem 1.2rem', borderRadius: '12px',
                                    border: 'none', cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                <Download size={18} /> Export
                            </button>
                            
                            {showDownloadMenu && (
                                <div style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '10px',
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                                    borderRadius: '12px', padding: '10px', minWidth: '200px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100
                                }}>
                                    <div 
                                        onClick={() => { alert('Downloading user data as PDF...'); setShowDownloadMenu(false); }}
                                        style={{ padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', color: '#fff', transition: '0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <File size={16} color="#ff4d4f" /> PDF Document
                                    </div>
                                    <div 
                                        onClick={() => { alert('Downloading user data as Excel...'); setShowDownloadMenu(false); }}
                                        style={{ padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', color: '#fff', transition: '0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <FileSpreadsheet size={16} color="#52c41a" /> Excel Spreadsheet
                                    </div>
                                    <div 
                                        onClick={() => { alert('Downloading user data as DOCX...'); setShowDownloadMenu(false); }}
                                        style={{ padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', color: '#fff', transition: '0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <FileText size={16} color="#1890ff" /> Word Document
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <th style={{ padding: '1rem', fontWeight: '500' }}>Name</th>
                                <th style={{ padding: '1rem', fontWeight: '500' }}>Contact Info</th>
                                <th style={{ padding: '1rem', fontWeight: '500' }}>Personal Details</th>
                                <th style={{ padding: '1rem', fontWeight: '500' }}>Role</th>
                                <th style={{ padding: '1rem', fontWeight: '500' }}>Shuu Pass</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                                        Loading user data...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u, idx) => (
                                    <tr key={idx} style={{ 
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ 
                                                    width: '40px', height: '40px', borderRadius: '50%', 
                                                    background: 'var(--gradient-primary)', 
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center', 
                                                    fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' 
                                                }}>
                                                    {u.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                {u.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.9rem' }}>
                                                    <Mail size={14} color="var(--text-muted)" /> {u.email}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    <Phone size={14} color="var(--text-muted)" /> {u.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.9rem' }}>
                                                    <Calendar size={14} color="var(--text-muted)" /> DOB: {u.dob || 'N/A'} (Age: {u.age || '-'})
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    <CreditCard size={14} color="var(--text-muted)" /> Passport: {u.passport || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {getShuuPassBadge(u.hasShuuPass)}
                                            {u.hasShuuPass && u.shuuPassDate && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    Since: {u.shuuPassDate}
                                                </div>
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

export default AdminUsers;
