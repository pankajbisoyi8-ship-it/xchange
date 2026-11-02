import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { Cpu, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate(from, { replace: true });
    } catch (err: any) {
      const data = err.response?.data;
      const message =
        data?.error?.details?.[0]?.message ||
        data?.error?.message ||
        data?.message ||
        (err.response?.status === 401
          ? 'Invalid email or password.'
          : err.response?.status >= 500
          ? 'The authentication service is temporarily unavailable. Please try again in a moment.'
          : 'Login failed. Please check your credentials.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoBuyer = () => {
    setEmail('buyer.amit@gmail.com');
    setPassword('Password123!');
  };

  const fillDemoSeller = () => {
    setEmail('seller.rahul@gmail.com');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/25">
            <Cpu className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500">Log in to buy and sell verified PC components</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/25 disabled:opacity-50 transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login Helpers */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block text-center">
            Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={fillDemoBuyer}
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold border border-slate-200 text-center"
            >
              Demo Buyer
            </button>
            <button
              type="button"
              onClick={fillDemoSeller}
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold border border-slate-200 text-center"
            >
              Demo Seller
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Create account
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <Link to="/agent/login" className="hover:text-purple-600">Field Agent Login →</Link>
          <Link to="/admin/login" className="hover:text-amber-600">Admin Login →</Link>
        </div>
      </div>
    </div>
  );
};

