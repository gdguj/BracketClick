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
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 28px 28px' }}>

        {/* Gesture hint — compact */}
        <div style={{
          background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
          borderRadius: 999, padding: '8px 24px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          border: '1.5px solid rgba(255,255,255,0.9)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#EA4335' }}>&lt;</span>
          <p style={{ margin: 0, fontSize: 13, color: '#5F6368', fontWeight: 700 }}>
            Make <strong style={{ color: '#373636' }}>&lt; &gt;</strong> gestures with both hands to start the countdown
          </p>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#34A853' }}>&gt;</span>
        </div>

        {/* 2-column: left controls, right camera (camera gets more space) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'stretch' }}>

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Frame picker */}
            <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '24px', border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 6, height: 28, borderRadius: 99, background: '#4285F4' }} />
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#373636', textTransform: 'uppercase', letterSpacing: 1.5 }}>Choose Frame</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                {[1, 2, 3].map((frame) => (
                  <button key={frame} onClick={() => setSelectedFrame(frame)} className={`frame-btn ${selectedFrame === frame ? 'active' : ''}`}>
                    <img src={`/frames/${frame === 1 ? 'Frame1' : `frame${frame}`}.svg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '24px', border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 6, height: 28, borderRadius: 99, background: '#34A853' }} />
                <label htmlFor="email" style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#373636', textTransform: 'uppercase', letterSpacing: 1.5 }}>Enter Email</label>
              </div>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleEmailKeyDown} placeholder="example@email.com" style={{ fontSize: 17, padding: '15px 18px', borderRadius: 14 }} />
              {savedEmail && <p style={{ margin: '10px 0 0', fontSize: 14, color: '#34A853', fontWeight: 700 }}>✓ {savedEmail}</p>}
            </div>

            {/* Status */}
            <div style={{
              borderRadius: 20,
              height: 110,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2.5px solid ${countdown !== null ? '#4285F4' : 'rgba(255,255,255,0.9)'}`,
              background: countdown !== null
                ? 'linear-gradient(135deg, #e8f0fe, #fce8f3)'
                : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
              overflow: 'hidden',
            }}>
              {countdown !== null ? (
                <div key={countdown} className="pop-in" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {countdown > 0 && <div className="pulse-ring" style={{ position: 'absolute', width: 56, height: 56, borderRadius: '50%', background: '#4285F4', opacity: 0.18 }} />}
                    <span style={{ fontSize: '2.8rem' }}>{emoji}</span>
                  </div>
                  <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, color: countdown === 0 ? '#4285F4' : '#373636' }}>
                    {countdown === 0 ? 'SMILE!' : countdown}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={isOffline ? '' : 'status-dot-live'} style={{ width: 14, height: 14, borderRadius: '50%', background: isOffline ? '#EA4335' : '#34A853', boxShadow: `0 0 0 5px ${isOffline ? 'rgba(234,67,53,0.2)' : 'rgba(52,168,83,0.2)'}` }} />
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#373636', textTransform: 'uppercase', letterSpacing: 2 }}>{systemStatus}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT — Camera (large) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            {/* Bracket hints */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 6px' }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#EA4335', opacity: 0.4 }}>&lt;</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#34A853', opacity: 0.4 }}>&gt;</span>
            </div>

            {/* Camera container */}
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 16px 56px rgba(0,0,0,0.2)',
              border: '6px solid rgba(255,255,255,0.95)',
              position: 'relative',
              background: '#1e1e1e',
              width: '100%',
              aspectRatio: '16/9',
            }}>
              <img
                src="http://127.0.0.1:5000/video_feed"
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/640x360?text=Connecting..."; }}
              />
              {isFlashing && (
                <div className="camera-flash" style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 50, pointerEvents: 'none' }} />
              )}
            </div>

            {/* Color bar */}
            <div style={{ display: 'flex', gap: 5 }}>
              {(['#4285F4','#EA4335','#F9AB00','#34A853','#4285F4','#EA4335'] as string[]).map((c, i) => (
                <div key={i} style={{ height: 7, borderRadius: 999, background: c, flex: 1, opacity: 0.65 }} />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;