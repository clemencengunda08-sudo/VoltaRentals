'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

export default function CustomersManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ color: 'white' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px' }}>Traveler Registry</h1>
      {loading ? <div>Loading...</div> : (
        <div style={{ backgroundColor: 'hsl(0, 20%, 9%)', borderRadius: '16px', border: '1px solid hsl(0, 25%, 16%)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'hsl(0, 20%, 12%)', color: 'hsl(0, 10%, 55%)', fontSize: '12px' }}>
              <tr>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Email</th>
                <th style={{ padding: '16px' }}>Phone</th>
                <th style={{ padding: '16px' }}>Verified</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid hsl(0, 25%, 16%)' }}>
                  <td style={{ padding: '16px' }}>{u.displayName || 'Unnamed'}</td>
                  <td style={{ padding: '16px' }}>{u.email}</td>
                  <td style={{ padding: '16px' }}>{u.phoneNumber || 'N/A'}</td>
                  <td style={{ padding: '16px' }}>{u.verified ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}