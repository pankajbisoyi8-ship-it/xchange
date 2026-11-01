import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { Listing, Address, Review } from '../types/index.ts';
import { useAuthStore } from '../store/authStore.ts';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Truck, 
  Banknote, 
  CheckCircle2, 
  Calendar, 
  Cpu, 
  Layers, 
  ChevronRight,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Checkout modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [newAddress, setNewAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    async function loadListing() {
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/reviews/listing/${id}`)
        ]);
        setListing(listingRes.data.data);
        setReviews(reviewsRes.data.data || []);
      } catch (err: any) {
        console.error('Failed to load listing', err);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  const handleOpenOrderModal = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.get('/users/addresses');
      const addrs = res.data.data || [];
      setAddresses(addrs);
      const defaultAddr = addrs.find((a: Address) => a.isDefault) || addrs[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (e) {
      console.error(e);
    }
    setOrderModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!listing) return;
    setIsSubmittingOrder(true);
    setOrderError('');

    try {
      let deliveryAddress;
      if (selectedAddressId) {
        const chosen = addresses.find(a => a.id === selectedAddressId);
        if (!chosen) throw new Error('Please select a valid delivery address');
        deliveryAddress = {
          line1: chosen.line1,
          line2: chosen.line2,
          city: chosen.city,
          state: chosen.state,
          pincode: chosen.pincode,
          phone: chosen.phone
        };
      } else {
        if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode || !newAddress.phone) {
          throw new Error('Please fill all mandatory address fields');
        }
        deliveryAddress = newAddress;
      }

      const res = await api.post('/orders', {
        listingId: listing.id,
        deliveryAddress
      });

      const createdOrder = res.data.data;
      navigate(`/orders/${createdOrder.id}`);
    } catch (err: any) {
      setOrderError(err.response?.data?.error?.message || err.message || 'Failed to place order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
            <div className="h-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Listing not found or removed</h2>
        <Link to="/browse" className="mt-4 inline-block text-brand-600 font-semibold hover:underline">
          Return to Browse
        </Link>
      </div>
    );
  }

  const deliveryFee = 200;
  const itemPrice = Number(listing.price);
  const totalAmount = itemPrice + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/browse?category=${listing.category.slug}`} className="hover:text-slate-800">{listing.category.name}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-semibold truncate max-w-xs">{listing.title}</span>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <img
              src={listing.images[activeImageIndex]?.url || '/images/grafhics card.jpg'}
              alt={listing.title}
              className="w-full h-full object-contain p-4"
            />
            {listing.isInspected && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg">
                <ShieldCheck className="w-4 h-4" />
                <span>Platform Inspected</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {listing.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white transition-all ${
                    activeImageIndex === idx ? 'border-brand-600 shadow' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Physical Inspection Guarantee Notice */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Protected by Mandatory Field Inspection</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                When you order this part, a platform agent will visit the seller, test pins/capacitors, verify serial numbers on a test bench, and photograph the hardware before bringing it to your door. If anything fails inspection, you pay ₹0.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Purchasing */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-900 text-white">
                {listing.condition.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {listing.brand} • {listing.model}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {listing.title}
            </h1>

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{listing.area}</span>
              </div>
              {listing.ageMonths && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{listing.ageMonths} months old</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Price</span>
              <span className="text-3xl font-extrabold text-slate-900">
                ₹{itemPrice.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Inspected Delivery Escort</span>
                <span className="font-semibold text-slate-800">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash on Delivery (COD)</span>
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total to Pay at Handover</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Action CTA */}
            {user?.id === listing.sellerId ? (
              <div className="p-3 text-center bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">
                This is your listing.
              </div>
            ) : listing.status !== 'ACTIVE' ? (
              <div className="p-3 text-center bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl">
                This item is currently {listing.status.toLowerCase()}.
              </div>
            ) : (
              <button
                onClick={handleOpenOrderModal}
                className="w-full py-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/25 transition-all text-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <Truck className="w-5 h-5" />
                <span>Place Cash on Delivery Order</span>
              </button>
            )}

            <p className="text-[11px] text-center text-slate-400">
              No online payment required. Pay only after you check the inspected item.
            </p>
          </div>

          {/* Seller Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-sm">
                {listing.seller.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{listing.seller.name}</div>
                <div className="text-[11px] text-slate-500">{listing.seller.area || 'Verified Seller'}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{listing.seller.avgRating || '5.0'}</span>
              <span className="text-[10px] text-slate-400">({listing.seller.reviewCount || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Specifications Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-600" />
              <span>Verified Hardware Specifications</span>
            </h3>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium block">Category</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{listing.category.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium block">Brand</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{listing.brand}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium block">Model</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{listing.model}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium block">Condition</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{listing.condition.replace('_', ' ')}</span>
              </div>

              {/* Dynamic specs mapped from category specSchema */}
              {listing.specs && Object.entries(listing.specs).map(([key, val]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 font-medium block capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-base text-slate-900">Seller's Description</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                <span>Verified Buyer Reviews</span>
              </h3>
              <span className="text-xs text-slate-400">({reviews.length})</span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No reviews yet for this listing.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{rev.reviewer?.name || 'Verified Buyer'}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{rev.productRating}/5</span>
                      </div>
                    </div>
                    {rev.comment && <p className="text-xs text-slate-600">{rev.comment}</p>}
                    {rev.sellerReply && (
                      <div className="pl-3 border-l-2 border-brand-500 text-[11px] text-slate-500 mt-2">
                        <span className="font-bold text-brand-600">Seller reply: </span>
                        {rev.sellerReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COD Checkout Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Confirm Cash on Delivery Order</h3>
              <button onClick={() => setOrderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {orderError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Price Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Hardware:</span>
                <span className="font-bold text-slate-900">₹{itemPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Inspection & Delivery Fee:</span>
                <span className="font-bold text-slate-900">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Cash Due at Delivery:</span>
                <span className="text-brand-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Address Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Delivery Address
              </label>

              {addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`block p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedAddressId === a.id ? 'border-brand-600 bg-brand-50/50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={a.id}
                        checked={selectedAddressId === a.id}
                        onChange={() => setSelectedAddressId(a.id)}
                        className="sr-only"
                      />
                      <div className="font-bold text-slate-900">{a.line1} {a.line2 && `, ${a.line2}`}</div>
                      <div className="text-slate-500 mt-0.5">{a.city}, {a.state} - {a.pincode}</div>
                      <div className="text-slate-500 mt-0.5 font-medium">Contact: {a.phone}</div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={newAddress.line2}
                    onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City *"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Postal Pincode *"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Recipient Phone *"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Handover OTP note */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-sky-600" />
              <span>You will receive a confidential 6-digit Delivery OTP upon inspection completion to give the agent at handover.</span>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingOrder}
                onClick={handleConfirmOrder}
                className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md disabled:opacity-50"
              >
                {isSubmittingOrder ? 'Placing Order...' : 'Confirm Order (COD)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

