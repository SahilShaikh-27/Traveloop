import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, MapPin, Globe, ArrowRight, Plane,
  Clock, Wallet, Navigation, Calendar, Radio,
  Shield, Activity, Cloud, User, TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/trips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nomad-gray font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-16 space-y-12">

        {/* ── Hero ── */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-nomad-border rounded-xl p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center space-x-3">
                <div className="bg-nomad-orange/10 p-2 rounded">
                  <Radio size={16} className="text-nomad-orange animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-nomad-orange">Travel Mode Active</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl font-black text-nomad-slate uppercase tracking-tight leading-none">
                  Travel<br />Overview
                </h1>
                <p className="text-sm text-nomad-muted max-w-lg font-medium leading-relaxed">
                  Plan your trips, explore new destinations, and keep track of your travel journals.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/create-trip')} className="nomad-btn-primary !px-8 !py-3 !text-xs uppercase tracking-widest">
                  <Plus size={14} /> Plan a Trip
                </button>
                <button onClick={() => navigate('/explore')} className="nomad-btn-ghost !px-8 !py-3 !text-xs uppercase tracking-widest">
                  <Globe size={14} /> Explore Places
                </button>
              </div>
            </div>

            {/* Abstract bg */}
            <div className="absolute top-0 right-0 h-full w-1/2 opacity-[0.03] pointer-events-none flex items-center justify-end pr-8">
              <Globe size={320} strokeWidth={0.5} />
            </div>
            <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.03] pointer-events-none" />
          </div>

          {/* Stats column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-nomad-slate text-white rounded-xl p-6 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="bg-white/10 p-2 rounded">
                    <Activity size={16} className="text-nomad-orange" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Trip Progress</span>
                </div>
                <div className="space-y-2">
                  <span className="block text-4xl font-black">{trips.length ? Math.min(trips.length * 12, 100) : 0}%</span>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(trips.length * 12, 100)}%` }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-nomad-orange"
                    />
                  </div>
                </div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                  Current travel activity and planned stops.
                </p>
              </div>
              <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.04] pointer-events-none" />
            </div>

            <div className="bg-white border border-nomad-border rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-nomad-blue/10 p-2 rounded">
                  <Shield size={16} className="text-nomad-blue" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-nomad-slate">Account Status</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase border-b border-nomad-gray pb-2">
                  <span className="text-nomad-muted">Sync Status</span>
                  <span className="text-emerald-500">Active</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-nomad-muted">User ID</span>
                  <span className="text-nomad-slate font-mono">USR-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Active Trips ── */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-l-4 border-nomad-orange pl-5">
            <div className="space-y-0.5">
              <h2 className="text-xl font-black text-nomad-slate uppercase tracking-tight">My Trips</h2>
              <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest">Your upcoming and recent journeys</p>
            </div>
            <button onClick={() => navigate('/trips')} className="text-[10px] font-black text-nomad-blue uppercase tracking-widest hover:underline flex items-center space-x-2">
              <span>All Trips</span><ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-44 bg-white border border-nomad-border rounded-xl animate-pulse" />)
            ) : trips.length > 0 ? (
              trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  className="boarding-pass group cursor-pointer hover:border-nomad-orange transition-all"
                >
                  <div className="space-y-5 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-nomad-orange uppercase tracking-[0.2em]">Trip</span>
                        <h3 className="text-lg font-black text-nomad-slate uppercase tracking-tight leading-none group-hover:text-nomad-orange transition-colors">{trip.title}</h3>
                      </div>
                      <div className="text-right">
                        <span className="block text-base font-black text-nomad-slate leading-none">STOPS</span>
                        <span className="text-[9px] font-bold text-nomad-muted leading-none">{trip.id?.slice(-2).toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-y border-dashed border-nomad-border py-4">
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-bold text-nomad-muted uppercase">Stops</span>
                        <span className="block text-sm font-black text-nomad-slate">{trip.stops?.length || 0}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-bold text-nomad-muted uppercase">Budget</span>
                        <span className="block text-sm font-black text-nomad-slate">₹{Math.floor((trip.totalBudget || 0) / 1000)}k</span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="block text-[8px] font-bold text-nomad-muted uppercase">Status</span>
                        <span className="block text-[10px] font-black text-nomad-blue italic">Active</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-nomad-muted">
                      <div className="flex items-center space-x-1.5">
                        <Clock size={10} />
                        <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <User size={10} />
                        <span>Trip Squad</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-white border border-dashed border-nomad-border rounded-xl text-center space-y-6">
                <Plane size={40} className="mx-auto text-slate-200" strokeWidth={1} />
                <div className="space-y-1">
                  <p className="text-base font-black text-nomad-slate uppercase tracking-tight">No Trips Found</p>
                  <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest">Start by planning your first journey!</p>
                </div>
                <button onClick={() => navigate('/create-trip')} className="nomad-btn-primary mx-auto">Plan Your First Trip</button>
              </div>
            )}
          </div>
        </section>

        {/* ── Network Stats ── */}
        <section className="bg-white border border-nomad-border rounded-xl p-10 md:p-14 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-10 text-center md:text-left">
            {[
              { icon: Globe,      color: 'text-nomad-blue',   value: '120+',  label: 'Destinations' },
              { icon: TrendingUp, color: 'text-nomad-orange',  value: '4.2k',  label: 'Happy Travelers' },
              { icon: Activity,   color: 'text-emerald-500',  value: '99%',   label: 'Reliability' },
              { icon: Cloud,      color: 'text-slate-400',    value: '4ms',   label: 'Response Time' },
            ].map(({ icon: Icon, color, value, label }) => (
              <div key={label} className="space-y-3">
                <div className={`w-10 h-10 bg-nomad-gray rounded border border-nomad-border flex items-center justify-center ${color} mx-auto md:mx-0`}>
                  <Icon size={20} />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-2xl font-black text-nomad-slate">{value}</span>
                  <span className="block text-[10px] font-bold text-nomad-muted uppercase tracking-widest">{label}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.04] pointer-events-none" />
        </section>
      </main>

      <footer className="py-16 text-center border-t border-nomad-border bg-white">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <Navigation size={14} className="text-nomad-slate" />
          <span className="text-[10px] font-black text-nomad-slate uppercase tracking-[0.4em]">Traveloop</span>
        </div>
        <p className="text-[9px] font-bold text-nomad-muted uppercase tracking-widest">© 2026 Traveloop. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
