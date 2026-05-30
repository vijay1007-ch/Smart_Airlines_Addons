import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';

const AdminBundles = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
            const res = await fetch("http://localhost:5000/bundles");
            const data = await res.json();
            setBundles(data);
        } catch (error) {
            console.error("Error fetching bundles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!addForm.name || !addForm.price) return alert("Please fill at least name and price");
        try {
            const res = await fetch("http://localhost:5000/bundles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                },
                body: JSON.stringify({
                    name: addForm.name,
                    price: Number(addForm.price),
                    shuuPassPrice: addForm.shuuPassPrice ? Number(addForm.shuuPassPrice) : undefined,
                    description: addForm.description,
                    iconBg: addForm.iconBg,
                    features: addForm.features ? addForm.features.split('\n').filter(f => f.trim()).map(f => ({ text: f.trim() })) : []
                })
            });
            if (res.ok) {
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
            const res = await fetch(`http://localhost:5000/bundles/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                },
                body: JSON.stringify({
                    name: editForm.name,
                    price: Number(editForm.price),
                    shuuPassPrice: editForm.shuuPassPrice ? Number(editForm.shuuPassPrice) : undefined,
                    description: editForm.description,
                    features: editForm.features ? editForm.features.split('\n').filter(f => f.trim()).map(f => ({ text: f.trim() })) : []
                })
            });
            if (res.ok) {
                setIsEditing(null);
                fetchBundles();
            }
        } catch (error) {
            console.error("Error updating bundle:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this bundle?")) return;
        try {
            const res = await fetch(`http://localhost:5000/bundles/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            if (res.ok) {
                fetchBundles();
            }
        } catch (error) {
            console.error("Error deleting bundle:", error);
        }
    };

    if (!user) return null;

    return (
        <div className="page" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '3rem' }}>
            <Navbar />

            {/* Ambient Background Elements */}
            <div style={{
                position: 'fixed', top: '-10%', right: '-5%', width: '500px', height: '500px',
                background: 'var(--primary-blue)', filter: 'blur(200px)', borderRadius: '50%', zIndex: -1, opacity: 0.25
            }} />
            <div style={{
                position: 'fixed', bottom: '-10%', left: '-5%', width: '500px', height: '500px',
                background: 'var(--accent-pink)', filter: 'blur(200px)', borderRadius: '50%', zIndex: -1, opacity: 0.25
            }} />

            <div className="container" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '2.5rem', fontWeight: '800', 
                            background: 'linear-gradient(90deg, #fff, #b388ff)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: '0.5rem'
                        }}>
                            Manage Bundles
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            Add, update, or remove premium bundles from the store.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                    >
                        <Plus size={18} /> Add New Bundle
                    </button>
                </div>

                {isAdding && (
                    <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                placeholder="Bundle Name" 
                                value={addForm.name}
                                onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                            />
                            <input 
                                type="number" 
                                placeholder="Price" 
                                value={addForm.price}
                                onChange={(e) => setAddForm({...addForm, price: e.target.value})}
                                style={{ width: '150px', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                            />
                            <input 
                                type="number" 
                                placeholder="shuuPass Price" 
                                value={addForm.shuuPassPrice}
                                onChange={(e) => setAddForm({...addForm, shuuPassPrice: e.target.value})}
                                style={{ width: '150px', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                placeholder="Description (e.g., Domestic & International)" 
                                value={addForm.description}
                                onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                            />
                            <input 
                                type="color" 
                                value={addForm.iconBg}
                                onChange={(e) => setAddForm({...addForm, iconBg: e.target.value})}
                                style={{ width: '50px', padding: '0.2rem', borderRadius: '8px', border: 'none', background: 'transparent' }}
                                title="Theme Color"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <textarea 
                                placeholder="Bundle Features (One feature per line)"
                                value={addForm.features}
                                onChange={(e) => setAddForm({...addForm, features: e.target.value})}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', minHeight: '80px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Cancel</button>
                            <button onClick={handleAdd} style={{ background: '#4ade80', color: '#000' }}>Save Bundle</button>
                        </div>
                    </div>
                )}

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '1rem 0', fontWeight: '500' }}>ID</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '500' }}>Bundle Name</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '500' }}>Price (₹)</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '500' }}>shuuPass Price</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading bundles...</td>
                                    </tr>
                                ) : bundles.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bundles found.</td>
                                    </tr>
                                ) : (
                                    bundles.map((bundle, index) => (
                                        <tr key={bundle.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem 0', fontWeight: '500', color: 'var(--text-muted)' }}>#{index + 1}</td>
                                            
                                            <td style={{ padding: '1rem 0', color: '#fff' }}>
                                                {isEditing === bundle.id ? (
                                                    <input 
                                                        type="text" 
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                                                    />
                                                ) : bundle.name}
                                            </td>
                                            
                                            <td style={{ padding: '1rem 0', fontWeight: '600', color: 'var(--accent-cyan)' }}>
                                                {isEditing === bundle.id ? (
                                                    <input 
                                                        type="number" 
                                                        value={editForm.price}
                                                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                                        style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                                                    />
                                                ) : `₹${bundle.price}`}
                                            </td>

                                            <td style={{ padding: '1rem 0', fontWeight: '600', color: '#fbbf24' }}>
                                                {isEditing === bundle.id ? (
                                                    <input 
                                                        type="number" 
                                                        value={editForm.shuuPassPrice || ''}
                                                        onChange={(e) => setEditForm({...editForm, shuuPassPrice: e.target.value})}
                                                        style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                                                        placeholder="shuuPass"
                                                    />
                                                ) : bundle.shuuPassPrice ? `₹${bundle.shuuPassPrice}` : '-'}
                                            </td>
                                            
                                            <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                                {isEditing === bundle.id ? (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        {isEditing === bundle.id && (
                                                            <div style={{ position: 'absolute', right: '80px', marginTop: '40px', background: 'rgba(0,0,0,0.9)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', zIndex: 10 }}>
                                                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--accent-cyan)' }}>Edit Features (One per line)</label>
                                                                <textarea 
                                                                    value={editForm.features}
                                                                    onChange={(e) => setEditForm({...editForm, features: e.target.value})}
                                                                    style={{ width: '300px', minHeight: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                                                                />
                                                            </div>
                                                        )}
                                                        <button 
                                                            onClick={() => handleUpdate(bundle.id)}
                                                            style={{ padding: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            title="Save"
                                                        ><Save size={16} /></button>
                                                        <button 
                                                            onClick={() => setIsEditing(null)}
                                                            style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            title="Cancel"
                                                        ><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <button 
                                                            onClick={() => {
                                                                setIsEditing(bundle.id);
                                                                setEditForm({ 
                                                                    name: bundle.name, 
                                                                    price: bundle.price, 
                                                                    shuuPassPrice: bundle.shuuPassPrice || '', 
                                                                    description: bundle.description || '',
                                                                    features: bundle.features ? bundle.features.map(f => f.text).join('\n') : ''
                                                                });
                                                            }}
                                                            style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            title="Edit"
                                                        ><Edit2 size={16} /></button>
                                                        <button 
                                                            onClick={() => handleDelete(bundle.id)}
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

export default AdminBundles;
