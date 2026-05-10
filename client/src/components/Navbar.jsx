import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation, Globe, Map, Book, User, LogOut, PlusCircle, Radio } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/',          icon: Navigation },
    { name: 'Trips',     path: '/trips',      icon: Map },
    { name: 'Explore',   path: '/explore',    icon: Globe },
    { name: 'Journal',   path: '/journal',    icon: Book },
  ];

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-nomad-border sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 bg-nomad-orange rounded flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Navigation size={18} fill="currentColor" />
          </div>
          <div>
            <span className="block text-base font-black tracking-tighter text-nomad-slate uppercase leading-none">Traveloop</span>
            <span className="block text-[8px] font-bold text-nomad-orange uppercase tracking-[0.3em] leading-none">Travel Dashboard</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded text-xs font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-nomad-gray text-nomad-blue border border-nomad-border'
                    : 'text-nomad-muted hover:text-nomad-slate hover:bg-nomad-gray'
                }`}
              >
                <Icon size={14} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Status pill */}
          <div className="hidden sm:flex items-center space-x-2 bg-nomad-gray border border-nomad-border px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest text-nomad-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Ready to Plan</span>
          </div>

          <button
            onClick={() => navigate('/create-trip')}
            className="nomad-btn-primary !px-4 !py-2 !text-[10px] uppercase tracking-widest"
          >
            <PlusCircle size={14} />
            <span className="hidden sm:inline">Plan Trip</span>
          </button>

          <Link to="/profile" className="w-9 h-9 rounded border border-nomad-border overflow-hidden hover:border-nomad-orange transition-all">
            <img src={`https://i.pravatar.cc/100?u=${user?.email}`} alt="Profile" className="w-full h-full object-cover" />
          </Link>

          <button onClick={logout} className="p-2 text-nomad-muted hover:text-red-500 transition-all" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
