import { useEffect, useState } from 'react'
import { auth, googleProvider } from '../lib/firebase'
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth'

export default function AuthWidget(){
  const [user, setUser] = useState<User|null>(null)
  useEffect(()=> onAuthStateChanged(auth, setUser), [])
  async function login(){ try { await signInWithPopup(auth, googleProvider) } catch(e){ console.error('Login error:', e) } }
  async function logout(){ try { await signOut(auth) } catch(e){ console.error('Logout error:', e) } }
  if(!user) return <button className="btn" onClick={login}>Sign in with Google</button>
  return (
    <div style={{display:'flex', gap:8, alignItems:'center'}}>
      <span className="muted">Hi {user.displayName || user.email}</span>
      <button className="btn" onClick={logout}>Sign out</button>
    </div>
  )
}
