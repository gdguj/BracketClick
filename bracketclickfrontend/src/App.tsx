import { useState, useEffect } from 'react';

const COUNTDOWN_EMOJIS: Record<number, string> = {
  3: '🙌',
  2: '✌️',
  1: '🤩',
  0: '📸',
};

function App() {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [systemStatus, setSystemStatus] = useState('Connecting...');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (isCapturing) return;
      try {
        const response = await fetch('http://127.0.0.1:5000/status');
        const data = await response.json();
        setSystemStatus(data.message);
        if (data.status === 'READY_TO_CAPTURE' && countdown === null) {
          setCountdown(3);
          setIsCapturing(true);
        }
      } catch (err) {
        setSystemStatus('SERVER OFFLINE');
      }
    };
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [isCapturing, countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 400);
      triggerBackendCapture();
      const resetTimer = setTimeout(() => {
        setCountdown(null);
        setIsCapturing(false);
      }, 2000);
      return () => clearTimeout(resetTimer);
    }
  }, [countdown]);

const triggerBackendCapture = async () => {
  console.log("Sending to backend:", savedEmail || email, selectedFrame);
  try {
    await fetch('http://127.0.0.1:5000/api/selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: savedEmail || email,
        frameId: selectedFrame
      })
    });
  } catch (err) {
    console.error(err);
  }
};

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && email.trim()) setSavedEmail(email);
  };

  const emoji = countdown !== null ? COUNTDOWN_EMOJIS[countdown] ?? '' : '';
  const isOffline = systemStatus === 'SERVER OFFLINE';

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Nunito', sans-serif",
      background: 'linear-gradient(135deg, #e8f0fe 0%, #fff8e1 35%, #e6f4ea 65%, #fce8e6 100%)',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

        @keyframes cameraFlash { 0%{opacity:0} 15%{opacity:1} 100%{opacity:0} }
        .camera-flash { animation: cameraFlash 0.4s ease-out forwards; }

        @keyframes popIn { 0%{transform:scale(0.3);opacity:0} 70%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        .pop-in { animation: popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }

        @keyframes pulseRing { 0%{transform:scale(0.8);opacity:0.5} 100%{transform:scale(2.2);opacity:0} }
        .pulse-ring { animation: pulseRing 1s ease-out infinite; }

        @keyframes floatDot { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        @keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .status-dot-live { animation: statusPulse 1.5s ease-in-out infinite; }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 18px 18px 28px;
        }
        @media (min-width: 720px) {
          .container { padding: 22px 28px 34px; }
        }

        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .camera-shell {
          width: min(100%, 980px);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 18px 60px rgba(0,0,0,0.18);
          border: 6px solid rgba(255,255,255,0.92);
          background: #1e1e1e;
          position: relative;
          aspect-ratio: 16/9;
        }
        .camera-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .camera-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(closest-side, rgba(0,0,0,0) 65%, rgba(0,0,0,0.35) 100%);
          pointer-events: none;
        }
        .countdown-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          z-index: 20;
          pointer-events: none;
        }
        .countdown-chip {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255,255,255,0.95);
          box-shadow: 0 12px 34px rgba(0,0,0,0.22);
        }
        .countdown-emoji {
          font-size: 2.6rem;
          line-height: 1;
        }
        .countdown-number {
          font-size: 3.1rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -1px;
          color: #1f1f1f;
        }
        .status-row {
          width: min(100%, 980px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255,255,255,0.92);
          box-shadow: 0 4px 18px rgba(0,0,0,0.08);
        }
        .status-text {
          font-size: 14px;
          font-weight: 900;
          color: #373636;
          text-transform: uppercase;
          letter-spacing: 1.2px;
        }
        .hint {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255,255,255,0.92);
          box-shadow: 0 4px 18px rgba(0,0,0,0.08);
        }
        .hint p {
          margin: 0;
          font-size: 13px;
          color: #5F6368;
          font-weight: 800;
        }

        .controls {
          width: min(100%, 980px);
          margin: 14px auto 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 860px) {
          .controls { grid-template-columns: 1.25fr 1fr; gap: 16px; }
        }
        .card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 22px;
          border: 1.5px solid rgba(255,255,255,0.92);
          box-shadow: 0 8px 26px rgba(0,0,0,0.08);
        }
        .card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 16px;
        }
        .card-title h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
          color: #373636;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .accent {
          width: 6px;
          height: 26px;
          border-radius: 99px;
        }

        .frame-btn {
          border-radius: 10px;
          border: 3px solid #e0e0e0;
          transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
          background: white;
          overflow: hidden;
          aspect-ratio: 16/9;
          cursor: pointer;
          padding: 0;
          display: block;
          width: 100%;
        }
        .frame-btn:hover { transform: scale(1.06); border-color: #aaa; }
        .frame-btn.active { border-color: #4285F4; box-shadow: 0 0 0 4px rgba(66,133,244,0.22); }

        input[type="email"] {
          width: 100%;
          padding: 11px 15px;
          border-radius: 10px;
          border: 2px solid #e0e0e0;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: white;
          box-sizing: border-box;
        }
        input[type="email"]:focus { border-color: #4285F4; box-shadow: 0 0 0 3px rgba(66,133,244,0.15); }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '2px solid rgba(255,255,255,0.9)', padding: '14px 0 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 7 }}>
            {(['#4285F4','#EA4335','#F9AB00','#34A853'] as string[]).map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, animation: `floatDot ${1.2 + i*0.2}s ease-in-out infinite`, animationDelay: `${i*0.15}s` }} />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: 'transparent', WebkitTextStroke: '2.5px #EA4335' }}>&lt;</span>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>
              {'BracketClick'.split('').map((ch, i) => {
                const colors = ['#4285F4','#EA4335','#F9AB00','#34A853','#4285F4','#EA4335','#F9AB00','#34A853','#4285F4','#EA4335','#F9AB00','#34A853'];
                return <span key={i} style={{ color: colors[i % colors.length] }}>{ch}</span>;
              })}
              <span style={{ color: '#5F6368', fontWeight: 700 }}> Photo Booth</span>
            </h1>
            <span style={{ fontSize: 36, fontWeight: 900, color: 'transparent', WebkitTextStroke: '2.5px #34A853' }}>&gt;</span>
          </div>

          <div style={{ display: 'flex', gap: 7 }}>
            {(['#34A853','#F9AB00','#EA4335','#4285F4'] as string[]).map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, animation: `floatDot ${1.2 + i*0.2}s ease-in-out infinite`, animationDelay: `${(3-i)*0.15}s` }} />
            ))}
          </div>
        </div>

        {/* Color bars */}
        <div style={{ display: 'flex', gap: 3, padding: '10px 28px 0', maxWidth: 1200, margin: '0 auto' }}>
          {(['#4285F4','#EA4335','#F9AB00','#34A853'] as string[]).map((c, i) => (
            <div key={i} style={{ height: 6, borderRadius: 999, background: c, flex: 1 }} />
          ))}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="page">
        <div className="container">
          <section className="hero">
            <div className="status-row">
              <div className="status-pill" aria-live="polite">
                <div
                  className={isOffline ? '' : 'status-dot-live'}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: isOffline ? '#EA4335' : '#34A853',
                    boxShadow: `0 0 0 5px ${isOffline ? 'rgba(234,67,53,0.18)' : 'rgba(52,168,83,0.18)'}`,
                  }}
                />
                <span className="status-text">{countdown !== null ? 'COUNTDOWN' : systemStatus}</span>
              </div>

              <div className="hint">
                <span style={{ fontSize: 16, fontWeight: 900, color: '#EA4335' }}>&lt;</span>
                <p>
                  Make <strong style={{ color: '#373636' }}>&lt; &gt;</strong> gestures with both hands to start the countdown
                </p>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#34A853' }}>&gt;</span>
              </div>
            </div>

            <div className="camera-shell">
              <img
                src="http://127.0.0.1:5000/video_feed"
                alt=""
                className="camera-img"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/1280x720?text=Connecting..."; }}
              />
              <div className="camera-vignette" />

              {countdown !== null && (
                <div className="countdown-overlay">
                  <div key={countdown} className="countdown-chip pop-in">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {countdown > 0 && (
                        <div
                          className="pulse-ring"
                          style={{
                            position: 'absolute',
                            width: 58,
                            height: 58,
                            borderRadius: '50%',
                            background: '#4285F4',
                            opacity: 0.16,
                          }}
                        />
                      )}
                      <span className="countdown-emoji">{emoji}</span>
                    </div>
                    <span className="countdown-number" style={{ color: countdown === 0 ? '#4285F4' : '#1f1f1f' }}>
                      {countdown === 0 ? 'SMILE!' : countdown}
                    </span>
                  </div>
                </div>
              )}

              {isFlashing && (
                <div className="camera-flash" style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 50, pointerEvents: 'none' }} />
              )}
            </div>

            <div style={{ width: 'min(100%, 980px)', display: 'flex', gap: 6 }}>
              {(['#4285F4','#EA4335','#F9AB00','#34A853','#4285F4','#EA4335'] as string[]).map((c, i) => (
                <div key={i} style={{ height: 7, borderRadius: 999, background: c, flex: 1, opacity: 0.65 }} />
              ))}
            </div>

            <section className="controls">
              <div className="card">
                <div className="card-title">
                  <div className="accent" style={{ background: '#4285F4' }} />
                  <h2>Choose Frame</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
                  {[1, 2, 3].map((frame) => (
                    <button
                      key={frame}
                      onClick={() => setSelectedFrame(frame)}
                      className={`frame-btn ${selectedFrame === frame ? 'active' : ''}`}
                      aria-pressed={selectedFrame === frame}
                    >
                      <img
                        src={`/frames/${frame === 1 ? 'Frame1' : `frame${frame}`}.svg`}
                        alt={`Frame ${frame}`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      />
                    </button>
                  ))}
                </div>
                {selectedFrame === null && (
                  <p style={{ margin: '14px 0 0', fontSize: 13, color: '#5F6368', fontWeight: 700 }}>
                    Tip: pick a frame before the countdown starts.
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="card">
                  <div className="card-title">
                    <div className="accent" style={{ background: '#34A853' }} />
                    <h2>Enter Email</h2>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    placeholder="example@email.com"
                    style={{ fontSize: 16, padding: '14px 16px', borderRadius: 14 }}
                  />
                  {savedEmail && (
                    <p style={{ margin: '10px 0 0', fontSize: 14, color: '#34A853', fontWeight: 800 }}>
                      ✓ Saved: {savedEmail}
                    </p>
                  )}
                </div>

                <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      className={isOffline ? '' : 'status-dot-live'}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: isOffline ? '#EA4335' : '#34A853',
                        boxShadow: `0 0 0 6px ${isOffline ? 'rgba(234,67,53,0.18)' : 'rgba(52,168,83,0.18)'}`,
                      }}
                    />
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: '#5F6368', letterSpacing: 1.4, textTransform: 'uppercase' }}>
                        System
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, color: '#373636', letterSpacing: 1 }}>
                        {systemStatus}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: selectedFrame ? '#4285F4' : '#9AA0A6' }} />
                    <p style={{ margin: 0, fontSize: 13, color: '#5F6368', fontWeight: 800 }}>
                      Frame: <span style={{ color: '#373636' }}>{selectedFrame ?? 'None'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;