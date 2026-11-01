import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { Listing, Category } from '../types/index.ts';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Award, 
  ArrowRight, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Banknote,
  Search
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, listingsRes] = await Promise.all([
          api.get('/listings/categories'),
          api.get('/listings?limit=8&sort=newest')
        ]);
        setCategories(catsRes.data.data || []);
        setFeaturedListings(listingsRes.data.data || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Scams • 100% Agent Bench-Tested Before Handover</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Buy & Sell Used PC Hardware <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-brand-300 to-emerald-400">
              Guaranteed by Physical Inspection
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Never risk buying a fried GPU, bent CPU pins, or degraded RAM again. Our platform field agents physically inspect, stress test, and serial-verify every part before it reaches your door.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/browse"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Search className="w-5 h-5" />
              <span>Browse Inspected Hardware</span>
            </Link>

            <Link
              to="/listings/new"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 backdrop-blur flex items-center justify-center gap-2 transition-all"
            >
              <span>List Your Old Hardware</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick stats banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1">Bench-tested by field agents</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur">
              <div className="text-2xl font-bold text-emerald-400">COD</div>
              <div className="text-xs text-slate-400 mt-1">Cash on doorstep delivery</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur">
              <div className="text-2xl font-bold text-sky-400">OTP</div>
              <div className="text-xs text-slate-400 mt-1">Secure handover code verification</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur">
              <div className="text-2xl font-bold text-purple-400">5%</div>
              <div className="text-xs text-slate-400 mt-1">Fair platform seller commission</div>
            </div>
          </div>
        </div>
      </section>

      {/* How Inspection Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How PartXchange Eliminates P2P Scams
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No meeting random strangers in parking lots. No bank transfers before seeing the goods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Listing & Approval</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sellers list components with exact category specs (VRAM, memory timings, socket). Platform admins review every listing before it goes live.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-white border border-brand-200 shadow-sm hover:shadow-md transition-shadow ring-1 ring-brand-500/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4">
              2
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-slate-900">Agent Physical Bench Test</h3>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Crucial Step</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              When you order, our trained Field Agent picks up the item, inspects capacitors, verifies serial numbers, tests power-on, and takes proof photos. If it fails, the order is cancelled immediately.
            </p>
          </div>

          <div className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">OTP Handover & COD</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Agent delivers the inspected component to your door. You share the private Delivery OTP, pay in cash, and enjoy reliable gaming hardware at half the price.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Explore Hardware Categories</h2>
            <p className="text-xs text-slate-500 mt-1">Select a category to view verified listings and specs</p>
          </div>
          <Link to="/browse" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => {
            const categoryImages: Record<string, string> = {
              gpu: '/images/grafhics card.jpg',
              cpu: '/images/cpu.jpg',
              motherboard: '/images/motherbord.jpg',
              storage: '/images/ssd.jpg',
              monitors: '/images/monitor.webp',
              controllers: '/images/controller.jpg',
              joysticks: '/images/joystick.jpg',
            };
            const catImg = categoryImages[cat.slug];

            return (
              <Link
                key={cat.id}
                to={`/browse?category=${cat.slug}`}
                className="group p-3 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-center overflow-hidden"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden mb-2.5 border border-slate-100 flex items-center justify-center">
                  {catImg ? (
                    <img src={catImg} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <Cpu className="w-7 h-7 text-slate-500 group-hover:text-brand-600" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-900 group-hover:text-brand-600 line-clamp-1">
                  {cat.name}
                </h4>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {cat._count?.listings || 0} active
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Verified Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Active Listings</h2>
            <p className="text-xs text-slate-500 mt-1">Inspected and ready for doorstep Cash on Delivery</p>
          </div>
          <Link to="/browse" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>See More</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-2xl h-80" />
            ))}
          </div>
        ) : featuredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No active listings yet</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first to list your used hardware!</p>
            <Link
              to="/listings/new"
              className="mt-4 inline-block px-5 py-2 text-xs font-bold text-white bg-brand-600 rounded-lg"
            >
              Post a Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((item) => (
              <Link
                key={item.id}
                to={`/listings/${item.id}`}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-brand-500 hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={item.images?.[0]?.url || '/images/grafhics card.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-900/80 text-white backdrop-blur">
                      {item.condition.replace('_', ' ')}
                    </span>
                    {item.isInspected && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Inspected</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
                    {item.category?.name}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.area}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium">Price (COD)</span>
                      <div className="text-lg font-extrabold text-slate-900">
                        ₹{Number(item.price).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{item.seller?.avgRating || '5.0'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Seller CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-700 via-sky-700 to-indigo-800 text-white p-8 sm:p-12 overflow-hidden shadow-xl">
          <div className="relative max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur">
              Sell Without Risk
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Upgrade Your Rig? Turn Your Old Hardware into Instant Cash.
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              No endless bargaining or risky meetups. An agent arrives at your door, inspects your component, delivers it to the buyer, and deposits your payout directly.
            </p>
            <div className="pt-2">
              <Link
                to="/listings/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-brand-900 bg-white hover:bg-slate-100 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <span>Create a Free Listing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

