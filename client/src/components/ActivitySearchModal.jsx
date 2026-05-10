import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Plus, Clock, Compass, Coffee, Tent, Moon, Sun, Loader2, Check, Trash2, Database, Radio, Activity, Navigation, Settings } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ['All', 'Sightseeing', 'Food', 'Adventure', 'Nightlife', 'Relaxation', 'Culture'];

const CategoryIcon = ({ type, size = 16, className = "" }) => {
  switch (type) {
    case 'Sightseeing': return <Compass size={size} className={className} />;
    case 'Food': return <Coffee size={size} className={className} />;
    case 'Adventure': return <Tent size={size} className={className} />;
    case 'Nightlife': return <Moon size={size} className={className} />;
    case 'Relaxation': return <Sun size={size} className={className} />;
    default: return <MapPin size={size} className={className} />;
  }
};

export default function ActivitySearchModal({ onClose, onSave, cityName, currentActivities = [], onRemove }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [costFilter, setCostFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({ time: '', notes: '' });

  // Fetch real-world activities from Gemini
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/trips/search-activities?cityName=${encodeURIComponent(cityName)}&q=${encodeURIComponent(search)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(res.data);
      } catch (err) {
        console.error("Error fetching activities", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchActivities();
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [search, cityName]);

  const filteredActivities = useMemo(() => {
    let filtered = activities;
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }
    if (costFilter !== 'All') {
      filtered = filtered.filter(a => {
        if (costFilter === '< ₹1000') return a.estimatedCost < 1000;
        if (costFilter === '₹1000 - ₹3000') return a.estimatedCost >= 1000 && a.estimatedCost <= 3000;
        if (costFilter === '> ₹3000') return a.estimatedCost > 3000;
        return true;
      });
    }
    if (durationFilter !== 'All') {
      filtered = filtered.filter(a => {
        if (durationFilter === '< 2 hours') return a.duration < 120;
        if (durationFilter === '2 - 4 hours') return a.duration >= 120 && a.duration <= 240;
        if (durationFilter === '> 4 hours') return a.duration > 240;
        return true;
      });
    }
    if (search) {
      filtered = filtered.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    }
    return filtered;
  }, [activities, categoryFilter, costFilter, durationFilter, search]);

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      name: selectedActivity.name,
      category: selectedActivity.category,
      estimatedCost: selectedActivity.estimatedCost,
      duration: selectedActivity.duration,
      time: formData.time,
      notes: formData.notes || selectedActivity.notes
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-nomad-slate/80 backdrop-blur-sm z-[500] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        className="bg-nomad-gray border border-nomad-border rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative"
      >
        {/* Technical Background Accent */}
        <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.03] pointer-events-none" />
        
        {/* Header - Utility Panel */}
        <div className="bg-white px-8 py-6 flex justify-between items-center border-b border-nomad-border shrink-0 relative z-10">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-nomad-gray border border-nomad-border rounded flex items-center justify-center text-nomad-slate">
                <Activity size={20} className="text-nomad-blue" />
             </div>
             <div>
                <h2 className="text-xl font-black text-nomad-slate uppercase tracking-tight leading-none">
                  {selectedActivity ? `Add Activity: ${selectedActivity.name}` : `Find Activities: ${cityName}`}
                </h2>
                <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest mt-1">
                  {selectedActivity ? 'Add some details to this activity.' : 'Find the best things to do in the city.'}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 border border-nomad-border rounded flex items-center justify-center text-slate-300 hover:text-nomad-slate hover:bg-nomad-gray transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative z-10">
          <AnimatePresence mode="wait">
            {!selectedActivity ? (
              <motion.div 
                key="search"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Search & Filters */}
                <div className="px-8 py-8 shrink-0 space-y-6 bg-white border-b border-nomad-border">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder={`SEARCH ACTIVITIES IN ${cityName.toUpperCase()}...`} 
                        className="nomad-input !pl-14 !py-5 uppercase !tracking-[0.2em] !text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-4 shrink-0">
                      <select value={costFilter} onChange={e => setCostFilter(e.target.value)} className="bg-nomad-gray border border-nomad-border rounded px-4 py-4 text-[10px] font-black uppercase tracking-widest text-nomad-slate outline-none focus:border-nomad-blue shadow-sm">
                        <option value="All">ANY RESOURCE LOAD</option>
                        <option value="< ₹1000">&lt; ₹1000</option>
                        <option value="₹1000 - ₹3000">₹1000 - ₹3000</option>
                        <option value="> ₹3000">&gt; ₹3000</option>
                      </select>
                      <select value={durationFilter} onChange={e => setDurationFilter(e.target.value)} className="bg-nomad-gray border border-nomad-border rounded px-4 py-4 text-[10px] font-black uppercase tracking-widest text-nomad-slate outline-none focus:border-nomad-blue shadow-sm">
                        <option value="All">ANY DURATION</option>
                        <option value="< 2 hours">&lt; 2 HOURS</option>
                        <option value="2 - 4 hours">2 - 4 HOURS</option>
                        <option value="> 4 hours">&gt; 4 HOURS</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {CATEGORIES.map(c => (
                      <button 
                        key={c}
                        onClick={() => setCategoryFilter(c)}
                        className={`px-6 py-2 flex items-center rounded border text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === c ? 'bg-nomad-slate text-white border-nomad-slate' : 'bg-white text-nomad-muted border-nomad-border hover:border-nomad-slate hover:text-nomad-slate'}`}
                      >
                        {c !== 'All' && <CategoryIcon type={c} size={12} className="mr-2" />}
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-6">
                      <Loader2 className="animate-spin text-nomad-blue" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-nomad-muted">Querying Experience Threads...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredActivities.map((activity, idx) => {
                        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(activity.imageKeyword || activity.name)}?width=400&height=300&nologo=true`;
                        const existingActivity = currentActivities.find(ca => ca.name.toLowerCase() === activity.name.toLowerCase());
                        const isAdded = !!existingActivity;

                        return (
                          <div key={idx} className={`bg-white border ${isAdded ? 'border-emerald-500 shadow-lg' : 'border-nomad-border hover:border-nomad-blue'} rounded-xl overflow-hidden group hover:-translate-y-1 transition-all cursor-pointer flex flex-col shadow-sm`} onClick={() => {
                            if (!isAdded) setSelectedActivity({...activity, image: imageUrl});
                          }}>
                            <div className="h-44 relative overflow-hidden bg-nomad-gray border-b border-nomad-border shrink-0">
                              <img src={imageUrl} alt={activity.name} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-700" />
                              <div className="absolute top-4 left-4 bg-nomad-slate text-white px-2.5 py-1.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center shadow-sm">
                                <CategoryIcon type={activity.category} size={10} className="mr-1.5" />
                                {activity.category}
                              </div>
                              <div className="absolute bottom-4 right-4 bg-white border border-nomad-border px-2.5 py-1 rounded text-[8px] font-black text-nomad-slate flex items-center shadow-sm">
                                <Clock size={10} className="mr-1.5" />
                                {activity.duration}M
                              </div>
                              <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.05] pointer-events-none" />
                            </div>
                            <div className="p-6 flex flex-col flex-1 space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <h3 className="text-base font-black text-nomad-slate uppercase tracking-tight leading-tight pr-2 group-hover:text-nomad-blue transition-colors line-clamp-2">{activity.name}</h3>
                                {isAdded && <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[8px] font-black uppercase shrink-0 border border-emerald-100">Already Added</div>}
                              </div>
                              <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest leading-relaxed line-clamp-2 flex-1">{activity.notes}</p>
                              
                              <div className="pt-4 border-t border-nomad-gray flex items-center justify-between mt-auto">
                                <span className="text-[10px] font-black text-nomad-slate bg-nomad-gray px-3 py-1.5 rounded border border-nomad-border uppercase tracking-widest">
                                  ₹{activity.estimatedCost.toLocaleString()}
                                </span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isAdded) {
                                      onRemove(existingActivity.id);
                                    } else {
                                      setSelectedActivity({...activity, image: imageUrl});
                                    }
                                  }}
                                  className={`w-10 h-10 border rounded flex items-center justify-center transition-all ${isAdded ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white' : 'bg-nomad-blue text-white border-nomad-blue hover:bg-nomad-blue/90 shadow-sm'}`}
                                >
                                  {isAdded ? <Trash2 size={18} /> : <Plus size={18} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Custom Fallback */}
                      {search && !filteredActivities.some(a => a.name.toLowerCase().includes(search.toLowerCase())) && (
                        <div className="bg-white border-2 border-dashed border-nomad-border rounded-xl flex flex-col items-center justify-center p-10 text-center cursor-pointer hover:border-nomad-blue hover:bg-nomad-blue/5 transition-all group" onClick={() => setSelectedActivity({ name: search, category: 'General', estimatedCost: 0, duration: 60, notes: '', isCustom: true })}>
                          <Plus size={40} className="text-slate-200 group-hover:text-nomad-blue transition-all mb-4" strokeWidth={1} />
                          <h3 className="text-base font-black text-nomad-slate uppercase tracking-tight mb-2">Add "{search}"</h3>
                          <p className="text-[9px] font-bold text-nomad-muted uppercase tracking-widest">Add a custom activity manually.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="config"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute inset-0 p-8 md:p-12 overflow-y-auto no-scrollbar"
              >
                <div className="max-w-xl mx-auto space-y-10">
                  
                  {!selectedActivity.isCustom && (
                    <div className="bg-nomad-slate rounded-xl overflow-hidden shadow-xl relative h-48 border border-white/10">
                       <img src={selectedActivity.image} className="w-full h-full object-cover opacity-40" alt="" />
                       <div className="absolute inset-0 bg-gradient-to-t from-nomad-slate via-nomad-slate/40 to-transparent flex flex-col justify-end p-8">
                          <span className="text-[9px] font-black text-nomad-blue uppercase tracking-[0.3em] mb-2 italic">{selectedActivity.category} PROTOCOL</span>
                          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight">{selectedActivity.name}</h2>
                       </div>
                       <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.05] pointer-events-none" />
                    </div>
                  )}

                  <form onSubmit={handleSave} className="bg-white p-8 md:p-10 rounded-xl border border-nomad-border shadow-sm space-y-8 relative overflow-hidden">
                    <div className="space-y-2">
                      <label className="nomad-label">Activity Time (Optional)</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-nomad-blue" />
                        <input type="text" placeholder="E.G. 10:00 AM // TRANSIT PHASE" className="nomad-input pl-12 font-black uppercase !tracking-widest" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="nomad-label">Notes & Details</label>
                      <div className="relative">
                         <Database size={16} className="absolute left-4 top-5 text-slate-300" />
                         <textarea placeholder="Add notes, tips or reminders..." className="nomad-input pl-12 min-h-[150px] !py-5 font-medium normal-case tracking-normal" value={formData.notes || selectedActivity.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                      </div>
                    </div>

                    <div className="pt-8 flex flex-col md:flex-row gap-4">
                      <button type="button" onClick={() => setSelectedActivity(null)} className="nomad-btn-ghost !py-4 md:w-1/3 !text-[10px] !font-black uppercase tracking-widest">Cancel</button>
                      <button type="submit" className="nomad-btn-secondary flex-1 !py-4 !text-[11px] !font-black uppercase tracking-widest shadow-lg">Add Activity</button>
                    </div>

                    {/* Technical Pattern */}
                    <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.02] pointer-events-none" />
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
