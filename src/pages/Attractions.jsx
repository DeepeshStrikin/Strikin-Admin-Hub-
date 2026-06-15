import { useEffect, useState } from 'react'
import { api, imgUrl } from '../api'
import ImageUpload from '../components/ImageUpload.jsx'

const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
const TIER_KEYS = [['standard', 'Standard bays'], ['vip', 'VIP bays'], ['vvip', 'VVIP bays']]
const INTERVALS = [[30, '30 min'], [45, '45 min'], [60, '1 hour'], [90, '1.5 hours'], [120, '2 hours']]
const Chev = () => <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
const Plus = ({ s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>

export default function Attractions() {
  const [activities, setActivities] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [data, setData] = useState(null) // { activity, tiers }
  const [openKey, setOpenKey] = useState(null)
  const [toast, setToast] = useState('')
  const [gameDrawer, setGameDrawer] = useState(null)
  const [tierDrawer, setTierDrawer] = useState(null)
  const [bayDrawer, setBayDrawer] = useState(null)   // { tier }
  const [bayDetail, setBayDetail] = useState(null)   // { bay, tier }
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  async function loadActivities(keepId) {
    const a = await api.activities()
    setActivities(a)
    setActiveId(a.find((x) => x.id === keepId)?.id || a[0]?.id || null)
  }
  async function loadTiers(id) { if (!id) { setData(null); return } setData(await api.tiers(id)) }
  useEffect(() => { loadActivities() }, [])
  useEffect(() => { if (activeId) loadTiers(activeId) }, [activeId])
  const reload = () => loadTiers(activeId)

  async function saveGame(d) {
    try {
      if (gameDrawer.mode === 'add') { const c = await api.createActivity(d); setGameDrawer(null); flash('Game added'); await loadActivities(c.id) }
      else { await api.updateActivity(gameDrawer.data.id, d); setGameDrawer(null); flash('Saved'); await loadActivities(activeId); reload() }
    } catch (e) { alert(e.message) }
  }
  async function deleteGame() {
    const a = activities.find((x) => x.id === activeId)
    if (!a) return
    if (!confirm(`Delete game "${a.name}"? (Remove its tiers & bays first.)`)) return
    try { await api.deleteActivity(a.id); flash('Game deleted'); await loadActivities() }
    catch (e) { alert(e.message) }
  }
  async function saveTier(d) {
    try {
      await api.saveTier({ ...d, activity_type_id: activeId, price: Number(d.price), time_interval_minutes: Number(d.time_interval_minutes) })
      setTierDrawer(null); flash('Tier saved'); reload()
    } catch (e) { alert(e.message) }
  }
  async function deleteTier(key) {
    if (!confirm('Delete this tier and all its bays?')) return
    try { await api.deleteTier(activeId, key); flash('Tier deleted'); reload() } catch (e) { alert(e.message) }
  }
  async function addBay(d, tier) {
    try {
      await api.createBay({ activity_type_id: activeId, name: d.name, description: d.description, image: d.image,
        bay_tier: tier.key, price_per_session: tier.price, max_players: Number(d.max_players) || 1 })
      setBayDrawer(null); flash('Bay added'); reload()
    } catch (e) { alert(e.message) }
  }
  async function updateBay(bay, tier, patch) {
    try {
      await api.updateBay(bay.id, {
        activity_type_id: activeId, bay_tier: tier.key, price_per_session: tier.price,
        name: patch.name ?? bay.name, description: patch.description ?? bay.description,
        image: patch.image ?? bay.image, max_players: Number(patch.max_players ?? bay.max_players),
        status: patch.status ?? bay.status,
      })
      setBayDetail(null); flash('Saved'); reload()
    } catch (e) { alert(e.message) }
  }
  async function deleteBay(bay) {
    if (!confirm('Delete this bay?')) return
    try { await api.deleteBay(bay.id); setBayDetail(null); flash('Deleted'); reload() } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div className="row-between">
        <h1 className="page" style={{ margin: 0 }}>Attractions</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          {activeId && <button className="btn" onClick={() => { const a = activities.find((x) => x.id === activeId); setGameDrawer({ mode: 'edit', data: a }) }}>Edit game</button>}
          {activeId && <button className="btn danger" onClick={deleteGame}>Delete game</button>}
          <button className="btn primary" onClick={() => setGameDrawer({ mode: 'add', data: { name: '', slug: '', tagline: '', image: '', is_rooftop_dining: false } })}>+ Add Game</button>
        </div>
      </div>

      <div className="tabs" style={{ marginTop: 16 }}>
        {activities.map((a) => (
          <button key={a.id} className={a.id === activeId ? 'active' : ''}
                  onClick={() => { setActiveId(a.id); setOpenKey(null) }}>{a.name}</button>
        ))}
      </div>

      {!data ? <div className="page-card"><div className="empty">Loading…</div></div> : (
        <>
          {data.tiers.map((t) => (
            <div key={t.key} className="acc-item">
              <div className={'acc-head' + (openKey === t.key ? ' open' : '')} onClick={() => setOpenKey(openKey === t.key ? null : t.key)}>
                <Chev />{t.name}
                <span className="muted" style={{ marginLeft: 8, fontWeight: 500 }}>· {rupees(t.price)} · {t.bays.length} {t.bays.length === 1 ? 'bay' : 'bays'}</span>
              </div>
              {openKey === t.key && (
                <TierPanel tier={t} onSaveTier={saveTier} onDeleteTier={deleteTier}
                           onAddBay={() => setBayDrawer({ tier: t })} onOpenBay={(b) => setBayDetail({ bay: b, tier: t })} />
              )}
            </div>
          ))}
          <button className="acc-add" onClick={() => setTierDrawer({})}><Plus /> Add a tier</button>
          {data.tiers.length === 0 && <div className="empty" style={{ marginTop: 12 }}>No tiers yet. Click “Add a tier”.</div>}
        </>
      )}

      {gameDrawer && <GameDrawer drawer={gameDrawer} onClose={() => setGameDrawer(null)} onSave={saveGame} />}
      {tierDrawer && <TierDrawer onClose={() => setTierDrawer(null)} onSave={saveTier} />}
      {bayDrawer && <BayDrawer tier={bayDrawer.tier} onClose={() => setBayDrawer(null)} onSave={(d) => addBay(d, bayDrawer.tier)} />}
      {bayDetail && <BayDetailDrawer bay={bayDetail.bay} onClose={() => setBayDetail(null)}
        onSave={(patch) => updateBay(bayDetail.bay, bayDetail.tier, patch)} onDelete={() => deleteBay(bayDetail.bay)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function TierPanel({ tier, onSaveTier, onDeleteTier, onAddBay, onOpenBay }) {
  const [f, setF] = useState({ description: tier.description, price: tier.price, time_interval_minutes: tier.time_interval_minutes, allow_select: tier.allow_select })
  useEffect(() => { setF({ description: tier.description, price: tier.price, time_interval_minutes: tier.time_interval_minutes, allow_select: tier.allow_select }) }, [tier.key]) // eslint-disable-line
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  return (
    <div className="acc-body" style={{ paddingTop: 16 }}>
      <div className="field row">
        <div style={{ flex: 2 }}><label>Bay description</label><textarea rows="2" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
        <div style={{ flex: 1 }}><label>Tier price (₹)</label><input type="number" value={f.price} onChange={(e) => set('price', e.target.value)} /></div>
      </div>
      <div className="section-title" style={{ margin: '6px 0 10px' }}>List of bays</div>
      <div className="bay-strip">
        {tier.bays.map((b) => (
          <div key={b.id} className={'bay-mini' + (b.status === 'disabled' ? ' disabled' : '')} onClick={() => onOpenBay(b)}>
            <img src={imgUrl(b.image)} alt="" onError={(e) => { e.target.style.visibility = 'hidden' }} />
            <b>{b.name}</b><small>{b.description}</small><span className="ppl">{b.max_players} Players</span>
          </div>
        ))}
        <div className="add-card" onClick={onAddBay}><Plus s={22} />Add new bay</div>
      </div>
      <div className="field row" style={{ marginTop: 18, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}><label>Time interval between slot</label>
          <select value={f.time_interval_minutes} onChange={(e) => set('time_interval_minutes', e.target.value)}>
            {INTERVALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}><label>Allow customer to select bay</label>
          <div><label className="switch"><input type="checkbox" checked={f.allow_select} onChange={(e) => set('allow_select', e.target.checked)} /><span /></label></div>
        </div>
      </div>
      <div className="row-between" style={{ marginTop: 18 }}>
        <button className="btn sm danger" onClick={() => onDeleteTier(tier.key)}>Delete tier</button>
        <button className="btn primary" onClick={() => onSaveTier({ key: tier.key, name: tier.name, ...f })}>Save tier</button>
      </div>
    </div>
  )
}

function DrawerShell({ title, onClose, children, footer }) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <h2>{title}<button type="button" className="x" onClick={onClose}>×</button></h2>
        <div style={{ flex: 1 }}>{children}</div>
        {footer}
      </div>
    </div>
  )
}

function GameDrawer({ drawer, onClose, onSave }) {
  const [f, setF] = useState(drawer.data); const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  return (
    <DrawerShell title={drawer.mode === 'add' ? 'Add game' : 'Edit game'} onClose={onClose}
      footer={<button className="btn primary" style={{ width: '100%', marginTop: 12 }} onClick={() => onSave(f)}>Save</button>}>
      <div className="field"><label>Name</label><input value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
      <div className="field"><label>Slug (url id, e.g. golf)</label><input value={f.slug} onChange={(e) => set('slug', e.target.value)} /></div>
      <div className="field"><label>Tagline</label><input value={f.tagline} onChange={(e) => set('tagline', e.target.value)} /></div>
      <div className="field"><label>Photo</label><ImageUpload value={f.image} onChange={(v) => set('image', v)} /></div>
      <div className="field"><label><input type="checkbox" checked={f.is_rooftop_dining} onChange={(e) => set('is_rooftop_dining', e.target.checked)} /> &nbsp;Dining venue (says “guests” not “players”)</label></div>
    </DrawerShell>
  )
}

function TierDrawer({ onClose, onSave }) {
  const [f, setF] = useState({ key: 'vvip', name: 'VVIP bays', description: '', price: '', time_interval_minutes: 60, allow_select: true })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  return (
    <DrawerShell title="Add a tier" onClose={onClose}
      footer={<button className="btn primary" style={{ width: '100%', marginTop: 12 }} onClick={() => onSave(f)}>Add tier</button>}>
      <div className="field"><label>Tier</label>
        <select value={f.key} onChange={(e) => { const k = e.target.value; set('key', k); set('name', (TIER_KEYS.find((t) => t[0] === k)?.[1]) || f.name) }}>
          {TIER_KEYS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <div className="field"><label>Display name</label><input value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
      <div className="field"><label>Description</label><textarea rows="2" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
      <div className="field row">
        <div style={{ flex: 1 }}><label>Price (₹)</label><input type="number" value={f.price} onChange={(e) => set('price', e.target.value)} /></div>
        <div style={{ flex: 1 }}><label>Slot interval</label>
          <select value={f.time_interval_minutes} onChange={(e) => set('time_interval_minutes', e.target.value)}>
            {INTERVALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
    </DrawerShell>
  )
}

function BayDrawer({ onClose, onSave }) {
  const [f, setF] = useState({ name: '', description: '', max_players: '', image: '' })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  return (
    <DrawerShell title="Add bay" onClose={onClose}
      footer={<button className="btn primary" style={{ width: '100%', marginTop: 12 }} onClick={() => onSave(f)}>Add bay</button>}>
      <div className="field"><label>Upload image</label><ImageUpload value={f.image} onChange={(v) => set('image', v)} /></div>
      <div className="field"><label>Bay name</label><input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Enter name" /></div>
      <div className="field"><label>Bay description</label><input value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Enter description" /></div>
      <div className="field"><label>Max capacity</label><input type="number" min="1" value={f.max_players} onChange={(e) => set('max_players', e.target.value)} placeholder="Enter max number of players" /></div>
    </DrawerShell>
  )
}

function BayDetailDrawer({ bay, onClose, onSave, onDelete }) {
  const [f, setF] = useState({ name: bay.name, description: bay.description, max_players: bay.max_players, image: bay.image, status: bay.status })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const disabled = f.status === 'disabled'
  return (
    <DrawerShell title={bay.name} onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn" style={{ flex: 1 }} onClick={() => set('status', disabled ? 'available' : 'disabled')}>
            {disabled ? 'Enable bay' : 'Disable bay'}
          </button>
          <button className="btn primary" style={{ flex: 1 }} onClick={() => onSave(f)}>Save changes</button>
        </div>}>
      <div className="field"><ImageUpload value={f.image} onChange={(v) => set('image', v)} /></div>
      <div className="field"><label>Bay name</label><input value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
      <div className="field"><label>Bay description</label><input value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
      <div className="field"><label>Max capacity</label><input type="number" min="1" value={f.max_players} onChange={(e) => set('max_players', e.target.value)} /></div>
      <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 14, marginTop: 6 }}>
        <div className="row-between" style={{ marginBottom: 8 }}><span className="muted">Bay ID</span><b>{bay.id}</b></div>
        <div className="row-between" style={{ marginBottom: 8 }}><span className="muted">Status</span>
          <b style={{ color: disabled ? 'var(--red)' : 'var(--green)' }}>{disabled ? 'Disabled' : 'Active'}</b></div>
        <div className="row-between"><span className="muted">Launched on</span><b>{(bay.created_at || '').slice(0, 10)}</b></div>
      </div>
      <button className="btn sm danger" style={{ marginTop: 16 }} onClick={onDelete}>Delete bay</button>
    </DrawerShell>
  )
}
