import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import axios from 'axios';

const AdminCatalogue = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // For Add/Edit
    const [isEditing, setIsEditing] = useState(null); // id of addon being edited
    const [editForm, setEditForm] = useState({ name: '', price: '' });
    
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', price: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== "admin") {
                navigate("/catalogue");
            } else {
                setUser(parsedUser);
                fetchAddons();
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const fetchAddons = async () => {
        try {
            const res = await axios.get(`${getApiUrl()}/addons`);
            const data = res.data;
            setAddons(data);
        } catch (error) {
            console.error("Error fetching addons:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!addForm.name || !addForm.price) return alert("Please fill all fields");
        try {
            const res = await axios.post(`${getApiUrl()}/addons`, addForm, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            if (res.status === 200 || res.status === 201) {
                setAddForm({ name: '', price: '' });
                setIsAdding(false);
                fetchAddons();
            }
        } catch (error) {
            console.error("Error adding addon:", error);
        }
    };

    const handleUpdate = async (id) => {
        if (!editForm.name || !editForm.price) return alert("Please fill all fields");
        try {
            const res = await axios.put(`${getApiUrl()}/addons/${id}`, editForm, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            if (res.status === 200 || res.status === 201) {
                setIsEditing(null);
                fetchAddons();
            }
        } catch (error) {
            console.error("Error updating addon:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await axios.delete(`${getApiUrl()}/addons/${id}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            if (res.status === 200 || res.status === 201) {
                fetchAddons();
            }
        } catch (error) {
            console.error("Error deleting addon:", error);
        }
    };

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <AdminSidebar />
            
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Manage Catalogue</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                            Add, update, or remove items from the store catalogue.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'var(--accent-teal)', color: '#fff',
                            padding: '0.6rem 1.2rem', borderRadius: '6px',
                            border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
                        }}
                    >
                        <Plus size={16} /> Add New Item
                    </button>
                </div>

                {isAdding && (
                    <div className="card glass-panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: 'var(--shadow-card)' }}>
                        <input 
                            type="text" 
                            placeholder="Item Name" 
                            value={addForm.name}
                            onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: '#fff', fontSize: '0.9rem' }}
                        />
                        <input 
                            type="number" 
                            placeholder="Price" 
                            value={addForm.price}
                            onChange={(e) => setAddForm({...addForm, price: e.target.value})}
                            style={{ width: '150px', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: '#fff', fontSize: '0.9rem' }}
                        />
                        <button onClick={handleAdd} style={{ background: '#10b981', color: '#ffffff', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid var(--border-light)', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                    </div>
                )}

                <div className="card glass-panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0', overflowX: 'auto', boxShadow: 'var(--shadow-card)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>ID</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Name</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Price (₹)</th>
                                <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading items...</td>
                                </tr>
                            ) : addons.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</td>
                                </tr>
                            ) : (
                                addons.map((addon, index) => (
                                    <tr key={addon.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                            #{index + 1}
                                        </td>
                                        
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>
                                            {isEditing === addon.id ? (
                                                <input 
                                                    type="text" 
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: '#fff', fontSize: '0.85rem', width: '100%' }}
                                                />
                                            ) : addon.name}
                                        </td>
                                        
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>
                                            {isEditing === addon.id ? (
                                                <input 
                                                    type="number" 
                                                    value={editForm.price}
                                                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                                    style={{ width: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: '#fff', fontSize: '0.85rem' }}
                                                />
                                            ) : `₹${addon.price}`}
                                        </td>
                                        
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            {isEditing === addon.id ? (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button 
                                                        onClick={() => handleUpdate(addon.id)}
                                                        style={{ padding: '0.4rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Save"
                                                    ><Save size={16} /></button>
                                                    <button 
                                                        onClick={() => setIsEditing(null)}
                                                        style={{ padding: '0.4rem', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Cancel"
                                                    ><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button 
                                                        onClick={() => {
                                                            setIsEditing(addon.id);
                                                            setEditForm({ name: addon.name, price: addon.price });
                                                        }}
                                                        style={{ padding: '0.4rem', background: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Edit"
                                                    ><Edit2 size={16} /></button>
                                                    <button 
                                                        onClick={() => handleDelete(addon.id)}
                                                        style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Delete"
                                                    ><Trash2 size={16} /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Showing 1 to {addons.length} of {addons.length} items
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCatalogue;
