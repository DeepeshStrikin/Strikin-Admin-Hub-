import { useEffect, useState } from 'react'
import { api, imgUrl } from '../api'
import ImageUpload from '../components/ImageUpload.jsx'

const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
const blank = { name: '', description: '', image: '', event_date: '', price: '', active: true }

export default function Events() {
  const [items, setItems] = useState([])
  const [drawer, setDrawer] = useState(null)
  const [toast, setToast] = useState('')
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2000) }
  const load = async () => setItems(await api.events())
  useEffect(() => { load() }, [])

  async function save(d) {
    const p = { ...d, price: Number(d.price) }
    try {
      if (drawer.mode === 'add') await api.createEvent(p)
      else await api.updateEvent(drawer.data.id, p)
      setDrawer(null); flash('Saved'); load()
    } catch (e) { alert(e.message) }
  }
  async function del(it) {
    if (!confirm(`Delete "${it.name}"?`)) return
    try { await api.deleteEvent(it.id); flash('Deleted'); load() } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div className="row-between">
        <h1 className="page" style={{ margin: 0 }}>Events</h1>
        <button className="btn primary" onClick={() => setDrawer({ mode: 'add', data: blank })}>+ Add event</button>
      </div>
      <p className="muted" style={{ marginTop: 6 }}>Events shown in the app. Changes appear instantly.</p>
      <div className="grid" style={{ marginTop: 18 }}>
        {items.map((e) => (
          <div key={e.id} className="act-card" style={{ cursor: 'default' }}>
            <img src={imgUrl(e.image)} alt="" onError={(ev) => { ev.target.style.visibility = 'hidden' }} />
            <div className="body">
              <div className="row-between"><b>{e.name}</b>{!e.active && <span className="tag std">Off</span>}</div>
              <p>{e.description || '—'}</p>
              <div className="row-between" style={{ marginTop: 10 }}>
                <span className="muted" style={{ fontSize: 13 }}>{e.event_date || '—'}</span>
                <b style={{ color: 'var(--primary)' }}>{rupees(e.price)}</b>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn sm" onClick={() => setDrawer({ mode: 'edit', data: e })}>Edit</button>
                <button className="btn sm danger" onClick={() => del(e)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="empty">No events yet. Click “Add event”.</div>}
      </div>
      {drawer && <EventDrawer drawer={drawer} onClose={() => setDrawer(null)} onSave={save} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function EventDrawer({ drawer, onClose, onSave }) {
  const [f, setF] = useState(drawer.data)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <form className="drawer" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(f) }}>
        <h2>{drawer.mode === 'add' ? 'Add event' : 'Edit event'}<button type="button" className="x" onClick={onClose}>×</button></h2>
        <div style={{ flex: 1 }}>
          <div className="field"><label>Image</label><ImageUpload value={f.image} onChange={(v) => set('image', v)} /></div>
          <div className="field"><label>Event name</label><input value={f.name} onChange={(e) => set('name', e.target.value)} required /></div>
          <div className="field"><label>Description</label><textarea rows="2" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="field row">
            <div style={{ flex: 1 }}><label>Date</label><input value={f.event_date} onChange={(e) => set('event_date', e.target.value)} placeholder="26 Oct 2025" /></div>
            <div style={{ flex: 1 }}><label>Price (₹)</label><input type="number" min="0" value={f.price} onChange={(e) => set('price', e.target.value)} /></div>
          </div>
          <div className="field"><label><input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} /> &nbsp;Show in app</label></div>
        </div>
        <button className="btn primary" style={{ width: '100%', marginTop: 12 }}>Save</button>
      </form>
    </div>
  )
}
