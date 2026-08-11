'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !id) {
      return setMessage('Invalid or missing reset token.');
    }
    if (password !== confirm) {
      return setMessage('Passwords do not match.');
    }
    if (password.length < 6) {
      return setMessage('Password must be at least 6 characters.');
    }

    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id, password }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:border-zinc-200 px-4">
      <Card className="w-full max-w-md p-8 shadow-md border border-gray-200 dark:border-zinc-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              New Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-zinc-200 dark:border-zinc-200 dark:text-white focus:border-emerald-600 focus:ring-emerald-500 sm:text-sm"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-zinc-200 dark:border-zinc-200 dark:text-white focus:border-emerald-600 focus:ring-emerald-500 sm:text-sm"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        {message && (
          <p className="mt-6 text-sm text-center text-emerald-600 dark:text-emerald-400">
            {message}
          </p>
        )}
      </Card>
    </div>
  );
}
