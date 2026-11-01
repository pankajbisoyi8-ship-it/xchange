import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { ChevronLeft, Banknote, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const AdminLedgerPage: React.FC = () => {
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadLedger = async () => {
    try {
      const res = await api.get('/cash/admin/ledger');
      setLedgerData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleConfirmRemittance = async (id: string) => {
    if (!confirm('Confirm receipt of cash remittance from field agent?')) return;
    setProcessingId(id);
    try {
      await api.post(`/cash/admin/confirm-remittance/${id}`);
      await loadLedger();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to confirm remittance');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReleasePayout = async (id: string) => {
    if (!confirm('Authorize seller net payout release for this delivered item?')) return;
    setProcessingId(id);
    try {
      await api.post(`/cash/admin/release-payout/${id}`);
      await loadLedger();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to release payout');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading cash ledger...</div>;
  }

  const { metrics, entries } = ledgerData || { metrics: {}, entries: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Operations</span>
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Financial Ledger & Settlement Hub</h1>
        <p className="text-xs text-slate-500 mt-1">Reconcile COD collections from agents and disburse seller payouts</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Cash With Field Agents</span>
          <div className="text-3xl font-extrabold font-mono text-purple-700">
            ₹{Number(metrics?.totalWithAgents || 0).toLocaleString()}
          </div>
          {metrics?.overdueCount > 0 && (
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{metrics.overdueCount} entries overdue {'>'} 24h</span>
            </span>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Remitted to Platform</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-600">
            ₹{Number(metrics?.totalRemitted || 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">Reconciled in bank / safe</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Pending Seller Payouts</span>
          <div className="text-3xl font-extrabold font-mono text-sky-600">
            ₹{Number(metrics?.totalPendingPayout || 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">Ready to transfer to verified sellers</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Collected COD</th>
                <th className="px-5 py-3">Seller Net Payout</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Remitted At</th>
                <th className="px-5 py-3">Payout Released</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((item: any) => (
                <tr key={item.id} className={`hover:bg-slate-50/50 ${item.isOverdue ? 'bg-rose-50/30' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{item.order?.listing?.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Seller: {item.order?.listing?.seller?.name} • Buyer: {item.order?.buyer?.name}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-slate-900">
                    ₹{Number(item.amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-emerald-600">
                    ₹{Number(item.sellerPayout).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'WITH_AGENT'
                        ? 'bg-purple-100 text-purple-800'
                        : item.status === 'REMITTED'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    {item.isOverdue && (
                      <span className="block text-[10px] text-rose-600 font-bold mt-0.5">⚠️ Overdue</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {item.remittedAt ? new Date(item.remittedAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {item.payoutAt ? new Date(item.payoutAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {item.status === 'WITH_AGENT' && (
                      <button
                        onClick={() => handleConfirmRemittance(item.id)}
                        disabled={processingId === item.id}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px] shadow-sm"
                      >
                        Confirm Remittance
                      </button>
                    )}
                    {item.status === 'REMITTED' && (
                      <button
                        onClick={() => handleReleasePayout(item.id)}
                        disabled={processingId === item.id}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] shadow-sm"
                      >
                        Release Seller Payout
                      </button>
                    )}
                    {item.status === 'PAYOUT_RELEASED' && (
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Settled</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

