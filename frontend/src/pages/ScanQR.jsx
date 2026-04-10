import React, { useState, useEffect, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import API_URL from '../apiConfig';

const ScanQR = () => {
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const verifyQR = useCallback(async (qrDataString) => {
    setVerifying(true);
    setError(null);
    try {
      // Expecting qrDataString to be JSON: { id: "...", h: "..." }
      let payload;
      try {
        payload = JSON.parse(qrDataString);
      } catch {
        throw new Error("Invalid QR code format. Not a government certificate.");
      }

      if (!payload.id || !payload.h) {
          throw new Error("Missing required data in QR code.");
      }

      const { data } = await axios.post(`${API_URL}/certificates/verify-qr`, {
        certificateId: payload.id,
        hash: payload.h
      });

      navigate('/result', { state: { result: data } });

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  }, [navigate]);

  useEffect(() => {
    let scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    const onScanSuccess = async (decodedText) => {
      scanner.clear();
      verifyQR(decodedText);
    };

    const onScanFailure = () => {
      // handle scan failure silently
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner.", err));
    };
  }, [verifyQR]);

  const handleRetry = () => {
      window.location.reload();
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px', margin: '3rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <QrCode size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          <span className="gradient-text">Scan & Verify</span>
        </h1>
        <p style={{ color: 'var(--text-dim)' }}>Point your camera at the certificate's QR code.</p>
      </div>

      <div className="glass" style={{ padding: '1rem', overflow: 'hidden' }}>
          {verifying ? (
               <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                   <RefreshCw size={48} color="var(--primary)" className="spin" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
                   <h2>Verifying Signature...</h2>
               </div>
          ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Verification Error</h3>
                  <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>{error}</p>
                  <button className="btn btn-primary" onClick={handleRetry}>Try Again</button>
              </div>
          ) : (
              <div id="reader" style={{ width: '100%' }}></div>
          )}
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        /* Style the HTML5 QR Code Scanner */
        #reader { border: none !important; border-radius: 12px; overflow: hidden; }
        #reader__dashboard_section_csr span { color: var(--text-main) !important; }
        #reader button { background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 10px; font-family: Inter, sans-serif;}
        #reader__camera_selection { background: var(--card-bg); color: var(--text-main); border: 1px solid var(--border); padding: 5px; border-radius: 5px; margin-bottom: 10px; }
      `}</style>
    </div>
  );
};

export default ScanQR;
