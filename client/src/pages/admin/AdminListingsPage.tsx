import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { Listing } from '../../types/index.ts';
import { ChevronLeft, Check, X, Eye, AlertCircle, Cpu } from 'lucide-react';

export const AdminListingsPage: React.FC = () => {
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionListingId, setActionListingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadPending = async () => {
    try {
      const res = await api.get('/admin/listings/pending');
      setPendingListings(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this listing and publish to live marketplace?')) return;
    setProcessing(true);
    try {
      await api.post(`/admin/listings/${id}/approve`);
      await loadPending();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!actionListingId || !rejectReason) return;
    setProcessing(true);
    try {
      await api.post(`/admin/listings/${actionListingId}/reject`, { reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason('');
      setActionListingId(null);
      await loadPending();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading pending moderation queue...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Operations</span>
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Listing Moderation Queue</h1>
        <p className="text-xs text-slate-500 mt-1">Review seller hardware listings before they are made public</p>
      </div>

      {pendingListings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <Check className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Queue is Clear!</h3>
          <p className="text-xs text-slate-400">All submitted hardware listings have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                <img
                  src={listing.images?.[0]?.url || ''}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur">
                  {listing.condition.replace('_', ' ')}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col space-y-3">
                <span className="text-[10px] font-bold text-brand-600 uppercase">
                  {listing.category?.name}
                </span>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                  {listing.title}
                </h3>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>Seller: <strong className="text-slate-800">{listing.seller?.name}</strong></div>
                  <div>Area: <strong>{listing.area}</strong></div>
                  <div>Price: <strong className="text-emerald-600 font-mono text-sm">₹{Number(listing.price).toLocaleString()}</strong></div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 max-h-24 overflow-y-auto">
                  {listing.description}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActionListingId(listing.id);
                      setShowRejectModal(true);
                    }}
                    disabled={processing}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(listing.id)}
                    disabled={processing}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Reject Listing</h3>
            <p className="text-xs text-slate-500">
              Provide a clear reason so the seller knows how to fix or re-submit their item.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Unclear photos of PCB, price seems unrealistic, missing model sticker..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing || !rejectReason}
                onClick={handleReject}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

