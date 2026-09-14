import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../lib/authService'

export default function Login() {
  const navigate = useNavigate()
  const [mobile,   setMobile]   = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const cleanMobile = mobile.replace(/\D/g, '')
  const isValid = cleanMobile.length === 10 && password.length > 0

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true); setError('')
    try {
      const data = await loginUser(cleanMobile, password)
      if (data.success) {
        navigate('/dashboard')
      } else if (data.notFound) {
        setError('Account not found. Please register first.')
      } else {
        setError(data.message || 'Incorrect mobile number or password.')
      }
    } catch {
      setError('Cannot connect to server. Make sure the auth server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-page {
          min-height: 100vh;
          background: #dde8d6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Farm background illustration ── */
        .lp-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* Field rows – left side */
        .lp-field-svg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 42%;
          opacity: 0.22;
        }

        /* Tractor – right side */
        .lp-tractor-svg {
          position: absolute;
          bottom: 60px;
          right: 4%;
          width: 28%;
          max-width: 340px;
          opacity: 0.18;
        }

        /* Wheat plants – bottom */
        .lp-wheat-svg {
          position: absolute;
          bottom: 0;
          width: 100%;
          opacity: 0.2;
        }

        /* ── Logo above card ── */
        .lp-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
          position: relative;
          z-index: 2;
        }

        .lp-logo-text {
          font-size: 28px;
          font-weight: 800;
          color: #2d5a27;
          letter-spacing: -0.5px;
        }

        /* ── Card ── */
        .lp-card {
          background: #1c2e1c;
          border-radius: 20px;
          padding: 36px 40px 28px;
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 2;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
          animation: cardIn 0.45s cubic-bezier(0.22,1,0.36,1);
        }

        @keyframes cardIn {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .lp-card-title {
          font-size: 26px;
          font-weight: 700;
          color: #ffffff;
          text-align: center;
          margin-bottom: 28px;
          letter-spacing: -0.3px;
        }

        /* Error */
        .lp-error {
          background: rgba(229,62,62,0.15);
          border: 1px solid rgba(229,62,62,0.35);
          border-radius: 10px;
          color: #ff8a80;
          font-size: 13px;
          padding: 10px 13px;
          margin-bottom: 18px;
          display: flex; gap: 7px; align-items: flex-start;
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }

        .lp-go-reg {
          color: #4caf50; cursor: pointer; text-decoration: underline;
          background:none; border:none; font-size:13px; font-family:inherit;
          padding:0; margin-left:4px;
        }

        /* ── Field labels ── */
        .lp-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          margin-bottom: 8px;
        }

        /* ── Mobile input row ── */
        .lp-phone-row {
          display: flex;
          align-items: center;
          border-bottom: 1.5px solid rgba(255,255,255,0.15);
          padding-bottom: 9px;
          margin-bottom: 24px;
          transition: border-color 0.2s;
        }
        .lp-phone-row:focus-within { border-bottom-color: rgba(76,175,80,0.7); }

        .lp-flag-btn {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.08);
          border: none; border-radius: 6px;
          padding: 5px 9px;
          color: rgba(255,255,255,0.85);
          font-size: 13.5px; font-weight: 600;
          font-family: inherit;
          cursor: default;
          white-space: nowrap;
          margin-right: 10px;
        }

        .lp-divider-v {
          width: 1px; height: 20px;
          background: rgba(255,255,255,0.15);
          margin-right: 10px;
          flex-shrink: 0;
        }

        .lp-phone-input {
          flex: 1;
          background: transparent; border: none; outline: none;
          font-size: 14.5px; font-family: inherit;
          color: #ffffff; caret-color: #4caf50;
        }
        .lp-phone-input::placeholder { color: rgba(255,255,255,0.3); }

        /* ── Password row ── */
        .lp-pwd-field { margin-bottom: 6px; }

        .lp-pwd-row {
          display: flex; align-items: center;
          border-bottom: 1.5px solid rgba(255,255,255,0.15);
          padding-bottom: 9px;
          transition: border-color 0.2s;
        }
        .lp-pwd-row:focus-within { border-bottom-color: rgba(76,175,80,0.7); }

        .lp-pwd-input {
          flex: 1;
          background: transparent; border: none; outline: none;
          font-size: 14.5px; font-family: inherit;
          color: #ffffff; caret-color: #4caf50;
        }
        .lp-pwd-input::placeholder { color: rgba(255,255,255,0.3); }

        .lp-eye {
          background: none; border: none; cursor: pointer;
          font-size: 17px; opacity: 0.5; padding: 0;
          transition: opacity 0.2s; line-height: 1;
        }
        .lp-eye:hover { opacity: 0.85; }

        /* ── Remember + Forgot row ── */
        .lp-extras {
          display: flex; align-items: center;
          justify-content: space-between;
          margin: 18px 0 26px;
        }

        .lp-remember {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; color: rgba(255,255,255,0.55);
          cursor: pointer; user-select: none;
        }

        .lp-remember input[type="checkbox"] {
          width: 14px; height: 14px;
          accent-color: #4caf50;
          cursor: pointer;
        }

        .lp-forgot {
          background: none; border: none;
          color: #4caf50; font-size: 13px; font-weight: 500;
          font-family: inherit; cursor: pointer; padding: 0;
          text-decoration: underline; text-underline-offset: 2px;
          opacity: 0.85; transition: opacity 0.2s;
        }
        .lp-forgot:hover { opacity: 1; }

        /* ── Login button – WHITE pill ── */
        .lp-btn {
          width: 100%;
          padding: 14px;
          background: #ffffff;
          color: #1a2e1a;
          border: none;
          border-radius: 50px;
          font-size: 15.5px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 0.2px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .lp-btn:hover:not(:disabled) {
          background: #f0f7ee;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .lp-spinner {
          display:inline-block; width:15px; height:15px;
          border:2.5px solid rgba(26,46,26,0.25); border-top-color:#1a2e1a;
          border-radius:50%; animation:spin 0.7s linear infinite;
          vertical-align:middle; margin-right:7px;
        }
        @keyframes spin { to{transform:rotate(360deg);} }

        /* ── Footer ── */
        .lp-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }
        .lp-footer button {
          background: none; border: none;
          color: #4caf50; font-size: 13px; font-weight: 600;
          font-family: inherit; cursor: pointer; padding: 0;
          text-decoration: underline; text-underline-offset: 2px;
          margin-left: 3px;
        }
        .lp-footer button:hover { color: #81c784; }

        @media(max-width:500px){
          .lp-card { padding:28px 24px 22px; margin:0 16px; }
          .lp-logo-text { font-size:24px; }
        }
      `}</style>

      <div className="lp-page">

        {/* ── Farm Background SVGs ── */}
        <div className="lp-bg">

          {/* Plowed field rows – bottom left */}
          <svg className="lp-field-svg" viewBox="0 0 500 380" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
              <path key={i}
                d={`M ${-20 + i*10} 380 Q ${100 + i*12} ${280 - i*5} ${260 + i*8} ${200 - i*3} T ${520} ${120 - i*4}`}
                stroke="#2d5a27" strokeWidth="6" strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Tractor – right */}
          <svg className="lp-tractor-svg" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Big rear wheel */}
            <circle cx="95" cy="155" r="62" stroke="#2d5a27" strokeWidth="10"/>
            <circle cx="95" cy="155" r="42" stroke="#2d5a27" strokeWidth="4"/>
            {[0,45,90,135,180,225,270,315].map(a => {
              const r1=44, r2=62, rad=a*Math.PI/180
              return <line key={a}
                x1={95+r1*Math.cos(rad)} y1={155+r1*Math.sin(rad)}
                x2={95+r2*Math.cos(rad)} y2={155+r2*Math.sin(rad)}
                stroke="#2d5a27" strokeWidth="4"/>
            })}
            {/* Small front wheel */}
            <circle cx="248" cy="168" r="36" stroke="#2d5a27" strokeWidth="8"/>
            <circle cx="248" cy="168" r="22" stroke="#2d5a27" strokeWidth="3"/>
            {/* Body */}
            <rect x="105" y="90" width="145" height="75" rx="6" stroke="#2d5a27" strokeWidth="8"/>
            {/* Hood/engine */}
            <rect x="220" y="108" width="70" height="50" rx="5" stroke="#2d5a27" strokeWidth="7"/>
            {/* Exhaust pipe */}
            <rect x="270" y="70" width="10" height="45" rx="4" stroke="#2d5a27" strokeWidth="6"/>
            <ellipse cx="275" cy="70" rx="8" ry="4" stroke="#2d5a27" strokeWidth="4"/>
            {/* Cabin */}
            <rect x="110" y="42" width="95" height="55" rx="8" stroke="#2d5a27" strokeWidth="7"/>
            {/* Cabin window */}
            <rect x="122" y="52" width="70" height="32" rx="5" stroke="#2d5a27" strokeWidth="4"/>
            {/* Plow arms at back */}
            <line x1="35" y1="155" x2="5" y2="130" stroke="#2d5a27" strokeWidth="6" strokeLinecap="round"/>
            <line x1="35" y1="155" x2="5" y2="160" stroke="#2d5a27" strokeWidth="6" strokeLinecap="round"/>
            <line x1="35" y1="155" x2="5" y2="185" stroke="#2d5a27" strokeWidth="6" strokeLinecap="round"/>
            <line x1="5" y1="125" x2="5" y2="190" stroke="#2d5a27" strokeWidth="5" strokeLinecap="round"/>
            {/* Chassis connection */}
            <line x1="158" y1="165" x2="215" y2="168" stroke="#2d5a27" strokeWidth="7" strokeLinecap="round"/>
          </svg>

          {/* Wheat plants – bottom strip */}
          <svg className="lp-wheat-svg" viewBox="0 0 1440 180" fill="none" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
            {[40,90,150,200,260,310,370,1090,1150,1200,1260,1310,1370,1400].map((x, i) => {
              const h = 90 + (i%3)*25
              return (
                <g key={x} transform={`translate(${x}, ${180})`}>
                  <line x1="0" y1="0" x2={i%2===0?-8:8} y2={-h} stroke="#2d5a27" strokeWidth="3" strokeLinecap="round"/>
                  {[-20,-10,0,10,20].map((oy,j) => (
                    <ellipse key={j} cx={i%2===0 ? (-8 + j*2) : (8 - j*2)}
                      cy={-h + 20 + oy}
                      rx="5" ry="10"
                      stroke="#2d5a27" strokeWidth="2.5"
                      transform={`rotate(${i%2===0 ? -20:20}, ${i%2===0 ? (-8 + j*2) : (8 - j*2)}, ${-h + 20 + oy})`}
                    />
                  ))}
                </g>
              )
            })}
          </svg>
        </div>

        {/* ── Logo above card ── */}
        <div className="lp-logo">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M18 4 C18 4 10 10 10 20 C10 26 14 30 18 32 C22 30 26 26 26 20 C26 10 18 4 18 4Z" fill="#3a7a2a"/>
            <path d="M18 14 C18 14 12 18 12 24" stroke="#6abf5e" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 14 C18 14 24 18 24 24" stroke="#6abf5e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="lp-logo-text">Crop-wise</span>
        </div>

        {/* ── Card ── */}
        <div className="lp-card">
          <h1 className="lp-card-title">login</h1>

          {error && (
            <div className="lp-error">
              <span>⚠️</span>
              <span>
                {error}
                {error.includes('register') && (
                  <button className="lp-go-reg" onClick={() => navigate('/register')}>Register →</button>
                )}
              </span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>

            {/* Mobile Number */}
            <label className="lp-label">Mobile Number</label>
            <div className="lp-phone-row">
              <div className="lp-flag-btn">🇮🇳 +91 ▾</div>
              <div className="lp-divider-v" />
              <input
                className="lp-phone-input"
                type="tel" inputMode="numeric" maxLength={10}
                placeholder="Enter mobile number"
                value={mobile}
                onChange={e => { setMobile(e.target.value.replace(/\D/g,'').slice(0,10)); setError('') }}
                autoFocus autoComplete="tel"
              />
            </div>

            {/* Password */}
            <div className="lp-pwd-field">
              <label className="lp-label">Password</label>
              <div className="lp-pwd-row">
                <input
                  className="lp-pwd-input"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  autoComplete="current-password"
                />
                <button type="button" className="lp-eye" onClick={() => setShowPwd(p => !p)} aria-label="Toggle password">
                  {showPwd ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="lp-extras">
              <label className="lp-remember">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember Me
              </label>
              <button type="button" className="lp-forgot">Forgot Password?</button>
            </div>

            {/* Login button */}
            <button type="submit" className="lp-btn" id="login-btn" disabled={loading || !isValid}>
              {loading ? <><span className="lp-spinner" />Logging in…</> : 'Login'}
            </button>
          </form>

          <div className="lp-footer">
            Don't have any account?
            <button onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>

      </div>
    </>
  )
}
