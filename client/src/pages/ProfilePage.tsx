import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import { User, Address } from '../types/index.ts';
import { useAuthStore } from '../store/authStore.ts';
import { 
  User as UserIcon, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Package, 
  Cpu
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profRes, addrRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/users/addresses')
        ]);
        setProfile(profRes.data.data);
        setAddresses(addrRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const res = await api.post('/users/addresses', newAddr);
      setAddresses(prev => [...prev, res.data.data]);
      setShowAddAddress(false);
      setNewAddr({
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        isDefault: false
      });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to add address');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert('Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Account & Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage personal details, saved shipping addresses, and security</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-extrabold text-2xl border border-brand-100">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{profile?.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                {profile?.role}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{profile?.email}</div>
            <div className="text-xs text-slate-500 mt-0.5">{profile?.phone || 'No phone verified'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-20">
            <span className="text-lg font-extrabold text-slate-900">{profile?._count?.listings || 0}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Listings</span>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-20">
            <span className="text-lg font-extrabold text-slate-900">{profile?._count?.ordersBought || 0}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Orders</span>
          </div>
        </div>
      </div>

      {/* Address Book Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Saved Addresses</h3>
          </div>

          <button
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        {/* New Address Form */}
        {showAddAddress && (
          <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">New Shipping Address</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="House / Flat / Street Line 1 *"
                value={newAddr.line1}
                onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
              <input
                type="text"
                placeholder="Landmark / Line 2"
                value={newAddr.line2}
                onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
              <input
                type="text"
                placeholder="City *"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
              <input
                type="text"
                placeholder="State *"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
              <input
                type="text"
                placeholder="Postal Pincode *"
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
              <input
                type="text"
                placeholder="Recipient Phone Number *"
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingAddr}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 rounded-lg shadow-sm"
              >
                {savingAddr ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        )}

        {/* Address Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{addr.line1}</span>
                {addr.isDefault && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Default
                  </span>
                )}
              </div>
              {addr.line2 && <div className="text-slate-600">{addr.line2}</div>}
              <div className="text-slate-500">{addr.city}, {addr.state} - {addr.pincode}</div>
              <div className="text-slate-500 font-medium pt-1">Phone: {addr.phone}</div>

              <button
                onClick={() => handleDeleteAddress(addr.id)}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

