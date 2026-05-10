import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Trash2, ArrowRight,
  Compass, Map, Plus, Navigation, Radio, Database, Zap, Star
} from 'lucide-react';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/trips', { headers: { Authorization: `Bearer ${token}` } });
      setTrips(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/trips/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch { alert("Failed to delete trip."); }
  };

  return (
    <div className="min-h-screen bg-nomad-gray font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-nomad-blue">
              <Database size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Your Travel Archive</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-nomad-slate uppercase tracking-tight leading-none">My Trips</h1>
            <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest italic">
              You have {trips.length} trips in your collection
            </p>
          </div>
          <button onClick={() => navigate('/create-trip')} className="nomad-btn-primary !px-10 !py-3 !text-xs uppercase tracking-widest shadow-lg">
            <Plus size={14} /> Add Trip
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-56 bg-white border border-nomad-border rounded-xl animate-pulse" />)}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-nomad-border rounded-xl p-6 md:p-8 hover:border-nomad-orange transition-all shadow-soft group cursor-pointer relative overflow-hidden"
                  onClick={() => navigate(`/trip/${trip.id}`)}
                >
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-nomad-orange uppercase tracking-widest italic">Status: Planned</span>
                        <h3 className="text-xl font-black text-nomad-slate uppercase tracking-tight group-hover:text-nomad-orange transition-colors line-clamp-1">{trip.title}</h3>
                      </div>
                      <div className="bg-nomad-gray border border-nomad-border w-10 h-10 flex items-center justify-center rounded text-nomad-slate">
                        <Navigation size={18} fill="currentColor" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-y border-dashed border-nomad-border py-5">
                      <div className="space-y-1">
                        <span className="block text-[8px] font-bold text-nomad-muted uppercase tracking-tighter">Stops</span>
                        <div className="flex items-center space-x-1.5 text-sm font-black text-nomad-slate">
                          <MapPin size={12} className="text-nomad-blue" />
                          <span>{trip.stops?.length || 0} Places</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="block text-[8px] font-bold text-nomad-muted uppercase tracking-tighter">Dates</span>
                        <div className="flex items-center justify-end space-x-1.5 text-sm font-black text-nomad-slate">
                          <Calendar size={12} className="text-nomad-orange" />
                          <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button onClick={e => { e.stopPropagation(); navigate(`/trip/${trip.id}`); }} className="text-[10px] font-black text-nomad-blue uppercase tracking-widest hover:underline">
                          View Trip →
                        </button>
                        <button onClick={e => { e.stopPropagation(); navigate('/journal'); }} className="text-[10px] font-black text-nomad-muted uppercase tracking-widest hover:text-nomad-slate">
                          Journal
                        </button>
                      </div>
                      <button onClick={(e) => handleDelete(e, trip.id)} className="p-1.5 text-slate-200 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.03] pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-nomad-border rounded-xl p-24 text-center space-y-8">
            <Compass className="mx-auto text-slate-200" strokeWidth={1} size={56} />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-nomad-slate uppercase tracking-tight">No Trips Found</h2>
              <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest italic max-w-sm mx-auto leading-relaxed">
                You haven't planned any trips yet. Start your journey today!
              </p>
            </div>
            <button onClick={() => navigate('/create-trip')} className="nomad-btn-primary mx-auto !px-12 !py-3">Start Planning</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Trips;
