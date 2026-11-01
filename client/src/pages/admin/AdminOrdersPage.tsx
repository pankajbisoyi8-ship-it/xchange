import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { Order, User } from '../../types/index.ts';
import { ChevronLeft, Truck, CheckCircle2, UserCheck, Package, RotateCcw, AlertTriangle } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNASSIGNED' | 'ACTIVE' | 'RETURNS'>('ALL');

  const loadData = async () => {
    try {
      const [ordersRes, usersRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/users?role=AGENT')
      ]);
      setOrders(ordersRes.data.data || []);
      setAgents(usersRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignAgent = async (orderId: string) => {
    if (!selectedAgentId) return;
    setProcessing(true);
    try {
      await api.post(`/admin/orders/${orderId}/assign`, { agentId: selectedAgentId });
      setAssigningOrderId(null);
      setSelectedAgentId('');
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to assign agent');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveReturn = async (orderId: string) => {
    const notes = window.prompt('Enter notes or instructions for field agent (optional):') ?? '';
    setProcessing(true);
    try {
      await api.post(`/admin/orders/${orderId}/approve-return`, { notes });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to approve return');
    } finally {
      setProcessing(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (activeTab === 'UNASSIGNED') return ord.status === 'PLACED';
    if (activeTab === 'ACTIVE') return ['AGENT_ASSIGNED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'INSPECTION_PASSED', 'OUT_FOR_DELIVERY'].includes(ord.status);
    if (activeTab === 'RETURNS') return ['DELIVERY_REFUSED', 'INSPECTION_FAILED', 'RETURN_APPROVED', 'RETURN_IN_TRANSIT', 'RETURNED_TO_SELLER'].includes(ord.status);
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'AGENT_ASSIGNED':
      case 'PICKUP_SCHEDULED':
      case 'PICKED_UP':
      case 'INSPECTION_PASSED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DELIVERY_REFUSED':
      case 'INSPECTION_FAILED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'RETURN_APPROVED':
      case 'RETURN_IN_TRANSIT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'RETURNED_TO_SELLER':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading orders...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Operations</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Orders & Field Agent Dispatch</h1>
          <p className="text-xs text-slate-500 mt-1">Assign field agents to new orders and approve customer returns back to sellers</p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('UNASSIGNED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'UNASSIGNED' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Dispatch ({orders.filter(o => o.status === 'PLACED').length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ACTIVE' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Deliveries ({orders.filter(o => ['AGENT_ASSIGNED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'INSPECTION_PASSED', 'OUT_FOR_DELIVERY'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setActiveTab('RETURNS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'RETURNS' ? 'bg-white text-purple-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Returns & Disputes ({orders.filter(o => ['DELIVERY_REFUSED', 'INSPECTION_FAILED', 'RETURN_APPROVED', 'RETURN_IN_TRANSIT', 'RETURNED_TO_SELLER'].includes(o.status)).length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Component</th>
                <th className="px-5 py-3">Buyer & Area</th>
                <th className="px-5 py-3">Price (COD)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Assigned Agent</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    No orders found in this view.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-mono font-bold text-slate-700">
                      #{ord.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 line-clamp-1">{ord.listing?.title}</span>
                      <span className="text-[11px] text-slate-400">{ord.listing?.category?.name}</span>
                      {(ord.returnReason || ord.refusalReason) && (
                        <div className="mt-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <strong>Reason:</strong> {ord.returnReason || ord.refusalReason}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{ord.buyer?.name}</div>
                      <div className="text-[11px] text-slate-400">{ord.deliveryAddress?.city}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      ₹{Number(ord.totalToCollect).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {assigningOrderId === ord.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs outline-none"
                          >
                            <option value="">Select Agent...</option>
                            {agents.map((a) => (
                              <option key={a.id} value={a.id}>{a.name} ({a.area})</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignAgent(ord.id)}
                            disabled={processing || !selectedAgentId}
                            className="px-2 py-1 bg-brand-600 text-white rounded font-bold"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-700">
                          {ord.agent?.name || <em className="text-rose-500 font-bold">Unassigned</em>}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {ord.status === 'PLACED' && assigningOrderId !== ord.id && (
                        <button
                          onClick={() => {
                            setAssigningOrderId(ord.id);
                            setSelectedAgentId('');
                          }}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px]"
                        >
                          Assign Agent
                        </button>
                      )}

                      {['DELIVERY_REFUSED', 'INSPECTION_FAILED'].includes(ord.status) && (
                        <button
                          onClick={() => handleApproveReturn(ord.id)}
                          disabled={processing}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Approve Return</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

