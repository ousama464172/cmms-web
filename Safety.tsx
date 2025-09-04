import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'

type Incident = { id?:string; type:'Near Miss'|'Injury'|'Other'; status:'Open'|'Closed'; date:string; created_date?:any }
type CAPA = { id?:string; title:string; status:'Open'|'Closed'|'In Progress'; created_date?:any }

export default function Safety(){
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [capas, setCapas] = useState<CAPA[]>([])

  // form state - incidents
  const [itype, setIType] = useState<'Near Miss'|'Injury'|'Other'>('Near Miss')
  const [istatus, setIStatus] = useState<'Open'|'Closed'>('Open')
  const [idate, setIDate] = useState('')

  // form state - CAPA
  const [ctitle, setCTitle] = useState('')
  const [cstatus, setCStatus] = useState<'Open'|'Closed'|'In Progress'>('In Progress')

  async function load(){
    const iSnap = await getDocs(query(collection(db,'incidents'), orderBy('created_date','desc'), limit(100)))
    setIncidents(iSnap.docs.map(d=>({ id:d.id, ...(d.data() as any) })))
    const cSnap = await getDocs(query(collection(db,'capas'), orderBy('created_date','desc'), limit(100)))
    setCapas(cSnap.docs.map(d=>({ id:d.id, ...(d.data() as any) })))
  }
  useEffect(()=>{ load() },[])

  async function createIncident(e:React.FormEvent){
    e.preventDefault()
    if(!idate) return
    await addDoc(collection(db,'incidents'), { type: itype, status: istatus, date: idate, created_date: serverTimestamp() })
    setIType('Near Miss'); setIStatus('Open'); setIDate('')
    await load()
  }

  async function createCAPA(e:React.FormEvent){
    e.preventDefault()
    if(!ctitle.trim()) return
    await addDoc(collection(db,'capas'), { title: ctitle, status: cstatus, created_date: serverTimestamp() })
    setCTitle(''); setCStatus('In Progress')
    await load()
  }

  return (
    <section className="card">
      <div className="badge">Health & Safety</div>
      <h1>Incidents & CAPA</h1>

      <div className="grid">
        <div className="card">
          <h3>Log Incident</h3>
          <form onSubmit={createIncident} style={{display:'grid', gap:8}}>
            <select value={itype} onChange={e=>setIType(e.target.value as any)}>
              <option>Near Miss</option><option>Injury</option><option>Other</option>
            </select>
            <select value={istatus} onChange={e=>setIStatus(e.target.value as any)}>
              <option>Open</option><option>Closed</option>
            </select>
            <input type="date" value={idate} onChange={e=>setIDate(e.target.value)} />
            <button className="btn" type="submit">Add Incident</button>
          </form>

          <h3 style={{marginTop:16}}>Incidents</h3>
          <table className="table">
            <thead><tr><th>ID</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{incidents.map(i=>(
              <tr key={i.id}><td>{i.id}</td><td>{i.type}</td><td>{i.status}</td><td>{i.date}</td></tr>
            ))}</tbody>
          </table>
        </div>

        <div className="card">
          <h3>New CAPA</h3>
          <form onSubmit={createCAPA} style={{display:'grid', gap:8}}>
            <input placeholder="Title" value={ctitle} onChange={e=>setCTitle(e.target.value)} />
            <select value={cstatus} onChange={e=>setCStatus(e.target.value as any)}>
              <option>Open</option><option>In Progress</option><option>Closed</option>
            </select>
            <button className="btn" type="submit">Add CAPA</button>
          </form>

          <h3 style={{marginTop:16}}>CAPA List</h3>
          <table className="table">
            <thead><tr><th>ID</th><th>Title</th><th>Status</th></tr></thead>
            <tbody>{capas.map(c=>(
              <tr key={c.id}><td>{c.id}</td><td>{c.title}</td><td>{c.status}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
