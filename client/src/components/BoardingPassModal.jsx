import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { X, Download, Plane } from 'lucide-react';

const BoardingPassModal = ({ order, onClose, user }) => {
    const passRef = useRef(null);

    const handleDownload = async () => {
        if (!passRef.current) return;
        
        try {
            const canvas = await html2canvas(passRef.current, {
                scale: 2,
                backgroundColor: null });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', [200, 100]); // landscape, custom size
            
            pdf.addImage(imgData, 'PNG', 0, 0, 200, 100);
            pdf.save(`BoardingPass_${order.orderId}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    if (!order) return null;

    // Generate some mock flight data based on orderId
    const flightNo = "SA" + order.orderId.replace('#', '').substring(0, 4);
    const date = new Date(order.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const seat = "12A";
    const gate = "G4";

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '10px',  padding: '10px 20px', width: 'auto' }}>
                        <Download size={18} /> Download PDF
                    </button>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* The Boarding Pass */}
                <div ref={passRef} style={{
                    display: 'flex',
                    background: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    color: '#1a0f2e',
                    position: 'relative'
                }}>
                    {/* Left Main Section */}
                    <div style={{ flex: 1, padding: '30px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Plane size={32} color="#0077ff" />
                                <h2 style={{ margin: 0, color: '#0077ff', textTransform: 'uppercase', letterSpacing: '2px' }}>Smart Airline</h2>
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: '#ff416c' }}>
                                {order.orderId}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a0f2e' }}>JFK</div>
                                <div style={{ color: '#666', fontWeight: '600' }}>New York</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '0 20px' }}>
                                <Plane size={24} color="#ccc" style={{ transform: 'rotate(90deg)' }} />
                                <div style={{ width: '100%', height: '2px', background: 'dashed 2px #ccc', margin: '10px 0' }} />
                                <div style={{ color: '#0077ff', fontWeight: 'bold' }}>Direct Flight</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a0f2e' }}>LHR</div>
                                <div style={{ color: '#666', fontWeight: '600' }}>London</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Passenger</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user?.name?.toUpperCase() || 'PASSENGER'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Flight</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{flightNo}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Date</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{date}</div>
                            </div>
                        </div>

                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Gate</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#ff9000' }}>{gate}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Boarding Time</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#0077ff' }}>08:45</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Seat</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#ff416c' }}>{seat}</div>
                            </div>
                        </div>
                    </div>

                    {/* Perforated Line Divider */}
                    <div style={{ width: '2px', background: 'transparent', borderLeft: '3px dashed #ccc', position: 'relative' }}>
                        
                        
                    </div>

                    {/* Right Stub Section */}
                    <div style={{ width: '220px', background: '#f4f7fb', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '15px', textAlign: 'center', color: '#1a0f2e' }}>BOARDING PASS</div>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                            <QRCode 
                                value={`FLIGHT:${flightNo}|SEAT:${seat}|USER:${user?.email}|ORDER:${order.orderId}`} 
                                size={120} 
                                level="H"
                            />
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>
                            Scan at Gate {gate}
                        </div>
                        <div style={{ marginTop: 'auto', fontWeight: 'bold', color: '#0077ff' }}>
                            {flightNo} - {seat}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardingPassModal;
