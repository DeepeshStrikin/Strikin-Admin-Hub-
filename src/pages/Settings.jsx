import { useEffect, useState } from 'react'
import { api } from '../api'

const FIELDS = [
  ['venue_name', 'Venue name'],
  ['support_email', 'Support email'],
  ['gst_rate_percent', 'GST rate (%)'],
  ['gst_hsn_sac_code', 'GST HSN/SAC code'],
  ['loyalty_earn_rate', 'Loyalty earn rate (e.g. 0.05 = 5%)'],
]

export default function Settings() {
  const [f, setF] = useState(null)
  const [toast, setToast] = useState('')
  useEffect(() => { api.getSettings().then(setF).catch(() => setF({})) }, [])
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  async function save() {
    try { await api.saveSettings(f); setToast('Settings saved'); setTimeout(() => setToast(''), 2000) }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <h1 className="page">Settings</h1>
      <div className="page-card" style={{ maxWidth: 560 }}>
        {!f ? <div className="empty">Loading…</div> : (
          <>
            {FIELDS.map(([k, label]) => (
              <div className="field" key={k}>
                <label>{label}</label>
                <input value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} />
              </div>
            ))}
            <button className="btn primary" onClick={save} style={{ marginTop: 8 }}>Save settings</button>
            <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>
              GST rate and loyalty rate affect new bookings across the app.
            </p>
          </>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
