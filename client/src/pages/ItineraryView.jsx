import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CitySearchModal from '../components/CitySearchModal';
import ActivitySearchModal from '../components/ActivitySearchModal';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Clock, Wallet, Navigation, ChevronRight, 
  Map as MapIcon, List, Calendar, ArrowLeft, AlertCircle, 
  X, Plus, Sparkles, Trash2, Share2, Globe, Compass, 
  Map, Wind, Shield, Backpack, ChevronDown, CheckCircle2,
  TrendingUp, Star, Users, MessageCircle, ThumbsUp, Activity,
  Database, Radio, Cpu, Layers
} from 'lucide-react';

const ItineraryView = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(null); 

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAddStop = async (payload) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/trips/${id}/stops`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(prev => ({ ...prev, stops: [...(prev.stops || []), res.data] }));
      setShowAddStop(false);
    } catch (err) {
      alert('Failed to add destination.');
    }
  };

  const handleManualAddActivity = async (payload) => {
    try {
      const token = localStorage.getItem('token');
      const stopId = showAddActivity.id;
      const res = await axios.post(`http://localhost:5000/api/trips/${id}/stops/${stopId}/activities`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(prev => ({
        ...prev,
        stops: prev.stops.map(s => s.id === stopId ? { ...s, activities: [...(s.activities || []), res.data] } : s)
      }));
      setShowAddActivity(null);
    } catch (err) {
      alert('Failed to add activity.');
    }
  };

  const handleRemoveActivity = async (stopId, activityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/trips/${id}/stops/${stopId}/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(prev => ({
        ...prev,
        stops: prev.stops.map(s => s.id === stopId ? { ...s, activities: (s.activities || []).filter(a => a.id !== activityId) } : s)
      }));
    } catch (err) {
      alert('Failed to remove activity.');
    }
  };

  const handleDeleteStop = async (stopId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/trips/${id}/stops/${stopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrip(prev => ({
        ...prev,
        stops: prev.stops.filter(s => s.id !== stopId)
      }));
    } catch (err) {
      alert('Failed to delete stop.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nomad-gray">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
          <div className="w-12 h-12 border-4 border-nomad-border border-t-nomad-orange rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-nomad-slate">Loading Trip...</p>
        </div>
      </div>
    );
  }

  const stops = trip?.stops || [];
  const totalEstimatedCost = stops.reduce((acc, s) => {
    const activities = s.activities || [];
    return acc + activities.reduce((a, ac) => a + (ac.estimatedCost || 0), 0);
  }, 0);

  return (
    <div className="min-h-screen bg-nomad-gray font-sans pb-32">
      <Navbar />

      {/* Technical Expedition Header */}
      <header className="bg-white border-b border-nomad-border py-10 md:py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-10">
           <div className="space-y-6">
              <div className="flex items-center space-x-4">
                 <button onClick={() => navigate('/trips')} className="w-10 h-10 border border-nomad-border rounded flex items-center justify-center text-nomad-slate hover:bg-nomad-gray transition-all">
                    <ArrowLeft size={18} />
                 </button>
                 <div className="flex items-center space-x-2 bg-nomad-orange/10 px-3 py-1.5 rounded">
                    <Radio size={14} className="text-nomad-orange" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-nomad-orange">Trip ID: {trip.id?.slice(-8).toUpperCase()}</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <h1 className="text-4xl md:text-6xl font-black text-nomad-slate uppercase tracking-tight">{trip.title}</h1>
                 <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-nomad-muted uppercase tracking-widest">
                       <Calendar size={14} />
                       <span>{new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-nomad-blue uppercase tracking-widest">
                       <MapIcon size={14} />
                       <span>{stops.length} STOPS</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex items-center space-x-4">
              <div className="hidden sm:flex -space-x-3 mr-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-10 h-10 rounded border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?u=mission-${i}`} alt="User" />
                   </div>
                 ))}
                 <div className="w-10 h-10 rounded border-2 border-white bg-nomad-slate flex items-center justify-center text-white text-[10px] font-bold">+2</div>
              </div>
              <button className="nomad-btn-primary !px-8 !text-[11px] uppercase tracking-widest">Share Trip</button>
              <button className="nomad-btn-ghost !p-2.5"><Share2 size={18} /></button>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Technical Node Timeline */}
        <div className="lg:col-span-8 space-y-12">
          {stops.length === 0 ? (
            <div className="bg-white border border-dashed border-nomad-border rounded-xl p-20 text-center space-y-6">
               <Cpu size={48} className="mx-auto text-slate-200" strokeWidth={1} />
               <div className="space-y-2">
                  <p className="text-lg font-black text-nomad-slate uppercase tracking-tight">No Stops Planned</p>
                  <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest">You haven't added any stops to this trip yet.</p>
               </div>
               <button onClick={() => setShowAddStop(true)} className="nomad-btn-secondary mx-auto !px-12">Add Stop</button>
            </div>
          ) : (
            <div className="relative pl-8 md:pl-12 border-l border-nomad-border space-y-16">
              {stops.map((stop, index) => (
                <motion.div 
                  key={stop.id}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Timeline Index Node */}
                  <div className="absolute -left-[45px] md:-left-[61px] top-0 w-8 h-8 md:w-12 md:h-12 bg-nomad-slate text-white border-4 border-nomad-gray rounded flex items-center justify-center font-black text-xs md:text-sm">
                     {index + 1}
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-nomad-blue uppercase tracking-widest">{stop.country}</span>
                          <h2 className="text-2xl md:text-4xl font-black text-nomad-slate uppercase tracking-tight">{stop.cityName}</h2>
                       </div>
                       <button onClick={() => handleDeleteStop(stop.id)} className="p-2.5 text-slate-300 hover:text-red-500 transition-all">
                          <Trash2 size={18} />
                       </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {stop.activities?.map((activity, ai) => (
                        <div key={activity.id || ai} className="bg-white border border-nomad-border rounded-lg p-5 space-y-5 hover:border-nomad-blue transition-all relative overflow-hidden group">
                           <div className="flex justify-between items-start relative z-10">
                              <span className="text-[9px] font-black bg-nomad-gray px-2 py-1 rounded text-nomad-slate uppercase tracking-tight">{activity.time || 'FLEXIBLE'}</span>
                              <button onClick={() => handleRemoveActivity(stop.id, activity.id)} className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                 <X size={14} />
                              </button>
                           </div>
                           <h4 className="text-base font-black text-nomad-slate uppercase tracking-tight relative z-10">{activity.name}</h4>
                           <div className="pt-4 border-t border-nomad-gray flex justify-between items-center relative z-10">
                              <div className="flex items-center space-x-1.5 text-nomad-blue">
                                 <Wallet size={12} />
                                 <span className="text-[10px] font-bold">₹{activity.estimatedCost?.toLocaleString()}</span>
                              </div>
                              <CheckCircle2 size={14} className="text-emerald-500" />
                           </div>
                           
                           {/* Technical Grid Accent */}
                           <div className="absolute inset-0 bg-grid-pattern bg-[size:16px_16px] opacity-[0.02] pointer-events-none" />
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => setShowAddActivity({ id: stop.id, cityName: stop.cityName })}
                        className="bg-white border border-dashed border-nomad-border rounded-lg p-5 flex flex-col items-center justify-center space-y-3 text-slate-300 hover:text-nomad-blue hover:border-nomad-blue transition-all group min-h-[160px]"
                      >
                        <Plus size={32} className="group-hover:rotate-90 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Add Activity</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* New prominent Add Day / Stop Button */}
          <div className="pt-10 border-t border-nomad-border">
             <button 
               onClick={() => setShowAddStop(true)} 
               className="w-full bg-white border-2 border-dashed border-nomad-border rounded-xl p-10 flex flex-col items-center justify-center space-y-4 text-slate-300 hover:text-nomad-orange hover:border-nomad-orange transition-all group"
             >
                <div className="w-16 h-16 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Plus size={32} />
                </div>
                <div className="text-center">
                   <span className="block text-sm font-black text-nomad-slate uppercase tracking-tight">Add Another Day / Stop</span>
                   <span className="block text-[10px] font-bold text-nomad-muted uppercase tracking-widest mt-1">Keep building your perfect itinerary</span>
                </div>
             </button>
          </div>
        </div>

        {/* Resource Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
           <div className="bg-white border border-nomad-border rounded-xl p-8 space-y-10 sticky top-24">
              <div className="flex items-center space-x-3 pb-6 border-b border-nomad-border">
                 <div className="bg-nomad-blue/10 p-2 rounded">
                   <Activity size={18} className="text-nomad-blue" />
                 </div>
                 <h3 className="text-sm font-black text-nomad-slate uppercase tracking-widest">Trip Overview</h3>
              </div>
              
              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <span className="block text-[9px] font-bold text-nomad-muted uppercase tracking-tighter">Total Budget</span>
                       <span className="block text-xl font-black text-nomad-slate tracking-tight">₹{trip.totalBudget?.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1 text-right">
                       <span className="block text-[9px] font-bold text-nomad-muted uppercase tracking-tighter">Current Spend</span>
                       <span className="block text-xl font-black text-nomad-orange tracking-tight">₹{totalEstimatedCost.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="h-2 w-full bg-nomad-gray rounded-full overflow-hidden border border-nomad-border">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min((totalEstimatedCost / (trip.totalBudget || 1)) * 100, 100)}%` }}
                         transition={{ duration: 1 }}
                         className={`h-full ${totalEstimatedCost > (trip.totalBudget || 0) ? 'bg-red-500' : 'bg-nomad-blue'}`}
                       />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                       <span className="text-nomad-muted">Budget Used</span>
                       <span className={totalEstimatedCost > (trip.totalBudget || 0) ? 'text-red-500' : 'text-nomad-blue'}>
                          {Math.round((totalEstimatedCost / (trip.totalBudget || 1)) * 100)}%
                       </span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 pt-4">
                    <button className="nomad-btn-ghost !text-[9px] !py-3 !font-black uppercase tracking-widest">Map View</button>
                    <button className="nomad-btn-ghost !text-[9px] !py-3 !font-black uppercase tracking-widest">View Schedule</button>
                 </div>
              </div>

              <div className="pt-8 border-t border-nomad-border space-y-6">
                 <span className="text-[9px] font-black text-nomad-muted uppercase tracking-widest">Traveling With</span>
                 <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                       {[1,2].map(i => (
                         <div key={i} className="w-8 h-8 rounded border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                            <img src={`https://i.pravatar.cc/100?u=presence-${i}`} alt="User" />
                         </div>
                       ))}
                    </div>
                    <span className="text-[10px] font-bold text-nomad-slate uppercase tracking-tight">+3 Travelers</span>
                 </div>
              </div>
           </div>

           <button onClick={() => setShowAddStop(true)} className="w-full nomad-btn-secondary !py-5 !text-sm !font-black uppercase tracking-widest shadow-lg">
             <Plus size={20} />
             <span>Add New Stop</span>
           </button>
        </aside>

      </main>

      {/* Modals */}
      {showAddStop && <CitySearchModal onClose={() => setShowAddStop(false)} onSave={handleManualAddStop} tripDates={{ start: trip?.startDate, end: trip?.endDate }} />}
      {showAddActivity && <ActivitySearchModal onClose={() => setShowAddActivity(null)} onSave={handleManualAddActivity} cityName={showAddActivity.cityName} currentActivities={trip?.stops?.find(s => s.id === showAddActivity.id)?.activities || []} onRemove={(activityId) => handleRemoveActivity(showAddActivity.id, activityId)} />}
    </div>
  );
};

export default ItineraryView;
