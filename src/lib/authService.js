// src/lib/authService.js
// Calls the local auth server (otp-server.mjs on port 3001)

const AUTH_SERVER = 'http://localhost:3001'

/**
 * Register a new user
 */
export async function registerUser({ name, mobile, email, password, photoBase64, photoMime, photoExt }) {
  const res = await fetch(`${AUTH_SERVER}/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, mobile, email, password, photoBase64, photoMime, photoExt }),
  })
  const data = await res.json()
  if (data.success) {
    localStorage.setItem('cw_user_id', data.userId)
    localStorage.setItem('cw_mobile', mobile)
  }
  return data
}

/**
 * Login with mobile + password
 */
export async function loginUser(mobile, password) {
  const res = await fetch(`${AUTH_SERVER}/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ mobile, password }),
  })
  const data = await res.json()
  if (data.success) {
    localStorage.setItem('cw_user_id', data.userId)
    localStorage.setItem('cw_mobile', mobile)
  }
  return data
}

/**
 * Load user profile by userId
 */
export async function getProfile(userId) {
  const res  = await fetch(`${AUTH_SERVER}/profile?userId=${userId}`)
  return res.json()
}

/**
 * Logout — clear session
 */
export function logout() {
  localStorage.removeItem('cw_user_id')
  localStorage.removeItem('cw_mobile')
}
