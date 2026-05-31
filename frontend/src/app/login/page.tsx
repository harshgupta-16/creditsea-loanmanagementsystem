'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const DEMO_CREDS = [
  { label: 'Admin', email: 'admin@creditsea.com', pass: 'Admin@123', icon: '🛡️' },
  { label: 'Sales', email: 'sales@creditsea.com', pass: 'Sales@123', icon: '📊' },
  { label: 'Sanction', email: 'sanction@creditsea.com', pass: 'Sanction@123', icon: '✅' },
  { label: 'Disbursement', email: 'disbursement@creditsea.com', pass: 'Disbursement@123', icon: '💰' },
  { label: 'Collection', email: 'collection@creditsea.com', pass: 'Collection@123', icon: '📋' },
  { label: 'Borrower', email: 'borrower@creditsea.com', pass: 'Borrower@123', icon: '👤' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password.trim());
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 relative overflow-hidden mesh-bg">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-[120px] animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-accent-500/15 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-800/8 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      <div className="w-full max-w-[540px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center animate-glow">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">CreditSea</h1>
          </div>
          <p className="text-surface-400 text-sm">Secure access to your financial dashboard</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-2xl p-6 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger-500/10 border border-danger-500/20 text-danger-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider pl-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="glass-input pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-primary-400 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 glass-button rounded-xl mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-surface-500 text-sm">
              New to CreditSea?{' '}
              <Link href="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors underline underline-offset-4 decoration-primary-400/30 hover:decoration-primary-400">
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials — 3-column grid */}
        <div className="glass-panel rounded-2xl p-4">
          <p className="text-[10px] text-surface-500 font-bold mb-3 tracking-[0.25em] uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            Quick Access — Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_CREDS.map((creds) => (
              <button
                key={creds.email}
                type="button"
                className="group text-left cursor-pointer glass-panel-hover rounded-xl p-3"
                onClick={() => {
                  setEmail(creds.email);
                  setPassword(creds.pass);
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{creds.icon}</span>
                  <span className="text-white font-semibold text-xs group-hover:text-primary-400 transition-colors">{creds.label}</span>
                </div>
                <p className="text-surface-500 text-[10px] truncate leading-relaxed">{creds.email}</p>
                <p className="text-surface-600 text-[10px] font-mono">{creds.pass}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
