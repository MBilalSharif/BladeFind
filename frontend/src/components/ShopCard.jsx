import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Scissors, ArrowRight } from "lucide-react";
import { getPhotoUrl } from "../api/shopsApi";

const GRADIENTS = [
  "from-cyan-900/60 via-background to-teal-900/40",
  "from-indigo-900/60 via-background to-cyan-900/40",
  "from-slate-800/80 via-background to-cyan-900/30",
  "from-teal-900/60 via-background to-emerald-900/30",
  "from-blue-900/50 via-background to-cyan-900/40",
];

const ShopCard = ({ shop, index = 0, isSelected = false }) => {
  const navigate = useNavigate();
  const { name, address, rating, userRatingsTotal, isOpen, priceLevel, photoReference, specialties = [] } = shop;

  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const priceDisplay = priceLevel != null ? "$".repeat(Math.max(1, Math.min(priceLevel, 4))) : "$$";
  const photoUrl = photoReference && !imgFailed ? getPhotoUrl(photoReference, 600) : null;
  const gradientClass = GRADIENTS[(name?.charCodeAt(0) || 0) % GRADIENTS.length];

  const handleClick = () => {
    // Pass shop data via location state so detail page has it immediately
    navigate(`/shops/${shop.placeId}`, { state: { shop } });
  };

  return (
    <div
      onClick={handleClick}
      className={`
        card-3d card-enter glass rounded-2xl overflow-hidden group cursor-pointer
        transition-all duration-300 border border-transparent hover:border-primary/25
        ${isSelected ? "neon-glow !border-primary/40" : ""}
      `}
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "both" }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-secondary/30">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Scissors className="w-10 h-10 text-primary" strokeWidth={1.5} />
            <span className="text-xs text-primary font-display tracking-widest uppercase">Barber</span>
          </div>
        </div>

        {photoUrl && (
          <img
            src={photoUrl}
            alt={name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgFailed(true); setImgLoaded(false); }}
          />
        )}
        {photoUrl && !imgLoaded && !imgFailed && <div className="absolute inset-0 shimmer" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />

        {/* Hover overlay CTA */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="glass px-4 py-2 rounded-full text-sm font-semibold text-primary neon-glow-sm flex items-center gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            View Details <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium glass ${isOpen ? "text-primary" : "text-muted-foreground"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-primary pulse-neon" : "bg-muted-foreground"}`} />
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs font-medium text-accent glass px-2 py-1 rounded-full">{priceDisplay}</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 leading-tight line-clamp-1">
          {name}
        </h3>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          {rating != null && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="font-medium text-foreground">{Number(rating).toFixed(1)}</span>
              {userRatingsTotal > 0 && <span className="text-muted-foreground text-xs">({userRatingsTotal})</span>}
            </div>
          )}
          {address && (
            <div className="flex items-center gap-1 text-muted-foreground min-w-0 flex-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-xs">{address}</span>
            </div>
          )}
        </div>
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specialties.slice(0, 3).map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopCard;
