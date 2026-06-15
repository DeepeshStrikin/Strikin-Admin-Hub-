// Admin API client. Points at the backend; in production set VITE_API_URL to the
// Railway URL (e.g. https://strikin-api.up.railway.app).
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const apiBase = BASE

const token = () => localStorage.getItem('strikin_admin_token') || ''

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let msg = `Error ${res.status}`
    try { const j = await res.json(); msg = j.detail || msg } catch { /* ignore */ }
    throw new Error(msg)
  }
  return res.status === 204 ? null : res.json()
}

// Resolve a stored image URL (e.g. "/assets/img_x") to an absolute URL for <img>.
export const imgUrl = (u) => (u && u.startsWith('/assets/') ? BASE + u : u)

async function uploadImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(BASE + '/admin/upload', {
    method: 'POST', headers: { 'X-Admin-Token': token() }, body: fd,
  })
  if (!res.ok) throw new Error('Upload failed')
  return (await res.json()).url
}

export const api = {
  login: (password) => req('POST', '/admin/login', { password }),

  activities: () => req('GET', '/activities'),
  bays: (activityId) => req('GET', `/activities/${activityId}/bays`),
  food: () => req('GET', '/food'),

  uploadImage,
  bookings: () => req('GET', '/admin/bookings'),
  addBooking: (d) => req('POST', '/admin/bookings/create', d),
  revenue: () => req('GET', '/admin/revenue'),
  stats: () => req('GET', '/admin/stats'),

  discounts: () => req('GET', '/admin/discounts'),
  createDiscount: (d) => req('POST', '/admin/discounts', d),
  updateDiscount: (id, d) => req('PUT', `/admin/discounts/${id}`, d),
  deleteDiscount: (id) => req('DELETE', `/admin/discounts/${id}`),

  events: () => req('GET', '/admin/events'),
  createEvent: (d) => req('POST', '/admin/events', d),
  updateEvent: (id, d) => req('PUT', `/admin/events/${id}`, d),
  deleteEvent: (id) => req('DELETE', `/admin/events/${id}`),

  corporates: () => req('GET', '/admin/corporates'),
  communications: () => req('GET', '/admin/communications'),
  getSettings: () => req('GET', '/admin/settings'),
  saveSettings: (d) => req('PUT', '/admin/settings', d),

  createActivity: (d) => req('POST', '/admin/activities', d),
  updateActivity: (id, d) => req('PUT', `/admin/activities/${id}`, d),
  deleteActivity: (id) => req('DELETE', `/admin/activities/${id}`),

  createBay: (d) => req('POST', '/admin/bays', d),
  updateBay: (id, d) => req('PUT', `/admin/bays/${id}`, d),
  deleteBay: (id) => req('DELETE', `/admin/bays/${id}`),

  tiers: (activityId) => req('GET', `/activities/${activityId}/tiers`),
  saveTier: (d) => req('POST', '/admin/tiers', d),
  deleteTier: (activityId, key) =>
    req('DELETE', `/admin/tiers?activity_type_id=${encodeURIComponent(activityId)}&key=${encodeURIComponent(key)}`),

  createFood: (d) => req('POST', '/admin/food', d),
  updateFood: (id, d) => req('PUT', `/admin/food/${id}`, d),
  deleteFood: (id) => req('DELETE', `/admin/food/${id}`),
}
