import { useState } from "react";
import { Star, MapPin, Navigation, X, Locate, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import MapViewComponent from "../components/MapView";
import useBarberShops from "../hooks/useBarberShops";
import { getPhotoUrl } from "../api/shopsApi";

/**
 * MapView page — matches the Lovable MapView.tsx design exactly.
 * Left sidebar with shop list + full-height Google Map on the right.
 * Selected shop shows a detail panel at bottom-right (matching design).
 */
const MapViewPage = () => {
  const [selectedShop, setSelectedShop] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [query, setQuery] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { shops, loading, error, searchCenter, searchByCoords, searchByText } = useBarberShops();

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (query.trim()) searchByText(query.trim(), radius);
  };

  const handleGeoSearch = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        searchByCoords(coords.latitude, coords.longitude, radius);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location denied. Enter a location manually."
            : "Could not get location."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16 h-screen flex">

        {/* ── Left Sidebar ────────────────────────────────────────────────────── */}
        <aside
          className={`flex flex-col glass-strong border-r border-border transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "w-80 shrink-0" : "w-0"
          }`}
        >
          {/* Search input area */}
          <div className="p-4 border-b border-border space-y-3">
            <form onSubmit={handleTextSearch} className="flex gap-2">
              <div className="flex-1 glass rounded-lg flex items-center gap-2 px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-all"
              >
                Go
              </button>
            </form>

            {/* Geo button */}
            <button
              onClick={handleGeoSearch}
              disabled={geoLoading || loading}
              className="w-full flex items-center justify-center gap-2 glass border border-primary/20 text-primary rounded-lg py-2 text-sm font-medium hover:neon-glow-sm transition-all disabled:opacity-50"
            >
              {geoLoading ? (
                <><span className="animate-spin">⟳</span> Locating...</>
              ) : (
                <><Locate className="w-4 h-4" /> Use My Location</>
              )}
            </button>

            {/* Radius chips */}
            <div className="flex gap-1.5">
              {[1000, 2000, 5000, 10000, 20000].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all ${
                    radius === r
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r / 1000}km
                </button>
              ))}
            </div>

            {geoError && <p className="text-xs text-red-400">{geoError}</p>}
          </div>

          {/* Shop list */}
          <div className="flex-1 overflow-y-auto sidebar-scroll">
            {loading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-xl p-3 animate-pulse space-y-2">
                    <div className="h-4 bg-secondary/60 rounded w-3/4" />
                    <div className="h-3 bg-secondary/60 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="p-4">
                <p className="text-xs text-red-400 glass rounded-xl px-3 py-2 border border-red-500/20">{error}</p>
              </div>
            )}

            {!loading && shops.length === 0 && !error && (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-3xl mb-2">✂️</p>
                <p className="text-sm">Search a location to find shops</p>
              </div>
            )}

            {!loading && shops.length > 0 && (
              <div className="p-3 space-y-2">
                <p className="text-xs text-muted-foreground px-1 mb-1">{shops.length} shops found</p>
                {shops.map((shop) => (
                  <button
                    key={shop.placeId}
                    onClick={() => setSelectedShop(selectedShop?.placeId === shop.placeId ? null : shop)}
                    className={`w-full text-left glass rounded-xl p-3 transition-all duration-200 hover:border-primary/30 ${
                      selectedShop?.placeId === shop.placeId
                        ? "border-primary/40 neon-glow-sm bg-primary/5"
                        : ""
                    }`}
                  >
                    <p className={`font-display font-semibold text-sm leading-tight mb-1 ${
                      selectedShop?.placeId === shop.placeId ? "text-primary" : "text-foreground"
                    }`}>
                      {shop.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {shop.rating && (
                        <span className="text-xs flex items-center gap-1">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          <span className="text-foreground">{shop.rating}</span>
                        </span>
                      )}
                      <span className={`text-xs flex items-center gap-0.5 ${
                        shop.isOpen ? "text-primary" : "text-muted-foreground"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? "bg-primary pulse-neon" : "bg-muted-foreground"} inline-block mr-1`} />
                        {shop.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                    {shop.address && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{shop.address}</span>
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── Map Area ─────────────────────────────────────────────────────────── */}
        <div className="relative flex-1">
          {/* Sidebar toggle button */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="absolute top-3 left-3 z-20 glass neon-glow-sm rounded-full w-9 h-9 flex items-center justify-center text-primary hover:bg-primary/10 transition-all"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <MapViewComponent
            shops={shops}
            selectedShop={selectedShop}
            onShopSelect={setSelectedShop}
            searchCenter={searchCenter}
          />

          {/* ── Selected shop detail panel (bottom-right, matching Lovable) ── */}
          {selectedShop && (
            <div className="absolute bottom-6 right-6 w-96 z-30 animate-fade-up">
              <div className="glass-strong rounded-2xl overflow-hidden neon-glow-sm">
                {/* Photo */}
                {selectedShop.photoReference ? (
                  <div className="relative h-32">
                    <img
                      src={getPhotoUrl(selectedShop.photoReference, 400)}
                      alt={selectedShop.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <button
                      onClick={() => setSelectedShop(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative h-16 bg-gradient-to-br from-primary/10 to-background flex items-center justify-center">
                    <button
                      onClick={() => setSelectedShop(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="text-2xl opacity-30">✂️</span>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground leading-tight">
                        {selectedShop.name}
                      </h3>
                      {selectedShop.address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedShop.address}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 ${
                      selectedShop.isOpen ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                      {selectedShop.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {selectedShop.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-medium text-foreground">{selectedShop.rating}</span>
                        {selectedShop.userRatingsTotal > 0 && (
                          <span className="text-muted-foreground">({selectedShop.userRatingsTotal})</span>
                        )}
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${selectedShop.placeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-90 neon-glow flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MapViewPage;
