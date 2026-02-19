import { useState, useCallback } from 'react';
import Head from 'next/head';

export default function IngestPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setResult(null);
        setError(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const payload = JSON.parse(text);

                const response = await fetch('/api/blog/ingest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (response.ok) {
                    setResult(data.message);
                } else {
                    setError(data.error || 'Ingestion failed');
                }
            } catch (err) {
                setError('Invalid file format. Please upload the Lux JSON (.txt) file.');
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{
            background: '#0a0a0a',
            color: '#fff',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Outfit, sans-serif',
            padding: '2rem'
        }}>
            <Head>
                <title>Lux | Neural Ingestion</title>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600&display=swap" rel="stylesheet" />
            </Head>

            <div style={{
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                background: '#111',
                padding: '3rem',
                borderRadius: '24px',
                border: '1px solid #222',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.2em',
                    color: '#ff0e59',
                    fontWeight: 600
                }}>
                    NEURAL INGESTION
                </h1>
                <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '2.5rem' }}>
                    Transmit blog intelligence directly to the Lux Engine.
                </p>

                <label style={{
                    display: 'block',
                    border: '2px dashed #333',
                    padding: '3rem 1rem',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: loading ? '#000' : 'transparent',
                }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#ff0e59'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#333'}
                >
                    <input
                        type="file"
                        accept=".txt,.json"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        disabled={loading}
                    />
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                        {loading ? '🧬' : '🧠'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#888' }}>
                        {loading ? 'SYNTHESIZING...' : 'Click or Drop Lux JSON File'}
                    </div>
                </label>

                {result && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'rgba(0, 255, 136, 0.1)',
                        border: '1px solid #00ff88',
                        borderRadius: '12px',
                        color: '#00ff88',
                        fontSize: '0.85rem'
                    }}>
                        ✅ {result}
                    </div>
                )}

                {error && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'rgba(255, 14, 89, 0.1)',
                        border: '1px solid #ff0e59',
                        borderRadius: '12px',
                        color: '#ff0e59',
                        fontSize: '0.85rem'
                    }}>
                        ❌ {error}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '2rem', color: '#333', fontSize: '0.7rem', display: 'flex', gap: '1rem' }}>
                <span>LUX ENGINE v3.0</span>
                <span>|</span>
                <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>BACK TO CORE</a>
            </div>
        </div>
    );
}
