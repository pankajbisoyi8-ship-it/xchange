import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { Order, OrderStatus } from '../types/index.ts';
import { useAuthStore } from '../store/authStore.ts';
import { 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Star, 
  KeyRound,
  FileCheck2,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [productRating, setProductRating] = useState(5);
  const [sellerRating, setSellerRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${order.id}/cancel`, { reason: cancelReason });
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
      setCancelModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/orders/${order.id}`, {
        productRating,
        sellerRating,
        comment
      });
      setReviewSuccess(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <Link to="/orders" className="mt-4 inline-block text-brand-600 font-semibold hover:underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  const timelineSteps = [
    { key: 'PLACED', label: 'Order Placed' },
    { key: 'AGENT_ASSIGNED', label: 'Agent Assigned' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'INSPECTION_PASSED', label: 'Inspected' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered & Paid' },
  ];

  const returnTimelineSteps = [
    { key: 'DELIVERY_REFUSED', label: 'Delivery Refused' },
    { key: 'RETURN_APPROVED', label: 'Return Approved' },
    { key: 'RETURN_IN_TRANSIT', label: 'Returning to Seller' },
    { key: 'RETURNED_TO_SELLER', label: 'Returned to Seller' },
  ];

  const statusOrderIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'AGENT_ASSIGNED': return 1;
      case 'PICKUP_SCHEDULED': return 1.5;
      case 'PICKED_UP': return 2;
      case 'INSPECTION_PASSED': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      default: return -1;
    }
  };

  const returnStatusIndex = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERY_REFUSED': return 0;
      case 'RETURN_APPROVED': return 1;
      case 'RETURN_IN_TRANSIT': return 2;
      case 'RETURNED_TO_SELLER': return 3;
      default: return -1;
    }
  };

  const isReturnStatus = ['DELIVERY_REFUSED', 'RETURN_APPROVED', 'RETURN_IN_TRANSIT', 'RETURNED_TO_SELLER'].includes(order.status);
  const currentIndex = statusOrderIndex(order.status);
  const currentReturnIndex = returnStatusIndex(order.status);
  const canCancel = order.isBuyer && ['PLACED', 'AGENT_ASSIGNED', 'PICKUP_SCHEDULED'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back button & Header */}
      <div>
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold mb-3">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.isBuyer ? 'You are the Buyer' : 'You are the Seller'}
            </p>
          </div>

          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Delivery OTP Card (Crucial for COD security) */}
      {order.isBuyer && order.deliveryOtp && !['DELIVERED', 'CANCELLED', 'DELIVERY_REFUSED', 'RETURN_APPROVED', 'RETURN_IN_TRANSIT', 'RETURNED_TO_SELLER'].includes(order.status) && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-600 to-brand-600 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-sky-200">
              <KeyRound className="w-4 h-4" />
              <span>Your Handover Verification Code</span>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">Keep Confidential</span>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-extrabold tracking-widest font-mono bg-white/10 px-4 py-2 rounded-xl border border-white/20">
              {order.deliveryOtp}
            </span>
            <p className="text-xs text-sky-100 max-w-sm">
              Provide this 6-digit code to the field agent <strong>only after</strong> you examine the delivered package and hand over cash.
            </p>
          </div>
        </div>
      )}

      {/* Visual Status Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
        <h2 className="text-base font-bold text-slate-900">
          {isReturnStatus ? 'Return to Seller Progress' : 'Order & Inspection Progress'}
        </h2>

        {order.status === 'CANCELLED' ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>Order Cancelled: {order.cancelReason || 'Cancelled before delivery'}</span>
          </div>
        ) : order.status === 'INSPECTION_FAILED' ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Inspection Failed: Hardware did not pass quality checklist and will be returned to seller.</span>
          </div>
        ) : isReturnStatus ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-purple-950">
                <RotateCcw className="w-4 h-4 text-purple-700" />
                <span>Return Journey Active</span>
              </div>
              {(order.returnReason || order.refusalReason) && (
                <p className="text-purple-800">
                  <strong>Reason:</strong> {order.returnReason || order.refusalReason}
                </p>
              )}
              {order.status === 'DELIVERY_REFUSED' && (
                <p className="text-purple-700">Customer rejected delivery. Awaiting Admin review and authorization to return hardware back to seller.</p>
              )}
              {order.status === 'RETURN_APPROVED' && (
                <p className="text-purple-700">Admin has approved the return. Field agent will pick up component from customer and transport back to seller.</p>
              )}
              {order.status === 'RETURN_IN_TRANSIT' && (
                <p className="text-purple-700">Field agent has picked up the rejected hardware and is returning it to the original seller.</p>
              )}
              {order.status === 'RETURNED_TO_SELLER' && (
                <p className="text-emerald-700 font-bold">Hardware successfully handed back to seller. Return custody concluded.</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {returnTimelineSteps.map((step, idx) => {
                const isPassed = currentReturnIndex >= idx;
                const isCurrent = currentReturnIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-4 ring-purple-50'
                          : isCurrent
                          ? 'bg-purple-500 text-white ring-4 ring-purple-100 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-semibold leading-tight ${
                      isPassed ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {timelineSteps.map((step, idx) => {
                const isPassed = currentIndex >= idx;
                const isCurrent = currentIndex === idx || (idx === 1 && currentIndex === 1.5);

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50'
                          : isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-semibold leading-tight ${
                      isPassed ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hardware & Inspection Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Purchased Hardware</h3>
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
              <img
                src={order.listing.images?.[0]?.url || '/images/grafhics card.jpg'}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brand-600 uppercase">
                {order.listing.category?.name}
              </span>
              <h4 className="font-bold text-sm text-slate-900 line-clamp-2">
                {order.listing.title}
              </h4>
              <div className="text-xs text-slate-500">
                Condition: <strong className="text-slate-800">{order.listing.condition.replace('_', ' ')}</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Item Price:</span>
              <span className="font-bold text-slate-900">₹{Number(order.itemPrice).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Escort Fee:</span>
              <span className="font-bold text-slate-900">₹{Number(order.deliveryFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Cash at Handover:</span>
              <span className="text-emerald-600">₹{Number(order.totalToCollect).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Inspection Details Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Inspection Evidence</span>
            </h3>
            {order.inspection && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                order.inspection.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {order.inspection.passed ? 'Passed Inspection' : 'Failed Inspection'}
              </span>
            )}
          </div>

          {order.inspection ? (
            <div className="space-y-3 text-xs">
              {order.inspection.serialNo && (
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-medium block">Verified Serial Number:</span>
                  <span className="font-mono font-bold text-slate-800">{order.inspection.serialNo}</span>
                </div>
              )}

              {order.inspection.notes && (
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-medium block">Agent Inspection Notes:</span>
                  <span className="text-slate-700">{order.inspection.notes}</span>
                </div>
              )}

              {/* Photos taken during bench inspection */}
              {order.inspection.photos?.length > 0 && (
                <div>
                  <span className="text-slate-500 font-medium block mb-2">Agent Bench Photos:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {order.inspection.photos.map((p) => (
                      <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:opacity-80">
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Inspection will be recorded once the field agent visits the seller.
            </div>
          )}
        </div>
      </div>

      {/* Review Card for Delivered Order */}
      {order.status === 'DELIVERED' && order.isBuyer && !order.review && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900">How Was Your Hardware?</h3>
          <p className="text-xs text-slate-500">
            Leave a verified purchase rating to help build trust in the community.
          </p>

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Quality (1-5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setProductRating(star)}
                      className="p-1 text-amber-500"
                    >
                      <Star className={`w-6 h-6 ${star <= productRating ? 'fill-current' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seller Rating (1-5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSellerRating(star)}
                      className="p-1 text-amber-500"
                    >
                      <Star className={`w-6 h-6 ${star <= sellerRating ? 'fill-current' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Comment (Optional)</label>
              <textarea
                rows={3}
                placeholder="Mention packaging, condition, noise, thermal test results..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Confirm Order Cancellation</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel this order? The hardware will be released back to active listings.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for cancellation *</label>
              <textarea
                rows={3}
                placeholder="e.g. Purchased another part, changed my mind..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling || !cancelReason}
                onClick={handleCancelOrder}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

