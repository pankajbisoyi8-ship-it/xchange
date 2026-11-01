import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { Order } from '../../types/index.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { 
  Truck, 
  Banknote, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  RotateCcw,
  Zap,
  Activity,
  PackageCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const AgentDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [cashSummary, setCashSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'available' | 'returns'>('my-tasks');
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, availableRes, cashRes] = await Promise.all([
        api.get('/agent/tasks'),
        api.get('/agent/available-orders'),
        api.get('/cash/agent/summary')
      ]);
      setTasks(tasksRes.data.data || []);
      setAvailableOrders(availableRes.data.data || []);
      setCashSummary(cashRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaimOrder = async (orderId: string) => {
    setClaimingId(orderId);
    try {
      await api.post(`/agent/orders/${orderId}/claim`);
      await loadData();
      setActiveTab('my-tasks');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to claim order');
    } finally {
      setClaimingId(null);
    }
  };

  const returnTasks = tasks.filter(t => ['RETURN_APPROVED', 'RETURN_IN_TRANSIT'].includes(t.status));
  const activeDeliveryTasks = tasks.filter(t => !['RETURN_APPROVED', 'RETURN_IN_TRANSIT', 'RETURNED_TO_SELLER'].includes(t.status));

  const getStageBadge = (status: string) => {
    switch (status) {
      case 'AGENT_ASSIGNED':
      case 'PICKUP_SCHEDULED':
        return { label: 'Step 1: Collect from Seller', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'PICKED_UP':
        return { label: 'Step 2: Bench Test & Inspect', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'INSPECTION_PASSED':
        return { label: 'Step 3: Ready for Courier Dispatch', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Step 4: Buyer OTP Handover & COD', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'DELIVERED':
        return { label: 'Delivered & COD Collected', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'DELIVERY_REFUSED':
        return { label: 'Delivery Refused by Buyer', color: 'bg-rose-100 text-rose-900 border-rose-200' };
      case 'RETURN_APPROVED':
        return { label: 'Return: Pick up from Customer', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'RETURN_IN_TRANSIT':
        return { label: 'Return: Handover to Seller', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner / Agent Profile */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active on Duty
              </span>
              <span className="text-xs text-slate-300 font-medium">Zone: <strong className="text-white">{user?.area || 'All Sectors'}</strong></span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-md">
              Certified Hardware Inspector & Courier Escort • Physical Bench Testing & COD Settlement
            </p>
          </div>

          <button
            onClick={loadData}
            title="Refresh Tasks"
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all flex items-center gap-2 backdrop-blur-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Tasks</span>
          </button>
        </div>

        {/* Quick KPI Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/10">
          <Link
            to="/agent/cash"
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all group backdrop-blur-sm"
          >
            <div className="flex items-center justify-between text-xs text-purple-200">
              <span className="font-semibold flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-400" />
                Cash in Hand
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full">
                Remit →
              </span>
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-white">
              ₹{Number(cashSummary?.cashInHand || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-300 mt-0.5 block">
              {cashSummary?.activeEntriesCount || 0} collected orders pending deposit
            </span>
          </Link>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-purple-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-400" />
                Active Escorts
              </span>
              <span className="text-[10px] font-bold text-sky-300 bg-sky-900/40 px-2 py-0.5 rounded-full">
                In Progress
              </span>
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-white">
              {activeDeliveryTasks.length}
            </div>
            <span className="text-[10px] text-slate-300 mt-0.5 block">
              Orders claimed & in delivery custody
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-purple-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Ready to Claim
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded-full">
                Auto-Dispatch
              </span>
            </div>
            <div className="text-2xl font-black font-mono mt-1 text-white">
              {availableOrders.length}
            </div>
            <span className="text-[10px] text-slate-300 mt-0.5 block">
              Unassigned in your zone ready for pickup
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-slate-200/70 p-1.5 rounded-2xl flex items-center gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('my-tasks')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'my-tasks' 
              ? 'bg-white text-slate-900 shadow-md font-extrabold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-purple-600" />
          <span>Active Escorts</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono">
            {activeDeliveryTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'available' 
              ? 'bg-white text-purple-800 shadow-md font-extrabold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Available to Pick Up</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
            {availableOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'returns' 
              ? 'bg-white text-rose-800 shadow-md font-extrabold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-rose-500" />
          <span>Returns to Seller</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-mono">
            {returnTasks.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Available Orders to Claim (Auto-Dispatch) */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Orders placed by buyers ready for immediate local pickup & bench testing</span>
            <span>{availableOrders.length} Available in Sector</span>
          </div>

          {availableOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
              <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700">No Pending Pickups Available</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All hardware in your zone has been claimed. New buyer orders will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {availableOrders.map((ord) => (
                <div key={ord.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                      {ord.listing.category?.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Collect COD:</span>
                      <span className="text-sm font-extrabold font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        ₹{Number(ord.totalToCollect).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      <img src={ord.listing.images?.[0]?.url || '/images/grafhics card.jpg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">{ord.listing.title}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span className="truncate"><strong>Seller Area:</strong> {ord.listing.area}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                          <span className="truncate"><strong>Deliver To:</strong> {ord.deliveryAddress?.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleClaimOrder(ord.id)}
                      disabled={claimingId === ord.id}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{claimingId === ord.id ? 'Claiming Task...' : 'Claim & Start Pickup Trip'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Active Tasks */}
      {activeTab === 'my-tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Tasks claimed by you currently in progress</span>
            <span>{activeDeliveryTasks.length} In Progress</span>
          </div>

          {activeDeliveryTasks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
              <Truck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700">No Active Tasks In Hand</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have no claimed deliveries right now. Switch to the "Available to Pick Up" tab to grab orders!
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>View Available Orders</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeDeliveryTasks.map((task) => {
                const stage = getStageBadge(task.status);
                return (
                  <div key={task.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition-all space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${stage.color}`}>
                        {stage.label}
                      </span>
                      <div className="text-xs font-bold text-slate-900">
                        Collect COD: <span className="font-mono text-emerald-600 text-sm">₹{Number(task.totalToCollect).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        <img src={task.listing.images?.[0]?.url || '/images/grafhics card.jpg'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">{task.listing.title}</h4>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Seller:</span>
                            <strong className="text-slate-800">{task.listing.seller?.name}</strong>
                            <a href={`tel:${task.listing.seller?.phone}`} className="ml-1 text-purple-600 hover:underline inline-flex items-center gap-0.5">
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Buyer:</span>
                            <strong className="text-slate-800">{task.buyer?.name}</strong>
                            <a href={`tel:${task.deliveryAddress?.phone}`} className="ml-1 text-emerald-600 hover:underline inline-flex items-center gap-0.5">
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">Destination: {task.deliveryAddress?.line1}, {task.deliveryAddress?.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <Link
                        to={`/agent/tasks/${task.id}`}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>Open Task Console</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Returns to Seller */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Hardware refused by customers approved for return back to seller</span>
            <span>{returnTasks.length} Returns</span>
          </div>

          {returnTasks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700">No Outstanding Returns</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no customer refused packages awaiting return trip right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {returnTasks.map((ret) => (
                <div key={ret.id} className="bg-white p-6 rounded-3xl border border-rose-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                      {ret.status === 'RETURN_APPROVED' ? 'Return Step 1: Pick Up from Customer' : 'Return Step 2: Handover to Seller'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Order #{ret.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-2xl text-xs text-rose-900 space-y-1">
                    <span className="font-bold">Customer Refusal Reason:</span>
                    <p>{ret.returnReason || ret.refusalReason || 'Customer rejected package'}</p>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      <img src={ret.listing.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-extrabold text-sm text-slate-900">{ret.listing.title}</h4>
                      <div className="text-xs text-slate-500">
                        Seller: <strong>{ret.listing.seller?.name}</strong> ({ret.listing.area})
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <Link
                      to={`/agent/tasks/${ret.id}`}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Execute Return Handover</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
