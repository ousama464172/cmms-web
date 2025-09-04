import { useEffect, useMemo, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'

type Asset = { id:string; name:string }
type WorkOrder = { id?:string; title:string; priority:'Low'|'Medium'|'High'|'Critical'; status:'Open'|'In Progress'|'Completed'; assetId:string; due:string; created_date?:any }

export default function WorkOrders(){
  const [assets, setAssets] = useState<Asset[]>([])
  const [rows, setRows] = useState<WorkOrder[]>([])
  const [q, setQ] = useState('')

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'Low'|'Medium'|'High'|'Critical'>('Medium')
  const [status, setStatus] = useState<'Open'|'In Progress'|'Completed'>('Open')
  const [assetId, setAssetId] = useState('')
  const [due, setDue] = useState('')

  async function load(){
    const aSnap = await getDocs(query(collection(db,'assets')))
    setAssets(aSnap.docs.map(d=>({ id:d.id, name:(d.data() as any).name })))
    const wSnap = await getDocs(query(collection(db,'work_orders'), orderBy('created_date','desc'), limit(200)))
    setRows(wSnap.docs.map(d=>({ id:d.id, ...(d.data() as any) })))
  }
  useEffect(()=>{ load() },[])

  const filtered = useMemo(()=>rows.filter(w=>{
    const txt = (w.title + ' ' + w.id + ' ' + w.assetId).toLowerCase()
    return txt.includes(q.toLowerCase())
  }), [q, rows])

  async function createWO(e:React.FormEvent){
    e.preventDefault()
    if(!title.trim() || !assetId) return
    await addDoc(collection(db,'work_orders'), { title, priority, status, assetId, due, created_date: serverTimestamp() })
    setTitle(''); setPriority('Medium'); setStatus('Open'); setAssetId(''); setDue('')
    await load()
  }

  return (
    <section className="card">
      <div className="badge">Work Orders</div>
      <div className="toolbar">
        <h1>Work Orders</h1>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title/ID/asset" />
      </div>

      <form onSubmit={createWO} className="toolbar" style={{gap:10, flexWrap:'wrap'}}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <select value={priority} onChange={e=>setPriority(e.target.value as any)}>
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option>Open</option><option>In Progress</option><option>Completed</option>
        </select>
        <select value={assetId} onChange={e=>setAssetId(e.target.value)}>
          <option value="">Select asset</option>
          {assets.map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input type="date" value={due} onChange={e=>setDue(e.target.value)} />
        <button className="btn" type="submit">Add WO</button>
      </form>

      <table className="table">
        <thead><tr><th>ID</th><th>Title</th><th>Priority</th><th>Status</th><th>Asset</th><th>Due</th></tr></thead>
        <tbody>{filtered.map(w=>(
          <tr key={w.id}><td>{w.id}</td><td>{w.title}</td><td>{w.priority}</td><td>{w.status}</td><td>{w.assetId}</td><td>{w.due}</td></tr>
        ))}</tbody>
      </table>
    </section>
  )
}
