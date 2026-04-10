import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Download, FileText, Activity } from 'lucide-react';
import API_URL from '../../apiConfig';

const Dashboard = () => {
    const [certificates, setCertificates] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [certsRes, reqsRes] = await Promise.all([
                    axios.get(`${API_URL}/certificates`, { headers: { Authorization: `Bearer ${user.token}` } }),
                    axios.get(`${API_URL}/requests`, { headers: { Authorization: `Bearer ${user.token}` } })
                ]);
                setCertificates(certsRes.data);
                setRequests(reqsRes.data);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.token]);

    const handleIssueFromRequest = (req) => {
        navigate('/admin/create', { state: { prefill: req } });
    };

    const handleDownload = async (certId, name) => {
        // ... (existing handleDownload logic)
        try {
            const response = await axios.get(`${API_URL}/certificates/download/${certId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name}_Certificate.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
        }
    };

    return (
        <div className="container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage and issue digital certificates</p>
                </div>
                <Link to="/admin/create" className="btn btn-primary">
                    <Plus size={18} /> Issue Manual Certificate
                </Link>
            </div>

            {/* Pending Requests Section */}
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '3rem', border: '1px solid var(--primary)' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} color="var(--primary)" /> Pending Citizen Requests
                </h3>
                {requests.filter(r => r.status === 'Pending').length === 0 ? (
                    <p style={{ color: 'var(--text-dim)' }}>No pending requests.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {requests.filter(r => r.status === 'Pending').map(req => (
                            <div key={req._id} className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontWeight: 600 }}>{req.name}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{req.certificateType}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>{req.reason}</p>
                                <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => handleIssueFromRequest(req)}>
                                    Issue Document
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Total Issued</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{certificates.length}</h3>
                    </div>
                </div>
                <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Pending Requests</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{requests.filter(r => r.status === 'Pending').length}</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Recent Certificates</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : certificates.length === 0 ? (
                    <p style={{ color: 'var(--text-dim)' }}>No certificates issued yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                                <th style={{ padding: '1rem', fontWeight: 500 }}>Name</th>
                                <th style={{ padding: '1rem', fontWeight: 500 }}>Type</th>
                                <th style={{ padding: '1rem', fontWeight: 500 }}>Recipient</th>
                                <th style={{ padding: '1rem', fontWeight: 500 }}>ID</th>
                                <th style={{ padding: '1rem', fontWeight: 500 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.map((cert) => (
                                <tr key={cert._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{cert.name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                                            {cert.certificateType}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{cert.recipientEmail}</td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                        {cert.certificateId.substring(0, 8)}...
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                            onClick={() => handleDownload(cert.certificateId, cert.name)}
                                        >
                                            <Download size={14} /> PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
