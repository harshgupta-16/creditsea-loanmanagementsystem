'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Lead } from '@/types';

export default function SalesModule() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'no-loan' | 'has-loan'>('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await api.getLeads();
      setLeads(data.leads);
    } catch {
      console.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (filter === 'no-loan') return !lead.hasLoan;
    if (filter === 'has-loan') return lead.hasLoan;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Sales — Lead Tracking</h2>
          <p className="text-surface-500 text-sm mt-1">Registered users and their application status</p>
        </div>
        <div className="flex gap-1.5 bg-surface-900/50 p-1 rounded-xl border border-white/[0.06]">
          {(['all', 'no-loan', 'has-loan'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-primary-500/15 text-primary-400 shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'no-loan' ? 'No Loan' : 'Has Loan'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Email</th>
                <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Profile</th>
                <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Loans</th>
                <th className="text-left text-[10px] font-bold text-surface-500 uppercase tracking-wider px-6 py-4">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">{lead.fullName}</td>
                  <td className="px-6 py-4 text-sm text-surface-400">{lead.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${
                      lead.profileComplete
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {lead.profileComplete ? '✓ Complete' : '⏳ Incomplete'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-300 font-mono">{lead.loanCount}</td>
                  <td className="px-6 py-4 text-sm text-surface-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-500">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
