'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:border-zinc-200 px-4">
      <Card className="w-full max-w-md p-8 shadow-md border border-gray-200 dark:border-zinc-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Forgot Password
        </h2>
        <p className="text-sm text-center text-gray-600 dark:text-zinc-400 mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-zinc-200 dark:border-zinc-200 dark:text-white focus:border-emerald-600 focus:ring-emerald-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
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
