import { useState } from 'react'
import AuthWidget from './Auth'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import WorkOrders from './pages/WorkOrders'
import PM from './pages/PM'
import Inventory from './pages/Inventory'
import Safety from './pages/Safety'
import GMP from './pages/GMP'

type Tab = 'Dashboard'|'Assets'|'Work Orders'|'PM'|'Inventory'|'Safety'|'GMP'

export default function App(){
  const [tab, setTab] = useState<Tab>('Dashboard')
  const tabs: Tab[] = ['Dashboard','Assets','Work Orders','PM','Inventory','Safety','GMP']
  return (
    <div className="wrap">
      <nav>
        <span className="brand">CMMS</span>
        {tabs.map(t => (
          <a key={t} href="#" onClick={(e)=>{e.preventDefault(); setTab(t)}}
             className={tab===t ? 'active' : ''}>{t}</a>
        ))}
        <span style={{marginLeft:'auto'}}><AuthWidget/></span>
      </nav>
      <main className="card">
        {tab==='Dashboard' && <Dashboard/>}
        {tab==='Assets' && <Assets/>}
        {tab==='Work Orders' && <WorkOrders/>}
        {tab==='PM' && <PM/>}
        {tab==='Inventory' && <Inventory/>}
        {tab==='Safety' && <Safety/>}
        {tab==='GMP' && <GMP/>}
      </main>
      <footer className="muted">© {new Date().getFullYear()} CMMS</footer>
    </div>
  )
}
