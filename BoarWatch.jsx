import { useState, useEffect, useRef } from "react";

const SCREENS = {
  SPLASH: "splash",
  LOGIN: "login",
  REGISTER: "register",
  HOME: "home",
  MONITOR: "monitor",
  ALERT: "alert",
  PREDICTION: "prediction",
  HISTORY: "history",
  SETTINGS: "settings",
  COMMUNITY: "community",
};

const alertHistory = [
  { id: 1, date: "2026-02-28", time: "19:43", location: "Sector 4 – North Trail", confidence: 94, thumbnail: "🐗" },
  { id: 2, date: "2026-02-27", time: "20:11", location: "Sector 2 – East Ridge", confidence: 88, thumbnail: "🐗" },
  { id: 3, date: "2026-02-26", time: "07:22", location: "Sector 6 – Farmland Edge", confidence: 91, thumbnail: "🐗" },
  { id: 4, date: "2026-02-25", time: "18:55", location: "Sector 1 – River Bend", confidence: 76, thumbnail: "🐗" },
  { id: 5, date: "2026-02-23", time: "21:04", location: "Sector 3 – Old Mill Rd", confidence: 83, thumbnail: "🐗" },
];

const weeklyData = [3, 7, 2, 9, 5, 11, 6];
const hourlyData = [0, 0, 0, 1, 0, 2, 3, 5, 2, 1, 0, 0, 1, 0, 0, 1, 2, 8, 11, 9, 7, 4, 1, 0];

