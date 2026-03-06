import { useState, useEffect } from 'react';

const COUNTDOWN_EMOJIS: Record<number, string> = {
  3: '🙌',
  2: '✌️',
  1: '🤩',
  0: '📸',
};

// All 6 frames by filename
const FRAMES = ['Frame1', 'Frame2', 'Frame3', 'Frame4', 'Frame5', 'Frame6'];

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
    try {
      await fetch('http://127.0.0.1:5000/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedEmail || email, frame: selectedFrame })
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
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Nunito', sans-serif", background: 'linear-gradient(135deg, #e8f0fe 0%, #fff8e1 35%, #e6f4ea 65%, #fce8e6 100%)' }}>
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

        .booth {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 8px 16px 12px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .camera-card {
          flex: 1;
          min-height: 0;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 10px;
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
        }

        .camera-shell {
          flex: 1;
          min-height: 0;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          background: #1e1e1e;
          border: 4px solid rgba(255,255,255,0.95);
          box-shadow: 0 14px 44px rgba(0,0,0,0.22);
        }

        .frames-row {
          flex-shrink: 0;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          gap: 8px;
          justify-content: center;
          align-items: center;
          flex-wrap: nowrap;
          overflow-x: auto;
          padding: 4px 2px;
          box-sizing: border-box;
        }

        .bottom-row {
          flex-shrink: 0;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 8px;
          align-items: stretch;
        }
        @media (max-width: 980px) {
          .bottom-row { grid-template-columns: 1fr; }
        }

        .frame-btn {
          border-radius: 8px;
          border: 2px solid #e0e0e0;
          transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
          background: white;
          overflow: hidden;
          cursor: pointer;
          padding: 0;
          display: block;
          width: 200px;
          aspect-ratio: 16 / 9;
          height: auto;
          flex: 0 0 auto;
        }
        .frame-btn:hover { transform: scale(1.04); border-color: #aaa; }
        .frame-btn.active { border-color: #4285F4; box-shadow: 0 0 0 4px rgba(66,133,244,0.22); }

        input[type="email"] {
          width: 100%;
          padding: 15px 18px;
          border-radius: 14px;
          border: 2px solid #e0e0e0;
          font-size: 17px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: white;
          box-sizing: border-box;
        }
        input[type="email"]:focus { border-color: #4285F4; box-shadow: 0 0 0 3px rgba(66,133,244,0.15); }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ flexShrink: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '2px solid rgba(255,255,255,0.9)', padding: '8px 0 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        <div style={{ display: 'flex', gap: 3, padding: '6px 28px 0', maxWidth: 1300, margin: '0 auto' }}>
          {(['#4285F4','#EA4335','#F9AB00','#34A853'] as string[]).map((c, i) => (
            <div key={i} style={{ height: 6, borderRadius: 999, background: c, flex: 1 }} />
          ))}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="booth">

        {/* Gesture hint */}
        <div style={{
          flexShrink: 0,
          background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
          borderRadius: 999, padding: '5px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          maxWidth: 1280, margin: '0 auto',
        }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#EA4335' }}>&lt;</span>
          <p style={{ margin: 0, fontSize: 12, color: '#5F6368', fontWeight: 700 }}>
            Make <strong style={{ color: '#373636' }}>&lt; &gt;</strong> gestures with both hands to start the countdown
          </p>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#34A853' }}>&gt;</span>
        </div>

        {/* ══ CAMERA (center, full size) ══ */}
        <section className="camera-card">
          <div className="camera-shell">
            <img
              src="http://127.0.0.1:5000/video_feed"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/640x360?text=Connecting..."; }}
            />
            {isFlashing && <div className="camera-flash" style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 50, pointerEvents: 'none' }} />}
          </div>
        </section>

        {/* ══ FRAMES (single row under camera) ══ */}
        <section className="frames-row" aria-label="Choose frame">
          {FRAMES.map((name, idx) => (
            <button key={name} onClick={() => setSelectedFrame(idx + 1)} className={`frame-btn ${selectedFrame === idx + 1 ? 'active' : ''}`}>
              <img src={`/frames/${name}.png`} alt={`Frame ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </button>
          ))}
        </section>

        {/* ══ EMAIL + STATUS (33/66) ══ */}
        <section className="bottom-row">
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '10px 14px', border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 5, height: 20, borderRadius: 99, background: '#34A853' }} />
              <label htmlFor="email" style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#373636', textTransform: 'uppercase', letterSpacing: 1.5 }}>Enter Email</label>
            </div>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleEmailKeyDown} placeholder="example@email.com" style={{ padding: '8px 12px', fontSize: 14 }} />
            {savedEmail && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#34A853', fontWeight: 700 }}>✓ {savedEmail}</p>}
          </div>

          <div style={{
            background: countdown !== null ? 'linear-gradient(135deg, #e8f0fe, #fce8f3)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)', borderRadius: 14, padding: '10px 14px',
            border: `1.5px solid ${countdown !== null ? '#4285F4' : 'rgba(255,255,255,0.9)'}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s', overflow: 'hidden',
          }}>
            {countdown !== null ? (
              <div key={countdown} className="pop-in" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {countdown > 0 && <div className="pulse-ring" style={{ position: 'absolute', width: 44, height: 44, borderRadius: '50%', background: '#4285F4', opacity: 0.18 }} />}
                  <span style={{ fontSize: '2rem' }}>{emoji}</span>
                </div>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, color: countdown === 0 ? '#4285F4' : '#373636' }}>
                  {countdown === 0 ? 'SMILE!' : countdown}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={isOffline ? '' : 'status-dot-live'} style={{ width: 12, height: 12, borderRadius: '50%', background: isOffline ? '#EA4335' : '#34A853', boxShadow: `0 0 0 4px ${isOffline ? 'rgba(234,67,53,0.2)' : 'rgba(52,168,83,0.2)'}` }} />
                <p style={{ margin: 0, fontSize: 19, fontWeight: 900, color: '#373636', textTransform: 'uppercase', letterSpacing: 2 }}>{systemStatus}</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;