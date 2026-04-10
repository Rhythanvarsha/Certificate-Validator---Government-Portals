import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Upload, ShieldCheck, Lock, FileCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="container animate-fade-in">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '4rem 0 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <ShieldCheck size={72} color="#6366f1" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
          <span className="gradient-text">Digital Certificate</span>
          <br />Verification Portal
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Instantly verify the authenticity of government-issued certificates using cryptographic signatures and QR technology.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: <Lock size={16} />, label: 'SHA-256 Hashed' },
            { icon: <ShieldCheck size={16} />, label: 'RSA Signed' },
            { icon: <FileCheck size={16} />, label: 'MongoDB Stored' },
          ].map((badge) => (
            <span key={badge.label} style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '100px',
              padding: '6px 16px',
              fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '6px', color: '#a5b4fc'
            }}>
              {badge.icon} {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Verify Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto 4rem' }}>
        {/* QR Code Card */}
        <Link to="/scan-qr" style={{ textDecoration: 'none' }}>
          <div className="glass glass-hover" style={{ padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '20px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 25px rgba(99,102,241,0.4)' }}>
              <QrCode size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Scan QR Code</h2>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>Use your camera to scan the QR code on any government-issued certificate for instant verification.</p>
            <div className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>Scan Now</div>
          </div>
        </Link>

        {/* Upload PDF Card */}
        <Link to="/upload-pdf" style={{ textDecoration: 'none' }}>
          <div className="glass glass-hover" style={{ padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', borderRadius: '20px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 25px rgba(14,165,233,0.4)' }}>
              <Upload size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Upload PDF</h2>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>Upload a certificate PDF file and our system will verify its digital signature and integrity.</p>
            <div className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>Upload & Verify</div>
          </div>
        </Link>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: '900px', margin: '0 auto 4rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { step: '01', title: 'Issue', desc: 'Admin creates a certificate with name, type, and date.' },
            { step: '02', title: 'Hash & Sign', desc: 'SHA-256 hash generated and digitally signed with RSA key.' },
            { step: '03', title: 'QR + PDF', desc: 'Certificate PDF with QR code is generated and stored.' },
            { step: '04', title: 'Verify', desc: 'User scans QR or uploads PDF for instant tamper detection.' },
          ].map((item) => (
            <div key={item.step} className="glass" style={{ padding: '1.5rem' }}>
              <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{item.step}</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
