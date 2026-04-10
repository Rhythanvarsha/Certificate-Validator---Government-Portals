import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Send, Download, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import API_URL from '../apiConfig';

const UserDashboard = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        certificateType: 'Birth',
        reason: ''
    });
    const [requestLoading, setRequestLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [certsRes, reqsRes] = await Promise.all([
                    axios.get(`${API_URL}/certificates/my`, { headers: { Authorization: `Bearer ${user.token}` } }),
                    axios.get(`${API_URL}/requests`, { headers: { Authorization: `Bearer ${user.token}` } })
                ]);
                setCertificates(certsRes.data);
                setRequests(reqsRes.data);
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setRequestLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/requests`, formData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setRequests([data, ...requests]);
            setShowRequestForm(false);
            setFormData({ name: user.name, certificateType: 'Birth', reason: '' });
        } catch (err) {
            alert("Request failed: " + (err.response?.data?.message || err.message));
        } finally {
            setRequestLoading(false);
        }
    };

    const handleDownload = async (certId, name) => {
        try {
            const response = await axios.get(`${API_URL}/certificates/download/${certId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name}_Certificate.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert("Download failed");
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}><h2>Loading Dashboard...</h2></div>;

    return (
        <div className="container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Welcome, {user.name}</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage your digital identity and certificates</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowRequestForm(true)}>
                    <Plus size={18} /> Request New Certificate
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Certificates Section */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle color="var(--success)" size={24} /> Issued Certificates
                    </h2>
                    <div className="glass" style={{ padding: '1.5rem' }}>
                        {certificates.length === 0 ? (
                            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>No certificates issued yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {certificates.map(cert => (
                                    <div key={cert._id} className="glass" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                                        <div>
                                            <h3 style={{ fontWeight: 600 }}>{cert.certificateType} Certificate</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Issued on {new Date(cert.issueDate).toLocaleDateString()}</p>
                                        </div>
                                        <button className="btn btn-outline" onClick={() => handleDownload(cert.certificateId, cert.name)}>
                                            <Download size={16} /> Download PDF
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Requests Section */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock color="var(--primary)" size={24} /> Recent Requests
                    </h2>
                    <div className="glass" style={{ padding: '1.5rem' }}>
                        {requests.length === 0 ? (
                            <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No requests made.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {requests.map(req => (
                                    <div key={req._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{req.certificateType}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(req.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span style={{ 
                                            fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', height: 'fit-content',
                                            background: req.status === 'Pending' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                                            color: req.status === 'Pending' ? 'var(--primary)' : 'var(--success)'
                                        }}>
                                            {req.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            {showRequestForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Request New Document</h2>
                        <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name on Certificate</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Certificate Type</label>
                                <select value={formData.certificateType} onChange={e => setFormData({...formData, certificateType: e.target.value})} required>
                                    <option value="Birth">Birth Certificate</option>
                                    <option value="Income">Income Certificate</option>
                                    <option value="Degree">Degree Certificate</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Reason for Request</label>
                                <textarea 
                                    value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required 
                                    style={{ width: '100%', padding: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', minHeight: '100px' }}
                                    placeholder="Explain why you need this document..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowRequestForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={requestLoading}>
                                    {requestLoading ? 'Sending...' : <><Send size={18} /> Submit Request</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
