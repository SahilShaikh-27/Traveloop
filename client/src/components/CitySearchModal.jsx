import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Plus, Calendar, Star, TrendingUp, DollarSign, Loader2, Database, Radio, Activity, Navigation, Settings } from 'lucide-react';
import axios from 'axios';

const REGIONS = ['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Africa'];

export default function CitySearchModal({ onClose, onSave, tripDates }) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  
  // State for the 2nd step (date configuration)
  const [selectedCity, setSelectedCity] = useState(null);
  const [formData, setFormData] = useState({ startDate: '', endDate: '', dayNumber: 1 });

  const minDateStr = tripDates?.start ? new Date(tripDates.start).toISOString().split('T')[0] : undefined;
  const maxDateStr = tripDates?.end ? new Date(tripDates.end).toISOString().split('T')[0] : undefined;

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch real-world data from Gemini
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/trips/search-cities?q=${search}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCities(res.data);
      } catch (err) {
        console.error("Error fetching cities", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce
    const timeoutId = setTimeout(() => {
      fetchCities();
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const filteredCities = useMemo(() => {
    let filtered = cities;
    if (regionFilter !== 'All') {
      filtered = filtered.filter(c => c.region === regionFilter);
    }
    return filtered;
  }, [cities, regionFilter]);

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      cityName: selectedCity.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dayNumber: formData.dayNumber
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
                <Navigation size={20} fill="currentColor" />
             </div>
             <div>
                <h2 className="text-xl font-black text-nomad-slate uppercase tracking-tight leading-none">
                  {selectedCity ? `Plan Stop: ${selectedCity.name}` : 'Find Destinations'}
                </h2>
                <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest mt-1">
                  {selectedCity ? 'Set the dates for this stop.' : 'Search for cities and places to visit.'}
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
            {!selectedCity ? (
              <motion.div 
                key="search"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Search & Filters */}
                <div className="px-8 py-8 shrink-0 space-y-6 bg-white border-b border-nomad-border">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="IDENTIFY DESTINATION..." 
                      className="nomad-input !pl-14 !py-5 uppercase !tracking-[0.2em] !text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {REGIONS.map(r => (
                      <button 
                        key={r}
                        onClick={() => setRegionFilter(r)}
                        className={`px-6 py-2 rounded border text-[10px] font-black uppercase tracking-widest transition-all ${regionFilter === r ? 'bg-nomad-slate text-white border-nomad-slate' : 'bg-white text-nomad-muted border-nomad-border hover:border-nomad-slate hover:text-nomad-slate'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-6">
                      <Loader2 className="animate-spin text-nomad-blue" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-nomad-muted">Searching destinations...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredCities.map(city => {
                        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(city.imageKeyword || city.name + ' city')}?width=500&height=400&nologo=true`;
                        return (
                          <div key={city.name} className="bg-white border border-nomad-border rounded-xl overflow-hidden group hover:border-nomad-orange transition-all cursor-pointer shadow-sm" onClick={() => setSelectedCity({...city, image: imageUrl})}>
                            <div className="h-44 relative overflow-hidden bg-nomad-gray border-b border-nomad-border">
                              <img src={imageUrl} alt={city.name} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-700" />
                              <div className="absolute top-4 left-4 bg-nomad-slate text-white px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest">
                                {city.country}
                              </div>
                              <div className="absolute top-4 right-4 w-10 h-10 bg-white border border-nomad-border rounded flex items-center justify-center text-nomad-orange shadow-sm group-hover:bg-nomad-orange group-hover:text-white transition-all">
                                <Plus size={18} />
                              </div>
                              <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.05] pointer-events-none" />
                            </div>
                            <div className="p-6 space-y-6">
                              <h3 className="text-lg font-black text-nomad-slate uppercase tracking-tight line-clamp-1 group-hover:text-nomad-orange transition-colors">{city.name}</h3>
                              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-nomad-gray">
                                <div className="space-y-1">
                                  <span className="block text-[8px] font-bold text-nomad-muted uppercase tracking-tighter italic">Stability</span>
                                  <div className="flex items-center space-x-1">
                                    <TrendingUp size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-nomad-slate">{city.pop}%</span>
                                  </div>
                                </div>
                                <div className="space-y-1 text-right">
                                  <span className="block text-[8px] font-bold text-nomad-muted uppercase tracking-tighter italic">Vibe</span>
                                  <span className="block text-[9px] font-black text-nomad-blue uppercase italic">{city.vibe}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Custom City fallback */}
                      {search && !filteredCities.some(c => c.name.toLowerCase() === search.toLowerCase()) && (
                        <div className="bg-white border-2 border-dashed border-nomad-border rounded-xl flex flex-col items-center justify-center p-10 text-center cursor-pointer hover:border-nomad-blue hover:bg-nomad-blue/5 transition-all group" onClick={() => setSelectedCity({ name: search, isCustom: true })}>
                          <Database size={40} className="text-slate-200 group-hover:text-nomad-blue transition-all mb-4" strokeWidth={1} />
                          <h3 className="text-base font-black text-nomad-slate uppercase tracking-tight mb-2">Add "{search}"</h3>
                          <p className="text-[9px] font-bold text-nomad-muted uppercase tracking-widest">Add a custom city or stop manually.</p>
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
                  
                  {/* Selected City Preview */}
                  {!selectedCity.isCustom && (
                    <div className="bg-nomad-slate rounded-xl overflow-hidden shadow-xl relative h-48 border border-white/10">
                       <img src={selectedCity.image} className="w-full h-full object-cover opacity-40" alt="" />
                       <div className="absolute inset-0 bg-gradient-to-t from-nomad-slate via-nomad-slate/40 to-transparent flex flex-col justify-end p-8">
                          <span className="text-[9px] font-black text-nomad-orange uppercase tracking-[0.3em] mb-2 italic">Selected Destination</span>
                          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">{selectedCity.name}</h2>
                          <div className="flex items-center space-x-2 text-[10px] font-bold text-white/50 uppercase tracking-widest mt-2">
                             <MapPin size={12} className="text-nomad-orange" />
                             <span>{selectedCity.country}</span>
                          </div>
                       </div>
                       <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.05] pointer-events-none" />
                    </div>
                  )}

                  <form onSubmit={handleSave} className="bg-white p-8 md:p-10 rounded-xl border border-nomad-border shadow-sm space-y-8 relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="nomad-label">Arrival Date</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-nomad-blue" />
                          <input required type="date" min={minDateStr} max={maxDateStr} className="nomad-input pl-12 font-black uppercase !tracking-widest" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="nomad-label">Departure Date</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-nomad-orange" />
                          <input required type="date" min={minDateStr} max={maxDateStr} className="nomad-input pl-12 font-black uppercase !tracking-widest" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="nomad-label">Stop Number / Day</label>
                      <div className="relative">
                         <Settings size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                         <input required type="number" min="1" className="nomad-input pl-12 font-black uppercase !tracking-widest" value={formData.dayNumber} onChange={e => setFormData({...formData, dayNumber: e.target.value})} />
                      </div>
                    </div>

                    <div className="pt-8 flex flex-col md:flex-row gap-4">
                      <button type="button" onClick={() => setSelectedCity(null)} className="nomad-btn-ghost !py-4 md:w-1/3 !text-[10px] !font-black uppercase tracking-widest">Cancel</button>
                      <button type="submit" className="nomad-btn-secondary flex-1 !py-4 !text-[11px] !font-black uppercase tracking-widest shadow-lg">Add to Itinerary</button>
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
