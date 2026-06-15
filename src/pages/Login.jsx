import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { setToken } from '../auth'

export default function Login() {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const r = await api.login(pw)
      setToken(r.token)
      nav('/attractions')
    } catch {
      setErr('Wrong password — try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form className="box" onSubmit={submit}>
        <div className="brand" style={{ paddingLeft: 0 }}>
          <img src="/strikin-mark.png" alt="" style={{ width: 30, height: 30 }} /><div><b>STRIKIN</b><small>Control centre</small></div>
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to manage your venue.</p>
        <div className="field">
          <label>Password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
                 placeholder="Enter admin password" autoFocus />
        </div>
        <button className="btn primary" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        {err && <div className="err">{err}</div>}
      </form>
    </div>
  )
}
