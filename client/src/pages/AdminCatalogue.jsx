import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';

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
            const res = await fetch(`${getApiUrl()}/addons`);
            const data = await res.json();
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
            const res = await fetch(`${getApiUrl()}/addons`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                },
                body: JSON.stringify(addForm)
            });
            if (res.ok) {
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
            const res = await fetch(`${getApiUrl()}/addons/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
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
            const res = await fetch(`${getApiUrl()}/addons/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            if (res.ok) {
                fetchAddons();
            }
        } catch (error) {
            console.error("Error deleting addon:", error);
        }
    };

    if (!user) return null;

    return (
        <div className="page" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '3rem' }}>
            <Navbar />

            
            

            <div className="container" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="title">
                            Manage Catalogue
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            Add, update, or remove items from the store catalogue.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                    >
                        <Plus size={18} /> Add New Item
                    </button>
                </div>

                {isAdding && (
                    <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input 
                            type="text" 
                            placeholder="Item Name" 
                            value={addForm.name}
                            onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}
                        />
                        <input 
                            type="number" 
                            placeholder="Price" 
                            value={addForm.price}
                            onChange={(e) => setAddForm({...addForm, price: e.target.value})}
                            style={{ width: '150px', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}
                        />
                        <button onClick={handleAdd} style={{ background: '#4ade80', color: '#ffffff' }}>Save</button>
                        <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Cancel</button>
                    </div>
                )}

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '1rem 0', fontWeight: '500' }}>ID</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '500' }}>Name</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '500' }}>Price (₹)</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading items...</td>
                                    </tr>
                                ) : addons.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</td>
                                    </tr>
                                ) : (
                                    addons.map((addon, index) => (
                                        <tr key={addon.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem 0', fontWeight: '500', color: 'var(--text-muted)' }}>#{index + 1}</td>
                                            
                                            <td style={{ padding: '1rem 0' }}>
                                                {isEditing === addon.id ? (
                                                    <input 
                                                        type="text" 
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)' }}
                                                    />
                                                ) : addon.name}
                                            </td>
                                            
                                            <td style={{ padding: '1rem 0', fontWeight: '600', color: 'var(--accent-cyan)' }}>
                                                {isEditing === addon.id ? (
                                                    <input 
                                                        type="number" 
                                                        value={editForm.price}
                                                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                                        style={{ width: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)' }}
                                                    />
                                                ) : `₹${addon.price}`}
                                            </td>
                                            
                                            <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                {isEditing === addon.id ? (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <button 
                                                            onClick={() => handleUpdate(addon.id)}
                                                            style={{ padding: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            title="Save"
                                                        ><Save size={16} /></button>
                                                        <button 
                                                            onClick={() => setIsEditing(null)}
                                                            style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)',  border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            title="Cancel"
                                                        ><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <button 
                                                            onClick={() => {
                                                                setIsEditing(addon.id);
                                                                setEditForm({ name: addon.name, price: addon.price });
                                                            }}
                                                            style={{ padding: '0.5rem', background: 'var(--bg-main)',  border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            title="Edit"
                                                        ><Edit2 size={16} /></button>
                                                        <button 
                                                            onClick={() => handleDelete(addon.id)}
                                                            style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCatalogue;
