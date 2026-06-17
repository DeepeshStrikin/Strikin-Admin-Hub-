import { useEffect, useState } from 'react'
import { api } from '../api'

const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
const colors = { paid: '#16a34a', pending: '#e5484d', pending_payment: '#b45309', complimentary: '#2f6bff' }
const Pill = ({ s }) => <span style={{ color: colors[s] || '#6b7280', fontWeight: 600 }}>{s}</span>
const today = () => new Date().toISOString().slice(0, 10)
const blank = { activity_id: '', bay_id: '', date: today(), time: '11:00 AM', players: 2, guest_name: '', guest_phone: '', payment_status: 'paid' }

export default function Bookings() {
  const [rows, setRows] = useState(null)
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState('')
  const [tab, setTab] = useState('bookings')
  const load = () => api.bookings().then(setRows).catch(() => setRows([]))
  useEffect(() => { load() }, [])
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  return (
    <div>
      <div className="row-between">
        <h1 className="page" style={{ margin: 0 }}>Bookings</h1>
        {tab === 'bookings' && <button className="btn primary" onClick={() => setDrawer(true)}>+ Add booking</button>}
      </div>
      <div className="tabs" style={{ marginTop: 12 }}>
        <button className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')}>All bookings</button>
        <button className={tab === 'availability' ? 'active' : ''} onClick={() => setTab('availability')}>Availability</button>
      </div>

      {tab === 'availability' ? <Availability /> : (
      <div className="page-card">
        {!rows ? <div className="empty">Loading…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Booking</th><th>Customer</th><th>Activity</th><th>Bay</th><th>When</th><th>Players</th><th>Amount</th><th>Payment</th>
              </tr></thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td><b>{b.id}</b></td>
                    <td>{b.guest_name || '—'}<div className="muted" style={{ fontSize: 12 }}>{b.guest_phone}</div></td>
                    <td>{b.activity}</td>
                    <td>{b.bay}</td>
                    <td>{b.date}<div className="muted" style={{ fontSize: 12 }}>{b.time}</div></td>
                    <td>{b.players}</td>
                    <td>{rupees(b.amount)}</td>
                    <td><Pill s={b.payment_status} /></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan="8" className="empty">No bookings yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
      {drawer && <AddBookingDrawer onClose={() => setDrawer(false)} onDone={() => { setDrawer(false); flash('Booking created'); load() }} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function Availability() {
  const [activities, setActivities] = useState([])
  const [activityId, setActivityId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.activities().then((a) => { setActivities(a); if (a[0]) setActivityId(a[0].id) }) }, [])
  useEffect(() => {
    if (!activityId) return
    setLoading(true)
    api.availability(activityId, date).then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [activityId, date])

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={activityId} onChange={(e) => setActivityId(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
          {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
               style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)' }} />
      </div>
      <div className="page-card">
        {loading || !data ? <div className="empty">Loading…</div> : (
          <div style={{ overflowX: 'auto' }}>
            <div className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
              {data.activity} · {data.date} — <span style={{ color: 'var(--green)' }}>green = free</span>,{' '}
              <span style={{ color: 'var(--red)' }}>red = booked</span>
            </div>
            {data.bays.map((b) => (
              <div key={b.bay} style={{ marginBottom: 14 }}>
                <div className="row-between" style={{ marginBottom: 6 }}>
                  <b>{b.bay} <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>({b.tier.toUpperCase()})</span></b>
                  <span className="muted" style={{ fontSize: 12 }}>{b.free} free · {b.booked} booked</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {b.slots.map((s) => (
                    <span key={s.time} style={{
                      fontSize: 12, padding: '4px 9px', borderRadius: 6,
                      background: s.booked ? '#fbe9ea' : '#e9f6ee',
                      color: s.booked ? 'var(--red)' : 'var(--green)',
                      textDecoration: s.booked ? 'line-through' : 'none',
                    }}>{s.time}</span>
                  ))}
                </div>
              </div>
            ))}
            {data.bays.length === 0 && <div className="empty">No bays for this activity.</div>}
          </div>
        )}
      </div>
    </div>
  )
}

const TIMES = ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM']

function AddBookingDrawer({ onClose, onDone }) {
  const [activities, setActivities] = useState([])
  const [bays, setBays] = useState([])
  const [f, setF] = useState(blank)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  useEffect(() => { api.activities().then(setActivities) }, [])
  useEffect(() => {
    if (f.activity_id) api.bays(f.activity_id).then((b) => { setBays(b); if (b[0]) set('bay_id', b[0].id) })
    else { setBays([]); set('bay_id', '') }
  }, [f.activity_id]) // eslint-disable-line

  async function submit(e) {
    e.preventDefault()
    if (!f.bay_id) { alert('Pick an activity and bay'); return }
    setBusy(true)
    try {
      await api.addBooking({ bay_id: f.bay_id, date: f.date, time: f.time, players: Number(f.players),
        guest_name: f.guest_name, guest_phone: f.guest_phone, payment_status: f.payment_status })
      onDone()
    } catch (err) { alert(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <form className="drawer" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Add booking<button type="button" className="x" onClick={onClose}>×</button></h2>
        <div style={{ flex: 1 }}>
          <div className="field"><label>Activity</label>
            <select value={f.activity_id} onChange={(e) => set('activity_id', e.target.value)} required>
              <option value="">Select activity…</option>
              {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Bay</label>
            <select value={f.bay_id} onChange={(e) => set('bay_id', e.target.value)} required>
              {bays.length === 0 && <option value="">Pick activity first</option>}
              {bays.map((b) => <option key={b.id} value={b.id}>{b.name} — {b.bay_tier.toUpperCase()} (₹{b.price_per_session})</option>)}
            </select>
          </div>
          <div className="field row">
            <div style={{ flex: 1 }}><label>Date</label><input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
            <div style={{ flex: 1 }}><label>Time</label>
              <select value={f.time} onChange={(e) => set('time', e.target.value)}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
          </div>
          <div className="field"><label>Players</label><input type="number" min="1" value={f.players} onChange={(e) => set('players', e.target.value)} /></div>
          <div className="field"><label>Customer name</label><input value={f.guest_name} onChange={(e) => set('guest_name', e.target.value)} /></div>
          <div className="field"><label>Phone</label><input value={f.guest_phone} onChange={(e) => set('guest_phone', e.target.value)} /></div>
          <div className="field"><label>Payment</label>
            <select value={f.payment_status} onChange={(e) => set('payment_status', e.target.value)}>
              <option value="paid">Paid</option>
              <option value="pending">Pending (pay at venue)</option>
              <option value="complimentary">Complimentary (free)</option>
            </select>
          </div>
        </div>
        <button className="btn primary" style={{ width: '100%', marginTop: 12 }} disabled={busy}>{busy ? 'Creating…' : 'Create booking'}</button>
      </form>
    </div>
  )
}
