import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { ChevronLeft, ShieldCheck, Clock, FileText } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading audit trail...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Operations</span>
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Security & Action Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-1">Immutable trace of status overrides, inspection submissions, and financial reconciliations</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Entity</th>
                <th className="px-5 py-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-bold text-brand-600">
                    {log.action}
                  </td>
                  <td className="px-5 py-3 text-slate-800">
                    {log.actor?.name || 'System'} <span className="text-slate-400">({log.actor?.role || 'SYSTEM'})</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {log.entity} #{log.entityId?.slice(-6)}
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-xs truncate">
                    {log.meta ? JSON.stringify(log.meta) : '—'}
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

