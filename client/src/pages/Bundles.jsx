import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../services/apiService';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Star, Diamond, CheckCircle } from 'lucide-react';

const Bundles = () => {
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState(null);
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('airline_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        fetch(`${getApiUrl()}/bundles`)
            .then(res => res.json())
            .then(data => {
                setBundles(data);
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
                )}
            </div>

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
