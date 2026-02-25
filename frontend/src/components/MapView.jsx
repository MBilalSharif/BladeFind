import { useCallback, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { Star, MapPin, Navigation } from "lucide-react";
import { getPhotoUrl } from "../api/shopsApi";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 31.5204, lng: 74.3587 }; // Lahore default

// Dark futuristic map style matching the Lovable neon aesthetic
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4a6572" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2035" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f1520" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#3a7fa8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1e3a5f" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#0d2137" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#4fc3f7" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1628" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#1a3a5c" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0f1a24" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0a1a1a" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#111827" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1a2a3a" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#2a9d8f" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#6bdcdc" }] },
];

const MAP_OPTIONS = {
  styles: MAP_STYLES,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

const LIBRARIES = ["places"];

/**
 * MapView component — matches the Lovable MapView page design.
 * Renders a dark styled Google Map with floating neon markers.
 */
const MapView = ({ shops, selectedShop, onShopSelect, searchCenter }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Pan to selected shop
  useEffect(() => {
    if (mapRef.current && selectedShop?.location) {
      mapRef.current.panTo(selectedShop.location);
      mapRef.current.setZoom(16);
    }
  }, [selectedShop]);

  // Fit bounds when shops update
  useEffect(() => {
    if (mapRef.current && shops.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      shops.forEach((s) => {
        if (s.location?.lat && s.location?.lng) bounds.extend(s.location);
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [shops]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-background text-muted-foreground">
        <div className="text-center glass rounded-2xl p-8">
          <p className="text-primary text-2xl mb-2">⚠</p>
          <p>Failed to load Google Maps.</p>
          <p className="text-xs mt-1">Check your API key in .env</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={searchCenter || DEFAULT_CENTER}
      zoom={13}
      options={MAP_OPTIONS}
      onLoad={onMapLoad}
      onClick={() => onShopSelect(null)}
    >
      {shops.map((shop) => (
        <Marker
          key={shop.placeId}
          position={shop.location}
          title={shop.name}
          onClick={() => onShopSelect(shop)}
          icon={
            window.google
              ? {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: selectedShop?.placeId === shop.placeId ? "#6BECE8" : "#2dd4bf",
                  fillOpacity: 1,
                  strokeColor: selectedShop?.placeId === shop.placeId ? "#fff" : "#0d9488",
                  strokeWeight: 2,
                  scale: selectedShop?.placeId === shop.placeId ? 12 : 8,
                }
              : undefined
          }
        />
      ))}

      {/* InfoWindow — matching Lovable's selected shop panel style */}
      {selectedShop && (
        <InfoWindow
          position={selectedShop.location}
          onCloseClick={() => onShopSelect(null)}
          options={{ pixelOffset: window.google ? new window.google.maps.Size(0, -20) : undefined }}
        >
          <div style={{ background: "#0d1117", border: "1px solid rgba(109,236,232,0.2)", borderRadius: "12px", overflow: "hidden", width: "260px" }}>
            {selectedShop.photoReference && (
              <img
                src={getPhotoUrl(selectedShop.photoReference, 300)}
                alt={selectedShop.name}
                style={{ width: "100%", height: "96px", objectFit: "cover" }}
              />
            )}
            <div style={{ padding: "12px" }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: "#e2e8f0", margin: "0 0 4px", fontSize: "14px" }}>
                {selectedShop.name}
              </p>
              {selectedShop.rating && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                  <span style={{ color: "#fbbf24", fontSize: "12px" }}>★</span>
                  <span style={{ color: "#e2e8f0", fontSize: "12px" }}>{selectedShop.rating}</span>
                  <span style={{ color: "#64748b", fontSize: "11px" }}>({selectedShop.userRatingsTotal})</span>
                </div>
              )}
              {selectedShop.address && (
                <p style={{ color: "#64748b", fontSize: "11px", margin: "0 0 8px" }}>📍 {selectedShop.address}</p>
              )}
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${selectedShop.placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block", textAlign: "center",
                  background: "hsl(180, 80%, 55%)", color: "#0d1117",
                  padding: "6px 12px", borderRadius: "8px",
                  fontSize: "12px", fontWeight: 600, textDecoration: "none",
                }}
              >
                Get Directions →
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapView;
