import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../services/apiService';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Star, Diamond, CheckCircle, X } from 'lucide-react';
import axios from 'axios';

const Bundles = () => {
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState(null);
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('airline_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        axios.get(`${getApiUrl()}/bundles`)
            .then(res => {
                setBundles(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching bundles:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        localStorage.setItem('airline_cart', JSON.stringify(cart));
    }, [cart]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleAddBundle = (bundleName, price) => {
        if (cart.some(item => item.name === bundleName)) {
            showToast(`⚠️ ${bundleName} is already selected!`);
        } else {
            setCart([...cart, { id: Date.now(), name: bundleName, price, details: 'Premium Bundle' }]);
            showToast(`✅ ${bundleName} added to cart!`);
        }
    };

    const isSelected = (name) => cart.some(item => item.name === name);

    const getIconComponent = (name) => {
        if (name.toLowerCase().includes('xtra')) return <Star size={32} color="#fff" />;
        if (name.toLowerCase().includes('xperience')) return <Diamond size={32} color="#fff" />;
        return <CheckCircle size={32} color="#fff" />;
    };

    return (
        <div className="page">
            <Navbar />
            <div className="container" style={{ paddingBottom: '100px' }}>
                <h1 className="title" style={{ marginBottom: '1rem' }}>Premium Bundles</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>Upgrade your journey with our curated value packs.</p>
                
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading bundles...</div>
                ) : (
                    <>
                        {bundles.length > 0 && (
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <button 
                                    onClick={() => setIsCompareModalOpen(true)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--accent-cyan)',
                                        color: 'var(--accent-cyan)',
                                        padding: '10px 20px',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-cyan)'; e.currentTarget.style.color = '#000'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                                >
                                    Compare Bundles
                                </button>
                            </div>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', marginBottom: '4rem' }}>
                            {bundles.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '2rem' }}>
                                No bundles currently available.
                            </div>
                        ) : (
                            bundles.map((bundle) => (
                                <div key={bundle.id} className="card" style={{ 
                                    width: '400px', 
                                    padding: '2.5rem', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                                    borderTop: `2px solid ${bundle.iconBg || '#00e5ff'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <div style={{ 
                                            width: '60px', height: '60px', borderRadius: '50%', 
                                            background: bundle.iconBg || '#00e5ff', display: 'flex', 
                                            justifyContent: 'center', alignItems: 'center',
                                            boxShadow: `0 0 20px ${bundle.iconBg || '#00e5ff'}80`
                                        }}>
                                            {getIconComponent(bundle.name)}
                                        </div>
                                        <div>
                                            <h2 style={{ fontSize: '1.6rem', margin: '0 0 5px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>{bundle.name}</h2>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>₹{bundle.price}</span>
                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{bundle.description || ''}</span>
                                            </div>
                                            {bundle.neuPassPrice && (
                                                <div style={{ fontSize: '0.9rem', color: '#fbbf24', marginTop: '5px' }}>
                                                    <strong style={{ fontSize: '1.1rem' }}>₹{bundle.neuPassPrice}</strong> for Shuu Pass members
                                                </div>
                                            )}
                                            {bundle.internationalPrice && (
                                                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>₹{bundle.internationalPrice}</span>
                                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>(International)</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#fbbf24', marginTop: '3px' }}>
                                                        <strong>₹{bundle.internationalNeuPassPrice}</strong> for Shuu Pass members
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                        {bundle.features && bundle.features.map((feature, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                                <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    <CheckCircle size={18} />
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                                                    {feature.text.replace(/Any standard seat|Gourmair|Hot Meals|50% off Prime seats|Xpress Ahead/g, match => `**${match}**`).split('**').map((part, i) => i % 2 === 1 ? <strong key={i} >{part}</strong> : part)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => handleAddBundle(bundle.name, bundle.price)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '1rem', 
                                            background: isSelected(bundle.name) ? 'rgba(0,0,0,0.1)' : `linear-gradient(90deg, ${bundle.iconBg || '#00e5ff'}, ${bundle.iconBg || '#00e5ff'}dd)`, 
                                            color: '#ffffff',
                                            border: isSelected(bundle.name) ? '1px solid var(--border-light)' : 'none',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            marginTop: 'auto'
                                        }}
                                    >
                                        {isSelected(bundle.name) ? 'Selected' : 'Add Bundle'}
                                    </button>
                                </div>
                            ))
                        )}
                        </div>
                    </>
                )}
            </div>

            {isCompareModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(6, 11, 25, 0.95), rgba(10, 25, 49, 0.98))',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                        borderRadius: '15px', width: '100%', maxWidth: '900px', maxHeight: '90vh',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, color: '#fff' }}>Compare Bundles</h2>
                            <button onClick={() => setIsCompareModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>Features</th>
                                        {bundles.map(b => (
                                            <th key={b.id} style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: b.iconBg || '#00e5ff' }}>{b.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>Price</td>
                                        {bundles.map(b => (
                                            <td key={b.id} style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-cyan)' }}>₹{b.price}</td>
                                        ))}
                                    </tr>
                                    {Array.from(new Set(bundles.flatMap(b => b.features.map(f => f.text)))).map((featureText, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{featureText}</td>
                                            {bundles.map(b => (
                                                <td key={b.id} style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                    {b.features.some(f => f.text === featureText) ? <CheckCircle size={18} color="#4ade80" style={{ margin: '0 auto' }} /> : <span style={{ color: '#555' }}>-</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div style={{
                    position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, rgba(6, 11, 25, 0.9), rgba(10, 25, 49, 0.95))',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 229, 255, 0.2)',
                    color: 'white', padding: '1rem 2rem', borderRadius: '30px',
                    backdropFilter: 'blur(10px)', zIndex: 1000, fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default Bundles;
