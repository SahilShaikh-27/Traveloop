import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Globe, Trash2, Camera, MapPin, 
  Settings, Save, LogOut, ChevronRight, Bookmark, 
  Trash, AlertCircle, CheckCircle2, ExternalLink,
  Shield, CreditCard, Sparkles, Wind, Database, Radio, 
  Activity, ShieldCheck, Zap
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const LANGUAGES = [
  { code: 'en', name: 'ENGLISH', flag: '🇺🇸' },
  { code: 'es', name: 'ESPAÑOL', flag: '🇪🇸' },
  { code: 'fr', name: 'FRANÇAIS', flag: '🇫🇷' },
  { code: 'de', name: 'DEUTSCH', flag: '🇩🇪' },
  { code: 'hi', name: 'HINDI', flag: '🇮🇳' },
];

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    language: 'en',
    avatar: null
  });
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData({
        name: res.data.name,
        email: res.data.email,
        language: res.data.language,
        avatar: res.data.avatar
      });
      setSavedDestinations(res.data.savedDestinations || []);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('language', profileData.language);
      if (profileData.newAvatarFile) {
        formData.append('avatar', profileData.newAvatarFile);
      }

      const res = await axios.patch('http://localhost:5000/api/users/profile', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updateUser(res.data);
      setProfileData({
        ...profileData,
        avatar: res.data.avatar,
        newAvatarFile: null
      });
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
      navigate('/auth');
    } catch (error) {
      alert('Failed to delete account.');
    }
  };

  const handleRemoveSaved = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/saved/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedDestinations(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      alert('Failed to remove destination.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nomad-gray">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
          <div className="w-12 h-12 border-4 border-nomad-border border-t-nomad-blue rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-nomad-slate">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nomad-gray font-sans pb-32">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16 space-y-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
          
          {/* Technical Identity Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-nomad-border rounded-xl p-10 text-center sticky top-24 shadow-sm relative overflow-hidden">
              <div className="relative group mx-auto w-40 h-40 mb-10">
                <div className="w-full h-full rounded border-2 border-nomad-slate p-1 bg-white relative z-10">
                  <div className="w-full h-full rounded bg-nomad-gray overflow-hidden">
                    {profileData.newAvatarPreview || profileData.avatar ? (
                      <img 
                        src={profileData.newAvatarPreview || getImageUrl(profileData.avatar)} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <User size={64} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-nomad-slate border-2 border-white rounded flex items-center justify-center text-white cursor-pointer hover:bg-nomad-orange transition-all z-20 shadow-lg">
                  <Camera size={18} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setProfileData({
                          ...profileData,
                          newAvatarFile: file,
                          newAvatarPreview: URL.createObjectURL(file)
                        });
                      }
                    }}
                  />
                </label>
              </div>

              <div className="space-y-3 mb-12 relative z-10">
                 <h3 className="text-2xl font-black text-nomad-slate uppercase tracking-tight">{profileData.name}</h3>
                 <div className="flex items-center justify-center space-x-2 text-nomad-blue">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Verified Traveler</span>
                 </div>
              </div>

              <div className="space-y-4 relative z-10">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full nomad-btn !text-[10px] !font-black !uppercase !tracking-widest ${activeTab === 'settings' ? 'bg-nomad-slate text-white' : 'bg-nomad-gray text-nomad-slate border border-nomad-border'}`}
                >
                  Account Settings
                </button>
                <button 
                  onClick={() => setActiveTab('saved')}
                  className={`w-full nomad-btn !text-[10px] !font-black !uppercase !tracking-widest ${activeTab === 'saved' ? 'bg-nomad-slate text-white' : 'bg-nomad-gray text-nomad-slate border border-nomad-border'}`}
                >
                  Saved Destinations
                  {savedDestinations.length > 0 && (
                    <span className="ml-2 bg-nomad-orange text-white px-2 py-0.5 rounded text-[8px]">{savedDestinations.length}</span>
                  )}
                </button>
              </div>

              <div className="mt-16 pt-8 border-t border-nomad-border space-y-4 relative z-10">
                <button 
                  onClick={logout}
                  className="w-full nomad-btn-ghost !text-[9px] !font-black !uppercase !tracking-widest !border-none !justify-between"
                >
                  <span>Logout</span>
                  <LogOut size={14} />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full nomad-btn-ghost !text-[9px] !font-black !uppercase !tracking-widest !border-none !justify-between !text-red-400 hover:!text-red-600"
                >
                  <span>Delete Account</span>
                  <Trash size={14} />
                </button>
              </div>

              <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.03] pointer-events-none" />
            </div>
          </aside>

          {/* Identity Matrix Content */}
          <section className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'settings' ? (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="bg-white border border-nomad-border rounded-xl p-8 md:p-12 space-y-12 shadow-sm relative overflow-hidden">
                    <div className="space-y-2 relative z-10">
                       <h2 className="text-3xl font-black text-nomad-slate uppercase tracking-tight">Profile Settings</h2>
                       <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest">Update your profile and account information.</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-10 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="nomad-label">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                            <input 
                              type="text" 
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              className="nomad-input pl-12 font-bold uppercase !tracking-widest"
                              placeholder="Name"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="nomad-label">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                            <input 
                              type="email" 
                              value={profileData.email}
                              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                              className="nomad-input pl-12 font-bold lowercase !tracking-tight"
                              placeholder="Email"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <label className="nomad-label text-center block">Preferred Language</label>
                        <div className="flex flex-wrap justify-center gap-8">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => setProfileData({ ...profileData, language: lang.code })}
                              className={`flex flex-col items-center space-y-3 transition-all ${profileData.language === lang.code ? 'scale-110' : 'opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}
                            >
                              <span className="text-4xl">{lang.flag}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest">{lang.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-10 border-t border-nomad-border flex flex-col md:flex-row items-center justify-between gap-6">
                        {status.message && (
                          <div className={`flex items-center space-x-3 px-4 py-2 rounded border font-black uppercase text-[10px] tracking-widest ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            <span>{status.message}</span>
                          </div>
                        )}
                        <button 
                          type="submit"
                          disabled={saving}
                          className="nomad-btn-primary w-full md:w-auto !py-4 !px-12 uppercase tracking-widest text-[12px] font-black shadow-lg ml-auto"
                        >
                          {saving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Save size={18} />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    
                    <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-[0.03] pointer-events-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-nomad-slate text-white p-8 rounded-xl space-y-6 relative overflow-hidden group">
                        <div className="relative z-10 space-y-4">
                           <div className="flex items-center justify-between">
                              <Shield size={24} className="text-nomad-orange" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-white/5 px-2 py-1 rounded">Secured</span>
                           </div>
                           <h3 className="text-xl font-black uppercase tracking-tight">Security Protocol</h3>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 leading-relaxed">Your account is secured. Travel data is private.</p>
                           <button className="text-[10px] font-black uppercase tracking-widest text-nomad-orange hover:underline underline-offset-4">Rotate Keys →</button>
                        </div>
                        <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.05] pointer-events-none" />
                     </div>
                     <div className="bg-white border border-nomad-border p-8 rounded-xl space-y-6 relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                           <div className="flex items-center justify-between">
                              <CreditCard size={24} className="text-nomad-blue" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-nomad-muted">Sync Status: Active</span>
                           </div>
                           <h3 className="text-xl font-black uppercase tracking-tight text-nomad-slate">Saved Funds</h3>
                           <p className="text-3xl font-black text-nomad-slate tracking-tighter">₹1,240,000</p>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-nomad-muted">Total budget across your planned trips.</p>
                        </div>
                        <div className="absolute inset-0 bg-grid-pattern bg-[size:24px_24px] opacity-[0.02] pointer-events-none" />
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="saved"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h2 className="text-3xl font-black text-nomad-slate uppercase tracking-tight">Saved Destinations</h2>
                       <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest">Places you want to visit.</p>
                    </div>
                    <Link to="/explore" className="nomad-btn-ghost !text-[10px] !font-black !uppercase !tracking-widest">Explore More</Link>
                  </div>

                  {savedDestinations.length === 0 ? (
                    <div className="bg-white border border-dashed border-nomad-border rounded-xl p-20 text-center space-y-8">
                      <Database className="mx-auto text-slate-200" strokeWidth={1} size={64} />
                      <div className="space-y-2">
                         <h3 className="text-2xl font-black text-nomad-slate uppercase tracking-tight">No Saved Places</h3>
                         <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest italic leading-relaxed">Your wishlist is currently empty.</p>
                      </div>
                      <button onClick={() => navigate('/explore')} className="nomad-btn-primary mx-auto !px-12">Browse Destinations</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {savedDestinations.map((dest, i) => (
                        <motion.div 
                          key={dest.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white border border-nomad-border rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:border-nomad-blue transition-all"
                        >
                          <Link to={dest.sourceSlug ? `/public/${dest.sourceSlug}` : '/explore'} className="block h-full">
                            <div className="bg-nomad-gray border-b border-nomad-border p-4 flex items-center justify-between">
                               <div className="flex items-center space-x-2">
                                  <MapPin size={12} className="text-nomad-blue" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-nomad-slate">{dest.country}</span>
                               </div>
                               <button 
                                 onClick={(e) => { e.preventDefault(); handleRemoveSaved(dest.id); }}
                                 className="p-1.5 text-slate-300 hover:text-red-500 transition-all"
                               >
                                 <Trash size={14} />
                               </button>
                            </div>
                            <div className="p-6 flex justify-between items-center bg-white relative overflow-hidden">
                               <div className="space-y-1 relative z-10">
                                  <h4 className="text-lg font-black text-nomad-slate uppercase tracking-tight line-clamp-1">{dest.name}</h4>
                                  <span className="text-[8px] font-bold text-nomad-muted uppercase tracking-widest">Saved Destination</span>
                               </div>
                               <ChevronRight size={20} className="text-slate-200 group-hover:text-nomad-blue group-hover:translate-x-1 transition-all relative z-10" />
                               
                               <div className="absolute inset-0 bg-grid-pattern bg-[size:16px_16px] opacity-[0.02] pointer-events-none" />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Fatal Protocol Confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-nomad-slate/90 backdrop-blur-md z-[600] flex items-center justify-center p-6"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-nomad-border rounded-xl p-10 md:p-16 max-w-xl w-full text-center space-y-10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-inner">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-3">
                 <h3 className="text-2xl font-black text-nomad-slate uppercase tracking-tight">Fatal Termination</h3>
                 <p className="text-[10px] font-bold text-nomad-muted uppercase tracking-widest italic leading-relaxed">This protocol will permanently erase your neural identity and all operational mission loops. Proceed with absolute caution.</p>
              </div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleDeleteAccount}
                  className="nomad-btn !bg-red-500 !text-white !py-5 !text-xs !font-black uppercase tracking-widest shadow-lg hover:!bg-red-600"
                >
                  Confirm Self-Destruct
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-nomad-slate transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
