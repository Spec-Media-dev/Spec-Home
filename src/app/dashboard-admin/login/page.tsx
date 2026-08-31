"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loginAdmin } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await loginAdmin(email, password);

    if (result.success) {
      router.push('/dashboard-admin');
      router.refresh();
    } else {
      setError(result.error || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tighter text-white mb-2">
            SPEC <span className="font-light text-neutral-400">ADMIN</span>
          </h1>
          <p className="text-sm text-neutral-500">Sign in to manage your website</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all"
              placeholder="admin@spechome.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-medium rounded-lg px-4 py-3 text-sm hover:bg-neutral-200 transition-colors flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <p className="text-xs text-neutral-600 text-center mt-4">
            Demo: admin@spechome.com / admin123
          </p>
        </form>
      </motion.div>
    </div>
  );
}
