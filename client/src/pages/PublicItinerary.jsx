import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { MapPin, Clock, Wallet, Navigation, Calendar, ArrowLeft, Copy, CheckCircle2, Share2, Globe, Users, Camera, Send, Bookmark, Database, Radio, Activity, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const PublicItinerary = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trips/public/${slug}`);
        setTrip(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load public trip');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [slug]);

  const handleCopyTrip = async () => {
    try {
      setIsCopying(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      
      const res = await axios.post(`http://localhost:5000/api/trips/public/${slug}/copy`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate(`/trip/${res.data.newTripId}`);
    } catch (err) {
      alert('Failed to copy trip. Please login to continue.');
      setIsCopying(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this trip on Traveloop: ${trip.title}`;
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      alert('Link copied! Paste in Instagram Bio/Stories.');
    }
  };

  const handleSaveDestination = async (stop) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      await axios.post('http://localhost:5000/api/users/saved', {
        name: stop.cityName,
        country: stop.country,
        image: stop.coverImage ? `http://localhost:5000${stop.coverImage}` : null,
        notes: `Saved from: ${trip.title}`,
        sourceSlug: slug
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`${stop.cityName} saved to your wishlist!`);
    } catch (err) {
      alert('Failed to save destination.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nomad-gray">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
          <div className="w-12 h-12 border-4 border-nomad-border border-t-nomad-blue rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-nomad-slate">Loading Trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-nomad-gray">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh] p-6">
          <div className="text-center p-10 md:p-16 bg-white rounded-xl border border-nomad-border shadow-sm max-w-md space-y-8 relative overflow-hidden">
            <Globe size={48} className="mx-auto text-slate-200" strokeWidth={1} />
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-nomad-slate uppercase tracking-tight">Trip Not Found</h2>
               <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest leading-relaxed">{error || "This trip itinerary is no longer accessible."}</p>
            </div>
            <button onClick={() => navigate('/explore')} className="nomad-btn-primary w-full !py-4">Explore Destinations</button>
            <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.03] pointer-events-none" />
          </div>
        </div>
      </div>
    );
  }

  const totalDays = trip?.endDate && trip?.startDate ? Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))) + 1 : Math.max(1, (trip?.stops?.length || 0));

  return (
    <div className="min-h-screen bg-nomad-gray font-sans pb-32">
      <Navbar />

      {/* Technical Public Header */}
      <div className="bg-nomad-slate text-white py-12 md:py-20 lg:py-28 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          <button onClick={() => navigate('/explore')} className="flex items-center text-white/50 hover:text-nomad-orange transition-all text-[10px] font-black uppercase tracking-widest group">
            <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-1 transition-transform" /> Explore Destinations
          </button>
          
          <div className="space-y-6">
             <div className="flex flex-wrap items-center gap-3">
                <div className="bg-nomad-blue/20 border border-nomad-blue/30 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center text-nomad-blue">
                   <Radio size={12} className="mr-2 animate-pulse" /> Public Trip
                </div>
                {trip.vibe && (
                   <div className="bg-white/10 border border-white/20 px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest text-white/50">
                      Vibe: {trip.vibe.toUpperCase()}
                   </div>
                )}
             </div>
             <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-none max-w-4xl">{trip.title}</h1>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-white/10">
                <div className="space-y-1">
                   <span className="block text-[8px] font-bold text-white/30 uppercase tracking-tighter">Architect</span>
                   <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-nomad-orange p-0.5"><User size={10} className="text-white mx-auto" /></div>
                      <span className="text-xs font-black uppercase text-white">{trip.user?.name || 'NOMAD'}</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <span className="block text-[8px] font-bold text-white/30 uppercase tracking-tighter">Trip Duration</span>
                   <div className="flex items-center space-x-2 text-xs font-black text-white">
                      <Calendar size={12} className="text-nomad-blue" />
                      <span>{totalDays} DAYS</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <span className="block text-[8px] font-bold text-white/30 uppercase tracking-tighter">Total Budget</span>
                   <div className="flex items-center space-x-2 text-xs font-black text-white">
                      <Wallet size={12} className="text-nomad-orange" />
                      <span>₹{(trip.totalBudget || 0).toLocaleString()}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
        
        {/* Technical Background Accent */}
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-[0.05] pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-[0.05] pointer-events-none flex items-center justify-end pr-10 translate-x-1/2">
           <Navigation size={600} strokeWidth={0.5} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-10 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Timeline View */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white p-8 md:p-12 rounded-xl border border-nomad-border shadow-sm space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-nomad-muted border-b border-nomad-gray pb-2 block w-fit">Trip Summary</span>
              <p className="text-nomad-slate font-medium text-lg leading-relaxed">{trip.description || "No description provided."}</p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                 <Activity size={20} className="text-nomad-blue" />
                 <h2 className="text-2xl font-black text-nomad-slate uppercase tracking-tight">Trip Itinerary</h2>
              </div>

              <div className="relative pl-8 md:pl-12 border-l border-nomad-border space-y-12">
                {(trip.stops || []).map((stop, index) => (
                  <div key={stop.id || index} className="relative">
                    {/* Index Node */}
                    <div className="absolute -left-[45px] md:-left-[61px] top-0 w-8 h-8 md:w-12 md:h-12 bg-nomad-gray border border-nomad-border rounded flex items-center justify-center font-black text-xs md:text-sm text-nomad-slate">
                       {index + 1}
                    </div>

                    <div className="bg-white border border-nomad-border rounded-xl p-8 md:p-10 space-y-8 relative overflow-hidden">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                          <div className="space-y-1">
                             <span className="text-[10px] font-black text-nomad-blue uppercase tracking-widest">Day {stop.dayNumber || index + 1} // {stop.country}</span>
                             <h3 className="text-2xl md:text-4xl font-black text-nomad-slate uppercase tracking-tight">{stop.cityName}</h3>
                          </div>
                          <button 
                            onClick={() => handleSaveDestination(stop)}
                            className="nomad-btn-ghost !text-[9px] !font-black !uppercase !tracking-widest flex items-center space-x-2"
                          >
                            <Bookmark size={14} />
                            <span>Save Stop</span>
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                          {(stop.activities || []).map((act, actIndex) => (
                            <div key={act.id || actIndex} className="bg-nomad-gray border border-nomad-border p-5 rounded-lg space-y-4">
                               <div className="flex justify-between items-start">
                                  <span className="text-[8px] font-black bg-white border border-nomad-border px-2 py-1 rounded text-nomad-slate uppercase tracking-tight">
                                     {act.category || 'LOG'}
                                  </span>
                                  {act.time && <span className="text-[9px] font-bold text-nomad-muted uppercase">{act.time}</span>}
                               </div>
                               <h4 className="text-sm font-black text-nomad-slate uppercase tracking-tight">{act.name}</h4>
                               <div className="pt-4 border-t border-nomad-border/50 flex justify-between items-center text-[9px] font-bold">
                                 <span className="flex items-center text-nomad-muted uppercase"><Clock size={10} className="mr-1.5"/> {act.duration}M</span>
                                 <span className="text-nomad-slate font-black">₹{act.estimatedCost.toLocaleString()}</span>
                               </div>
                            </div>
                          ))}
                          {(!stop.activities || stop.activities.length === 0) && (
                            <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest italic">No activities planned for this stop.</p>
                          )}
                       </div>

                       {/* Technical Pattern */}
                       <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.02] pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Control Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <div className="bg-nomad-orange p-8 md:p-10 rounded-xl text-white shadow-xl space-y-10 relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                   <h3 className="text-2xl font-black uppercase tracking-tight">Save Trip</h3>
                   <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest leading-relaxed">Add this trip to your dashboard to make it your own.</p>
                </div>
                <button 
                  onClick={handleCopyTrip} 
                  disabled={isCopying}
                  className="w-full nomad-btn !bg-white !text-nomad-orange !py-5 !text-[11px] !font-black !uppercase !tracking-[0.2em] shadow-lg relative z-10 active:scale-95 transition-all"
                >
                  {isCopying ? (
                    <><div className="w-4 h-4 border-2 border-nomad-orange/30 border-t-nomad-orange rounded-full animate-spin mr-3" /> COPYING TRIP...</>
                  ) : (
                    <><Copy size={16} className="mr-3" /> COPY THIS TRIP</>
                  )}
                </button>
                <div className="absolute bottom-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
                   <Cpu size={200} strokeWidth={0.5} />
                </div>
              </div>

              <div className="bg-white border border-nomad-border rounded-xl p-8 space-y-8 shadow-sm">
                <div className="flex items-center space-x-3 pb-4 border-b border-nomad-border">
                   <Share2 size={16} className="text-nomad-blue" />
                   <h4 className="text-[10px] font-black text-nomad-slate uppercase tracking-widest">Share This Trip</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => handleShare('twitter')} className="flex flex-col items-center gap-3 p-4 rounded-lg bg-nomad-gray border border-nomad-border hover:border-nomad-blue transition-all group">
                    <Send size={18} className="text-slate-400 group-hover:text-nomad-blue" />
                    <span className="text-[8px] font-black uppercase tracking-widest">X (TWITTER)</span>
                  </button>
                  <button onClick={() => handleShare('instagram')} className="flex flex-col items-center gap-3 p-4 rounded-lg bg-nomad-gray border border-nomad-border hover:border-pink-500 transition-all group">
                    <Camera size={18} className="text-slate-400 group-hover:text-pink-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">INSTAGRAM</span>
                  </button>
                  <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-3 p-4 rounded-lg bg-nomad-gray border border-nomad-border hover:border-emerald-500 transition-all group">
                    {copiedLink ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} className="text-slate-400 group-hover:text-emerald-500" />}
                    <span className="text-[8px] font-black uppercase tracking-widest">{copiedLink ? 'COPIED' : 'LINK'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default PublicItinerary;
