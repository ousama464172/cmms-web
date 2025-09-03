import React, { useState } from 'react'
import { seedAssets } from '../lib/seedAssets'

export default function AssetSeeder() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seededCount, setSeededCount] = useState(0)

  const handleSeedAssets = async () => {
    setIsSeeding(true)
    try {
      await seedAssets()
      setSeededCount(12) // We know we're seeding 12 assets
      alert('✅ Successfully seeded 12 sample assets! Click "Load assets" to see them.')
    } catch (error) {
      console.error('Seeding error:', error)
      alert('❌ Failed to seed assets. Check console for details.')
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div style={{ 
      background: '#f8fafc', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px', 
      padding: '16px', 
      marginBottom: '20px' 
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>🌱 Asset Seeder</h3>
      <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>
        Populate your database with sample assets for testing and development.
      </p>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button 
          className="btn" 
          onClick={handleSeedAssets}
          disabled={isSeeding}
          style={{ 
            background: isSeeding ? '#9ca3af' : '#10b981',
            fontSize: '14px',
            padding: '8px 16px'
          }}
        >
          {isSeeding ? '⏳ Seeding...' : '🌱 Seed Sample Assets'}
        </button>
        
        {seededCount > 0 && (
          <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
            ✅ {seededCount} assets seeded
          </span>
        )}
      </div>
      
      <details style={{ marginTop: '12px' }}>
        <summary style={{ cursor: 'pointer', color: '#64748b', fontSize: '12px' }}>
          What assets will be created?
        </summary>
        <ul style={{ 
          margin: '8px 0 0 0', 
          paddingLeft: '20px', 
          fontSize: '12px', 
          color: '#64748b' 
        }}>
          <li>Compressor Unit #1 (Running)</li>
          <li>Conveyor Belt #3 (Running)</li>
          <li>Hydraulic Press #2 (Maintenance)</li>
          <li>Cooling Tower #1 (Running)</li>
          <li>Generator Backup #1 (Standby)</li>
          <li>Pump Station #2 (Down)</li>
          <li>Mixer Unit #4 (Running)</li>
          <li>Boiler System #1 (Running)</li>
          <li>Crane #3 (Standby)</li>
          <li>Dust Collector #2 (Running)</li>
          <li>Control Panel #5 (Running)</li>
          <li>Heat Exchanger #1 (Maintenance)</li>
        </ul>
      </details>
    </div>
  )
}
