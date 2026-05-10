import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Navigation, Globe, Database, Lock, User, Mail, Zap, Radio } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${isLogin ? 'login' : 'signup'}`, { email, password, name });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-nomad-gray font-sans">
      {/* Visual side */}
      <div className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between bg-nomad-slate relative overflow-hidden">
        <div className="relative z-10 space-y-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 text-white">
            <div className="w-12 h-12 bg-nomad-orange rounded flex items-center justify-center text-white shadow-lg">
              <Navigation size={24} fill="currentColor" />
            </div>
            <div>
              <span className="block text-2xl font-black tracking-tighter uppercase leading-none">Traveloop</span>
              <span className="text-[9px] font-bold text-nomad-orange uppercase tracking-[0.3em] leading-none">Travel Platform</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-7xl font-black text-white uppercase tracking-tight leading-[0.9]">
              Plan Your<br /><span className="text-nomad-orange">Next</span><br />Journey.
            </h1>
            <p className="text-lg text-white/40 max-w-xs font-medium leading-relaxed">
              The all-in-one platform for travelers to plan, track, and share.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded border border-white/10 w-fit text-nomad-orange">
                <Database size={20} />
              </div>
              <div>
                <p className="text-white font-black uppercase text-xs tracking-tight">140+ Places</p>
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-relaxed">Curated travel destinations.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded border border-white/10 w-fit text-nomad-blue">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <p className="text-white font-black uppercase text-xs tracking-tight">Easy Planning</p>
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-relaxed">Simple and fast itinerary tools.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[9px] font-bold text-white/20 tracking-widest uppercase">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Secure Access</span>
            </div>
          </div>
          <span>© 2026 Traveloop</span>
        </div>

        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-[0.05] pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-full opacity-[0.05] pointer-events-none flex items-center justify-end pr-10 translate-x-1/2">
          <Globe size={800} strokeWidth={0.5} />
        </div>
      </div>

      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.03] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white border border-nomad-border rounded-xl p-10 md:p-14 shadow-premium relative overflow-hidden">
            <div className="mb-10 space-y-2">
              <div className="w-8 h-1 bg-nomad-orange mb-5" />
              <h2 className="text-3xl font-black text-nomad-slate uppercase tracking-tight">
                {isLogin ? 'Welcome Back' : 'Join Traveloop'}
              </h2>
              <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-[0.2em]">Login to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="nomad-label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="nomad-input pl-12 uppercase tracking-widest text-xs" placeholder="FULL NAME" required />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="nomad-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="nomad-input pl-12" placeholder="name@email.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="nomad-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="nomad-input pl-12 tracking-widest" placeholder="••••••••" required />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-50 py-3 rounded border border-red-100">{error}</p>
              )}

              <button type="submit" className="nomad-btn-primary w-full !py-4 !text-xs uppercase tracking-[0.3em] font-black">
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-10 text-center border-t border-nomad-gray pt-8">
              <p className="text-[10px] text-nomad-muted font-bold uppercase tracking-widest">
                {isLogin ? "Don't have an account?" : "Already registered?"}{' '}
                <button onClick={() => setIsLogin(!isLogin)} className="text-nomad-blue font-black hover:underline">
                  {isLogin ? 'Register Now' : 'Back to Login'}
                </button>
              </p>
            </div>

            <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.03] pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
