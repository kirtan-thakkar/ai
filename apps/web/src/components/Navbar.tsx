import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Bookmark, 
  Calendar, 
  Users, 
  History, 
  Sparkles,
  Layers,
  GraduationCap,
  Menu,
  X,
  Shuffle,
  ChevronUp,
  Search,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/ai-lab', label: 'AI Lab', icon: GraduationCap },
    { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
    { to: '/planner', label: 'Planner', icon: Calendar },
    { to: '/watch-party', label: 'Couch War', icon: Users },
    { to: '/alternatives/m_interstellar', label: 'Alternatives', icon: Layers },
    { to: '/history', label: 'History', icon: History },
  ];

  // Mobile dock primary links
  const mobileDockLinks = [
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/ai-lab', label: 'AI Lab', icon: GraduationCap },
    { to: '/watchlist', label: 'Watchlist', icon: Bookmark },
    { to: '/watch-party', label: 'Couch War', icon: Users },
  ];

  // Identify active route label for the breadcrumb pill
  const activeLink = navLinks.find(link => location.pathname.startsWith(link.to.split('/')[1] ? `/${link.to.split('/')[1]}` : link.to));
  const currentViewTitle = activeLink ? activeLink.label : location.pathname === '/' ? 'Home' : 'Explore';

  const triggerSurpriseMe = () => {
    navigate('/discover?preset_mood=8.0&preset_time=120');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Brand Bar (Visible on mobile only for top identity context) */}
      <div className="md:hidden sticky top-0 z-40 w-full px-4 py-3 bg-[#050507]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f24c27] to-[#ff7a59] p-0.5 shadow-md shadow-[#f24c27]/30">
            <div className="w-full h-full bg-[#08080c] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#f24c27]" />
            </div>
          </div>
          <span className="text-base font-extrabold tracking-tight text-white uppercase font-mono">
            CINEMIND <span className="text-xs font-bold text-[#f24c27]">AI</span>
          </span>
        </Link>
        <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{currentViewTitle}</span>
        </span>
      </div>

      {/* Main Glassmorphic Navbar Container (Sticky Top on Desktop, Floating Bottom Dock on Mobile) */}
      <header className="evocuir-nav-header pointer-events-none">
        
        {/* Mobile Upward Drop-Up Drawer (Opens above the bottom dock) */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-4 bottom-[84px] z-50 pointer-events-auto">
            <div className="evocuir-glass-nav p-5 shadow-2xl border border-white/20 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.1] px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f24c27] animate-pulse" />
                  <span className="tracked-caps text-white font-bold">Quick Navigation</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const basePath = link.to.split('/')[1];
                  const active = location.pathname.startsWith(`/${basePath}`);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition ${
                        active
                          ? 'bg-white text-black font-bold shadow-lg'
                          : 'text-[#d4d4e2] hover:text-white bg-white/[0.03] border border-white/[0.06]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={triggerSurpriseMe}
                    className="flex-1 py-3 px-4 rounded-full evocuir-glass-pill text-xs font-bold text-white flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-[#f24c27]" />
                    <span>Surprise Me</span>
                  </button>
                  <Link
                    to="/discover"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 btn-evo-accent !text-xs !py-3 !px-4 text-center justify-center"
                  >
                    <span>New Search</span>
                  </Link>
                </div>

                {!isGuest && user ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <div className="w-6 h-6 rounded-full bg-[#f24c27]/20 border border-[#f24c27]/40 text-[#f24c27] flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="text-xs text-rose-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-2xl evocuir-glass-pill text-xs font-bold text-center text-white flex items-center justify-center gap-2 border border-white/10"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#f24c27]" />
                    <span>Sign In / Switch Profile</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Desktop & Mobile Main Glass Pill */}
        <nav className="evocuir-glass-nav pointer-events-auto flex items-center justify-between gap-2.5 flex-nowrap">
          
          {/* Desktop Left: Brand Identity */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f24c27] to-[#ff7a59] p-0.5 shadow-md shadow-[#f24c27]/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#08080c] rounded-full flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#f24c27] animate-pulse" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-white uppercase font-mono">
                  CINEMIND
                </span>
                <span className="text-xs font-black text-[#f24c27] tracking-wider uppercase">
                  AI
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08] shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const basePath = link.to.split('/')[1];
              const active = location.pathname.startsWith(`/${basePath}`);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-white text-black shadow-md font-bold'
                      : 'text-[#d4d4e2] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-black' : 'text-[#a0a0ab]'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Right: Quick Action Controls & User Identity */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button 
              onClick={triggerSurpriseMe}
              title="Fast Mood Matching"
              className="evocuir-glass-pill px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-white hover:border-[#f24c27] transition whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#f24c27]" />
              <span className="hidden xl:inline">Surprise Me</span>
            </button>

            {/* User Auth Status Pill */}
            {!isGuest && user ? (
              <div className="flex items-center gap-2 evocuir-glass-pill px-3 py-1.5 border border-white/10 shadow-sm shrink-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f24c27] to-[#ff7a59] text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold text-white capitalize max-w-[85px] truncate">
                  {user.name}
                </span>
                <button 
                  onClick={logout}
                  title="Sign Out"
                  className="text-white/40 hover:text-rose-400 transition ml-0.5 p-0.5 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="evocuir-glass-pill px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-bold text-white hover:border-[#f24c27] transition whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-[#f24c27]" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Bottom Dock View (Full width flex inside floating pill) */}
          <div className="md:hidden flex items-center justify-around w-full h-full px-1">
            {mobileDockLinks.map((link) => {
              const Icon = link.icon;
              const basePath = link.to.split('/')[1];
              const active = location.pathname.startsWith(`/${basePath}`);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                    active
                      ? 'text-[#f24c27] font-bold scale-105'
                      : 'text-[#a0a0ab] hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-[#f24c27]' : 'text-[#a0a0ab]'}`} />
                  <span className="text-[11px] mt-0.5">{link.label}</span>
                </Link>
              );
            })}

            {/* Mobile Menu / More Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                mobileMenuOpen ? 'text-white' : 'text-[#a0a0ab]'
              }`}
              aria-label="More Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
              <span className="text-[11px] mt-0.5">More</span>
            </button>
          </div>

        </nav>
      </header>
    </>
  );
};
