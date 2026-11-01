import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { api } from '../../lib/api.ts';
import { 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  Package, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Truck, 
  Menu, 
  X,
  Cpu
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                Part<span className="text-brand-600">Xchange</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-3 h-3" />
                <span>Physically Inspected</span>
              </div>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search RTX 3070, Ryzen CPUs, DDR5, Monitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-brand-500 rounded-full transition-all outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              to="/browse"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
            >
              Browse Hardware
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/listings/new"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all shadow-brand-600/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell Component</span>
                </Link>

                <Link
                  to="/orders"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  <span>Orders</span>
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {user?.role === 'AGENT' && (
                  <Link
                    to="/agent"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Agent App</span>
                  </Link>
                )}

                <div className="h-6 w-px bg-slate-200" />

                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 text-sm font-medium text-slate-700 hover:text-brand-600 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex flex-col gap-1 pt-2">
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Browse Hardware
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/listings/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-lg flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell Hardware</span>
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>My Orders</span>
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                {user?.role === 'AGENT' && (
                  <Link
                    to="/agent"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 rounded-lg flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Agent App</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Account & Addresses</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

