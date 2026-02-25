import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Locate, Compass, Scissors, ChevronDown, Map } from "lucide-react";
import Navbar from "../components/Navbar";
import ShopCard from "../components/ShopCard";
import useBarberShops from "../hooks/useBarberShops";

/* ─────────────────────────────────────────────────────────────────────────────
   SCISSORS INTRO
   Shown once per session (sessionStorage flag). Two dark curtain halves cover
   the page. A scissors SVG slides in from the left, the neon cut-line expands,
   then both curtains fly apart revealing the hero. Total duration: ~1.4s.
───────────────────────────────────────────────────────────────────────────── */
const INTRO_KEY = "bf_intro_shown";

const ScissorsIntro = ({ onDone }) => {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Small tick so the DOM is painted before we add .playing
    const t1 = setTimeout(() => setPlaying(true), 60);
    // Remove overlay after all animations finish (curtains open at 0.88s, last 0.5s → 1.38s)
    const t2 = setTimeout(() => onDone(), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`intro-overlay ${playing ? "playing" : ""}`}>
      {/* Dark curtain — top half */}
      <div className="intro-curtain-top" />

      {/* Dark curtain — bottom half */}
      <div className="intro-curtain-bottom" />

      {/* Neon glowing cut line at vertical center */}
      <div className="intro-cut-line" />

      {/* Scissors icon sliding in */}
      <div className="intro-scissors-wrap">
        {/* SVG scissors oriented horizontally pointing right */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          {/* Top blade */}
          <g transform="rotate(-20, 36, 36)">
            <ellipse cx="16" cy="14" rx="10" ry="10" stroke="hsl(180,80%,55%)" strokeWidth="2.5" fill="hsla(180,80%,55%,0.12)" />
            <circle cx="16" cy="14" r="4" fill="hsl(180,80%,55%)" opacity="0.5" />
            <line x1="24" y1="18" x2="66" y2="34" stroke="hsl(180,80%,55%)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Bottom blade */}
          <g transform="rotate(20, 36, 36)">
            <ellipse cx="16" cy="58" rx="10" ry="10" stroke="hsl(180,80%,55%)" strokeWidth="2.5" fill="hsla(180,80%,55%,0.12)" />
            <circle cx="16" cy="58" r="4" fill="hsl(180,80%,55%)" opacity="0.5" />
            <line x1="24" y1="54" x2="66" y2="38" stroke="hsl(180,80%,55%)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Pivot dot */}
          <circle cx="36" cy="36" r="3" fill="hsl(180,80%,55%)" />
        </svg>
      </div>
    </div>
  );
};

