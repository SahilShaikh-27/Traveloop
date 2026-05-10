import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Plus, Trash2, Edit3, Calendar, 
  Search, Filter, StickyNote, MoreVertical, 
  ChevronRight, ArrowRight, MessageSquare, Save, X, MapPin,
  Sparkles, PenTool, Wind, Zap, MessageCircle, FileText, Database, Radio
} from 'lucide-react';

const Journal = () => {
  const [notes, setNotes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTripId, setActiveTripId] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ content: '', tripId: '', stopId: '' });
  const [stopsForSelectedTrip, setStopsForSelectedTrip] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [notesRes, tripsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/notes', { headers }),
        axios.get('http://localhost:5000/api/trips', { headers })
      ]);
      
      setNotes(notesRes.data);
      setTrips(tripsRes.data);
    } catch (error) {
      console.error('Failed to fetch journal data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripChange = (tripId) => {
    setNewNote({ ...newNote, tripId, stopId: '' });
    if (tripId) {
      const trip = trips.find(t => t.id === tripId);
      setStopsForSelectedTrip(trip?.stops || []);
    } else {
      setStopsForSelectedTrip([]);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/notes', newNote, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes([res.data, ...notes]);
      setShowAddModal(false);
      setNewNote({ content: '', tripId: '', stopId: '' });
    } catch (error) {
      alert('Failed to save note.');
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`http://localhost:5000/api/notes/${editingNote.id}`, { content: editingNote.content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.map(n => n.id === editingNote.id ? { ...n, content: res.data.content } : n));
      setEditingNote(null);
    } catch (error) {
      alert('Failed to update note.');
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      alert('Failed to delete note.');
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesTrip = activeTripId === 'all' || n.tripId === activeTripId;
    const matchesSearch = n.content.toLowerCase().includes(search.toLowerCase()) || 
                         (n.trip?.title && n.trip.title.toLowerCase().includes(search.toLowerCase()));
    return matchesTrip && matchesSearch;
  });

  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const date = new Date(note.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(note);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-nomad-gray">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
          <div className="w-12 h-12 border-4 border-nomad-border border-t-nomad-blue rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-nomad-slate">Loading Journals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nomad-gray font-sans pb-32 overflow-x-hidden">
      <Navbar />

      {/* Technical Log Header */}
      <header className="bg-nomad-slate text-white py-12 md:py-20 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-nomad-orange">
               <Database size={18} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Travel Journals</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">My Journals</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">You have {notes.length} journal entries across your trips...</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="nomad-btn-primary !px-10 !py-4 uppercase tracking-widest text-[11px] font-black"
          >
            <PenTool size={16} />
            <span>New Entry</span>
          </button>
        </div>
        
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-[0.05] pointer-events-none" />
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-10 py-12 space-y-12">
        {/* Technical Filter/Search Strip */}
        <div className="bg-white border border-nomad-border rounded-lg p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="QUERY LOG ENTRIES..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="nomad-input pl-12 uppercase !tracking-widest !text-[10px]"
              />
           </div>
           <div className="flex items-center space-x-4 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
              <button 
                onClick={() => setActiveTripId('all')}
                className={`px-6 py-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTripId === 'all' ? 'bg-nomad-slate text-white border-nomad-slate' : 'bg-white text-nomad-muted border-nomad-border hover:border-nomad-slate hover:text-nomad-slate'}`}
              >
                All Trips
              </button>
              {trips.map(trip => (
                <button 
                  key={trip.id}
                  onClick={() => setActiveTripId(trip.id)}
                  className={`px-6 py-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTripId === trip.id ? 'bg-nomad-slate text-white border-nomad-slate' : 'bg-white text-nomad-muted border-nomad-border hover:border-nomad-slate hover:text-nomad-slate'}`}
                >
                  {trip.title}
                </button>
              ))}
           </div>
        </div>

        {Object.keys(groupedNotes).length === 0 ? (
          <div className="bg-white border border-dashed border-nomad-border rounded-xl p-20 text-center space-y-6">
            <FileText size={48} className="mx-auto text-slate-200" strokeWidth={1} />
            <div className="space-y-2">
               <p className="text-lg font-black text-nomad-slate uppercase tracking-tight">No Journal Entries</p>
               <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest">You haven't written any journals for this search.</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="nomad-btn-primary mx-auto !px-12">Create Entry</button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedNotes).map(([date, dateNotes]) => (
              <div key={date} className="space-y-6">
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-nomad-blue px-4 py-1.5 bg-nomad-blue/5 border border-nomad-blue/20 rounded-full">{date}</span>
                  <div className="h-px flex-1 bg-nomad-border" />
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {dateNotes.map((note, ni) => (
                    <motion.div 
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-nomad-border rounded-xl p-6 md:p-10 group hover:border-nomad-orange transition-all shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex flex-wrap gap-3">
                          {note.trip && (
                            <div className="bg-nomad-gray border border-nomad-border px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest text-nomad-slate">
                              TRIP: {note.trip.title}
                            </div>
                          )}
                          {note.tripStopId && note.trip?.stops && (
                            <div className="bg-nomad-blue/5 border border-nomad-blue/20 px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest text-nomad-blue flex items-center space-x-1.5">
                              <MapPin size={10} />
                              <span>PLACE: {note.trip.stops.find(s => s.id === note.tripStopId)?.cityName || 'UNKNOWN'}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => setEditingNote({ ...note })}
                            className="p-2 text-slate-400 hover:text-nomad-blue"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {editingNote?.id === note.id ? (
                        <form onSubmit={handleUpdateNote} className="space-y-6 relative z-10">
                          <textarea 
                            value={editingNote.content}
                            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                            className="w-full p-6 border border-nomad-border rounded-lg outline-none font-medium text-nomad-slate text-lg min-h-[150px] focus:ring-2 focus:ring-nomad-orange transition-all"
                            autoFocus
                          />
                          <div className="flex justify-end space-x-3">
                            <button type="button" onClick={() => setEditingNote(null)} className="nomad-btn-ghost !text-[9px] !py-2 uppercase tracking-widest">Cancel</button>
                            <button type="submit" className="nomad-btn-primary !text-[9px] !py-2 uppercase tracking-widest">Save</button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-8 relative z-10">
                          <p className="text-lg md:text-xl font-medium text-nomad-slate leading-relaxed border-l-2 border-nomad-orange pl-6">
                            {note.content}
                          </p>
                          <div className="pt-6 border-t border-nomad-gray flex items-center justify-between">
                            <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-nomad-muted">
                              <Radio size={12} className="mr-2 text-emerald-500 animate-pulse" />
                              <span>Written at {new Date(note.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="text-[9px] font-black text-nomad-muted uppercase tracking-tighter">
                               ENTRY ID: {note.id?.slice(-8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Technical Background Pattern */}
                      <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.02] pointer-events-none" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Technical Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-nomad-slate/80 backdrop-blur-sm z-[500] flex items-center justify-center p-6"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-nomad-border rounded-xl p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-nomad-slate uppercase tracking-tight leading-none">New Journal Entry</h3>
                   <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest">Write about your travel experience</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-300 hover:text-nomad-slate transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddNote} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="nomad-label">Select Trip</label>
                    <select 
                      value={newNote.tripId}
                      onChange={(e) => handleTripChange(e.target.value)}
                      className="nomad-input uppercase !tracking-widest !text-[10px] bg-nomad-gray cursor-pointer"
                    >
                      <option value="">Personal Journal</option>
                      {trips.map(trip => (
                        <option key={trip.id} value={trip.id}>{trip.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="nomad-label">Select Stop</label>
                    <select 
                      value={newNote.stopId}
                      onChange={(e) => setNewNote({ ...newNote, stopId: e.target.value })}
                      disabled={!newNote.tripId}
                      className="nomad-input uppercase !tracking-widest !text-[10px] bg-nomad-gray cursor-pointer disabled:opacity-30"
                    >
                      <option value="">General Trip Journal</option>
                      {stopsForSelectedTrip.map(stop => (
                        <option key={stop.id} value={stop.id}>{stop.cityName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="nomad-label">Journal Content</label>
                  <textarea 
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="nomad-input !p-6 min-h-[200px] text-base font-medium normal-case tracking-normal"
                    placeholder="Write your thoughts here..."
                    required
                  />
                </div>

                <button type="submit" className="nomad-btn-primary w-full !py-4 uppercase tracking-widest text-[12px] font-black">
                   <Save size={18} />
                   Save Entry
                </button>
              </form>

              {/* Technical Accent Grid */}
              <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.03] pointer-events-none" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Journal;
