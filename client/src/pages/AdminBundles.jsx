import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Edit2, Trash2, Plus, Save, X, Check, Diamond } from 'lucide-react';
import axios from 'axios';

const AdminBundles = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBundle, setSelectedBundle] = useState(null);
    
    // For Add/Edit
    const [isEditing, setIsEditing] = useState(null); // id of bundle being edited
    const [editForm, setEditForm] = useState({ name: '', price: '', shuuPassPrice: '', description: '', features: '' });
    
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', price: '', shuuPassPrice: '', description: '', iconBg: '#00e5ff', features: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== "admin") {
                navigate("/bundles");
            } else {
                setUser(parsedUser);
                fetchBundles();
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const fetchBundles = async () => {
        try {
            const res = await axios.get(`${getApiUrl()}/bundles`);
            const data = res.data;
            setBundles(data);
            if (data.length > 0 && !selectedBundle) {
                setSelectedBundle(data[0]);
            }
        } catch (error) {
            console.error("Error fetching bundles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!addForm.name || !addForm.price) return alert("Please fill at least name and price");
        try {
            const res = await axios.post(`${getApiUrl()}/bundles`, {
                name: addForm.name,
                price: Number(addForm.price),
                shuuPassPrice: addForm.shuuPassPrice ? Number(addForm.shuuPassPrice) : undefined,
                description: addForm.description,
                iconBg: addForm.iconBg,
                features: addForm.features ? addForm.features.split('\n').filter(f => f.trim()).map(f => ({ text: f.trim() })) : []
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            if (res.status === 200 || res.status === 201) {
                setAddForm({ name: '', price: '', shuuPassPrice: '', description: '', iconBg: '#00e5ff', features: '' });
                setIsAdding(false);
                fetchBundles();
            }
        } catch (error) {
            console.error("Error adding bundle:", error);
        }
    };

    const handleUpdate = async (id) => {
        if (!editForm.name || !editForm.price) return alert("Please fill at least name and price");
        try {
            const res = await axios.put(`${getApiUrl()}/bundles/${id}`, {
                name: editForm.name,
                price: Number(editForm.price),
                shuuPassPrice: editForm.shuuPassPrice ? Number(editForm.shuuPassPrice) : undefined,
                description: editForm.description,
                features: editForm.features ? editForm.features.split('\n').filter(f => f.trim()).map(f => ({ text: f.trim() })) : []
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            if (res.status === 200 || res.status === 201) {
                setIsEditing(null);
                fetchBundles();
                // Update selected bundle if it was the one edited
                if (selectedBundle && selectedBundle.id === id) {
                    const updatedRes = await axios.get(`${getApiUrl()}/bundles/${id}`);
                    if (updatedRes.status === 200 || updatedRes.status === 201) setSelectedBundle(updatedRes.data);
                }
            }
        } catch (error) {
            console.error("Error updating bundle:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this bundle?")) return;
        try {
            const res = await axios.delete(`${getApiUrl()}/bundles/${id}`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            if (res.status === 200 || res.status === 201) {
                if (selectedBundle && selectedBundle.id === id) setSelectedBundle(null);
                fetchBundles();
            }
        } catch (error) {
            console.error("Error deleting bundle:", error);
        }
    };

    const beginEdit = (bundle) => {
        setIsEditing(bundle.id);
        setEditForm({ 
            name: bundle.name, 
            price: bundle.price, 
            shuuPassPrice: bundle.shuuPassPrice || '', 
            description: bundle.description || '',
            features: bundle.features ? bundle.features.map(f => f.text).join('\n') : ''
        });
    };

    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#060b13', color: 'var(--text-main)' }}>
            <AdminSidebar />
            
            <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem', display: 'flex', gap: '2rem' }}>
                
                {/* Left Column: Manage Bundles */}
                <div style={{ flex: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Manage Bundles</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                                Add, update, or remove premium bundles from the store.
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsAdding(true)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: '#2563eb', color: '#fff',
                                padding: '0.6rem 1.2rem', borderRadius: '6px',
                                border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
                            }}
                        >
                            <Plus size={16} /> Add New Bundle
                        </button>
                    </div>

                    {isAdding && (
                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="text" placeholder="Bundle Name" value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #1e293b', background: '#060b13', color: '#fff', fontSize: '0.9rem' }} />
                                <input type="number" placeholder="Price" value={addForm.price} onChange={(e) => setAddForm({...addForm, price: e.target.value})} style={{ width: '120px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1e293b', background: '#060b13', color: '#fff', fontSize: '0.9rem' }} />
                                <input type="number" placeholder="shuuPass Price" value={addForm.shuuPassPrice} onChange={(e) => setAddForm({...addForm, shuuPassPrice: e.target.value})} style={{ width: '140px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1e293b', background: '#060b13', color: '#fff', fontSize: '0.9rem' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="text" placeholder="Description (e.g., Domestic & International)" value={addForm.description} onChange={(e) => setAddForm({...addForm, description: e.target.value})} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #1e293b', background: '#060b13', color: '#fff', fontSize: '0.9rem' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <textarea placeholder="Bundle Features (One feature per line)" value={addForm.features} onChange={(e) => setAddForm({...addForm, features: e.target.value})} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #1e293b', background: '#060b13', color: '#fff', fontSize: '0.9rem', minHeight: '80px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleAdd} style={{ background: '#10b981', color: '#ffffff', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Save Bundle</button>
                            </div>
                        </div>
                    )}

                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '0', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #1e293b', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>ID</th>
                                    <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Bundle Name</th>
                                    <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Price (₹)</th>
                                    <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500' }}>Shuu Pass Price (₹)</th>
                                    <th style={{ padding: '1.2rem 1.5rem', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading bundles...</td>
                                    </tr>
                                ) : bundles.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bundles found.</td>
                                    </tr>
                                ) : (
                                    bundles.map((bundle, index) => (
                                        <tr 
                                            key={bundle.id} 
                                            style={{ 
                                                borderBottom: '1px solid #1e293b',
                                                cursor: 'pointer',
                                                background: selectedBundle?.id === bundle.id ? 'rgba(37, 99, 235, 0.05)' : 'transparent'
                                            }}
                                            onClick={() => { if (isEditing !== bundle.id) setSelectedBundle(bundle); }}
                                        >
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                #{index + 1}
                                            </td>
                                            
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>
                                                {isEditing === bundle.id ? (
                                                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #1e293b', background: '#060b13', color: '#fff', fontSize: '0.85rem', width: '100%' }} />
                                                ) : bundle.name}
                                            </td>
                                            
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>
                                                {isEditing === bundle.id ? (
                                                    <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #1e293b', background: '#060b13', color: '#fff', fontSize: '0.85rem' }} />
                                                ) : `₹${bundle.price}`}
                                            </td>

                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: '#f59e0b' }}>
                                                {isEditing === bundle.id ? (
                                                    <input type="number" value={editForm.shuuPassPrice} onChange={(e) => setEditForm({...editForm, shuuPassPrice: e.target.value})} style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #1e293b', background: '#060b13', color: '#fff', fontSize: '0.85rem' }} />
                                                ) : bundle.shuuPassPrice ? `₹${bundle.shuuPassPrice}` : '-'}
                                            </td>
                                            
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                {isEditing === bundle.id ? (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        {/* Features edit handled below or in a modal in a real app, keeping it simple here since they edit via details panel usually */}
                                                        <button onClick={(e) => { e.stopPropagation(); handleUpdate(bundle.id); }} style={{ padding: '0.4rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Save"><Save size={16} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); setIsEditing(null); }} style={{ padding: '0.4rem', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Cancel"><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); beginEdit(bundle); }}
                                                            style={{ padding: '0.4rem', background: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                            title="Edit"
                                                        ><Edit2 size={16} /></button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(bundle.id); }}
                                                            style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid #1e293b' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Showing 1 to {bundles.length} of {bundles.length} bundles
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bundle Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', visibility: 'hidden' }}>
                        {/* Placeholder to align top with the left column */}
                        <h1 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem 0' }}>Spacer</h1>
                        <button style={{ padding: '0.6rem 1.2rem' }}>Spacer</button>
                    </div>

                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.5rem', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Bundle Details</h3>
                            {selectedBundle && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => beginEdit(selectedBundle)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                                    ><Edit2 size={12} /> Edit Bundle</button>
                                    <button 
                                        onClick={() => handleDelete(selectedBundle.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dc2626', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                                    ><Trash2 size={12} /> Delete</button>
                                </div>
                            )}
                        </div>

                        {selectedBundle ? (
                            <>
                                <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                                    Bundles &gt; {selectedBundle.name.toUpperCase()}
                                </div>

                                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                            <div style={{ background: 'rgba(255, 65, 108, 0.1)', padding: '0.8rem', borderRadius: '12px' }}>
                                                <Diamond size={24} color="#ff416c" />
                                            </div>
                                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>
                                                {selectedBundle.name.toUpperCase()}
                                            </h2>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '3.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{selectedBundle.price}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(Domestic)</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{Math.floor(selectedBundle.price * 1.5)}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(International)</span>
                                            </div>
                                            {selectedBundle.shuuPassPrice && (
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', color: '#f59e0b', marginTop: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{selectedBundle.shuuPassPrice}</span>
                                                    <span style={{ fontSize: '0.85rem' }}>for Shuu Pass members</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Included Add-ons</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {selectedBundle.features?.map((f, i) => (
                                                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', padding: '2px', marginTop: '2px' }}>
                                                        <Check size={12} color="#10b981" />
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.4' }}>{f.text}</span>
                                                </div>
                                            ))}
                                            {(!selectedBundle.features || selectedBundle.features.length === 0) && (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No features listed.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', borderTop: '1px solid #1e293b', paddingTop: '1.5rem' }}>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>Created At</div>
                                        <div style={{ fontSize: '0.85rem' }}>20 Oct, 2026</div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>Updated At</div>
                                        <div style={{ fontSize: '0.85rem' }}>20 Oct, 2026</div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>Bundle Type</div>
                                        <div style={{ fontSize: '0.85rem' }}>Premium</div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>Status</div>
                                        <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>Active</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                                Select a bundle to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBundles;
