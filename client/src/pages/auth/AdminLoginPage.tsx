import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { LayoutDashboard, AlertCircle, ShieldAlert } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/admin/login', { email, password });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@partxchange.com');
    setPassword('AdminPass123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/25">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3 h-3" />
            <span>Staff Portal Access</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Admin</h1>
          <p className="text-xs text-slate-500">Moderation, Cash Ledger & Agent Operations</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
            <input
              type="email"
              placeholder="admin@partxchange.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-500/25 disabled:opacity-50 transition-all"
          >
            {loading ? 'Verifying Admin Authority...' : 'Log In as Administrator'}
          </button>
        </form>

        <div className="pt-2">
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold transition-colors"
          >
            Auto-fill SuperAdmin Demo
          </button>
        </div>
      </div>
    </div>
  );
};

