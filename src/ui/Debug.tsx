import { useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { addDoc, collection } from 'firebase/firestore'

export default function Debug(){
  const [user, setUser] = useState<User|null>(null)
  const [msg, setMsg] = useState('')
  useEffect(()=> onAuthStateChanged(auth, setUser), [])

  async function writePing(){
    try{
      await addDoc(collection(db,'_ping'), { at: Date.now(), uid: user?.uid || null })
      setMsg('✅ Ping write succeeded')
    }catch(e:any){
      console.error('Ping write failed:', e)
      setMsg('❌ Ping write failed: ' + (e?.code || e?.message || 'unknown'))
      alert('Ping failed: ' + (e?.message || e))
    }
  }

  return (
    <section className="card">
      <div className="badge">Debug</div>
      <h1>Runtime Diagnostics</h1>
      <ul className="muted">
        <li>Signed in: <strong>{user ? 'Yes' : 'No'}</strong></li>
        <li>User: {user ? (user.displayName || user.email || user.uid) : '-'}</li>
        <li>Env present (apiKey): <strong>{import.meta.env.VITE_FIREBASE_API_KEY ? 'Yes' : 'No'}</strong></li>
        <li>ProjectId: {import.meta.env.VITE_FIREBASE_PROJECT_ID || '-'}</li>
      </ul>
      <button className="btn" onClick={writePing}>Write Ping</button>
      {msg && <p style={{marginTop:8}}>{msg}</p>}
      <p className="muted" style={{marginTop:12}}>Open DevTools (F12) → Console to see detailed errors.</p>
    </section>
  )
}
