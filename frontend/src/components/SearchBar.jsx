import { useState } from "react";
import { Search, Locate } from "lucide-react";

/**
 * SearchBar — floating glass search input matching the Lovable Index hero design.
 * Supports text search and geolocation.
 */
const SearchBar = ({ onTextSearch, onGeoSearch, loading, radius, onRadiusChange, variant = "hero" }) => {
  const [query, setQuery] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (query.trim()) onTextSearch(query.trim(), radius);
  };

  const handleGeoSearch = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onGeoSearch(coords.latitude, coords.longitude, radius);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Please enter a location manually.");
        } else {
          setGeoError("Unable to retrieve your location. Try again.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (variant === "compact") {
    // Compact version for the Shops page header
    return (
      <div className="space-y-3">
        <form onSubmit={handleTextSearch} className="glass neon-glow-sm rounded-xl p-1.5 flex items-center gap-2 max-w-md">
          <div className="flex items-center gap-2 flex-1 px-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search by location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm py-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleGeoSearch}
            disabled={geoLoading || loading}
            title="Use my location"
            className="glass border border-primary/30 text-primary px-3 py-2 rounded-lg text-sm transition-all hover:neon-glow-sm disabled:opacity-50"
          >
            {geoLoading ? (
              <span className="animate-spin inline-block">⟳</span>
            ) : (
              <Locate className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Radius picker */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground text-xs">Radius:</span>
          {[1000, 2000, 5000, 10000].map((r) => (
            <button
              key={r}
              onClick={() => onRadiusChange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                radius === r
                  ? "bg-primary/15 text-primary neon-glow-sm border border-primary/30"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {r / 1000}km
            </button>
          ))}
        </div>

        {geoError && (
          <p className="text-xs text-red-400 glass px-3 py-2 rounded-lg border border-red-500/20">
            ⚠️ {geoError}
          </p>
        )}
      </div>
    );
  }

  // Hero variant — large glass pill matching Index page
  return (
    <div className="space-y-4">
      <form
        onSubmit={handleTextSearch}
        className="glass neon-glow-sm rounded-2xl p-2 flex items-center gap-2 max-w-xl mx-auto"
      >
        <div className="flex items-center gap-2 flex-1 px-4">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by name, location, or style..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm py-3"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90 neon-glow shrink-0 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {geoError && (
        <p className="text-center text-xs text-red-400">{geoError}</p>
      )}
    </div>
  );
};

export default SearchBar;
