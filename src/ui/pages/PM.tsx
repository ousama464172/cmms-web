import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'

type PMTask = { id?:string; title:string; frequency:'Weekly'|'Monthly'|'Quarterly'|'Yearly'; nextDue:string; is_active:boolean; created_date?:any }

export default function PM(){
  const [rows, setRows] = useState<PMTask[]>([])
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<'Weekly'|'Monthly'|'Quarterly'|'Yearly'>('Monthly')
  const [nextDue, setNextDue] = useState('')

  async function load(){
    const snap = await getDocs(query(collection(db,'pm_tasks'), orderBy('created_date','desc'), limit(200)))
    setRows(snap.docs.map(d=>({ id:d.id, ...(d.data() as any) })))
  }
  useEffect(()=>{ load() },[])

  async function createPM(e:React.FormEvent){
    e.preventDefault()
    if(!title.trim() || !nextDue) return
    await addDoc(collection(db,'pm_tasks'), { title, frequency, nextDue, is_active:true, created_date: serverTimestamp() })
    setTitle(''); setFrequency('Monthly'); setNextDue('')
    await load()
  }

  return (
    <section className="card">
      <div className="badge">Preventive Maintenance</div>
      <h1>PM Schedules</h1>

      <form onSubmit={createPM} className="toolbar" style={{gap:10, flexWrap:'wrap'}}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <select value={frequency} onChange={e=>setFrequency(e.target.value as any)}>
          <option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option>
        </select>
        <input type="date" value={nextDue} onChange={e=>setNextDue(e.target.value)} />
        <button className="btn" type="submit">Add PM</button>
      </form>

      <table className="table">
        <thead><tr><th>ID</th><th>Title</th><th>Frequency</th><th>Next Due</th><th>Active</th></tr></thead>
        <tbody>{rows.map(p=>(
          <tr key={p.id}><td>{p.id}</td><td>{p.title}</td><td>{p.frequency}</td><td>{p.nextDue}</td><td>{String(p.is_active)}</td></tr>
        ))}</tbody>
      </table>
    </section>
  )
}
