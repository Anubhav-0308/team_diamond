// auth-server backend  (otp-server.mjs — renamed in function, kept same filename)
// Endpoints: POST /register  POST /login  GET /profile  POST /update-profile
// Passwords are hashed with bcryptjs — NEVER stored as plain text
// Run: node otp-server.mjs   (keep running alongside npm run dev)

import http   from 'node:http'
import https  from 'node:https'
import crypto from 'node:crypto'
import { readFileSync } from 'node:fs'
import bcrypt from 'bcryptjs'

// ── Load .env ────────────────────────────────────────────────
try {
  const envFile = readFileSync('.env', 'utf8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key) process.env[key] = val
  }
} catch { /* rely on actual env vars */ }

const PORT         = 3001
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY || ''
const ID_SECRET    = process.env.OTP_SECRET || 'cropwise_otp_secret_2024'
const SALT_ROUNDS  = 10

// ── Derive stable UUID from mobile number ────────────────────
function mobileToUUID(mobile) {
  const hash = crypto.createHash('sha256').update(`cropwise:${mobile}:${ID_SECRET}`).digest('hex')
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '5' + hash.slice(13, 16),
    (parseInt(hash[16], 16) & 0x3 | 0x8).toString(16) + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join('-')
}

// ── HTTPS helpers ─────────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function jsonRes(res, status, data) {
  cors(res)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')) } catch { resolve({}) } })
    req.on('error', reject)
  })
}

function supabaseRest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url  = new URL(`${SUPABASE_URL}${path}`)
    const bodyStr = body ? JSON.stringify(body) : null
    const headers = {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation',
    }
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr)

    const req = https.request({
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method,
      headers,
    }, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data || 'null') }) }
        catch { resolve({ status: res.statusCode, data }) }
      })
    })
    req.on('error', reject)
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

async function uploadPhoto(userId, photoBase64, photoMime, photoExt) {
  if (!photoBase64 || !photoExt) return null
  const photoBuffer = Buffer.from(photoBase64, 'base64')
  const storagePath = `${userId}/avatar.${photoExt}`

  return new Promise((resolve) => {
    const url = new URL(`${SUPABASE_URL}/storage/v1/object/profile-photos/${storagePath}`)
    const req = https.request({
      hostname: url.hostname,
      path:     url.pathname,
      method:   'PUT',
      headers:  {
        'apikey':         SERVICE_KEY,
        'Authorization':  `Bearer ${SERVICE_KEY}`,
        'Content-Type':   photoMime || 'image/jpeg',
        'Content-Length': photoBuffer.length,
        'x-upsert':       'true',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c)
      res.on('end', () => {
        if (res.statusCode < 300) {
          const url = `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${storagePath}`
          console.log(`✅ Photo uploaded: ${storagePath}`)
          resolve(url)
        } else {
          console.warn('⚠️  Photo upload failed:', d)
          resolve(null)
        }
      })
    })
    req.on('error', () => resolve(null))
    req.write(photoBuffer)
    req.end()
  })
}

// ── Route: POST /register ────────────────────────────────────
async function handleRegister(req, res) {
  const { name, mobile, email, password, photoBase64, photoMime, photoExt } = await readBody(req)

  // ── Validation ──
  if (!name || !name.trim())
    return jsonRes(res, 400, { success: false, message: 'Full name is required.' })

  const cleanMobile = String(mobile || '').replace(/\D/g, '')
  if (cleanMobile.length !== 10)
    return jsonRes(res, 400, { success: false, message: 'Enter a valid 10-digit mobile number.' })

  if (!password || password.length < 6)
    return jsonRes(res, 400, { success: false, message: 'Password must be at least 6 characters.' })

  if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return jsonRes(res, 400, { success: false, message: 'Enter a valid email address.' })

  try {
    // ── Check if mobile already exists ──
    const existing = await supabaseRest(
      `/rest/v1/users?mobile_number=eq.%2B91${cleanMobile}&select=id&limit=1`
    )
    if (Array.isArray(existing.data) && existing.data.length > 0) {
      return jsonRes(res, 409, {
        success: false,
        message: 'An account with this mobile number already exists. Please login.',
      })
    }

    // ── Hash password ──
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    // ── Derive userId ──
    const userId = mobileToUUID(cleanMobile)

    // ── Upload profile photo ──
    const profilePicture = await uploadPhoto(userId, photoBase64, photoMime, photoExt)

    // ── Insert user ──
    const insertRes = await supabaseRest('/rest/v1/users', 'POST', {
      id:               userId,
      name:             name.trim(),
      mobile_number:    `+91${cleanMobile}`,
      email:            email?.trim() || null,
      profile_picture:  profilePicture,
      password_hash:    passwordHash,
    })

    if (insertRes.status >= 300) {
      console.error('Insert failed:', insertRes.data)
      return jsonRes(res, 500, { success: false, message: 'Registration failed. Please try again.' })
    }

    console.log(`✅ Registered: ${name.trim()} (+91${cleanMobile})`)
    return jsonRes(res, 200, {
      success: true,
      userId,
      message: 'Registration successful!',
    })

  } catch (err) {
    console.error('Register error:', err.message)
    return jsonRes(res, 500, { success: false, message: 'Server error: ' + err.message })
  }
}

