import { useEffect, useState } from 'react'
import './styles.css'
import AssetSeeder from './AssetSeeder'

// Check if Firebase is configured
const isFirebaseConfigured = () => {
  return import.meta.env.VITE_FIREBASE_API_KEY && 
         import.meta.env.VITE_FIREBASE_API_KEY !== 'your_api_key_here'
}

type Asset = { id?:string; name:string; status:'Running'|'Down'|'Standby'; location:string; created_date?:any }

export default function App(){
  const [user, setUser] = useState<any>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [busy, setBusy] = useState(false)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)

  // Only initialize Firebase if configured
  useEffect(() => {
    if (isFirebaseConfigured()) {
      try {
        import('../lib/firebase').then(({ auth }) => {
          import('firebase/auth').then(({ onAuthStateChanged }) => {
            onAuthStateChanged(auth, setUser)
          })
        })
      } catch (error) {
        setFirebaseError('Failed to initialize Firebase')
        console.error('Firebase initialization error:', error)
      }
    } else {
      setFirebaseError('Firebase not configured - please set up environment variables')
    }
  }, [])

  async function login(){ 
    if (!isFirebaseConfigured()) return alert('Firebase not configured')
    try {
      console.log('🔐 Attempting Google sign-in...')
      const { auth, googleProvider } = await import('../lib/firebase')
      const { signInWithPopup } = await import('firebase/auth')
      
      // Configure Google provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, googleProvider)
      console.log('✅ Sign-in successful:', result.user)
      alert(`Welcome ${result.user.displayName || result.user.email}!`)
    } catch (error) {
      console.error('❌ Login error:', error)
      alert(`Login failed: ${error.message || 'Unknown error'}`)
    }
  }
  
  async function logout(){ 
    if (!isFirebaseConfigured()) return alert('Firebase not configured')
    try {
      const { auth } = await import('../lib/firebase')
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  async function seedAsset(){
    if(!user) return alert('Sign in first')
    if (!isFirebaseConfigured()) return alert('Firebase not configured')
    setBusy(true)
    try {
      const { db } = await import('../lib/firebase')
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
      await addDoc(collection(db, 'assets'), {
        name:'Compressor 1', status:'Running', location:'Plant 1', created_date: serverTimestamp()
      })
      await loadAssets()
      alert('✅ Asset added! Check the table below.')
    } catch (error) {
      console.error('Seed asset error:', error)
      alert('Failed to seed asset')
    }
    setBusy(false)
  }

  async function ping(){
    if(!user) return alert('Sign in first')
    if (!isFirebaseConfigured()) return alert('Firebase not configured')
    try {
      const { db } = await import('../lib/firebase')
      const { addDoc, collection } = await import('firebase/firestore')
      await addDoc(collection(db, '_ping'), { when: Date.now() })
      alert('Ping written to Firestore!')
    } catch (error) {
      console.error('Ping error:', error)
      alert('Failed to write ping')
    }
  }

  async function loadAssets(){
    if(!user) return alert('Sign in first')
    if (!isFirebaseConfigured()) return alert('Firebase not configured')
    setBusy(true)
    try {
      const { db } = await import('../lib/firebase')
      const { getDocs, collection, query, orderBy, limit } = await import('firebase/firestore')
      const snap = await getDocs(query(collection(db, 'assets'), orderBy('created_date','desc'), limit(20)))
      const loadedAssets = snap.docs.map(d=>({ id:d.id, ...(d.data() as any)}))
      setAssets(loadedAssets)
      console.log(`📊 Loaded ${loadedAssets.length} assets:`, loadedAssets)
      if (loadedAssets.length === 0) {
        alert('No assets found. Try seeding some assets first!')
      } else {
        alert(`✅ Loaded ${loadedAssets.length} assets!`)
      }
    } catch (error) {
      console.error('Load assets error:', error)
      alert('Failed to load assets')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>CMMS + Firebase</h1>
        <p className="muted">Sign in, write a test doc, seed an asset, and list assets from Firestore.</p>

        {firebaseError && (
          <div style={{ 
            background: '#fee2e2', 
            border: '1px solid #fca5a5', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <strong>⚠️ {firebaseError}</strong>
            <br />
            <small>Create a .env file with your Firebase configuration to enable full functionality.</small>
          </div>
        )}

        <div className="row">
          {!user
            ? <button className="btn" onClick={login} disabled={!isFirebaseConfigured()}>
                {isFirebaseConfigured() ? 'Sign in with Google' : 'Firebase Not Configured'}
              </button>
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

        {isFirebaseConfigured() && (
          <AssetSeeder />
        )}

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
