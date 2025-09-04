import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, updateDoc, doc } from 'firebase/firestore'

type Part = { id?:string; name:string; stock:number; min:number; created_date?:any }

export default function Inventory(){
  const [rows, setRows] = useState<Part[]>([])
  const [name, setName] = useState('')
  const [stock, setStock] = useState<number>(0)
  const [min, setMin] = useState<number>(0)

  async function load(){
    const snap = await getDocs(query(collection(db,'parts'), orderBy('created_date','desc'), limit(200)))
    setRows(snap.docs.map(d => ({ id:d.id, ...(d.data() as any) })))
  }
  useEffect(()=>{ load() },[])

  async function createPart(e:React.FormEvent){
    e.preventDefault()
    if(!name.trim()) return
    await addDoc(collection(db,'parts'), { name, stock:Number(stock)||0, min:Number(min)||0, created_date: serverTimestamp() })
    setName(''); setStock(0); setMin(0)
    await load()
  }

  async function adjustStock(id:string, delta:number){
    const p = rows.find(x=>x.id===id); if(!p) return
    const newVal = Math.max(0, (Number(p.stock)||0) + delta)
    await updateDoc(doc(db,'parts', id), { stock: newVal })
    await load()
  }

  return (
    <section className="card">
      <div className="badge">Inventory</div>
      <h1>Parts & Stock</h1>

      <form onSubmit={createPart} className="toolbar" style={{gap:10, flexWrap:'wrap'}}>
        <input placeholder="Part name" value={name} onChange={e=>setName(e.target.value)} />
        <input type="number" placeholder="Stock" value={stock} onChange={e=>setStock(parseInt(e.target.value||'0'))} />
        <input type="number" placeholder="Min" value={min} onChange={e=>setMin(parseInt(e.target.value||'0'))} />
        <button className="btn" type="submit">Add Part</button>
      </form>

      <table className="table">
        <thead><tr><th>Part</th><th>Stock</th><th>Min</th><th>Actions</th></tr></thead>
        <tbody>{rows.map(p=>{
          const low = (p.stock ?? 0) < (p.min ?? 0)
          return (
            <tr key={p.id!}>
              <td>{p.name} {low && <span className="badge" style={{marginLeft:8}}>Low</span>}</td>
              <td>{p.stock}</td>
              <td>{p.min}</td>
              <td>
                <button className="btn" onClick={()=>adjustStock(p.id!, +1)} type="button">+1</button>{' '}
                <button className="btn" onClick={()=>adjustStock(p.id!, -1)} type="button">-1</button>
              </td>
            </tr>
          )
        })}</tbody>
      </table>
    </section>
  )
}
