import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'

type Asset = { id?:string; name:string; status:'Running'|'Down'|'Standby'; location:string; created_date?:any }

export default function Assets(){
  const [rows, setRows] = useState<Asset[]>([])
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'Running'|'Down'|'Standby'>('Running')
  const [location, setLocation] = useState('')

  async function load(){
    const snap = await getDocs(query(collection(db,'assets'), orderBy('created_date','desc'), limit(200)))
    setRows(snap.docs.map(d => ({ id:d.id, ...(d.data() as any) })))
  }
  useEffect(()=>{ load() },[])

  async function createAsset(e:React.FormEvent){
    e.preventDefault()
    if(!name.trim()) return
    await addDoc(collection(db,'assets'), { name, status, location, created_date: serverTimestamp() })
    setName(''); setStatus('Running'); setLocation('')
    await load()
  }

  return (
    <section className="card">
      <div className="badge">Assets</div>
      <h1>Asset Register</h1>

      <form onSubmit={createAsset} className="toolbar" style={{gap:10, flexWrap:'wrap'}}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <select value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option>Running</option><option>Down</option><option>Standby</option>
        </select>
        <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
        <button className="btn" type="submit">Add Asset</button>
      </form>

      <table className="table">
        <thead><tr><th>Name</th><th>Status</th><th>Location</th></tr></thead>
        <tbody>{rows.map(a=>(
          <tr key={a.id}><td>{a.name}</td><td>{a.status}</td><td>{a.location}</td></tr>
        ))}</tbody>
      </table>
    </section>
  )
}
