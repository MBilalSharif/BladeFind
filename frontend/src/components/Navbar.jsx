import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Compass, Scissors, LogOut, User, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ─── User avatar dropdown ───────────────────────────────────────────────────── */
const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl hover:border-primary/30 border border-transparent transition-all"
      >
        {/* Avatar */}
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
          {user.name?.split(" ")[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl overflow-hidden z-50 border border-primary/10 animate-fade-up">
          {/* Profile header */}
          <div className="px-4 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            <button
              onClick={() => { setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </button>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Navbar ────────────────────────────────────────────────────────────── */
const Navbar = () => {
  const location = useLocation();
  const { user, isLoggedIn, logout, setShowAuthModal } = useAuth();

  const links = [
    { to: "/",      label: "Home",  icon: Scissors },
    { to: "/shops", label: "Shops", icon: Search },
    { to: "/map",   label: "Map",   icon: Compass },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-sm">
            <Scissors className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            BLADE<span className="text-primary">FIND</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary/15 text-primary neon-glow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Auth section */}
        <div className="shrink-0">
          {isLoggedIn ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary/15 border border-primary/30 text-primary px-4 py-2 rounded-xl text-sm font-semibold hover:neon-glow-sm hover:bg-primary/20 transition-all"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