// ── Route: POST /login ───────────────────────────────────────
async function handleLogin(req, res) {
  const { mobile, password } = await readBody(req)

  const cleanMobile = String(mobile || '').replace(/\D/g, '')
  if (cleanMobile.length !== 10)
    return jsonRes(res, 400, { success: false, message: 'Enter a valid 10-digit mobile number.' })

  if (!password)
    return jsonRes(res, 400, { success: false, message: 'Password is required.' })

  try {
    // ── Fetch user by mobile ──
    const result = await supabaseRest(
      `/rest/v1/users?mobile_number=eq.%2B91${cleanMobile}&select=*&limit=1`
    )

    if (!Array.isArray(result.data) || result.data.length === 0) {
      return jsonRes(res, 404, {
        success: false,
        message: 'Account not found. Please register first.',
        notFound: true,
      })
    }

    const user = result.data[0]

    // ── Compare password ──
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return jsonRes(res, 401, {
        success: false,
        message: 'Incorrect mobile number or password.',
      })
    }

    // ── Return safe user (no password hash) ──
    const { password_hash, ...safeUser } = user
    console.log(`✅ Login: ${user.name} (+91${cleanMobile})`)

    return jsonRes(res, 200, {
      success: true,
      userId: user.id,
      user: safeUser,
      message: 'Login successful!',
    })

  } catch (err) {
    console.error('Login error:', err.message)
    return jsonRes(res, 500, { success: false, message: 'Server error: ' + err.message })
  }
}

// ── Route: GET /profile?userId=... ──────────────────────────
async function handleGetProfile(req, res) {
  const url    = new URL(req.url, `http://localhost:${PORT}`)
  const userId = url.searchParams.get('userId')

  if (!userId) return jsonRes(res, 400, { success: false, message: 'Missing userId' })

  try {
    const result = await supabaseRest(`/rest/v1/users?id=eq.${userId}&select=id,name,mobile_number,email,profile_picture,created_at`)
    const rows   = Array.isArray(result.data) ? result.data : []

    if (rows.length === 0)
      return jsonRes(res, 404, { success: false, message: 'User not found' })

    return jsonRes(res, 200, { success: true, user: rows[0] })
  } catch (err) {
    console.error('get-profile error:', err.message)
    return jsonRes(res, 500, { success: false, message: err.message })
  }
}

// ── Server ───────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); res.end(); return }

  if (req.method === 'POST' && req.url === '/register')          return handleRegister(req, res)
  if (req.method === 'POST' && req.url === '/login')             return handleLogin(req, res)
  if (req.method === 'GET'  && req.url.startsWith('/profile'))   return handleGetProfile(req, res)

  jsonRes(res, 404, { error: 'Not found' })
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!\n   Stop the existing server first.\n`)
    process.exit(1)
  }
  throw err
})

server.listen(PORT, () => {
  console.log('═'.repeat(52))
  console.log('🌾  Crop-wise Auth Server  (Mobile + Password)')
  console.log(`📡  Running at http://localhost:${PORT}`)
  console.log('─'.repeat(52))
  console.log(`  Supabase : ${SUPABASE_URL || '⚠️  NOT SET'}`)
  console.log(`  Svc Key  : ${SERVICE_KEY ? '✅ Set' : '⚠️  NOT SET'}`)
  console.log('─'.repeat(52))
  console.log('  POST /register  → create account (bcrypt)')
  console.log('  POST /login     → verify password (bcrypt)')
  console.log('  GET  /profile   → load user profile')
  console.log('─'.repeat(52))
  console.log('⚡  Keep this running alongside: npm run dev')
  console.log('═'.repeat(52))
})
