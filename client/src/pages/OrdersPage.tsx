import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { Order } from '../types/index.ts';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'bought' | 'sold'>('bought');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.get('/orders/mine');
        setOrders(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const boughtOrders = orders.filter(o => o.isBuyer);
  const soldOrders = orders.filter(o => o.isSeller);
  const displayedOrders = activeTab === 'bought' ? boughtOrders : soldOrders;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">Order Placed</span>;
      case 'AGENT_ASSIGNED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700">Agent Assigned</span>;
      case 'PICKUP_SCHEDULED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">Pickup Scheduled</span>;
      case 'PICKED_UP':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700">Item Picked Up</span>;
      case 'INSPECTION_PASSED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">Inspection Passed</span>;
      case 'INSPECTION_FAILED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700">Inspection Failed</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">Out for Delivery</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600 text-white">Delivered & Paid</span>;
      case 'DELIVERY_REFUSED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Delivery Refused</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Personal Account Hub</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Orders & Sold Hardware</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track field inspection benchmarks, agent escorts, OTP codes, and seller payouts</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1.5 bg-slate-200/70 rounded-2xl text-xs font-bold self-start sm:self-center">
          <button
            onClick={() => setActiveTab('bought')}
            className={`px-5 py-2.5 rounded-xl transition-all ${
              activeTab === 'bought' ? 'bg-white text-slate-900 shadow-md font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Purchases ({boughtOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('sold')}
            className={`px-5 py-2.5 rounded-xl transition-all ${
              activeTab === 'sold' ? 'bg-white text-slate-900 shadow-md font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sold Hardware ({soldOrders.length})
          </button>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Transactions</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">{orders.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block">In Transit / Active</span>
          <div className="text-2xl font-black font-mono text-sky-600 mt-0.5">
            {orders.filter(o => ['AGENT_ASSIGNED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'INSPECTION_PASSED', 'OUT_FOR_DELIVERY'].includes(o.status)).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block">Completed Deliveries</span>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-0.5">
            {orders.filter(o => o.status === 'DELIVERED').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block">Returns / Disputed</span>
          <div className="text-2xl font-black font-mono text-rose-600 mt-0.5">
            {orders.filter(o => ['DELIVERY_REFUSED', 'RETURN_APPROVED', 'RETURN_IN_TRANSIT', 'RETURNED_TO_SELLER'].includes(o.status)).length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === 'bought' ? 'No orders placed yet' : 'No hardware sold yet'}
          </h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'bought'
              ? 'Find verified used PC components and order with zero risk.'
              : 'List your PC parts to find local buyers effortlessly.'}
          </p>
          <Link
            to={activeTab === 'bought' ? '/browse' : '/listings/new'}
            className="inline-block px-5 py-2 text-xs font-bold text-white bg-brand-600 rounded-lg shadow-sm"
          >
            {activeTab === 'bought' ? 'Browse Hardware' : 'List Component'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="group block bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    <img
                      src={order.listing.images?.[0]?.url || '/images/grafhics card.jpg'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide">
                        {order.listing.category?.name || 'Hardware'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {order.listing.title}
                    </h3>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Total: <strong className="text-slate-800">₹{Number(order.totalToCollect).toLocaleString()}</strong></span>
                      {order.agent && (
                        <span>Agent: <strong className="text-slate-700">{order.agent.name}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {getStatusBadge(order.status)}
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

