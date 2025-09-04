import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, getDoc } from 'firebase/firestore'

type Asset = { id?:string; name:string; status:'Running'|'Down'|'Standby'; location:string; created_date?:any }

export default function Assets(){
  const [rows, setRows] = useState<Asset[]>([])
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'Running'|'Down'|'Standby'>('Running')
  const [location, setLocation] = useState('')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<string>('')

  useEffect(()=>{ loadSorted() },[])

  async function loadSorted(){
    try{
      setLog(l => l + "\nLoading assets (sorted)...")
      const snap = await getDocs(query(collection(db,'assets'), orderBy('created_date','desc'), limit(200)))
      const data = snap.docs.map(d => ({ id:d.id, ...(d.data() as any) }))
      setRows(data)
      setLog(l => l + `\nLoaded ${data.length} docs (sorted)`)
    }catch(e:any){
      console.error('Load assets (sorted) failed:', e)
      alert('Load (sorted) failed: ' + (e?.message || e))
    }
  }

  async function loadRaw(){
    try{
      setLog(l => l + "\nLoading assets (raw, no orderBy)...")
      const snap = await getDocs(collection(db,'assets'))
      const data = snap.docs.map(d => ({ id:d.id, ...(d.data() as any) }))
      setRows(data)
      setLog(l => l + `\nLoaded ${data.length} docs (raw)`)
    }catch(e:any){
      console.error('Load assets (raw) failed:', e)
      alert('Load (raw) failed: ' + (e?.message || e))
    }
  }

  async function createAsset(e:React.FormEvent){
    e.preventDefault()
    try{
      if(!name.trim()){
        alert('Please enter a name')
        return
      }
      setBusy(true)
      setLog(l => l + `\nCreating asset \"${name}\"...`)
      const payload = { name: name.trim(), status, location, created_date: serverTimestamp() }
      const ref = await addDoc(collection(db,'assets'), payload)
      setLog(l => l + `\nAdded with id: ${ref.id}. Fetching saved doc...`)
      const snap = await getDoc(ref)
      const saved = snap.exists() ? ({ id: ref.id, ...(snap.data() as any) }) : ({ id: ref.id, ...payload })
      setRows(prev => [saved, ...prev])
      alert('✅ Asset added: ' + ref.id)
      setName(''); setStatus('Running'); setLocation('')
    }catch(err:any){
      console.error('Add asset failed:', err)
      alert(err?.message || 'Failed to add asset')
      setLog(l => l + `\nAdd failed: ${err?.code || err?.message || err}`)
    }finally{
      setBusy(false)
    }
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
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add Asset'}</button>
        <button className="btn" type="button" onClick={loadSorted}>Reload (sorted)</button>
        <button className="btn" type="button" onClick={loadRaw}>Reload (raw)</button>
      </form>

      <table className="table">
        <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Location</th></tr></thead>
        <tbody>{rows.map(a=>(
          <tr key={a.id}><td>{a.id}</td><td>{a.name}</td><td>{a.status}</td><td>{a.location}</td></tr>
        ))}</tbody>
      </table>

      <details style={{marginTop:12}}>
        <summary>Diagnostics</summary>
        <pre style={{whiteSpace:'pre-wrap'}}>{log || 'No logs yet'}</pre>
      </details>
    </section>
  )
}
