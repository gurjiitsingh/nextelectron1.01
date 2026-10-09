'use client';

import { useState } from 'react';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);

  // =====================================================
// SYNC ICON
// =====================================================

function SyncIcon({
  size = 20,
}: {
  size?: number;
}) {

  return (

    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path
        d="M20 11a8.1 8.1 0 0 0-14.8-4L3 9"
      />

      <path
        d="M3 4v5h5"
      />

      <path
        d="M4 13a8.1 8.1 0 0 0 14.8 4L21 15"
      />

      <path
        d="M21 20v-5h-5"
      />

    </svg>

  );

}

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
      className="p-1 rounded-full bg-blue-600 text-white disabled:opacity-50"
    >
      {loading ? 'Syncing...' : <> <SyncIcon      size={20}/></>}
    </button>
  );
}