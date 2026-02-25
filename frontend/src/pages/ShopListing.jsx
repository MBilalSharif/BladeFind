import { useState } from "react";
import Navbar from "../components/Navbar";
import ShopCard from "../components/ShopCard";
import SearchBar from "../components/SearchBar";
import useBarberShops from "../hooks/useBarberShops";

const FILTERS = ["All", "Top Rated", "Open Now", "$", "$$", "$$$"];

// Map price level int to $ string for filtering
const priceLevelToStr = (level) => {
  if (level == null) return "$$";
  return "$".repeat(Math.max(1, Math.min(level, 3)));
};

const ShopListing = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [radius, setRadius] = useState(5000);
  const { shops, loading, error, searchByCoords, searchByText } = useBarberShops();

  const filteredShops = shops.filter((shop) => {
    if (activeFilter === "Top Rated") return shop.rating >= 4.5;
    if (activeFilter === "Open Now") return shop.isOpen === true;
    if (["$", "$$", "$$$"].includes(activeFilter)) return priceLevelToStr(shop.priceLevel) === activeFilter;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-4xl font-bold text-foreground">Barber Shops</h1>
          <p className="text-muted-foreground mt-2">
            {filteredShops.length > 0
              ? `${filteredShops.length} shop${filteredShops.length !== 1 ? "s" : ""} found near you`
              : "Search a location to find nearby barber shops"}
          </p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4 mb-10 animate-fade-up-delay-1">
          <SearchBar
            onTextSearch={searchByText}
            onGeoSearch={searchByCoords}
            loading={loading}
            radius={radius}
            onRadiusChange={setRadius}
            variant="compact"
          />

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeFilter === f
                    ? "bg-primary/15 text-primary neon-glow-sm border border-primary/30"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="glass rounded-2xl p-6 text-center border border-red-500/20 mb-8">
            <p className="text-red-400">⚠ {error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <div className="h-48 shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-5 shimmer rounded-lg w-3/4" />
                  <div className="h-4 shimmer rounded-lg w-1/2" />
                  <div className="h-4 shimmer rounded-lg w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shop grid */}
        {!loading && filteredShops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop, i) => (
              <ShopCard key={shop.placeId} shop={shop} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && shops.length === 0 && !error && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">✂️</p>
            <p className="font-display text-xl font-semibold text-foreground mb-2">No shops yet</p>
            <p className="text-muted-foreground">Search a location above to discover barber shops</p>
          </div>
        )}

        {!loading && shops.length > 0 && filteredShops.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No shops match your filters</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ShopListing;
