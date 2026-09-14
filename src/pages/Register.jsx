import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../lib/authService'

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function Register() {
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const [form, setForm] = useState({ name:'', mobile:'', email:'', password:'' })
  const [photoFile,    setPhotoFile]    = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [showPwd,      setShowPwd]      = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')

  const field = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError('') }
  const cleanMobile = form.mobile.replace(/\D/g, '')

  const handlePhoto = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('Please select a valid image.'); return }
    if (f.size > MAX_FILE_SIZE)        { setError('Image must be under 5 MB.'); return }
    setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); setError('')
  }

  const validate = () => {
    if (!form.name.trim())         return 'Full name is required.'
    if (cleanMobile.length !== 10) return 'Enter a valid 10-digit mobile number.'
    if (form.password.length < 6)  return 'Password must be at least 6 characters.'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
                                   return 'Enter a valid email address.'
    return null
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      let photoBase64=null, photoMime=null, photoExt=null
      if (photoFile) {
        photoMime = photoFile.type; photoExt = photoFile.name.split('.').pop()
        photoBase64 = await new Promise((resolve, reject) => {
          const r = new FileReader()
          r.onload  = () => resolve(r.result.split(',')[1])
          r.onerror = reject
          r.readAsDataURL(photoFile)
        })
      }
      const data = await registerUser({
        name: form.name.trim(), mobile: cleanMobile,
        email: form.email.trim()||null, password: form.password,
        photoBase64, photoMime, photoExt,
      })
      if (data.success) {
        setSuccess('Account created! Redirecting…')
        setTimeout(() => navigate('/dashboard'), 900)
      } else if (data.message?.includes('already exists')) {
        setError('An account with this mobile number already exists.')
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch {
      setError('Cannot connect to server. Make sure the auth server is running.')
    } finally { setLoading(false) }
  }

  const canSubmit = form.name.trim() && cleanMobile.length===10 && form.password.length>=6

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .rp-page {
          min-height: 100vh;
          background: #dde8d6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter','Outfit',sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px 16px;
        }

        .rp-bg { position:absolute; inset:0; pointer-events:none; overflow:hidden; }

        .rp-field-svg   { position:absolute; bottom:0; left:0; width:42%; opacity:0.22; }
        .rp-tractor-svg { position:absolute; bottom:60px; right:4%; width:28%; max-width:340px; opacity:0.18; }
        .rp-wheat-svg   { position:absolute; bottom:0; width:100%; opacity:0.2; }

        /* Logo */
        .rp-logo {
          display:flex; align-items:center; gap:10px;
          margin-bottom:18px; position:relative; z-index:2;
        }
        .rp-logo-text {
          font-size:26px; font-weight:800;
          color:#2d5a27; letter-spacing:-0.5px;
        }

        /* Card */
        .rp-card {
          background: #1c2e1c;
          border-radius: 20px;
          padding: 32px 40px 26px;
          width: 100%; max-width: 460px;
          position: relative; z-index: 2;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
          animation: cardIn 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }

        .rp-card-title {
          font-size:24px; font-weight:700;
          color:#ffffff; text-align:center; margin-bottom:22px;
        }

        /* Alerts */
        .rp-alert {
          border-radius:10px; font-size:13px;
          padding:10px 13px; margin-bottom:16px;
          display:flex; gap:7px; align-items:flex-start;
          animation:fadeIn 0.3s;
        }
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        .rp-err { background:rgba(229,62,62,0.15); border:1px solid rgba(229,62,62,0.35); color:#ff8a80; }
        .rp-suc { background:rgba(76,175,80,0.15); border:1px solid rgba(76,175,80,0.35); color:#81c784; }
        .rp-link-btn {
          color:#4caf50; cursor:pointer; text-decoration:underline;
          background:none; border:none; font-size:13px; font-family:inherit; padding:0; margin-left:4px;
        }

        /* Photo */
        .rp-photo-wrap {
          display:flex; flex-direction:column; align-items:center;
          gap:8px; margin-bottom:20px; cursor:pointer; position:relative;
        }
        .rp-photo-circle {
          width:70px; height:70px; border-radius:50%;
          border:2px dashed rgba(76,175,80,0.45);
          background:rgba(76,175,80,0.08);
          display:flex; align-items:center; justify-content:center;
          font-size:28px; overflow:hidden; transition:all 0.2s;
        }
        .rp-photo-wrap:hover .rp-photo-circle { border-color:rgba(76,175,80,0.8); background:rgba(76,175,80,0.14); }
        .rp-photo-circle img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
        .rp-photo-lbl {
          font-size:11.5px; font-weight:600;
          color:rgba(76,175,80,0.65); letter-spacing:0.8px; text-transform:uppercase;
        }

        /* Field */
        .rp-label {
          display:block; font-size:13px; font-weight:500;
          color:rgba(255,255,255,0.55); margin-bottom:7px;
        }
        .rp-opt { color:rgba(255,255,255,0.3); font-size:11px; }

        .rp-field-row {
          display:flex; align-items:center;
          border-bottom:1.5px solid rgba(255,255,255,0.15);
          padding-bottom:9px; margin-bottom:20px;
          transition:border-color 0.2s;
        }
        .rp-field-row:focus-within { border-bottom-color:rgba(76,175,80,0.7); }

        .rp-flag-btn {
          display:flex; align-items:center; gap:4px;
          background:rgba(255,255,255,0.08); border:none; border-radius:6px;
          padding:4px 8px; color:rgba(255,255,255,0.85);
          font-size:13px; font-weight:600; font-family:inherit;
          cursor:default; white-space:nowrap; margin-right:10px;
        }
        .rp-divv { width:1px; height:18px; background:rgba(255,255,255,0.15); margin-right:10px; flex-shrink:0; }

        .rp-input {
          flex:1; background:transparent; border:none; outline:none;
          font-size:14.5px; font-family:inherit;
          color:#fff; caret-color:#4caf50;
        }
        .rp-input::placeholder { color:rgba(255,255,255,0.3); }

        .rp-eye {
          background:none; border:none; cursor:pointer;
          font-size:16px; opacity:0.5; padding:0; transition:opacity 0.2s;
        }
        .rp-eye:hover { opacity:0.85; }

        .rp-hint { font-size:11px; color:#ff8a80; margin-top:4px; margin-bottom:12px; }

        /* Button */
        .rp-btn {
          width:100%; padding:14px;
          background:#ffffff; color:#1a2e1a;
          border:none; border-radius:50px;
          font-size:15px; font-weight:700; font-family:inherit;
          cursor:pointer; transition:all 0.25s;
          box-shadow:0 2px 12px rgba(0,0,0,0.2);
          margin-top:6px;
        }
        .rp-btn:hover:not(:disabled){ background:#f0f7ee; transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.25); }
        .rp-btn:active:not(:disabled){ transform:translateY(0); }
        .rp-btn:disabled{ opacity:0.4; cursor:not-allowed; transform:none; }

        .rp-spinner {
          display:inline-block; width:14px; height:14px;
          border:2.5px solid rgba(26,46,26,0.25); border-top-color:#1a2e1a;
          border-radius:50%; animation:spin 0.7s linear infinite;
          vertical-align:middle; margin-right:6px;
        }
        @keyframes spin{to{transform:rotate(360deg);}}

        .rp-footer {
          text-align:center; margin-top:18px;
          font-size:13px; color:rgba(255,255,255,0.4);
        }
        .rp-footer button {
          background:none; border:none; color:#4caf50;
          font-size:13px; font-weight:600; font-family:inherit;
          cursor:pointer; padding:0; text-decoration:underline;
          text-underline-offset:2px; margin-left:3px;
        }
        .rp-footer button:hover{ color:#81c784; }

        @media(max-width:500px){
          .rp-card{ padding:26px 22px 20px; margin:0 10px; }
        }
      `}</style>

      <div className="rp-page">

        {/* Farm BG */}
        <div className="rp-bg">
          <svg className="rp-field-svg" viewBox="0 0 500 380" fill="none">
            {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
              <path key={i}
                d={`M ${-20+i*10} 380 Q ${100+i*12} ${280-i*5} ${260+i*8} ${200-i*3} T ${520} ${120-i*4}`}
                stroke="#2d5a27" strokeWidth="6" strokeLinecap="round"/>
            ))}
          </svg>
          <svg className="rp-tractor-svg" viewBox="0 0 320 220" fill="none">
            <circle cx="95" cy="155" r="62" stroke="#2d5a27" strokeWidth="10"/>
            <circle cx="95" cy="155" r="42" stroke="#2d5a27" strokeWidth="4"/>
            {[0,45,90,135,180,225,270,315].map(a => {
              const r1=44,r2=62,rad=a*Math.PI/180
              return <line key={a} x1={95+r1*Math.cos(rad)} y1={155+r1*Math.sin(rad)} x2={95+r2*Math.cos(rad)} y2={155+r2*Math.sin(rad)} stroke="#2d5a27" strokeWidth="4"/>
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
          <svg className="rp-wheat-svg" viewBox="0 0 1440 180" fill="none" preserveAspectRatio="xMidYMax meet">
            {[40,90,150,200,260,310,370,1090,1150,1200,1260,1310,1370,1400].map((x,i)=>{
              const h=90+(i%3)*25
              return <g key={x} transform={`translate(${x},180)`}>
                <line x1="0" y1="0" x2={i%2===0?-8:8} y2={-h} stroke="#2d5a27" strokeWidth="3" strokeLinecap="round"/>
                {[-20,-10,0,10,20].map((oy,j)=>(
                  <ellipse key={j} cx={i%2===0?(-8+j*2):(8-j*2)} cy={-h+20+oy}
                    rx="5" ry="10" stroke="#2d5a27" strokeWidth="2.5"
                    transform={`rotate(${i%2===0?-20:20},${i%2===0?(-8+j*2):(8-j*2)},${-h+20+oy})`}/>
                ))}
              </g>
            })}
          </svg>
        </div>

        {/* Logo */}
        <div className="rp-logo">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M18 4 C18 4 10 10 10 20 C10 26 14 30 18 32 C22 30 26 26 26 20 C26 10 18 4 18 4Z" fill="#3a7a2a"/>
            <path d="M18 14 C18 14 12 18 12 24" stroke="#6abf5e" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 14 C18 14 24 18 24 24" stroke="#6abf5e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="rp-logo-text">Crop-wise</span>
        </div>

        {/* Card */}
        <div className="rp-card">
          <h1 className="rp-card-title">create account</h1>

          {error && <div className="rp-alert rp-err"><span>⚠️</span><span>{error}{error.includes('already exists')&&<button className="rp-link-btn" onClick={()=>navigate('/login')}>Login →</button>}</span></div>}
          {success && <div className="rp-alert rp-suc"><span>✅</span><span>{success}</span></div>}

          <form onSubmit={handleRegister} noValidate>

            {/* Photo */}
            <div className="rp-photo-wrap" onClick={()=>fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto}
                style={{position:'absolute',inset:0,opacity:0,cursor:'pointer',width:'100%',height:'100%'}}/>
              <div className="rp-photo-circle">
                {photoPreview ? <img src={photoPreview} alt="Preview"/> : '👨‍🌾'}
              </div>
              <span className="rp-photo-lbl">{photoPreview?'Change Photo':'Upload Photo'}</span>
            </div>

            {/* Name */}
            <label className="rp-label">Full Name</label>
            <div className="rp-field-row">
              <input className="rp-input" type="text" placeholder="Your full name"
                value={form.name} onChange={e=>field('name',e.target.value)} autoFocus autoComplete="name"/>
            </div>

            {/* Mobile */}
            <label className="rp-label">Mobile Number</label>
            <div className="rp-field-row">
              <div className="rp-flag-btn">🇮🇳 +91 ▾</div>
              <div className="rp-divv"/>
              <input className="rp-input" type="tel" inputMode="numeric" maxLength={10}
                placeholder="Enter mobile number"
                value={form.mobile} onChange={e=>field('mobile',e.target.value.replace(/\D/g,'').slice(0,10))}
                autoComplete="tel"/>
            </div>

            {/* Email */}
            <label className="rp-label">Email <span className="rp-opt">(optional)</span></label>
            <div className="rp-field-row">
              <input className="rp-input" type="email" placeholder="your@email.com"
                value={form.email} onChange={e=>field('email',e.target.value)} autoComplete="email"/>
            </div>

            {/* Password */}
            <label className="rp-label">Password</label>
            <div className="rp-field-row">
              <input className="rp-input" type={showPwd?'text':'password'}
                placeholder="Min. 6 characters"
                value={form.password} onChange={e=>field('password',e.target.value)} autoComplete="new-password"/>
              <button type="button" className="rp-eye" onClick={()=>setShowPwd(p=>!p)}>
                {showPwd?'👁️':'🙈'}
              </button>
            </div>
            {form.password.length>0&&form.password.length<6&&(
              <p className="rp-hint">Password must be at least 6 characters</p>
            )}

            <button type="submit" className="rp-btn" id="register-btn" disabled={loading||!canSubmit}>
              {loading?<><span className="rp-spinner"/>Creating account…</>:'Create Account'}
            </button>
          </form>

          <div className="rp-footer">
            Already have an account?
            <button onClick={()=>navigate('/login')}>Login</button>
          </div>
        </div>
      </div>
    </>
  )
}
