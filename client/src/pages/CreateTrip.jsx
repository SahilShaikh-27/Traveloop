import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Wallet, Check, ArrowRight, ArrowLeft, Activity, Sparkles, MapPin, Globe, Wind, Compass, Plus, Zap, Sun, Shield, Plane, Cpu, Settings, Database, Radio } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const planningStyles = [
  { id: 'cheapest', icon: '🍃', label: 'BUDGET TRAVEL', desc: 'Focus on saving money and using local transport.' },
  { id: 'explorer', icon: '🧭', label: 'EXPLORER', desc: 'Find unique local experiences and hidden gems.' },
  { id: 'balanced', icon: '⚖️', label: 'BALANCED', desc: 'A mix of comfort and value for a smooth trip.' },
  { id: 'premium', icon: '✨', label: 'PREMIUM', desc: 'Enjoy high-quality hotels and prioritized activities.' },
  { id: 'luxury', icon: '👑', label: 'LUXURY', desc: 'Maximum comfort and top-tier services throughout.' },
];

const CreateTrip = () => {
  const [step, setStep] = useState(1);
  const [vibe, setVibe] = useState('Chill');
  const [planningStyle, setPlanningStyle] = useState('balanced');
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: null,
    startDate: '',
    endDate: '',
    totalBudget: '30000',
  });
  const navigate = useNavigate();

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('startDate', formData.startDate);
      payload.append('endDate', formData.endDate);
      payload.append('totalBudget', formData.totalBudget);
      payload.append('vibe', vibe);
      payload.append('planningStyle', planningStyle);
      if (formData.coverImage) payload.append('coverImage', formData.coverImage);

      const res = await axios.post('http://localhost:5000/api/trips', payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      });
      navigate(`/trip/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start planning your trip.');
    } finally {
      setIsCreating(false);
    }
  };

  const STEPS = ['Details', 'Budget', 'Style'];

  return (
    <div className="min-h-screen bg-nomad-gray font-sans pb-32 overflow-x-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-12">
        {/* Technical Progress Tracker */}
        <div className="flex items-center justify-between bg-white border border-nomad-border p-6 rounded-lg shadow-sm">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center space-y-3 relative z-10">
               <div className={`w-10 h-10 border-2 border-nomad-slate rounded flex items-center justify-center transition-all ${step >= i + 1 ? 'bg-nomad-slate text-white' : 'bg-nomad-gray text-slate-300 border-nomad-border'}`}>
                 {step > i + 1 ? <Check size={18} strokeWidth={3} /> : <span className="text-xs font-black">{i + 1}</span>}
               </div>
               <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${step >= i + 1 ? 'text-nomad-slate' : 'text-slate-300'}`}>{s}</span>
            </div>
          ))}
          {/* Progress Bar Background Line */}
          <div className="absolute left-[10%] right-[10%] h-px bg-nomad-border -z-0 hidden md:block" />
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Briefing */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-12">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-nomad-orange">
                   <Settings size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Trip Details - Step 1 of 3</span>
                </div>
                <h2 className="text-4xl font-black text-nomad-slate uppercase tracking-tight">Plan Your Trip</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-nomad-muted">Enter the basic details of your journey.</p>
              </div>
              
              <div className="bg-white border border-nomad-border rounded-xl p-8 md:p-12 space-y-10 shadow-sm relative overflow-hidden">
                <div className="space-y-2 relative z-10">
                  <label className="nomad-label">Trip Name</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="E.G. SUMMER IN PARIS..."
                    className="nomad-input !py-4 text-lg font-black uppercase !tracking-widest"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-2">
                    <label className="nomad-label">Start Date</label>
                    <input 
                      type="date" 
                      value={formData.startDate} 
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="nomad-input !py-4 uppercase !tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="nomad-label">End Date</label>
                    <input 
                      type="date" 
                      value={formData.endDate} 
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="nomad-input !py-4 uppercase !tracking-widest"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <label className="nomad-label">Cover Photo (Optional)</label>
                  <label className="w-full bg-nomad-gray border border-dashed border-nomad-border rounded-lg p-10 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:border-nomad-blue hover:text-nomad-blue transition-all">
                    <Database size={32} strokeWidth={1} />
                    <span className="text-[10px] font-black uppercase tracking-widest mt-4">
                      {formData.coverImage ? formData.coverImage.name : 'Upload a cover image'}
                    </span>
                    <input 
                      type="file" 
                      className="hidden"
                      accept="image/*" 
                      onChange={(e) => setFormData({...formData, coverImage: e.target.files[0]})}
                    />
                  </label>
                </div>

                <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.03] pointer-events-none" />
              </div>

              <div className="flex justify-end pt-6">
                <button 
                  disabled={!formData.title || !formData.startDate || !formData.endDate} 
                  onClick={() => setStep(2)} 
                  className="nomad-btn-primary !px-12 !py-5 uppercase tracking-widest text-[12px] font-black shadow-lg"
                >
                  <span>Continue to Budget</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Resources */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-16">
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center space-x-2 text-nomad-blue">
                   <Activity size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Trip Budget - Step 2 of 3</span>
                </div>
                <h2 className="text-4xl font-black text-nomad-slate uppercase tracking-tight">Set Your Budget</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-nomad-muted">Define how much you'd like to spend.</p>
              </div>
              
              <div className="bg-white border border-nomad-border rounded-xl p-12 md:p-20 text-center space-y-12 shadow-sm relative overflow-hidden">
                <div className="w-16 h-16 bg-nomad-blue/10 rounded flex items-center justify-center mx-auto text-nomad-blue">
                  <Wallet size={32} />
                </div>
                
                <div className="space-y-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-nomad-muted">Total Budget Threshold (INR)</p>
                   <div className="flex items-center justify-center space-x-4">
                     <span className="text-4xl font-black text-nomad-blue tracking-tighter">₹</span>
                     <input 
                       type="number" 
                       value={formData.totalBudget} 
                       onChange={(e) => setFormData({...formData, totalBudget: e.target.value})}
                       className="w-48 md:w-80 bg-transparent text-center border-b-2 border-nomad-slate focus:border-nomad-orange outline-none text-4xl md:text-6xl font-black transition-all pb-2 tracking-tighter"
                     />
                   </div>
                </div>

                <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.03] pointer-events-none" />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-nomad-muted hover:text-nomad-slate transition-all flex items-center space-x-2">
                   <ArrowLeft size={14} />
                   <span>Go Back</span>
                </button>
                <button 
                  disabled={!formData.totalBudget} 
                  onClick={() => setStep(3)} 
                  className="nomad-btn-primary !px-12 !py-5 uppercase tracking-widest text-[12px] font-black shadow-lg w-full md:w-auto"
                >
                  <span>Select Travel Style</span>
                  <Cpu size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Protocol Selection */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-12">
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center space-x-2 text-nomad-orange">
                   <Radio size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Travel Style - Step 3 of 3</span>
                </div>
                <h2 className="text-4xl font-black text-nomad-slate uppercase tracking-tight">Travel Style</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-nomad-muted">How would you like to travel?</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {planningStyles.map((style) => (
                  <button 
                    key={style.id} 
                    onClick={() => setPlanningStyle(style.id)}
                    className={`bg-white border p-6 md:p-8 rounded-lg text-left flex items-center space-x-8 transition-all relative overflow-hidden ${
                      planningStyle === style.id 
                        ? 'border-nomad-orange border-2 ring-1 ring-nomad-orange' 
                        : 'border-nomad-border hover:border-nomad-slate'
                    }`}
                  >
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded flex items-center justify-center text-2xl md:text-3xl transition-all ${planningStyle === style.id ? 'bg-nomad-orange text-white' : 'bg-nomad-gray border border-nomad-border text-nomad-slate'}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm md:text-lg font-black text-nomad-slate uppercase tracking-tight">{style.label}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-nomad-muted uppercase tracking-widest leading-relaxed">{style.desc}</p>
                    </div>
                    {planningStyle === style.id && <div className="w-6 h-6 bg-nomad-orange rounded-full flex items-center justify-center text-white"><Check size={14} strokeWidth={4} /></div>}
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-6">
                <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-widest text-nomad-muted hover:text-nomad-slate order-2 md:order-1">Change Budget</button>
                <button onClick={handleCreate} disabled={isCreating} className="nomad-btn-secondary !py-6 !px-16 text-xl font-black uppercase tracking-[0.2em] shadow-xl order-1 md:order-2 w-full md:w-auto">
                  {isCreating ? (
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap size={24} fill="currentColor" />
                      <span>START PLANNING</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CreateTrip;
