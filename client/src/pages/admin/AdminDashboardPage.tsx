import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Truck, 
  Banknote, 
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Package,
  Activity,
  ChevronRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading platform command analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Platform Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Live Control Room
              </span>
              <span className="text-xs text-slate-300 font-medium">PostgreSQL Engine: <strong className="text-emerald-400">Connected</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Operations Center</h1>
            <p className="text-xs text-slate-300 max-w-lg">
              Moderation queue, field agent courier oversight, physical hardware inspection verification, and COD remittance ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/listings"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Review Queue</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono">
                {stats?.listings?.pendingReview || 0}
              </span>
            </Link>
            <Link
              to="/admin/orders"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-1.5 backdrop-blur-md"
            >
              <span>Dispatch Hub</span>
            </Link>
            <Link
              to="/admin/ledger"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-1.5 backdrop-blur-md"
            >
              <span>Cash Ledger</span>
            </Link>
          </div>
        </div>

        {/* Highlight Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-300 font-semibold block">Pending Listing Approvals</span>
            <div className="text-3xl font-black font-mono text-amber-400 mt-1">
              {stats?.listings?.pendingReview || 0}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Awaiting physical spec review</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-300 font-semibold block">Cash in Agent Custody</span>
            <div className="text-3xl font-black font-mono text-purple-300 mt-1">
              ₹{Number(stats?.financials?.cashWithAgents || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {stats?.financials?.overdueRemittances > 0 ? (
                <span className="text-rose-400 font-bold">⚠️ {stats.financials.overdueRemittances} overdue {'>'} 24h</span>
              ) : (
                'All agent balances current'
              )}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-300 font-semibold block">Earned Commission</span>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
              ₹{Number(stats?.financials?.totalCommission || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">5% on verified handovers</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-300 font-semibold block">Platform Members</span>
            <div className="text-3xl font-black font-mono text-sky-400 mt-1">
              {stats?.users?.total || 0}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">{stats?.users?.agents || 0} active field agents</span>
          </div>
        </div>
      </div>

      {/* Navigation Modules Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/admin/listings"
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700">Listing Moderation</h3>
            <p className="text-xs text-slate-500 mt-1">Audit specs, images and pricing before components go live.</p>
          </div>
          <div className="pt-2 flex items-center text-xs font-bold text-amber-700 gap-1">
            <span>Moderate Queue</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-lg transition-all group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700">Orders & Dispatch</h3>
            <p className="text-xs text-slate-500 mt-1">Monitor pickups, approve customer returns & track couriers.</p>
          </div>
          <div className="pt-2 flex items-center text-xs font-bold text-sky-700 gap-1">
            <span>Open Dispatch Hub</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/ledger"
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700">Cash Ledger & Payouts</h3>
            <p className="text-xs text-slate-500 mt-1">Reconcile agent remittances and authorize seller payouts.</p>
          </div>
          <div className="pt-2 flex items-center text-xs font-bold text-purple-700 gap-1">
            <span>Review Ledger</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all group space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700">Community & Agents</h3>
            <p className="text-xs text-slate-500 mt-1">Onboard verified field agents and manage accounts.</p>
          </div>
          <div className="pt-2 flex items-center text-xs font-bold text-emerald-700 gap-1">
            <span>Manage Users</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Live Stream Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              <span>Recent Marketplace Orders</span>
            </h3>
            <Link to="/admin/orders" className="text-xs font-bold text-brand-600 hover:underline">
              View All ({stats?.orders?.total || 0})
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentOrders?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No orders placed yet.</div>
            ) : (
              stats?.recentOrders?.map((ord: any) => (
                <div key={ord.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{ord.listing?.title}</div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-2">
                      <span>Buyer: <strong className="text-slate-700">{ord.buyer?.name}</strong></span>
                      <span>•</span>
                      <span>Agent: <strong className="text-purple-700">{ord.agent?.name || 'Unassigned'}</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-extrabold text-slate-900 text-sm">
                      ₹{Number(ord.totalToCollect).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{ord.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>Security & Audit Trail</span>
            </h3>
            <Link to="/admin/audit" className="text-xs font-bold text-brand-600 hover:underline">
              Full Logs
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentAudits?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No audit events recorded.</div>
            ) : (
              stats?.recentAudits?.map((log: any) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800">
                      {log.action}
                    </span>
                    <div className="text-slate-400 text-[11px]">
                      By: <strong className="text-slate-700">{log.actor?.name || 'System'}</strong> ({log.actor?.role || 'SYSTEM'})
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
