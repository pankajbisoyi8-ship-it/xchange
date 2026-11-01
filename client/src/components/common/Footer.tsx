import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Truck, Banknote, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      {/* Trust Highlights */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-xs tracking-wide uppercase">Physical Inspection</h4>
                <p className="text-xs text-slate-400 mt-0.5">Bench-tested before handover</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-xs tracking-wide uppercase">Cash on Delivery</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pay only upon verified receipt</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-xs tracking-wide uppercase">Agent Escort</h4>
                <p className="text-xs text-slate-400 mt-0.5">Doorstep pickup & direct delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-xs tracking-wide uppercase">Dispute Protection</h4>
                <p className="text-xs text-slate-400 mt-0.5">Refuse at door if not as promised</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Part<span className="text-brand-400">Xchange</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
              The trusted marketplace for buying and selling second-hand PC and laptop components. Every part is physically verified by trained field agents before you pay.
            </p>
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} PartXchange. All rights reserved.
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Hardware</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/browse?category=gpu" className="hover:text-white transition-colors">Graphics Cards (GPUs)</Link></li>
              <li><Link to="/browse?category=cpu" className="hover:text-white transition-colors">Processors (CPUs)</Link></li>
              <li><Link to="/browse?category=ram" className="hover:text-white transition-colors">Memory (RAM)</Link></li>
              <li><Link to="/browse?category=motherboard" className="hover:text-white transition-colors">Motherboards</Link></li>
              <li><Link to="/browse?category=storage" className="hover:text-white transition-colors">SSDs & HDDs</Link></li>
              <li><Link to="/browse?category=monitors" className="hover:text-white transition-colors">Monitors</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Marketplace</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/browse" className="hover:text-white transition-colors">Browse Catalog</Link></li>
              <li><Link to="/listings/new" className="hover:text-white transition-colors">Sell an Item</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Orders</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Saved Addresses</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Portals</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/agent/login" className="hover:text-purple-400 transition-colors">Agent Task Portal</Link></li>
              <li><Link to="/admin/login" className="hover:text-amber-400 transition-colors">Staff Admin Portal</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">User Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

