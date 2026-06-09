import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Search, Download, File, FileSpreadsheet, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

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
            const res = await axios.get(`${getApiUrl()}/auth/users`);
            if (res.status === 200 || res.status === 201) {
                const data = res.data;
                setUsersList(data);
            }
        } catch (error) {
            console.error("Failed to fetch users data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadCSV = () => {
        const headers = 'Name,Email,Phone,DOB,Passport,Role,ShuuPass\n';
        const rows = usersList.map(u => `${u.name || ''},${u.email || ''},${u.phone || ''},${u.dob || ''},${u.passport || ''},${u.role || ''},${u.hasShuuPass ? 'Yes' : 'No'}`).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'users_export.csv';
        link.click();
        setShowDownloadMenu(false);
    };

    if (!user) return null;

    const filteredUsers = usersList.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    const getRoleBadge = (role) => {
        if (role === 'admin') {
            return (
                <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                    border: '1px solid #dc2626', color: '#ef4444'
                }}>
                    • ADMIN
                </span>
            );
        }
        return (
            <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                border: '1px solid #059669', color: '#10b981'
            }}>
                • USER
            </span>
        );
    };

    const getShuuPassBadge = (hasPass) => {
        if (!hasPass) return <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>-</span>;
        return (
            <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                border: '1px solid #0ea5e9', color: '#38bdf8'
            }}>
                • Active
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <AdminSidebar />
            
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>User Data</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                            Manage and view all registered passenger details
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Search Bar */}
                        <div style={{ position: 'relative', width: '280px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                placeholder="Search by name, email, phone..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.6rem 1rem 0.6rem 2.2rem', 
                                    borderRadius: '6px', 
                                    background: 'var(--bg-card)', 
                                    border: '1px solid var(--border-light)',
                                    color: '#fff',
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    marginBottom: 0
                                }}
                            />
                        </div>

                        {/* Export Button */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'var(--accent-teal)', color: '#fff',
                                    padding: '0.6rem 1rem', borderRadius: '6px',
                                    border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
                                }}
                            >
                                <Download size={16} /> Export
                            </button>
                            
                            {showDownloadMenu && (
                                <div style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                                    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                                    borderRadius: '8px', padding: '8px', minWidth: '180px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 100
                                }}>
                                    <div onClick={handleDownloadCSV} style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.background = '#1e293b'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} >
                                        <FileSpreadsheet size={14} color="#10b981" /> Download CSV
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card glass-panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0', overflowX: 'auto', boxShadow: 'var(--shadow-card)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Name</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Contact Info</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Personal Details</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Role</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Shuu Pass</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((u, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ 
                                                    width: '32px', height: '32px', borderRadius: '50%', 
                                                    background: 'var(--accent-teal)',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center', 
                                                    fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' 
                                                }}>
                                                    {u.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{u.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                    <span style={{color: 'var(--text-muted)'}}>✉</span> {u.email}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    <span>✆</span> {u.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                    <span style={{color: 'var(--text-muted)'}}>📅</span> DOB: {u.dob || 'N/A'} (Age: {u.age || '-'})
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                    <span>🪪</span> Passport: {u.passport || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {getShuuPassBadge(u.hasShuuPass)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    
                    {/* Pagination Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button style={{ width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ChevronLeft size={16}/></button>
                            <button style={{ width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--accent-teal)', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>1</button>
                            <button style={{ width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>2</button>
                            <button style={{ width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ChevronRight size={16}/></button>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Showing 1 to {Math.min(filteredUsers.length, 6)} of {filteredUsers.length} results
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