/* ─── Particle field ─────────────────────────────────────────────────────────── */
const ParticleField = () => {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${(i * 3.7 + 5) % 100}%`,
    size: (i % 3) + 1,
    duration: 8 + (i % 12),
    delay: (i * 0.4) % 10,
    drift: ((i % 7) - 3) * 40,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
};

/* ─── Orbit rings ────────────────────────────────────────────────────────────── */
const OrbitRings = () => (
  <div className="absolute left-1/2 top-1/2 pointer-events-none select-none">
    <div className="orbit-ring orbit-ring-1" style={{ width: 480, height: 480, marginLeft: -240, marginTop: -240 }} />
    <div className="orbit-ring orbit-ring-2" style={{ width: 680, height: 680, marginLeft: -340, marginTop: -340 }} />
    <div className="orbit-ring orbit-ring-3" style={{ width: 900, height: 900, marginLeft: -450, marginTop: -450 }} />
  </div>
);

/* ─── Floating scissors hero icon ───────────────────────────────────────────── */
const FloatingScissors = () => (
  <div className="scissors-float inline-flex mb-8">
    <div className="w-20 h-20 rounded-2xl glass neon-glow-sm flex items-center justify-center">
      <Scissors className="w-10 h-10 text-primary" strokeWidth={1.5} />
    </div>
  </div>
);

/* ─── Location permission modal ──────────────────────────────────────────────── */
const LocationPermissionModal = ({ onAllow, onDeny, loading }) => (
  <div className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4"
    style={{ background: "hsla(220,20%,4%,0.85)", backdropFilter: "blur(8px)" }}>
    <div className="modal-card glass-strong rounded-3xl p-8 max-w-sm w-full text-center neon-glow-sm">
      <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-2 rounded-full bg-primary/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.4s" }} />
        <div className="relative w-16 h-16 rounded-full glass neon-glow flex items-center justify-center">
          <MapPin className="w-7 h-7 text-primary" />
        </div>
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">Find Nearby Barbers</h2>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        BladeFind needs your location to show barber shops near you. We never store your location.
      </p>
      <div className="space-y-3">
        <button onClick={onAllow} disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm neon-glow hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
          {loading
            ? <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Locating...</>
            : <><Locate className="w-4 h-4" /> Allow Location Access</>}
        </button>
        <button onClick={onDeny} className="w-full glass py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all">
          Search Manually Instead
        </button>
      </div>
    </div>
  </div>
);

/* ─── Skeleton card ──────────────────────────────────────────────────────────── */
const SkeletonCard = ({ delay = 0 }) => (
  <div className="glass rounded-2xl overflow-hidden" style={{ animationDelay: `${delay}s` }}>
    <div className="h-48 shimmer" />
    <div className="p-4 space-y-3">
      <div className="h-5 shimmer rounded-lg w-3/4" />
      <div className="h-4 shimmer rounded-lg w-1/2" />
      <div className="h-4 shimmer rounded-lg w-full" />
      <div className="flex gap-2">
        <div className="h-6 shimmer rounded-full w-16" />
        <div className="h-6 shimmer rounded-full w-20" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
const Index = () => {
  const navigate = useNavigate();
  const [radius] = useState(5000);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem(INTRO_KEY));
  const resultsRef = useRef(null);

  const { shops, loading, error, searchByCoords, searchByText } = useBarberShops();

  /* Mark intro as shown and hide overlay */
  const handleIntroDone = useCallback(() => {
    sessionStorage.setItem(INTRO_KEY, "1");
    setShowIntro(false);
  }, []);

  /* Auto-request location after intro finishes */
  useEffect(() => {
    if (showIntro) return; // wait for intro
    if (!navigator.geolocation) return;

    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        doGeolocate();
      } else if (result.state === "prompt") {
        const t = setTimeout(() => setShowModal(true), 600);
        return () => clearTimeout(t);
      }
    }).catch(() => {
      const t = setTimeout(() => setShowModal(true), 600);
      return () => clearTimeout(t);
    });
  }, [showIntro]); // eslint-disable-line

  const doGeolocate = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationGranted(true);
        setModalLoading(false);
        setShowModal(false);
        searchByCoords(coords.latitude, coords.longitude, radius);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 800);
      },
      (err) => {
        setModalLoading(false);
        setShowModal(false);
        setGeoError(err.code === err.PERMISSION_DENIED
          ? "Location access denied. Search a city or address below."
          : "Couldn't get your location. Search manually.");
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  }, [radius, searchByCoords]);

  const handleModalAllow = () => { setModalLoading(true); doGeolocate(); };
  const handleModalDeny  = () => { setShowModal(false); };

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    searchByText(searchQuery.trim(), radius);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  };

  const featuredShops = shops.slice(0, 6);
  const hasResults = featuredShops.length > 0;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Scissors intro (only on first visit per session) ─────────────── */}
      {showIntro && <ScissorsIntro onDone={handleIntroDone} />}

      <Navbar />

      {/* ── Location permission modal ─────────────────────────────────────── */}
      {showModal && (
        <LocationPermissionModal
          onAllow={handleModalAllow}
          onDeny={handleModalDeny}
          loading={modalLoading}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">

        <div className="absolute inset-0 grid-bg opacity-25" />
        <div className="absolute inset-0 scanline" />
        <OrbitRings />
        <ParticleField />

        {/* Glow blobs */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full bg-primary/4 blur-[120px]" />
        </div>
        <div className="absolute left-1/4 top-1/3 pointer-events-none">
          <div className="w-[300px] h-[300px] rounded-full bg-accent/3 blur-[80px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <div className="animate-fade-up flex justify-center">
            <FloatingScissors />
          </div>

          <div className="animate-fade-up-delay-1">
            <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight mb-4 leading-[1.05]">
              Find Your
              <span className="block text-primary neon-text mt-1">Perfect Cut</span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl mb-8 max-w-lg mx-auto leading-relaxed">
              Discover top-rated barber shops near you with real-time availability
            </p>
          </div>

          {locationGranted && !loading && (
            <div className="animate-fade-up mb-6 inline-flex items-center gap-2 glass neon-glow-sm px-4 py-2 rounded-full text-sm text-primary">
              <MapPin className="w-4 h-4" />
              Showing barber shops near your location
            </div>
          )}
          {geoError && (
            <div className="animate-fade-up mb-4 inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-amber-400 border border-amber-500/20">
              ⚠ {geoError}
            </div>
          )}

          <div className="animate-fade-up-delay-2">
            <form onSubmit={handleTextSearch}
              className="search-glow-focus glass rounded-2xl p-2 flex items-center gap-2 max-w-xl mx-auto transition-all duration-300">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search city, area or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm py-3"
                />
              </div>
              <button type="submit" disabled={loading || !searchQuery.trim()}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 neon-glow transition-all shrink-0 disabled:opacity-50">
                {loading
                  ? <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />Searching</div>
                  : "Search"}
              </button>
            </form>
          </div>

          <div className="animate-fade-up-delay-3 flex items-center justify-center gap-4 mt-6 flex-wrap">
            <button onClick={handleModalAllow} disabled={loading}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
              <Locate className="w-4 h-4 group-hover:text-primary transition-colors" />
              Use My Location
            </button>
            <span className="text-border">|</span>
            <button onClick={() => navigate("/map")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
              <Map className="w-4 h-4 group-hover:text-primary transition-colors" />
              Open Map View
            </button>
          </div>
        </div>

        {(loading || hasResults) && (
          <button onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up-delay-3 group">
            <span className="text-xs text-muted-foreground tracking-widest uppercase">
              {loading ? "Loading..." : `${shops.length} shops found`}
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
            <ChevronDown className="w-4 h-4 text-primary/60 animate-bounce" />
          </button>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          RESULTS
      ════════════════════════════════════════════════════════════════════ */}
      {(loading || hasResults || error) && (
        <section ref={resultsRef} className="relative container mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-primary neon-glow rounded-full" />
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                  {locationGranted ? "Nearby Barbers" : "Search Results"}
                </h2>
              </div>
              <p className="text-muted-foreground ml-4">
                {loading ? "Finding barber shops near you..." : `${shops.length} shop${shops.length !== 1 ? "s" : ""} found`}
              </p>
            </div>
            {shops.length > 6 && (
              <button onClick={() => navigate("/shops")}
                className="text-sm text-primary hover:underline underline-offset-4 transition-all flex items-center gap-1">
                View all {shops.length} shops →
              </button>
            )}
          </div>

          {error && !loading && (
            <div className="glass rounded-2xl p-6 text-center border border-red-500/20 mb-8">
              <p className="text-red-400 text-sm">⚠ {error}</p>
              <p className="text-muted-foreground text-xs mt-1">Check your API key or try a different search</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} delay={i * 0.08} />)
              : featuredShops.map((shop, i) => <ShopCard key={shop.placeId} shop={shop} index={i} />)}
          </div>

          {!loading && hasResults && (
            <div className="mt-16 text-center">
              <div className="glass-strong rounded-2xl p-8 inline-flex flex-col items-center gap-4 neon-glow-sm">
                <Compass className="w-8 h-8 text-primary" />
                <p className="font-display text-lg font-semibold text-foreground">Want the full picture?</p>
                <p className="text-muted-foreground text-sm">Browse all shops, filter by rating, price, and availability</p>
                <div className="flex gap-3 flex-wrap justify-center">
                  <button onClick={() => navigate("/shops")}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 neon-glow transition-all">
                    Browse All Shops
                  </button>
                  <button onClick={() => navigate("/map")}
                    className="glass border border-primary/30 text-primary px-6 py-2.5 rounded-xl font-semibold text-sm hover:neon-glow-sm transition-all">
                    Open Map View
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Index;
