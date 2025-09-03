import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export interface Asset {
  name: string
  status: 'Running' | 'Down' | 'Standby' | 'Maintenance'
  location: string
  type: string
  description?: string
  lastMaintenance?: any
  nextMaintenance?: any
  created_date?: any
}

const sampleAssets: Asset[] = [
  {
    name: 'Compressor Unit #1',
    status: 'Running',
    location: 'Plant A - Floor 1',
    type: 'Compressor',
    description: 'Main air compressor for production line 1',
    lastMaintenance: new Date('2024-01-15'),
    nextMaintenance: new Date('2024-04-15')
  },
  {
    name: 'Conveyor Belt #3',
    status: 'Running',
    location: 'Plant A - Floor 2',
    type: 'Conveyor',
    description: 'High-speed conveyor for packaging line',
    lastMaintenance: new Date('2024-02-01'),
    nextMaintenance: new Date('2024-05-01')
  },
  {
    name: 'Hydraulic Press #2',
    status: 'Maintenance',
    location: 'Plant B - Floor 1',
    type: 'Press',
    description: 'Heavy-duty hydraulic press for metal forming',
    lastMaintenance: new Date('2024-02-20'),
    nextMaintenance: new Date('2024-02-25')
  },
  {
    name: 'Cooling Tower #1',
    status: 'Running',
    location: 'Plant A - Rooftop',
    type: 'Cooling System',
    description: 'Industrial cooling tower for temperature control',
    lastMaintenance: new Date('2024-01-30'),
    nextMaintenance: new Date('2024-04-30')
  },
  {
    name: 'Generator Backup #1',
    status: 'Standby',
    location: 'Plant A - Basement',
    type: 'Generator',
    description: 'Emergency backup generator (500kW)',
    lastMaintenance: new Date('2024-01-10'),
    nextMaintenance: new Date('2024-07-10')
  },
  {
    name: 'Pump Station #2',
    status: 'Down',
    location: 'Plant B - Floor 2',
    type: 'Pump',
    description: 'Water circulation pump for cooling system',
    lastMaintenance: new Date('2024-02-10'),
    nextMaintenance: new Date('2024-02-12')
  },
  {
    name: 'Mixer Unit #4',
    status: 'Running',
    location: 'Plant A - Floor 3',
    type: 'Mixer',
    description: 'Industrial mixer for chemical processing',
    lastMaintenance: new Date('2024-02-05'),
    nextMaintenance: new Date('2024-05-05')
  },
  {
    name: 'Boiler System #1',
    status: 'Running',
    location: 'Plant A - Utility Room',
    type: 'Boiler',
    description: 'Steam boiler for heating and processing',
    lastMaintenance: new Date('2024-01-20'),
    nextMaintenance: new Date('2024-04-20')
  },
  {
    name: 'Crane #3',
    status: 'Standby',
    location: 'Plant B - Loading Bay',
    type: 'Crane',
    description: 'Overhead crane for heavy lifting operations',
    lastMaintenance: new Date('2024-01-25'),
    nextMaintenance: new Date('2024-04-25')
  },
  {
    name: 'Dust Collector #2',
    status: 'Running',
    location: 'Plant A - Floor 2',
    type: 'Environmental',
    description: 'Industrial dust collection system',
    lastMaintenance: new Date('2024-02-15'),
    nextMaintenance: new Date('2024-05-15')
  },
  {
    name: 'Control Panel #5',
    status: 'Running',
    location: 'Plant A - Control Room',
    type: 'Electrical',
    description: 'Main control panel for production line 2',
    lastMaintenance: new Date('2024-01-12'),
    nextMaintenance: new Date('2024-04-12')
  },
  {
    name: 'Heat Exchanger #1',
    status: 'Maintenance',
    location: 'Plant B - Floor 1',
    type: 'Heat Exchanger',
    description: 'Plate heat exchanger for temperature control',
    lastMaintenance: new Date('2024-02-18'),
    nextMaintenance: new Date('2024-02-22')
  }
]

export async function seedAssets(): Promise<void> {
  try {
    console.log('🌱 Starting asset seeding...')
    
    const assetsCollection = collection(db, 'assets')
    const promises = sampleAssets.map(async (asset) => {
      const assetData = {
        ...asset,
        created_date: serverTimestamp(),
        lastMaintenance: asset.lastMaintenance,
        nextMaintenance: asset.nextMaintenance
      }
      
      const docRef = await addDoc(assetsCollection, assetData)
      console.log(`✅ Added asset: ${asset.name} (ID: ${docRef.id})`)
      return docRef
    })
    
    await Promise.all(promises)
    console.log(`🎉 Successfully seeded ${sampleAssets.length} assets!`)
    
  } catch (error) {
    console.error('❌ Error seeding assets:', error)
    throw error
  }
}

export async function clearAssets(): Promise<void> {
  try {
    console.log('🗑️ Clearing all assets...')
    // Note: This would require admin SDK or a cloud function
    // For now, we'll just log the intention
    console.log('⚠️ Asset clearing requires admin privileges or cloud function')
  } catch (error) {
    console.error('❌ Error clearing assets:', error)
    throw error
  }
}
