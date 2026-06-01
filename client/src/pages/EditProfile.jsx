import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../services/apiService';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        phone: '',
        age: '',
        dob: '',
        passport: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(storedUser);
        
        // Pre-fill form with existing data if available
        setFormData({
            phone: storedUser.phone || '',
            age: storedUser.age || '',
            dob: storedUser.dob || '',
            passport: storedUser.passport || ''
        });
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${getApiUrl()}/auth/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: user.email, 
                    ...formData 
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Profile updated successfully!");
                // Update local storage
                localStorage.setItem("user", JSON.stringify(data.user));
                setUser(data.user);
                
                // Show success message briefly then optionally navigate
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
            setMessage("Something went wrong connecting to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="page" style={{ position: 'relative', overflow: 'hidden' }}>
            <Navbar />
            
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', paddingBottom: '100px' }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%', borderTop: '4px solid var(--accent-cyan)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Edit Profile</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Update your personal and travel details</p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</div>
                    </div>

                    {message && (
                        <div style={{ 
                            padding: '10px', 
                            marginBottom: '20px', 
                            borderRadius: '5px', 
                            background: message.includes('success') ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 65, 108, 0.2)',
                            color: message.includes('success') ? '#2ed573' : '#ff416c',
                            textAlign: 'center',
                            border: `1px solid ${message.includes('success') ? '#2ed573' : '#ff416c'}`
                        }}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Phone Number</label>
                            <input 
                                type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 234 567 8900" 
                                style={{ marginBottom: 0, width: '100%' }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Date of Birth</label>
                                <input 
                                    type="date" 
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    style={{ marginBottom: 0, width: '100%', colorScheme: 'dark' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Age</label>
                                <input 
                                    type="number" 
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="e.g. 28" 
                                    min="0"
                                    max="120"
                                    style={{ marginBottom: 0, width: '100%' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Passport / National ID</label>
                            <input 
                                type="text" 
                                name="passport"
                                value={formData.passport}
                                onChange={handleChange}
                                placeholder="Enter document number" 
                                style={{ marginBottom: 0, width: '100%' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ 
                                width: '100%', 
                                padding: '1rem', 
                                marginTop: '10px',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Saving...' : 'Save Profile Details'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
