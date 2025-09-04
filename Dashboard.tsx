import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

type WO = { id:string; title:string; status:string; due?:string; created_date?:any }
type PM = { id:string; title:string; nextDue:string; is_active?:boolean; created_date?:any }
type Part = { id:string; name:string; stock:number; min:number; created_date?:any }

export default function Dashboard(){
  const [assetCount, setAssetCount] = useState(0)
  const [openWOs, setOpenWOs] = useState<WO[]>([])
  const [upcomingPMs, setUpcomingPMs] = useState<PM[]>([])
  const [lowStock, setLowStock] = useState<Part[]>([])

  useEffect(()=>{ (async()=>{
    // Assets count
    const aSnap = await getDocs(query(collection(db,'assets')))
    setAssetCount(aSnap.size)

    // Recent Open WOs
    const wSnap = await getDocs(query(collection(db,'work_orders'), orderBy('created_date','desc'), limit(200)))
    const allWOs: WO[] = wSnap.docs.map(d => ({ id:d.id, ...(d.data() as any) }))
    setOpenWOs(allWOs.filter(w => w.status !== 'Completed').slice(0,8))

    // PMs (nearest due first)
    const pSnap = await getDocs(query(collection(db,'pm_tasks'), orderBy('created_date','desc'), limit(200)))
    const allPMs: PM[] = pSnap.docs.map(d => ({ id:d.id, ...(d.data() as any) }))
    const soon = allPMs
      .filter(p => p.is_active)
      .sort((a,b)=> (a.nextDue||'').localeCompare(b.nextDue||''))
      .slice(0,8)
    setUpcomingPMs(soon)

    // Low stock parts
    const partSnap = await getDocs(query(collection(db,'parts'), orderBy('created_date','desc'), limit(200)))
    const parts: Part[] = partSnap.docs.map(d => ({ id:d.id, ...(d.data() as any) }))
    setLowStock(parts.filter(p => (p.stock ?? 0) < (p.min ?? 0)).slice(0,8))
  })() },[])

  return (
    <section className="card">
      <div className="badge">Dashboard</div>
      <h1>Overview</h1>
      <div className="kpis">
        <div className="kpi"><div className="muted">Assets</div><strong>{assetCount}</strong></div>
        <div className="kpi"><div className="muted">Open WOs</div><strong>{openWOs.length}</strong></div>
        <div className="kpi"><div className="muted">Upcoming PMs</div><strong>{upcomingPMs.length}</strong></div>
        <div className="kpi"><div className="muted">Low Stock</div><strong>{lowStock.length}</strong></div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Recent Work Orders</h3>
          <table className="table">
            <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>{openWOs.map(w=> (
              <tr key={w.id}><td>{w.id}</td><td>{w.title}</td><td>{w.status}</td><td>{w.due || '-'}</td></tr>
            ))}</tbody>
          </table>
        </div>

        <div className="card">
          <h3>Upcoming PM</h3>
          <table className="table">
            <thead><tr><th>ID</th><th>Title</th><th>Next Due</th></tr></thead>
            <tbody>{upcomingPMs.map(p=> (
              <tr key={p.id}><td>{p.id}</td><td>{p.title}</td><td>{p.nextDue}</td></tr>
            ))}</tbody>
          </table>
        </div>

        <div className="card">
          <h3>Low Stock Alerts</h3>
          <table className="table">
            <thead><tr><th>Part</th><th>Stock</th><th>Min</th></tr></thead>
            <tbody>{lowStock.map(p=> (
              <tr key={p.id}><td>{p.name}</td><td>{p.stock}</td><td>{p.min}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
