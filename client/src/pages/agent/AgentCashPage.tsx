import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { ChevronLeft, Banknote, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export const AgentCashPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [declaring, setDeclaring] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    try {
      const res = await api.get('/cash/agent/summary');
      setSummary(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleToggleEntry = (id: string) => {
    if (selectedEntryIds.includes(id)) {
      setSelectedEntryIds(selectedEntryIds.filter(i => i !== id));
    } else {
      setSelectedEntryIds([...selectedEntryIds, id]);
    }
  };

  const handleSelectAll = () => {
    const active = summary?.history?.filter((e: any) => e.status === 'WITH_AGENT') || [];
    if (selectedEntryIds.length === active.length) {
      setSelectedEntryIds([]);
    } else {
      setSelectedEntryIds(active.map((e: any) => e.id));
    }
  };

  const handleDeclareRemittance = async () => {
    if (selectedEntryIds.length === 0) return;
    setDeclaring(true);
    try {
      await api.post('/cash/agent/remit', { entryIds: selectedEntryIds });
      await loadSummary();
      setSelectedEntryIds([]);
      alert('Remittance declared. An admin will reconcile and confirm.');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to declare remittance');
    } finally {
      setDeclaring(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading cash ledger...</div>;
  }

  const unremittedEntries = summary?.history?.filter((e: any) => e.status === 'WITH_AGENT') || [];
  const remittedEntries = summary?.history?.filter((e: any) => e.status !== 'WITH_AGENT') || [];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <Link to="/agent" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Tasks</span>
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Cash Ledger & Remittance</h1>
        <p className="text-xs text-slate-500 mt-0.5">Declare physical cash deposits to platform administration</p>
      </div>

      {/* Cash In Hand Counter */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Total Cash In Hand</span>
          </span>
          <span className="text-[11px] bg-slate-800 px-2.5 py-0.5 rounded-full font-semibold">
            {unremittedEntries.length} Pending
          </span>
        </div>
        <div className="text-4xl font-extrabold font-mono text-emerald-400">
          ₹{Number(summary?.cashInHand || 0).toLocaleString()}
        </div>
        <div className="text-xs text-slate-400 pt-1">
          Must be deposited to platform within 24 hours of collection.
        </div>
      </div>

      {/* Unremitted Cash Orders */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Orders Collected Awaiting Remittance</h2>
          {unremittedEntries.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-purple-600 hover:underline"
            >
              {selectedEntryIds.length === unremittedEntries.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {unremittedEntries.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
            No pending cash in hand. All collections are reconciled!
          </div>
        ) : (
          <div className="space-y-2">
            {unremittedEntries.map((entry: any) => (
              <label
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                  selectedEntryIds.includes(entry.id)
                    ? 'border-purple-600 bg-purple-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEntryIds.includes(entry.id)}
                    onChange={() => handleToggleEntry(entry.id)}
                    className="rounded text-purple-600 focus:ring-0 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-slate-900">{entry.order?.listing?.title || 'Order'}</div>
                    <div className="text-slate-400 text-[11px]">
                      Buyer: {entry.order?.buyer?.name} • {new Date(entry.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-slate-900">
                  ₹{Number(entry.amount).toLocaleString()}
                </div>
              </label>
            ))}
          </div>
        )}

        {unremittedEntries.length > 0 && (
          <button
            onClick={handleDeclareRemittance}
            disabled={declaring || selectedEntryIds.length === 0}
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all disabled:opacity-50"
          >
            {declaring ? 'Submitting...' : `Declare Remittance for Selected (${selectedEntryIds.length})`}
          </button>
        )}
      </div>

      {/* Remitted / Settled History */}
      {remittedEntries.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Past Remittance History</h2>
          <div className="space-y-2 text-xs">
            {remittedEntries.map((entry: any) => (
              <div key={entry.id} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{entry.order?.listing?.title}</span>
                  <div className="text-[11px] text-slate-400">
                    Status: <strong className="text-emerald-700">{entry.status}</strong> • {new Date(entry.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-mono font-bold text-slate-700">
                  ₹{Number(entry.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

