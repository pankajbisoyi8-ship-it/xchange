import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { Order } from '../../types/index.ts';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Phone, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Banknote,
  KeyRound,
  RotateCcw,
  PackageCheck
} from 'lucide-react';

export const AgentTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Inspection Checklist Form State
  const [checklist, setChecklist] = useState({
    visualCondition: true,
    pcbAndPinsIntact: true,
    powerOnTestPassed: true,
    stressTestPassed: true,
    serialNumberMatched: true
  });
  const [serialNo, setSerialNo] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [inspectionPhotos, setInspectionPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submittingInspection, setSubmittingInspection] = useState(false);

  // Delivery OTP Form State
  const [enteredOtp, setEnteredOtp] = useState('');
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const [actionError, setActionError] = useState('');

  // Refusal & Return States
  const [refuseModalOpen, setRefuseModalOpen] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');
  const [submittingRefusal, setSubmittingRefusal] = useState(false);

  const [returnPickupNotes, setReturnPickupNotes] = useState('');
  const [submittingReturnPickup, setSubmittingReturnPickup] = useState(false);

  const [returnCompleteNotes, setReturnCompleteNotes] = useState('');
  const [submittingReturnComplete, setSubmittingReturnComplete] = useState(false);

  const loadOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handlePickup = async () => {
    setActionError('');
    try {
      await api.post(`/agent/orders/${id}/pickup`, { notes: 'Collected from seller custody' });
      await loadOrder();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleInspectionPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    setActionError('');
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        const res = await api.post('/listings/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setInspectionPhotos(prev => [...prev, res.data.data.url]);
      }
    } catch (err: any) {
      setActionError('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitInspection = async (passed: boolean) => {
    if (inspectionPhotos.length < 2) {
      setActionError('At least 2 evidence photos (bench test, serial sticker) are required.');
      return;
    }

    setSubmittingInspection(true);
    setActionError('');
    try {
      await api.post(`/agent/orders/${id}/inspection`, {
        passed,
        checklist,
        serialNo,
        notes: inspectionNotes,
        photos: inspectionPhotos
      });
      await loadOrder();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to submit inspection');
    } finally {
      setSubmittingInspection(false);
    }
  };

  const handleMarkOutForDelivery = async () => {
    try {
      await api.post(`/agent/orders/${id}/out-for-delivery`);
      await loadOrder();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleDeliverWithOtp = async () => {
    if (enteredOtp.length !== 6) {
      setActionError('Please enter the 6-digit delivery OTP from the buyer.');
      return;
    }

    setSubmittingDelivery(true);
    setActionError('');
    try {
      await api.post(`/agent/orders/${id}/deliver`, { otp: enteredOtp });
      await loadOrder();
      navigate('/agent');
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Invalid delivery OTP');
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const handleRefuseDelivery = async () => {
    if (!refusalReason.trim()) {
      setActionError('Please enter the customer refusal reason.');
      return;
    }

    setSubmittingRefusal(true);
    setActionError('');
    try {
      await api.post(`/agent/orders/${id}/refuse`, { reason: refusalReason });
      setRefuseModalOpen(false);
      await loadOrder();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to refuse delivery');
    } finally {
      setSubmittingRefusal(false);
    }
  };

  const handlePickupReturn = async () => {
    setSubmittingReturnPickup(true);
    setActionError('');
    try {
      await api.post(`/agent/orders/${id}/return-pickup`, { notes: returnPickupNotes });
      await loadOrder();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to confirm return pickup');
    } finally {
      setSubmittingReturnPickup(false);
    }
  };

  const handleCompleteReturn = async () => {
    setSubmittingReturnComplete(true);
    setActionError('');
    try {
      await api.post(`/agent/orders/${id}/return-complete`, { notes: returnCompleteNotes });
      await loadOrder();
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to confirm return handover to seller');
    } finally {
      setSubmittingReturnComplete(false);
    }
  };

  if (loading || !order) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading task details...</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/agent" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Link>
        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
          Status: {order.status}
        </span>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Hardware Summary Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
          <img
            src={order.listing.images?.[0]?.url || ''}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-brand-600 uppercase">{order.listing.category?.name}</span>
          <h2 className="font-bold text-sm text-slate-900 line-clamp-1">{order.listing.title}</h2>
          <div className="text-xs text-slate-600 font-semibold">
            Collect COD: <span className="text-emerald-600 font-bold">₹{Number(order.totalToCollect).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* STAGE 1: Pickup from Seller */}
      {['AGENT_ASSIGNED', 'PICKUP_SCHEDULED'].includes(order.status) && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">1</span>
            <span>Step 1: Collect Hardware from Seller</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{order.listing.seller?.name}</span>
              <a href={`tel:${order.listing.seller?.phone}`} className="flex items-center gap-1 font-bold text-purple-600">
                <Phone className="w-3.5 h-3.5" />
                <span>Call Seller</span>
              </a>
            </div>
            <div className="text-slate-500">{order.listing.area}</div>
          </div>

          <button
            onClick={handlePickup}
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all"
          >
            Confirm Item Collected (Mark Picked Up)
          </button>
        </div>
      )}

      {/* STAGE 2: Bench Inspection (INS-1, INS-2) */}
      {order.status === 'PICKED_UP' && (
        <div className="bg-white p-6 rounded-2xl border border-purple-200 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">2</span>
            <span>Step 2: Physical Bench Inspection</span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Inspection Checklist
            </label>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={checklist.visualCondition}
                  onChange={(e) => setChecklist({ ...checklist, visualCondition: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-slate-800 font-medium">Cosmetic & heatsink condition matches listing</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={checklist.pcbAndPinsIntact}
                  onChange={(e) => setChecklist({ ...checklist, pcbAndPinsIntact: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-slate-800 font-medium">Pins / PCB / Capacitors intact (no burns or bending)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={checklist.powerOnTestPassed}
                  onChange={(e) => setChecklist({ ...checklist, powerOnTestPassed: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-slate-800 font-medium">Component powers on properly on test bench</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={checklist.stressTestPassed}
                  onChange={(e) => setChecklist({ ...checklist, stressTestPassed: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-slate-800 font-medium">Passed stress test / memory diagnostic without artifacts</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={checklist.serialNumberMatched}
                  onChange={(e) => setChecklist({ ...checklist, serialNumberMatched: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-slate-800 font-medium">Serial sticker is intact and legitimate</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Recorded Serial Number *</label>
            <input
              type="text"
              placeholder="e.g. SN-89472938472"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Notes</label>
            <textarea
              rows={2}
              placeholder="Thermal readings, port status, accessories verified..."
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          {/* Photo uploads (at least 2 required) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Inspection Evidence Photos ({inspectionPhotos.length}/6) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {inspectionPhotos.map((url, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {inspectionPhotos.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-purple-500 bg-slate-50 flex flex-col items-center justify-center cursor-pointer text-center p-2">
                  <Camera className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-600">Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleInspectionPhotoUpload}
                    className="sr-only"
                    disabled={uploadingPhoto}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={submittingInspection || uploadingPhoto}
              onClick={() => handleSubmitInspection(false)}
              className="py-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
            >
              Fail Inspection (Cancel Order)
            </button>
            <button
              type="button"
              disabled={submittingInspection || uploadingPhoto || !serialNo}
              onClick={() => handleSubmitInspection(true)}
              className="py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all disabled:opacity-50"
            >
              Pass Inspection
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: Out for Delivery */}
      {order.status === 'INSPECTION_PASSED' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">3</span>
            <span>Step 3: Dispatch to Buyer</span>
          </div>

          <p className="text-xs text-slate-600">
            Hardware passed all inspection benchmarks. Start journey to buyer doorstep.
          </p>

          <button
            onClick={handleMarkOutForDelivery}
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all"
          >
            Mark Out for Delivery
          </button>
        </div>
      )}

      {/* STAGE 4: Deliver & Handover OTP */}
      {order.status === 'OUT_FOR_DELIVERY' && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">4</span>
            <span>Step 4: Buyer Handover & COD Collection</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{order.buyer?.name}</span>
              <a href={`tel:${order.deliveryAddress?.phone}`} className="flex items-center gap-1 font-bold text-emerald-600">
                <Phone className="w-3.5 h-3.5" />
                <span>Call Buyer</span>
              </a>
            </div>
            <div className="text-slate-500">
              {order.deliveryAddress?.line1}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-center space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">Cash to Collect</span>
            <div className="text-3xl font-extrabold font-mono text-emerald-700">
              ₹{Number(order.totalToCollect).toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
              Enter 6-Digit Delivery OTP from Buyer
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value.trim())}
              className="w-full text-center text-3xl font-extrabold tracking-widest font-mono py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleDeliverWithOtp}
              disabled={submittingDelivery || enteredOtp.length !== 6}
              className="w-full py-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg disabled:opacity-50 transition-all"
            >
              {submittingDelivery ? 'Verifying OTP & Recording Cash...' : 'Verify OTP & Complete Delivery'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRefuseModalOpen(true);
                setRefusalReason('');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              Buyer Refused Delivery
            </button>
          </div>
        </div>
      )}

      {/* STAGE: Delivery Refused (Waiting for Admin approval) */}
      {order.status === 'DELIVERY_REFUSED' && (
        <div className="bg-white p-6 rounded-2xl border border-rose-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>Delivery Refused by Customer</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-xs space-y-1 text-rose-900">
            <div className="font-semibold">Reason Recorded:</div>
            <div>{order.refusalReason || order.returnReason || 'Customer rejected package at doorstep.'}</div>
          </div>
          <p className="text-xs text-slate-500">
            Pending Admin approval to dispatch Return Trip. You will be notified once return is approved.
          </p>
        </div>
      )}

      {/* RETURN STAGE 1: Return Approved (Agent picks up from customer) */}
      {order.status === 'RETURN_APPROVED' && (
        <div className="bg-white p-6 rounded-2xl border border-purple-200 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <RotateCcw className="w-5 h-5 text-purple-600" />
            <span>Return Step 1: Pick Up Hardware from Customer</span>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-900 space-y-1">
            <span className="font-bold">Customer Refusal Reason:</span>
            <p>{order.refusalReason || order.returnReason || 'Hardware returned by customer'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{order.buyer?.name}</span>
              <a href={`tel:${order.deliveryAddress?.phone}`} className="flex items-center gap-1 font-bold text-purple-600">
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer</span>
              </a>
            </div>
            <div className="text-slate-500">
              {order.deliveryAddress?.line1}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Return Pickup Notes (Optional)</label>
            <input
              type="text"
              placeholder="Package sealed, physical state noted..."
              value={returnPickupNotes}
              onChange={(e) => setReturnPickupNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <button
            onClick={handlePickupReturn}
            disabled={submittingReturnPickup}
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all disabled:opacity-50"
          >
            {submittingReturnPickup ? 'Updating Return Custody...' : 'Confirm Return Picked Up from Customer'}
          </button>
        </div>
      )}

      {/* RETURN STAGE 2: Return in Transit (Agent hands over back to seller) */}
      {order.status === 'RETURN_IN_TRANSIT' && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Truck className="w-5 h-5 text-indigo-600" />
            <span>Return Step 2: Handover Hardware Back to Seller</span>
          </div>

          <p className="text-xs text-slate-600">
            You have custody of the rejected hardware. Return the item to the original seller.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{order.listing.seller?.name}</span>
              <a href={`tel:${order.listing.seller?.phone}`} className="flex items-center gap-1 font-bold text-indigo-600">
                <Phone className="w-3.5 h-3.5" />
                <span>Call Seller</span>
              </a>
            </div>
            <div className="text-slate-500">
              Seller Area: {order.listing.area}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Seller Handover Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Handed over to seller in person, verified seals..."
              value={returnCompleteNotes}
              onChange={(e) => setReturnCompleteNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <button
            onClick={handleCompleteReturn}
            disabled={submittingReturnComplete}
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all disabled:opacity-50"
          >
            {submittingReturnComplete ? 'Completing Handover...' : 'Confirm Handover Back to Seller'}
          </button>
        </div>
      )}

      {/* RETURN COMPLETED */}
      {order.status === 'RETURNED_TO_SELLER' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Return Completed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hardware was successfully returned and handed back to the original seller. This return task is closed.
          </p>
        </div>
      )}

      {/* DELIVERED */}
      {order.status === 'DELIVERED' && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Delivery Completed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Order verified via OTP and cash collected: ₹{Number(order.totalToCollect).toLocaleString()}. Remember to remit collected cash to the admin hub.
          </p>
        </div>
      )}

      {/* Refuse Modal */}
      {refuseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Record Customer Delivery Refusal</h3>
            <p className="text-xs text-slate-500">
              Provide the exact reason why the buyer is refusing delivery or payment. Admin will review for return approval.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Refusal Reason *</label>
              <textarea
                rows={3}
                placeholder="e.g. Buyer refused payment, exterior cosmetic disagreement, buyer not reachable..."
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefuseModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingRefusal || !refusalReason.trim()}
                onClick={handleRefuseDelivery}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl disabled:opacity-50"
              >
                {submittingRefusal ? 'Recording Refusal...' : 'Confirm Refusal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

