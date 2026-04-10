import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import API_URL from '../../apiConfig';

const CreateCertificate = () => {
    const location = useLocation();
    const prefill = location.state?.prefill;

    const [formData, setFormData] = useState({
        name: prefill?.name || '',
        recipientEmail: prefill?.citizenEmail || '',
        certificateType: prefill?.certificateType || 'Birth',
        issueDate: new Date().toISOString().split('T')[0],
        requestId: prefill?._id || null
    });
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.post(`${API_URL}/certificates/create`, formData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSuccessData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create certificate');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!successData) return;
        try {
            const response = await axios.get(`${API_URL}/certificates/download/${successData.certificateId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${successData.name}_Certificate.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (downloadError) {
             console.error("Download failed", downloadError);
        }
    };

    if (successData) {
        return (
            <div className="container animate-fade-in" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
                <div className="glass" style={{ padding: '3rem 2rem' }}>
                    <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Certificate Generated Securely!</h2>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                        The certificate for <strong>{successData.name}</strong> has been hashed, signed, and issued to <strong>{successData.recipientEmail}</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                         <button className="btn btn-primary" onClick={handleDownload}>Download PDF File</button>
                         <button className="btn btn-outline" onClick={() => navigate('/admin')}>Go to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
             <button className="btn btn-outline" style={{ padding: '6px 12px', marginBottom: '2rem' }} onClick={() => navigate('/admin')}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="glass" style={{ padding: '2.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{prefill ? 'Fulfill Document Request' : 'Issue New Certificate'}</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Cryptographic keys will be used to automatically sign this document.</p>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Citizen Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Recipient Email (for account syncing)</label>
                        <input type="email" name="recipientEmail" value={formData.recipientEmail} onChange={handleChange} required placeholder="citizen@example.com" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Certificate Type</label>
                        <select name="certificateType" value={formData.certificateType} onChange={handleChange} required>
                            <option value="Birth">Birth Certificate</option>
                            <option value="Income">Income Certificate</option>
                            <option value="Degree">Degree Certificate</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Date of Issue</label>
                        <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Processing Cryptography...' : <><Save size={18} /> Issue & Sign Certificate</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCertificate;
