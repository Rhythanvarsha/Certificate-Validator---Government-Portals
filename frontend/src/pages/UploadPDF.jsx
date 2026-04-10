import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import API_URL from '../apiConfig';

const UploadPDF = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setError('');
    } else {
      setError('Please drop a valid PDF file.');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      const { data } = await axios.post(`${API_URL}/certificates/verify-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/result', { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          <span className="gradient-text">Upload & Verify</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>
          Drop your certificate PDF below to verify its authenticity via digital signature.
        </p>

        {/* Drop Zone */}
        <div
          className="glass"
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
            background: dragOver ? 'rgba(99,102,241,0.08)' : '',
            transition: 'all 0.3s ease',
            borderRadius: '16px',
            marginBottom: '1.5rem',
          }}
          onClick={() => document.getElementById('pdf-input').click()}
        >
          <input id="pdf-input" type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
          {file ? (
            <div>
              <FileText size={56} color="#6366f1" style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{file.name}</p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                {(file.size / 1024).toFixed(1)} KB · Click to change file
              </p>
            </div>
          ) : (
            <div>
              <Upload size={56} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Drop your PDF here
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                or <span style={{ color: 'var(--primary)' }}>click to browse</span>
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Supports PDF only
              </p>
            </div>
          )}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '1rem', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px' }}>
            <XCircle size={20} /> {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleVerify}
          disabled={!file || loading}
          style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: (!file || loading) ? 0.6 : 1 }}
        >
          {loading ? 'Verifying...' : <><CheckCircle size={20} /> Verify Certificate</>}
        </button>
      </div>
    </div>
  );
};

export default UploadPDF;
