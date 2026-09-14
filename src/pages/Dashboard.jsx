import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout } from '../lib/authService';
import './Dashboard.css';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* Shared farm SVG background — same as Login/Register */
function FarmBg() {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
      {/* Field rows – bottom left */}
      <svg style={{ position:'absolute', bottom:0, left:0, width:'38%', opacity:0.15 }}
        viewBox="0 0 500 380" fill="none">
        {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
          <path key={i}
            d={`M ${-20+i*10} 380 Q ${100+i*12} ${280-i*5} ${260+i*8} ${200-i*3} T ${520} ${120-i*4}`}
            stroke="#2d5a27" strokeWidth="6" strokeLinecap="round"/>
        ))}
      </svg>

      {/* Tractor – right */}
      <svg style={{ position:'absolute', bottom:40, right:'2%', width:'20%', maxWidth:280, opacity:0.12 }}
        viewBox="0 0 320 220" fill="none">
        <circle cx="95" cy="155" r="62" stroke="#2d5a27" strokeWidth="10"/>
        <circle cx="95" cy="155" r="42" stroke="#2d5a27" strokeWidth="4"/>
        {[0,45,90,135,180,225,270,315].map(a => {
          const r=Math.PI/180,r1=44,r2=62
          return <line key={a}
            x1={95+r1*Math.cos(a*r)} y1={155+r1*Math.sin(a*r)}
            x2={95+r2*Math.cos(a*r)} y2={155+r2*Math.sin(a*r)}
            stroke="#2d5a27" strokeWidth="4"/>
        })}
        <circle cx="248" cy="168" r="36" stroke="#2d5a27" strokeWidth="8"/>
        <circle cx="248" cy="168" r="22" stroke="#2d5a27" strokeWidth="3"/>
        <rect x="105" y="90" width="145" height="75" rx="6" stroke="#2d5a27" strokeWidth="8"/>
        <rect x="220" y="108" width="70" height="50" rx="5" stroke="#2d5a27" strokeWidth="7"/>
        <rect x="270" y="70" width="10" height="45" rx="4" stroke="#2d5a27" strokeWidth="6"/>
        <rect x="110" y="42" width="95" height="55" rx="8" stroke="#2d5a27" strokeWidth="7"/>
        <rect x="122" y="52" width="70" height="32" rx="5" stroke="#2d5a27" strokeWidth="4"/>
        <line x1="35" y1="155" x2="5" y2="130" stroke="#2d5a27" strokeWidth="6" strokeLinecap="round"/>
        <line x1="35" y1="155" x2="5" y2="160" stroke="#2d5a27" strokeWidth="6" strokeLinecap="round"/>
        <line x1="35" y1="155" x2="5" y2="185" stroke="#2d5a27" strokeWidth="6" strokeLinecap="round"/>
        <line x1="5" y1="125" x2="5" y2="190" stroke="#2d5a27" strokeWidth="5" strokeLinecap="round"/>
        <line x1="158" y1="165" x2="215" y2="168" stroke="#2d5a27" strokeWidth="7" strokeLinecap="round"/>
      </svg>

      {/* Wheat – bottom */}
      <svg style={{ position:'absolute', bottom:0, width:'100%', opacity:0.14 }}
        viewBox="0 0 1440 160" fill="none" preserveAspectRatio="xMidYMax meet">
        {[50,120,200,300,380,1060,1140,1220,1300,1390].map((x,i) => {
          const h = 80+(i%3)*22
          return <g key={x} transform={`translate(${x},160)`}>
            <line x1="0" y1="0" x2={i%2===0?-7:7} y2={-h} stroke="#2d5a27" strokeWidth="3" strokeLinecap="round"/>
            {[-18,-9,0,9,18].map((oy,j) => (
              <ellipse key={j} cx={i%2===0?(-7+j*1.5):(7-j*1.5)} cy={-h+18+oy}
                rx="5" ry="9" stroke="#2d5a27" strokeWidth="2.5"
                transform={`rotate(${i%2===0?-20:20},${i%2===0?(-7+j*1.5):(7-j*1.5)},${-h+18+oy})`}/>
            ))}
          </g>
        })}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState('Dashboard');

  useEffect(() => {
    const load = async () => {
      try {
        const userId = localStorage.getItem('cw_user_id');
        if (!userId) { navigate('/login'); return; }
        const data = await getProfile(userId);
        if (data.success && data.user) setUser(data.user);
        else navigate('/login');
      } catch { navigate('/login'); }
      finally   { setLoading(false); }
    };
    load();
  }, [navigate]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { icon: '⊞', label: 'Dashboard' },
    { icon: '🌱', label: 'My Crops' },
    { icon: '🤖', label: 'AI Analysis' },
    { icon: '💡', label: 'Recommendations' },
    { icon: '📋', label: 'Reports' },
    { icon: '👤', label: 'Profile' },
    { icon: '⚙️', label: 'Settings' },
  ];

  const stats = [
    { label: 'TOTAL CROPS',     value: '12', color: '#ffffff' },
    { label: 'HEALTHY CROPS',   value: '10', color: '#81c784' },
    { label: 'NEEDS ATTENTION', value: '2',  color: '#e8a020' },
    { label: 'RECENT ANALYSES', value: '48', color: '#81c784' },
  ];

  const recentAnalyses = [
    { crop: 'Tomato', status: 'Severe blight warning', dot: '#e8a020' },
    { crop: 'Potato', status: 'Healthy',               dot: '#81c784' },
    { crop: 'Onion',  status: 'Mild nutrient stress',  dot: '#e8a020' },
  ];

  const alerts = [
    { msg: 'Apply fungicide to Tomato crop', color: 'rgba(232,160,32,0.25)' },
    { msg: 'Check soil moisture levels',      color: 'rgba(232,160,32,0.25)' },
    { msg: 'Potato growth is on track',       color: 'rgba(76,175,80,0.25)' },
  ];

  if (loading) return (
    <div className="db-loading">
      <div className="db-spinner"/>
      <p>Loading your farm…</p>
    </div>
  );

  const fullName = user?.name || 'Farmer';
  const mobile   = user?.mobile_number || '';
  const avatar   = user?.profile_picture;

  return (
    <div className="db-page">
      <FarmBg/>

      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        {/* Logo */}
        <div className="db-logo">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <path d="M18 4C18 4 10 10 10 20C10 26 14 30 18 32C22 30 26 26 26 20C26 10 18 4 18 4Z" fill="#4caf50"/>
            <path d="M18 14C18 14 12 18 12 24" stroke="#a5d6a7" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 14C18 14 24 18 24 24" stroke="#a5d6a7" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="db-logo-text">Crop<span>-wise</span></span>
        </div>

        {/* User info */}
        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          padding:'18px 20px 20px',
          borderBottom:'1px solid rgba(255,255,255,0.08)',
          marginBottom:8,
        }}>
          {avatar
            ? <img src={avatar} alt={fullName} style={{
                width:56, height:56, borderRadius:'50%', objectFit:'cover',
                border:'2px solid rgba(76,175,80,0.5)',
              }}/>
            : <div style={{
                width:56, height:56, borderRadius:'50%',
                background:'rgba(76,175,80,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:26,
              }}>👨‍🌾</div>
          }
          <p style={{ color:'white', fontWeight:700, fontSize:13.5, marginTop:10, textAlign:'center' }}>{fullName}</p>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginTop:2 }}>{mobile}</p>
        </div>

        {/* Nav */}
        <nav className="db-nav">
          {navItems.map(({ icon, label }) => (
            <button key={label}
              className={`db-nav-item${active===label?' active':''}`}
              onClick={() => setActive(label)}>
              <span className="db-nav-icon">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="db-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* ── Main ── */}
      <main className="db-main">
        {/* Top bar */}
        <header className="db-topbar">
          <div className="db-search-wrap">
            <span className="db-search-icon">🔍</span>
            <input className="db-search" placeholder="Search crops, reports…" type="search"/>
          </div>
          <button className="db-bell" aria-label="Notifications">🔔</button>
        </header>

        {/* Greeting */}
        <section className="db-greeting">
          <h1 className="db-greeting-title">{getGreeting()}, {fullName} 🌾</h1>
          <p className="db-greeting-sub">Here's what's happening across your farms today</p>
        </section>

        {/* Stats */}
        <section className="db-stats">
          {stats.map(s => (
            <div className="db-stat-card" key={s.label}>
              <p className="db-stat-label">{s.label}</p>
              <p className="db-stat-value" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </section>

        {/* Charts */}
        <section className="db-charts">
          {/* Donut */}
          <div className="db-card db-card-health">
            <h2 className="db-card-title">Crop Health Overview</h2>
            <div className="db-donut-wrap">
              <svg viewBox="0 0 120 120" className="db-donut">
                <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="18"/>
                <circle cx="60" cy="60" r="46" fill="none" stroke="#4caf50"
                  strokeWidth="18" strokeDasharray="240 289" strokeDashoffset="0"
                  transform="rotate(-90 60 60)" strokeLinecap="round"/>
                <circle cx="60" cy="60" r="46" fill="none" stroke="#e8a020"
                  strokeWidth="18" strokeDasharray="35 289" strokeDashoffset="-240"
                  transform="rotate(-90 60 60)"/>
                <circle cx="60" cy="60" r="46" fill="none" stroke="#e53e3e"
                  strokeWidth="18" strokeDasharray="14 289" strokeDashoffset="-275"
                  transform="rotate(-90 60 60)"/>
                <text x="60" y="56" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">83%</text>
                <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">Healthy</text>
              </svg>
              <div className="db-legend">
                <div className="db-legend-item"><span style={{background:'#4caf50'}}/>Healthy 83%</div>
                <div className="db-legend-item"><span style={{background:'#e8a020'}}/>Warning 12%</div>
                <div className="db-legend-item"><span style={{background:'#e53e3e'}}/>Critical 5%</div>
              </div>
            </div>
          </div>

          {/* Line chart */}
          <div className="db-card db-card-yield">
            <h2 className="db-card-title">Crop Performance (Yield Over Time)</h2>
            <div className="db-line-wrap">
              <svg viewBox="0 0 320 120" className="db-line-chart" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="yg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#4caf50" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#4caf50" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {[20,50,80,110].map(y=>(
                  <line key={y} x1="0" y1={y} x2="320" y2={y}
                    stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                ))}
                <polygon fill="url(#yg)"
                  points="20,90 60,70 100,80 140,55 180,65 220,45 260,55 300,40 300,120 20,120"/>
                <polyline fill="none" stroke="#4caf50" strokeWidth="2.5"
                  strokeLinejoin="round" strokeLinecap="round"
                  points="20,90 60,70 100,80 140,55 180,65 220,45 260,55 300,40"/>
                {[[20,90],[60,70],[100,80],[140,55],[180,65],[220,45],[260,55],[300,40]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="4" fill="#4caf50"/>
                ))}
              </svg>
            </div>
          </div>
        </section>

        {/* Bottom */}
        <section className="db-bottom">
          <div className="db-card">
            <h2 className="db-card-title">Recent AI Analyses</h2>
            <ul className="db-analyses-list">
              {recentAnalyses.map((a,i) => (
                <li key={i} className="db-analyses-item">
                  <span className="db-dot" style={{background:a.dot}}/>
                  <span><strong>{a.crop}</strong> — {a.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="db-card">
            <h2 className="db-card-title">Alerts</h2>
            <ul className="db-alerts-list">
              {alerts.map((a,i) => (
                <li key={i} className="db-alert-item" style={{background:a.color, color:'rgba(255,255,255,0.85)'}}>
                  {a.msg}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
