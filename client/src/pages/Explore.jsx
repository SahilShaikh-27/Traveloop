import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Globe, Star,
  ArrowRight, Radio, Shield, Navigation, Database, Zap
} from 'lucide-react';

const Explore = () => {
  const [publicTrips, setPublicTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => { fetchPublicTrips(); }, []);

  const fetchPublicTrips = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/trips/public/all');
      setPublicTrips(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const CATEGORIES = [
    { label: 'All',         icon: Globe },
    { label: 'Popular',     icon: Radio },
    { label: 'Featured',    icon: Shield },
    { label: 'Trending',    icon: Navigation },
  ];

  const filtered = publicTrips.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-nomad-gray font-sans">
      <Navbar />

      {/* Explore destinations */}
      <section className="bg-nomad-slate text-white py-12 md:py-20 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-nomad-blue">
              <Database size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Discover New Places</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">Explore</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Browse {publicTrips.length} popular travel itineraries
            </p>
          </div>

          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="SEARCH PLACES..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-80 pl-12 pr-6 py-3.5 bg-white/10 border border-white/20 rounded text-xs font-black uppercase tracking-widest text-white outline-none focus:bg-white focus:text-nomad-slate transition-all placeholder:text-white/30"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-[0.05] pointer-events-none" />
      </section>

      {/* Category Bar */}
      <div className="bg-white border-b border-nomad-border overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center space-x-10 min-w-max">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center space-x-2 transition-all ${activeCategory === cat.label ? 'text-nomad-blue' : 'text-nomad-muted hover:text-nomad-slate'}`}
              >
                <Icon size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-56 bg-white border border-nomad-border rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filtered.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-nomad-border rounded-xl overflow-hidden group cursor-pointer shadow-soft hover:border-nomad-blue transition-all"
                  onClick={() => navigate(`/public/${trip.publicSlug}`)}
                >
                  {/* Luggage tag header */}
                  <div className="bg-nomad-gray border-b border-nomad-border px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-nomad-blue" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-nomad-slate">TRIP-{trip.id?.slice(-4).toUpperCase()}</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-nomad-muted">{trip.vibe || 'GENERAL'}</span>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-nomad-slate uppercase tracking-tight line-clamp-1 group-hover:text-nomad-blue transition-colors">{trip.title}</h3>
                      <div className="flex items-center space-x-1.5 text-nomad-muted">
                        <MapPin size={12} />
                        <span className="text-[10px] font-bold uppercase">{trip.stops?.length || 0} Stops</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-nomad-gray pt-4">
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-bold text-nomad-muted uppercase">Rating</span>
                        <div className="flex items-center space-x-1">
                          <Star size={10} className="text-nomad-blue fill-nomad-blue" />
                          <span className="text-xs font-black text-nomad-slate">4.8</span>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="block text-[8px] font-bold text-nomad-muted uppercase">Travelers</span>
                        <span className="text-xs font-black text-nomad-slate">12</span>
                      </div>
                    </div>

                    <button className="w-full nomad-btn-ghost !py-2.5 !text-[10px] uppercase tracking-widest group-hover:bg-nomad-blue group-hover:text-white group-hover:border-nomad-blue transition-all">
                      View Itinerary
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <div className="bg-white border border-nomad-border rounded-full pl-5 pr-3 py-2.5 shadow-premium flex items-center space-x-3 cursor-pointer hover:border-nomad-orange transition-all group">
          <div className="flex flex-col text-right">
            <span className="text-[8px] font-bold text-nomad-muted uppercase tracking-widest">Travel Mode</span>
            <span className="text-[10px] font-black text-nomad-slate uppercase">Exploring Now</span>
          </div>
          <div className="w-9 h-9 bg-nomad-slate rounded-full flex items-center justify-center text-white group-hover:bg-nomad-orange transition-all">
            <Zap size={16} fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
