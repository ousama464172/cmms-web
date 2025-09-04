import { useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { addDoc, collection } from 'firebase/firestore'

export default function Debug(){
  const [user, setUser] = useState<User|null>(null)
  const [msg, setMsg] = useState('')
  useEffect(() => onAuthStateChanged(auth, setUser), [])

  async function writePing(){
    try{
      await addDoc(collection(db, '_ping'), { at: Date.now(), uid: user?.uid || null })
      setMsg('✅ Ping write succeeded')
    }catch(e:any){
      console.error('Ping write failed:', e)
      setMsg('❌ ' + (e?.code || e?.message || 'unknown'))
      alert(e?.message || String(e))
    }
  }

  return (
    <section className="card">
      <div className="badge">Debug</div>
      <h1>Runtime Diagnostics</h1>
      <p className="muted">Signed in: <strong>{user ? 'Yes' : 'No'}</strong></p>
      <button className="btn" onClick={writePing}>Write Ping</button>
      {msg && <p style={{marginTop:8}}>{msg}</p>}
    </section>
  )
}
