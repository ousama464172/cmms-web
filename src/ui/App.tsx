import { useEffect, useState } from 'react'
import './styles.css'
import { auth, googleProvider, db } from '../lib/firebase'
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { addDoc, collection, getDocs, serverTimestamp, query, orderBy, limit } from 'firebase/firestore'

type Asset = { id?:string; name:string; status:'Running'|'Down'|'Standby'; location:string; created_date?:any }

export default function App(){
  const [user, setUser] = useState<User|null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [busy, setBusy] = useState(false)
  useEffect(()=> onAuthStateChanged(auth, setUser), [])

  async function login(){ await signInWithPopup(auth, googleProvider) }
  async function logout(){ await signOut(auth) }

  async function seedAsset(){
    if(!user) return alert('Sign in first')
    setBusy(true)
    await addDoc(collection(db, 'assets'), {
      name:'Compressor 1', status:'Running', location:'Plant 1', created_date: serverTimestamp()
    })
    await loadAssets()
    setBusy(false)
  }

  async function ping(){
    if(!user) return alert('Sign in first')
    await addDoc(collection(db, '_ping'), { when: Date.now() })
    alert('Ping written to Firestore!')
  }

  async function loadAssets(){
    if(!user) return alert('Sign in first')
    const snap = await getDocs(query(collection(db, 'assets'), orderBy('created_date','desc'), limit(20)))
    setAssets(snap.docs.map(d=>({ id:d.id, ...(d.data() as any)})))
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>CMMS + Firebase</h1>
        <p className="muted">Sign in, write a test doc, seed an asset, and list assets from Firestore.</p>

        <div className="row">
          {!user
            ? <button className="btn" onClick={login}>Sign in with Google</button>
            : <>
                <span className="muted">Hello {user.displayName || user.email}</span>
                <button className="btn" onClick={logout}>Sign out</button>
              </>
          }
        </div>

        <div className="row">
          <button className="btn" onClick={ping} disabled={!user || busy}>Write ping</button>
          <button className="btn" onClick={seedAsset} disabled={!user || busy}>Seed asset</button>
          <button className="btn" onClick={loadAssets} disabled={!user || busy}>Load assets</button>
        </div>

        <table>
          <thead><tr><th>Name</th><th>Status</th><th>Location</th></tr></thead>
          <tbody>
            {assets.map(a=>(
              <tr key={a.id}>
                <td>{a.name}</td><td>{a.status}</td><td>{a.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
