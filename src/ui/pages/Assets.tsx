import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

type Asset = { id?: string; name: string; status: 'Running' | 'Down' | 'Standby'; location: string; created_date?: any };

export default function Assets() {
  const [rows, setRows] = useState<Asset[]>([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'Running' | 'Down' | 'Standby'>('Running');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  // Load data in real-time
  useEffect(() => {
    const q = query(collection(db, 'assets'), orderBy('created_date', 'desc'), limit(200));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        setIsLoading(false);
        setError(null);
      },
      (e) => {
        console.error('Error fetching assets:', e);
        setError('Failed to load assets. Please try again later.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function createAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      alert('Name and Location cannot be empty.');
      return;
    }
    try {
      await addDoc(collection(db, 'assets'), { name, status, location, created_date: serverTimestamp() });
      resetForm();
    } catch (e) {
      console.error('Error adding asset:', e);
      alert('Failed to add asset. Check console for details.');
    }
  }

  async function updateAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAssetId || !name.trim() || !location.trim()) {
      alert('Name and Location cannot be empty.');
      return;
    }
    try {
      await updateDoc(doc(db, 'assets', editingAssetId), { name, status, location });
      resetForm();
    } catch (e) {
      console.error('Error updating asset:', e);
      alert('Failed to update asset. Check console for details.');
    }
  }

  async function deleteAsset(id: string) {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteDoc(doc(db, 'assets', id));
      } catch (e) {
        console.error('Error deleting asset:', e);
        alert('Failed to delete asset. Check console for details.');
      }
    }
  }

  function startEditing(asset: Asset) {
    if (asset.id) {
      setEditingAssetId(asset.id);
      setName(asset.name);
      setStatus(asset.status);
      setLocation(asset.location);
    }
  }

  function resetForm() {
    setEditingAssetId(null);
    setName('');
    setStatus('Running');
    setLocation('');
  }

  return (
    <section className="card">
      <div className="badge">Assets</div>
      <h1>Asset Register</h1>

      <form onSubmit={editingAssetId ? updateAsset : createAsset} className="toolbar" style={{ gap: 10, flexWrap: 'wrap' }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <select value={status} onChange={e => setStatus(e.target.value as any)}>
          <option>Running</option><option>Down</option><option>Standby</option>
        </select>
        <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
        <button className="btn" type="submit">
          {editingAssetId ? 'Update Asset' : 'Add Asset'}
        </button>
        {editingAssetId && (
          <button className="btn" type="button" onClick={resetForm} style={{ background: 'var(--line)', color: 'var(--text)' }}>Cancel</button>
        )}
      </form>

      {isLoading && <p>Loading assets...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!isLoading && !error && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(a => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.status}</td>
                <td>{a.location}</td>
                <td>
                  <button className="btn" type="button" onClick={() => startEditing(a)}>Edit</button>{' '}
                  <button className="btn" type="button" onClick={() => a.id && deleteAsset(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