const communityReports = [
  { id: 1, user: "Ravi M.", time: "2h ago", location: "North Trail", type: "Sighting", severity: "high" },
  { id: 2, user: "Priya K.", time: "5h ago", location: "East Ridge", type: "Tracks Found", severity: "medium" },
  { id: 3, user: "Arun S.", time: "1d ago", location: "Farmland Edge", type: "Sighting", severity: "high" },
  { id: 4, user: "Meena V.", time: "1d ago", location: "River Bend", type: "Noise", severity: "low" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a1a0f;
    --bg2: #0e2015;
    --bg3: #162b1c;
    --green: #2dbd6e;
    --green2: #1a8f4f;
    --green-dim: #1d5433;
    --amber: #e8a020;
    --red: #e84040;
    --red-dim: #6b1a1a;
    --text: #d4edd8;
    --text-dim: #6b9975;
    --card: rgba(22, 43, 28, 0.85);
    --border: rgba(45, 189, 110, 0.15);
    --mono: 'Space Mono', monospace;
    --sans: 'Sora', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); }

  .phone {
    width: 390px;
    height: 780px;
    background: var(--bg);
    border-radius: 44px;
    overflow: hidden;
    position: relative;
    border: 2px solid rgba(45,189,110,0.2);
    box-shadow: 0 0 60px rgba(45,189,110,0.08), 0 0 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  .screen { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }

  /* ---- SPLASH ---- */
  .splash {
    background: radial-gradient(ellipse at 60% 30%, #1a4d2b 0%, #0a1a0f 60%);
    align-items: center; justify-content: center; gap: 20px;
    position: relative; overflow: hidden;
  }
  .splash::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 45%, rgba(45,189,110,0.12) 0%, transparent 65%);
    animation: pulse 2.5s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
  .radar-rings {
    position: absolute; width: 320px; height: 320px;
    top: 50%; left: 50%; transform: translate(-50%,-55%);
  }
  .ring {
    position: absolute; border-radius: 50%; border: 1px solid rgba(45,189,110,0.2);
    top: 50%; left: 50%; transform: translate(-50%,-50%);
    animation: expand 3s ease-out infinite;
  }
  .ring:nth-child(2) { animation-delay: 1s; }
  .ring:nth-child(3) { animation-delay: 2s; }
  @keyframes expand {
    0% { width: 60px; height: 60px; opacity: 0.8; }
    100% { width: 300px; height: 300px; opacity: 0; }
  }
  .boar-icon-wrap {
    width: 90px; height: 90px; background: linear-gradient(135deg, #1a8f4f, #2dbd6e);
    border-radius: 24px; display: flex; align-items: center; justify-content: center;
    font-size: 44px; position: relative; z-index: 2;
    box-shadow: 0 8px 32px rgba(45,189,110,0.4);
  }
  .app-title { font-family: var(--mono); font-size: 32px; font-weight: 700; color: #fff; z-index: 2; letter-spacing: 2px; }
  .app-tagline { font-size: 13px; color: var(--text-dim); z-index: 2; letter-spacing: 3px; text-transform: uppercase; }
  .splash-btn {
    margin-top: 20px; padding: 14px 48px; background: var(--green); border: none;
    border-radius: 30px; color: #fff; font-family: var(--sans); font-size: 15px; font-weight: 700;
    cursor: pointer; z-index: 2; letter-spacing: 1px;
    box-shadow: 0 4px 20px rgba(45,189,110,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .splash-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(45,189,110,0.5); }

  /* ---- AUTH ---- */
  .auth-screen {
    background: linear-gradient(160deg, #0e2015 0%, #0a1a0f 100%);
    padding: 40px 28px; gap: 16px;
  }
  .auth-screen::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232dbd6e' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
  .auth-logo { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 8px; }
  .auth-logo-icon { width: 60px; height: 60px; background: linear-gradient(135deg, #1a8f4f, #2dbd6e); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
  .auth-logo-text { font-family: var(--mono); font-size: 22px; font-weight: 700; color: #fff; }
  .auth-title { font-size: 24px; font-weight: 800; color: var(--text); text-align: center; }
  .auth-sub { font-size: 13px; color: var(--text-dim); text-align: center; margin-top: -8px; }
  .input-group { display: flex; flex-direction: column; gap: 4px; }
  .input-label { font-size: 12px; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
  .auth-input {
    background: var(--bg3); border: 1px solid var(--border); border-radius: 12px;
    padding: 13px 16px; color: var(--text); font-family: var(--sans); font-size: 14px;
    outline: none; transition: border-color 0.2s;
  }
  .auth-input:focus { border-color: var(--green); }
  .auth-input::placeholder { color: var(--text-dim); }
  .auth-btn {
    padding: 14px; background: var(--green); border: none; border-radius: 12px;
    color: #fff; font-family: var(--sans); font-size: 15px; font-weight: 700;
    cursor: pointer; margin-top: 4px; transition: opacity 0.2s;
  }
  .auth-btn:hover { opacity: 0.9; }
  .auth-link { font-size: 13px; color: var(--text-dim); text-align: center; cursor: pointer; }
  .auth-link span { color: var(--green); font-weight: 600; }

  /* ---- MAIN LAYOUT ---- */
  .main-screen { flex: 1; display: flex; flex-direction: column; }
  .topbar {
    padding: 44px 24px 16px; display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(180deg, var(--bg2) 0%, transparent 100%);
  }
  .topbar-title { font-family: var(--mono); font-size: 18px; font-weight: 700; color: var(--green); }
  .topbar-sub { font-size: 11px; color: var(--text-dim); }
  .topbar-avatar { width: 36px; height: 36px; background: var(--green-dim); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .content { flex: 1; overflow-y: auto; padding: 0 16px 16px; display: flex; flex-direction: column; gap: 12px; }
  .content::-webkit-scrollbar { display: none; }

  /* BOTTOM NAV */
  .bottom-nav {
    display: flex; background: var(--bg2); border-top: 1px solid var(--border);
    padding: 8px 0 16px;
  }
  .nav-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
    cursor: pointer; padding: 4px 0;
  }
  .nav-icon { font-size: 20px; }
  .nav-label { font-size: 9px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
  .nav-item.active .nav-label { color: var(--green); }
  .nav-item.active .nav-icon { filter: drop-shadow(0 0 6px rgba(45,189,110,0.8)); }

  /* CARDS */
  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 16px; backdrop-filter: blur(10px);
  }
  .card-title { font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 12px; }

  /* HOME */
  .risk-banner {
    border-radius: 16px; padding: 20px; display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(135deg, #162b1c, #1a3d22);
    border: 1px solid rgba(45,189,110,0.3);
  }
  .risk-label { font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
  .risk-value { font-size: 28px; font-weight: 800; }
  .risk-low { color: var(--green); }
  .risk-med { color: var(--amber); }
  .risk-high { color: var(--red); }
  .prob-circle {
    width: 80px; height: 80px; border-radius: 50%;
    background: conic-gradient(var(--amber) 0% 72%, rgba(255,255,255,0.06) 72% 100%);
    display: flex; align-items: center; justify-content: center; position: relative;
  }
  .prob-inner {
    width: 62px; height: 62px; background: var(--bg2); border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .prob-num { font-family: var(--mono); font-size: 16px; font-weight: 700; color: var(--amber); }
  .prob-sub { font-size: 9px; color: var(--text-dim); }
  .status-pill {
    display: flex; align-items: center; gap: 8px; padding: 10px 16px;
    background: rgba(45,189,110,0.08); border: 1px solid rgba(45,189,110,0.2);
    border-radius: 30px;
  }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: blink 1.5s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .status-text { font-size: 13px; font-weight: 600; color: var(--green); }
  .alert-btn {
    padding: 16px; background: linear-gradient(135deg, var(--red-dim), #a02020);
    border: 1px solid rgba(232,64,64,0.4); border-radius: 16px;
    display: flex; align-items: center; justify-content: center; gap: 12px;
    cursor: pointer; transition: transform 0.15s;
  }
  .alert-btn:hover { transform: scale(0.98); }
  .alert-btn-text { font-size: 16px; font-weight: 800; color: #fff; }
  .stats-row { display: flex; gap: 10px; }
  .stat-card { flex: 1; background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center; }
  .stat-num { font-family: var(--mono); font-size: 22px; font-weight: 700; color: var(--green); }
  .stat-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; margin-top: 2px; }

  /* MONITOR */
  .camera-feed {
    background: #050e06; border-radius: 16px; overflow: hidden;
    aspect-ratio: 4/3; position: relative; display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border);
  }
  .cam-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(45,189,110,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(45,189,110,0.04) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .boar-detected {
    position: absolute; width: 120px; height: 90px;
    border: 2px solid #ff4040; border-radius: 4px;
    top: 50%; left: 50%; transform: translate(-20%, -50%);
    animation: bbox-pulse 1s ease-in-out infinite;
  }
  .boar-emoji { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%); font-size: 48px; }
  @keyframes bbox-pulse { 0%,100%{border-color:#ff4040} 50%{border-color:#ff8080} }
  .det-label {
    position: absolute; top: -22px; left: -2px; background: #ff4040;
    padding: 2px 8px; font-size: 10px; font-weight: 700; border-radius: 4px 4px 0 0;
    white-space: nowrap;
  }
  .cam-overlay-info {
    position: absolute; top: 10px; left: 10px; right: 10px;
    display: flex; justify-content: space-between;
  }
  .cam-badge {
    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); padding: 4px 10px;
    border-radius: 20px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 6px;
  }
  .cam-rec { color: var(--red); }
  .live-dot { width: 6px; height: 6px; background: var(--red); border-radius: 50%; animation: blink 1s infinite; }
  .siren-btn {
    width: 64px; height: 64px; border-radius: 50%; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 28px;
    transition: transform 0.2s;
  }
  .siren-on { background: radial-gradient(circle, #ff6060, #c00); animation: siren-glow 0.8s ease-in-out infinite; }
  .siren-off { background: var(--bg3); }
  @keyframes siren-glow { 0%,100%{box-shadow:0 0 0 0 rgba(232,64,64,0.6)} 50%{box-shadow:0 0 20px 8px rgba(232,64,64,0.3)} }
  .toggle-row { display: flex; align-items: center; justify-content: space-between; }
  .toggle { width: 44px; height: 24px; background: var(--bg3); border-radius: 12px; position: relative; cursor: pointer; transition: background 0.2s; border: 1px solid var(--border); }
  .toggle.on { background: var(--green); }
  .toggle::after { content: ''; position: absolute; width: 18px; height: 18px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: left 0.2s; }
  .toggle.on::after { left: 22px; }

  /* ALERT SCREEN */
  .alert-screen { background: linear-gradient(160deg, #1a0505 0%, #0a0a0a 100%); }
  .alert-header {
    background: linear-gradient(135deg, #8b0000, #cc0000); padding: 32px 24px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .alert-icon { font-size: 48px; animation: shake 0.5s ease-in-out infinite alternate; }
  @keyframes shake { 0%{transform:rotate(-8deg)} 100%{transform:rotate(8deg)} }
  .alert-title { font-size: 20px; font-weight: 800; color: white; text-align: center; }
  .alert-time { font-family: var(--mono); font-size: 12px; color: rgba(255,200,200,0.8); }
  .info-row { display: flex; gap: 4px; align-items: center; font-size: 12px; color: rgba(255,200,200,0.7); }
  .action-btn {
    padding: 14px 20px; border-radius: 12px; border: none; cursor: pointer;
    font-family: var(--sans); font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 10px;
    transition: opacity 0.2s;
  }
  .action-btn:hover { opacity: 0.9; }
  .action-sms { background: linear-gradient(135deg, #1a5c33, var(--green)); color: white; }
  .action-call { background: linear-gradient(135deg, #6b1a1a, var(--red)); color: white; }
  .action-dismiss { background: var(--bg3); color: var(--text-dim); border: 1px solid var(--border); }

  /* PREDICTION */
  .hour-bar-wrap { display: flex; align-items: flex-end; gap: 2px; height: 70px; }
  .hour-bar { flex: 1; border-radius: 2px 2px 0 0; min-height: 2px; transition: height 0.3s; }
  .hour-low { background: var(--green); }
  .hour-med { background: var(--amber); }
  .hour-high { background: var(--red); }
  .week-bar-wrap { display: flex; align-items: flex-end; gap: 6px; height: 60px; }
  .week-bar { flex: 1; border-radius: 4px 4px 0 0; min-height: 4px; background: var(--green); }
  .week-labels { display: flex; gap: 6px; }
  .week-label { flex: 1; text-align: center; font-size: 10px; color: var(--text-dim); }
  .risk-time-badge { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; text-align: center; }
  .rt-high { background: rgba(232,64,64,0.2); color: var(--red); border: 1px solid rgba(232,64,64,0.3); }
  .rt-med { background: rgba(232,160,32,0.2); color: var(--amber); border: 1px solid rgba(232,160,32,0.3); }
  .rt-low { background: rgba(45,189,110,0.1); color: var(--green); border: 1px solid rgba(45,189,110,0.2); }

  /* HISTORY */
  .hist-item {
    display: flex; align-items: center; gap: 12px; padding: 12px;
    background: var(--bg3); border-radius: 12px; border: 1px solid var(--border);
  }
  .hist-thumb { width: 48px; height: 48px; background: var(--green-dim); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .hist-info { flex: 1; }
  .hist-loc { font-size: 13px; font-weight: 600; color: var(--text); }
  .hist-meta { font-size: 11px; color: var(--text-dim); margin-top: 2px; }
  .hist-conf { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--green); }

  /* SETTINGS */
  .settings-section { display: flex; flex-direction: column; gap: 2px; }
  .setting-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--bg3); border-radius: 12px; border: 1px solid var(--border); margin-bottom: 2px; }
  .setting-left { display: flex; align-items: center; gap: 12px; }
  .setting-icon { font-size: 20px; width: 32px; text-align: center; }
  .setting-text { font-size: 14px; font-weight: 600; color: var(--text); }
  .setting-sub { font-size: 11px; color: var(--text-dim); }
  .slider { -webkit-appearance: none; width: 100px; height: 4px; background: var(--bg2); border-radius: 2px; outline: none; }
  .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--green); cursor: pointer; }

  /* COMMUNITY */
  .map-placeholder {
    height: 180px; background: #0a1a0f; border-radius: 12px;
    position: relative; overflow: hidden; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
  }
  .map-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(45,189,110,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(45,189,110,0.06) 1px, transparent 1px);
    background-size: 30px 30px;
  }
  .map-zone {
    position: absolute; border-radius: 50%; opacity: 0.3;
  }
  .zone-red { background: var(--red); width: 80px; height: 60px; top: 30%; left: 20%; }
  .zone-amber { background: var(--amber); width: 60px; height: 50px; top: 50%; left: 55%; }
  .map-pin { position: absolute; font-size: 24px; }
  .report-btn {
    padding: 14px; background: var(--green); border: none; border-radius: 12px;
    color: #fff; font-family: var(--sans); font-size: 14px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .comm-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg3); border-radius: 12px; border: 1px solid var(--border); }
  .sev-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .sev-high { background: var(--red); }
  .sev-med { background: var(--amber); }
  .sev-low { background: var(--green); }
  .comm-info { flex: 1; }
  .comm-name { font-size: 13px; font-weight: 700; }
  .comm-detail { font-size: 11px; color: var(--text-dim); }

  .wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #040a06;
    padding: 20px;
    gap: 20px;
  }
  .app-title-outer {
    font-family: 'Space Mono', monospace;
    font-size: 28px;
    color: #2dbd6e;
    letter-spacing: 4px;
    font-weight: 700;
  }
  .app-sub-outer {
    font-size: 13px;
    color: #3d7a52;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: -12px;
  }
`;

function BottomNav({ screen, setScreen }) {
  const items = [
    { id: SCREENS.HOME, icon: "🏠", label: "Home" },
    { id: SCREENS.MONITOR, icon: "🎥", label: "Monitor" },
    { id: SCREENS.PREDICTION, icon: "📊", label: "Predict" },
    { id: SCREENS.COMMUNITY, icon: "👥", label: "Community" },
    { id: SCREENS.SETTINGS, icon: "⚙️", label: "Settings" },
  ];
  return (
    <div className="bottom-nav">
      {items.map((i) => (
        <div key={i.id} className={`nav-item ${screen === i.id ? "active" : ""}`} onClick={() => setScreen(i.id)}>
          <span className="nav-icon">{i.icon}</span>
          <span className="nav-label">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

function SplashScreen({ next }) {
  useEffect(() => { const t = setTimeout(next, 2800); return () => clearTimeout(t); }, []);
  return (
    <div className="screen splash">
      <div className="radar-rings">
        <div className="ring" style={{ width: 80, height: 80 }} />
        <div className="ring" style={{ width: 80, height: 80 }} />
        <div className="ring" style={{ width: 80, height: 80 }} />
      </div>
      <div className="boar-icon-wrap">🐗</div>
      <div className="app-title">BoarWatch</div>
      <div className="app-tagline">Smart Wildlife Alert System</div>
      <button className="splash-btn" onClick={next}>Get Started</button>
    </div>
  );
}

function LoginScreen({ setScreen }) {
  return (
    <div className="screen auth-screen">
      <div className="auth-logo">
        <div className="auth-logo-icon">🐗</div>
        <div className="auth-logo-text">BoarWatch</div>
      </div>
      <div className="auth-title">Welcome Back</div>
      <div className="auth-sub">Sign in to your safety network</div>
      <div className="input-group">
        <div className="input-label">Email</div>
        <input className="auth-input" type="email" placeholder="your@email.com" />
      </div>
      <div className="input-group">
        <div className="input-label">Password</div>
        <input className="auth-input" type="password" placeholder="••••••••" />
      </div>
      <button className="auth-btn" onClick={() => setScreen(SCREENS.HOME)}>Login</button>
      <div className="auth-link" onClick={() => setScreen(SCREENS.REGISTER)}>
        New here? <span>Create Account</span>
      </div>
    </div>
  );
}

function RegisterScreen({ setScreen }) {
  return (
    <div className="screen auth-screen" style={{ gap: 10 }}>
      <div className="auth-logo" style={{ marginBottom: 0 }}>
        <div className="auth-logo-icon">🐗</div>
      </div>
      <div className="auth-title" style={{ fontSize: 20 }}>Create Account</div>
      {[
        { label: "Full Name", ph: "Ravi Kumar", type: "text" },
        { label: "Phone Number", ph: "+91 98765 43210", type: "tel" },
        { label: "Location / Village", ph: "Sector 4, North Trail", type: "text" },
        { label: "Emergency Contact", ph: "+91 90000 00000", type: "tel" },
        { label: "Password", ph: "••••••••", type: "password" },
      ].map((f) => (
        <div key={f.label} className="input-group">
          <div className="input-label">{f.label}</div>
          <input className="auth-input" type={f.type} placeholder={f.ph} style={{ padding: "11px 14px" }} />
        </div>
      ))}
      <div className="toggle-row" style={{ background: "var(--bg3)", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border)" }}>
        <span style={{ fontSize: 13, color: "var(--text-dim)" }}>📍 Enable GPS Location</span>
        <div className="toggle on" />
      </div>
      <button className="auth-btn" onClick={() => setScreen(SCREENS.HOME)}>Create Account</button>
      <div className="auth-link" onClick={() => setScreen(SCREENS.LOGIN)}>Already have an account? <span>Sign In</span></div>
    </div>
  );
}

function HomeScreen({ setScreen }) {
  return (
    <div className="screen main-screen">
      <div className="topbar">
        <div>
          <div className="topbar-title">BoarWatch</div>
          <div className="topbar-sub">Kochi Region • Sun, Mar 1</div>
        </div>
        <div className="topbar-avatar">🧑</div>
      </div>
      <div className="content">
        <div className="risk-banner">
          <div>
            <div className="risk-label">Today's Risk Level</div>
            <div className="risk-value risk-med">MEDIUM</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>Peak: 6PM – 9PM</div>
          </div>
          <div className="prob-circle">
            <div className="prob-inner">
              <div className="prob-num">72%</div>
              <div className="prob-sub">RISK</div>
            </div>
          </div>
        </div>
        <div className="status-pill">
          <div className="status-dot" />
          <span className="status-text">No Boar Detected – System Active</span>
        </div>
        <div className="stats-row">
          <div className="stat-card"><div className="stat-num">23</div><div className="stat-label">This Month</div></div>
          <div className="stat-card"><div className="stat-num">5</div><div className="stat-label">This Week</div></div>
          <div className="stat-card"><div className="stat-num">3</div><div className="stat-label">Today</div></div>
        </div>
        <div className="alert-btn" onClick={() => setScreen(SCREENS.ALERT)}>
          <span style={{ fontSize: 28 }}>🚨</span>
          <div>
            <div className="alert-btn-text">Trigger Alert</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Notify all neighbors instantly</div>
          </div>
        </div>
        <div className="card" style={{ cursor: "pointer" }} onClick={() => setScreen(SCREENS.HISTORY)}>
          <div className="card-title">Recent Detections</div>
          {alertHistory.slice(0, 3).map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{a.location}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{a.date} · {a.time}</div>
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--green)" }}>{a.confidence}%</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav screen={SCREENS.HOME} setScreen={setScreen} />
    </div>
  );
}

function MonitorScreen({ setScreen }) {
  const [sirenOn, setSirenOn] = useState(true);
  const [soundToggle, setSoundToggle] = useState(true);
  return (
    <div className="screen main-screen">
      <div className="topbar">
        <div>
          <div className="topbar-title">Live Monitor</div>
          <div className="topbar-sub">AI Detection Active</div>
        </div>
        <span style={{ fontSize: 22 }}>📡</span>
      </div>
      <div className="content">
        <div className="camera-feed">
          <div className="cam-grid" />
          <div className="boar-emoji">🐗</div>
          <div className="boar-detected">
            <div className="det-label">Wild Boar · 92%</div>
          </div>
          <div className="cam-overlay-info">
            <div className="cam-badge cam-rec">
              <div className="live-dot" />
              LIVE
            </div>
            <div className="cam-badge" style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-dim)" }}>
              19:43:22
            </div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className={`siren-btn ${sirenOn ? "siren-on" : "siren-off"}`} onClick={() => setSirenOn(!sirenOn)}>
            {sirenOn ? "🚨" : "🔕"}
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: sirenOn ? "var(--red)" : "var(--text-dim)" }}>
              {sirenOn ? "SIREN ACTIVE" : "Siren Off"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{sirenOn ? "Alert broadcast in progress" : "Tap to enable siren"}</div>
          </div>
        </div>
        <div className="card">
          <div className="toggle-row">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Sound Alert</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Play audio on detection</div>
            </div>
            <div className={`toggle ${soundToggle ? "on" : ""}`} onClick={() => setSoundToggle(!soundToggle)} />
          </div>
        </div>
        <div className="card">
          <div className="card-title">Detection Info</div>
          {[
            ["Object", "Wild Boar (Sus scrofa)"],
            ["Confidence", "92.4%"],
            ["Bounding Box", "x:201 y:148 w:120 h:90"],
            ["Camera", "Zone-4 North"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{k}</span>
              <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav screen={SCREENS.MONITOR} setScreen={setScreen} />
    </div>
  );
}

function AlertScreen({ setScreen }) {
  return (
    <div className="screen" style={{ background: "linear-gradient(160deg, #1a0505, #080808)" }}>
      <div className="alert-header">
        <div className="alert-icon">🚨</div>
        <div className="alert-title">Wild Boar Detected!</div>
        <div className="alert-time">Today · 19:43:22</div>
        <div className="info-row">📍 Sector 4 – North Trail, Kochi</div>
        <div style={{ marginTop: 8, background: "rgba(255,64,64,0.15)", border: "1px solid rgba(255,64,64,0.4)", borderRadius: 8, padding: "6px 16px", fontSize: 14, fontWeight: 700, color: "#ff9090" }}>
          Confidence: 92.4%
        </div>
      </div>
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "rgba(232,64,64,0.08)", border: "1px solid rgba(232,64,64,0.25)", borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Captured Image</div>
          <div style={{ height: 100, background: "#1a0505", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, border: "1px solid rgba(232,64,64,0.2)" }}>🐗</div>
        </div>
        <button className="action-btn action-sms" style={{ width: "100%" }}>
          <span style={{ fontSize: 20 }}>💬</span> Send SMS to Neighbors (12)
        </button>
        <button className="action-btn action-call" style={{ width: "100%" }}>
          <span style={{ fontSize: 20 }}>📞</span> Call Emergency Contact
        </button>
        <button className="action-btn action-dismiss" style={{ width: "100%" }} onClick={() => setScreen(SCREENS.HOME)}>
          <span style={{ fontSize: 20 }}>✓</span> Dismiss Alert
        </button>
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Alert Sent To</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Ravi M.", "Priya K.", "Arun S.", "+8 more"].map(n => (
              <div key={n} style={{ padding: "4px 10px", background: "var(--bg3)", borderRadius: 20, fontSize: 11, color: "var(--text-dim)", border: "1px solid var(--border)" }}>{n}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictionScreen({ setScreen }) {
  const maxHour = Math.max(...hourlyData);
  const maxWeek = Math.max(...weeklyData);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="screen main-screen">
      <div className="topbar">
        <div>
          <div className="topbar-title">Prediction</div>
          <div className="topbar-sub">AI Pattern Analysis</div>
        </div>
        <span style={{ fontSize: 22 }}>🧠</span>
      </div>
      <div className="content">
        <div className="risk-banner">
          <div>
            <div className="risk-label">Today's Forecast</div>
            <div className="risk-value risk-med">72% Risk</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>Based on 45 days of data</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["High: 6PM–9PM", "Med: 7AM–8AM", "Low: Daytime"].map((r, i) => (
              <div key={r} className={`risk-time-badge ${["rt-high", "rt-med", "rt-low"][i]}`}>{r}</div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Hourly Activity (Today)</div>
          <div className="hour-bar-wrap">
            {hourlyData.map((v, i) => {
              const h = (v / maxHour) * 64;
              const cls = v >= 8 ? "hour-high" : v >= 4 ? "hour-med" : "hour-low";
              return <div key={i} className={`hour-bar ${cls}`} style={{ height: Math.max(h, 2) }} />;
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>12AM</span>
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>6AM</span>
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>12PM</span>
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>6PM</span>
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>11PM</span>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Weekly Sightings</div>
          <div className="week-bar-wrap">
            {weeklyData.map((v, i) => (
              <div key={i} className="week-bar" style={{ height: (v / maxWeek) * 54 }} />
            ))}
          </div>
          <div className="week-labels" style={{ marginTop: 6 }}>
            {days.map(d => <div key={d} className="week-label">{d}</div>)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Risk Summary</div>
          {[
            ["Most Active Hour", "7:00 PM – 8:00 PM"],
            ["Quietest Period", "10 AM – 4 PM"],
            ["Avg Confidence", "87.3%"],
            ["Model Accuracy", "91.2%"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{k}</span>
              <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav screen={SCREENS.PREDICTION} setScreen={setScreen} />
    </div>
  );
}

function HistoryScreen({ setScreen }) {
  return (
    <div className="screen main-screen">
      <div className="topbar">
        <div>
          <div className="topbar-title">Alert History</div>
          <div className="topbar-sub">{alertHistory.length} total detections</div>
        </div>
        <span style={{ fontSize: 22 }}>📜</span>
      </div>
      <div className="content">
        <div className="stats-row">
          <div className="stat-card"><div className="stat-num">23</div><div className="stat-label">Month</div></div>
          <div className="stat-card"><div className="stat-num">87%</div><div className="stat-label">Avg Conf.</div></div>
          <div className="stat-card"><div className="stat-num">4</div><div className="stat-label">Zones</div></div>
        </div>
        {alertHistory.map((a) => (
          <div key={a.id} className="hist-item">
            <div className="hist-thumb">{a.thumbnail}</div>
            <div className="hist-info">
              <div className="hist-loc">{a.location}</div>
              <div className="hist-meta">{a.date} · {a.time}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <div className="hist-conf">{a.confidence}%</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)" }}>conf.</div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav screen={SCREENS.HOME} setScreen={setScreen} />
    </div>
  );
}

function SettingsScreen({ setScreen }) {
  const [toggles, setToggles] = useState({ sound: true, darkMode: true, sms: true, push: true });
  const tog = (k) => setToggles(t => ({ ...t, [k]: !t[k] }));
  return (
    <div className="screen main-screen">
      <div className="topbar">
        <div>
          <div className="topbar-title">Settings</div>
          <div className="topbar-sub">Customize your experience</div>
        </div>
        <span style={{ fontSize: 22 }}>⚙️</span>
      </div>
      <div className="content">
        {[
          { icon: "🔊", text: "Alert Sound", sub: "Play siren on detection", key: "sound" },
          { icon: "💬", text: "SMS Alerts", sub: "Notify neighbors via SMS", key: "sms" },
          { icon: "🔔", text: "Push Notifications", sub: "Receive push alerts", key: "push" },
          { icon: "🌙", text: "Dark Mode", sub: "Forest dark theme", key: "darkMode" },
        ].map(s => (
          <div key={s.key} className="setting-item">
            <div className="setting-left">
              <span className="setting-icon">{s.icon}</span>
              <div>
                <div className="setting-text">{s.text}</div>
                <div className="setting-sub">{s.sub}</div>
              </div>
            </div>
            <div className={`toggle ${toggles[s.key] ? "on" : ""}`} onClick={() => tog(s.key)} />
          </div>
        ))}
        <div className="setting-item">
          <div className="setting-left">
            <span className="setting-icon">🎯</span>
            <div>
              <div className="setting-text">Detection Sensitivity</div>
              <div className="setting-sub">Higher = more detections</div>
            </div>
          </div>
          <input type="range" className="slider" min="1" max="100" defaultValue="75" />
        </div>
        {[
          { icon: "📍", text: "Location Settings", sub: "GPS zone configuration" },
          { icon: "👤", text: "Emergency Contacts", sub: "Manage SMS recipients" },
          { icon: "📊", text: "Export Data", sub: "Download detection logs" },
          { icon: "🔒", text: "Privacy & Security", sub: "Data & permissions" },
        ].map(s => (
          <div key={s.text} className="setting-item" style={{ cursor: "pointer" }}>
            <div className="setting-left">
              <span className="setting-icon">{s.icon}</span>
              <div>
                <div className="setting-text">{s.text}</div>
                <div className="setting-sub">{s.sub}</div>
              </div>
            </div>
            <span style={{ color: "var(--text-dim)", fontSize: 18 }}>›</span>
          </div>
        ))}
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>BoarWatch v2.1.0 · Region: Kochi, Kerala</div>
          <div style={{ fontSize: 11, color: "var(--green-dim)", marginTop: 4 }}>© 2026 BoarWatch AI Systems</div>
        </div>
      </div>
      <BottomNav screen={SCREENS.SETTINGS} setScreen={setScreen} />
    </div>
  );
}

function CommunityScreen({ setScreen }) {
  return (
    <div className="screen main-screen">
      <div className="topbar">
        <div>
          <div className="topbar-title">Community</div>
          <div className="topbar-sub">Neighborhood Safety Network</div>
        </div>
        <span style={{ fontSize: 22 }}>👥</span>
      </div>
      <div className="content">
        <div className="map-placeholder">
          <div className="map-grid" />
          <div className="map-zone zone-red" />
          <div className="map-zone zone-amber" />
          <div className="map-pin" style={{ top: "25%", left: "18%" }}>📍</div>
          <div className="map-pin" style={{ top: "48%", left: "53%" }}>📍</div>
          <div className="map-pin" style={{ top: "60%", left: "30%" }}>🐗</div>
          <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 8 }}>
            {[["🔴", "High Risk"], ["🟡", "Medium"], ["🟢", "Safe"]].map(([c, l]) => (
              <div key={l} style={{ background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 8, fontSize: 10, color: "white", display: "flex", gap: 4, alignItems: "center" }}>{c} {l}</div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.25)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--red)" }}>2</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)" }}>HIGH RISK ZONES</div>
          </div>
          <div style={{ flex: 1, background: "rgba(232,160,32,0.1)", border: "1px solid rgba(232,160,32,0.25)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--amber)" }}>1</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)" }}>MED ZONES</div>
          </div>
          <div style={{ flex: 1, background: "rgba(45,189,110,0.08)", border: "1px solid rgba(45,189,110,0.2)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--green)" }}>18</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)" }}>USERS NEARBY</div>
          </div>
        </div>
        <button className="report-btn">
          <span>🐗</span> Report a Sighting
        </button>
        <div className="card-title" style={{ paddingLeft: 4 }}>Recent Community Reports</div>
        {communityReports.map(r => (
          <div key={r.id} className="comm-item">
            <div className={`sev-dot sev-${r.severity}`} />
            <div className="comm-info">
              <div className="comm-name">{r.user} · <span style={{ fontWeight: 400, color: "var(--text-dim)" }}>{r.type}</span></div>
              <div className="comm-detail">📍 {r.location} · {r.time}</div>
            </div>
            <div style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 700, background: r.severity === "high" ? "rgba(232,64,64,0.15)" : r.severity === "medium" ? "rgba(232,160,32,0.15)" : "rgba(45,189,110,0.1)", color: r.severity === "high" ? "var(--red)" : r.severity === "medium" ? "var(--amber)" : "var(--green)" }}>
              {r.severity.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      <BottomNav screen={SCREENS.COMMUNITY} setScreen={setScreen} />
    </div>
  );
}

export default function BoarWatch() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);

  const renderScreen = () => {
    switch (screen) {
      case SCREENS.SPLASH: return <SplashScreen next={() => setScreen(SCREENS.LOGIN)} />;
      case SCREENS.LOGIN: return <LoginScreen setScreen={setScreen} />;
      case SCREENS.REGISTER: return <RegisterScreen setScreen={setScreen} />;
      case SCREENS.HOME: return <HomeScreen setScreen={setScreen} />;
      case SCREENS.MONITOR: return <MonitorScreen setScreen={setScreen} />;
      case SCREENS.ALERT: return <AlertScreen setScreen={setScreen} />;
      case SCREENS.PREDICTION: return <PredictionScreen setScreen={setScreen} />;
      case SCREENS.HISTORY: return <HistoryScreen setScreen={setScreen} />;
      case SCREENS.SETTINGS: return <SettingsScreen setScreen={setScreen} />;
      case SCREENS.COMMUNITY: return <CommunityScreen setScreen={setScreen} />;
      default: return <HomeScreen setScreen={setScreen} />;
    }
  };

  const navItems = [
    { id: SCREENS.HOME, label: "🏠 Home" },
    { id: SCREENS.MONITOR, label: "🎥 Monitor" },
    { id: SCREENS.ALERT, label: "🚨 Alert" },
    { id: SCREENS.PREDICTION, label: "📊 Predict" },
    { id: SCREENS.HISTORY, label: "📜 History" },
    { id: SCREENS.SETTINGS, label: "⚙️ Settings" },
    { id: SCREENS.COMMUNITY, label: "👥 Community" },
    { id: SCREENS.LOGIN, label: "🔐 Login" },
    { id: SCREENS.REGISTER, label: "📝 Register" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="wrapper">
        <div className="app-title-outer">🐗 BOARWATCH</div>
        <div className="app-sub-outer">Smart Wildlife Alert System</div>
        <div className="phone">{renderScreen()}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 500 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setScreen(n.id)} style={{
              padding: "6px 12px", background: screen === n.id ? "var(--green)" : "var(--bg3)",
              border: "1px solid " + (screen === n.id ? "var(--green)" : "var(--border)"),
              borderRadius: 20, color: screen === n.id ? "#fff" : "var(--text-dim)",
              fontSize: 12, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600
            }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
