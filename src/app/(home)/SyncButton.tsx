'use client';

import { useState } from 'react';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    try {
      setLoading(true);

      const res = await window.posApi.syncAll();
  
      console.log('SYNC RESULT', res);

      alert('Data synced successfully');
    } catch (e) {
      console.error(e);
      alert('Sync failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
    >
      {loading ? 'Syncing...' : 'Reload Data'}
    </button>
  );
}