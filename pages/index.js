export default function Home() {
  return (
    <div style={{
      background: '#0a0a0a',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', letterSpacing: '0.2em' }}>
          LUX ENGINE
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          AI Backend • API Active
        </p>
        <p style={{ color: '#333', fontSize: '0.7rem', marginTop: '2rem' }}>
          /api/chat • /api/auth • /api/members • /api/memory
        </p>
      </div>
    </div>
  );
}