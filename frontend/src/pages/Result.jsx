import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, FileText, User, Calendar, Hash, ArrowLeft } from 'lucide-react';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    if (!result) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
                <h2>No result data found.</h2>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>Go Home</button>
            </div>
        );
    }

    const isValid = result.valid;

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '600px', margin: '3rem auto' }}>
            <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: `6px solid ${isValid ? 'var(--success)' : 'var(--danger)'}` }}>
                
                {/* Status Indicator */}
                <div style={{ marginBottom: '2rem' }}>
                    {isValid ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                            <CheckCircle size={64} />
                        </div>
                    ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                            <XCircle size={64} />
                        </div>
                    )}
                    <h1 style={{ marginTop: '1rem', fontSize: '2.5rem', color: isValid ? 'var(--success)' : 'var(--danger)' }}>
                        {isValid ? 'VERIFIED VALID' : 'INVALID / TAMPERED'}
                    </h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        {isValid 
                            ? 'The digital signature matches our government database records.' 
                            : result.message || 'The certificate could not be verified or has been modified.'}
                    </p>
                </div>

                {/* Data Display - Only if valid */}
                {isValid && result.data && (
                    <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <User size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Issued To</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{result.data.name}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <FileText size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Certificate Type</p>
                                <p style={{ fontSize: '1.1rem' }}>{result.data.certificateType}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <Calendar size={20} color="var(--primary)" />
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Issue Date</p>
                                <p style={{ fontSize: '1.1rem' }}>{new Date(result.data.issueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Hash size={20} color="var(--primary)" />
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Certificate ID</p>
                                <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden' }}>{result.data.certificateId}</p>
                            </div>
                        </div>
                    </div>
                )}

                <button className="btn btn-outline" style={{ marginTop: '2rem', width: '100%' }} onClick={() => navigate('/')}>
                    <ArrowLeft size={18} /> Back to Home
                </button>
            </div>
        </div>
    );
};

export default Result;
