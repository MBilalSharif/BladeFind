import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Phone, Globe, Clock, DollarSign,
  Scissors, ChevronLeft, ChevronRight, X, Send, Trash2,
  ExternalLink, MessageSquare, Plus, CheckCircle, AlertCircle, LogIn,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { fetchShopDetails, fetchReviews, submitReview, deleteReview, getPhotoUrl } from "../api/shopsApi";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HELPERS                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

const GRADIENTS = [
  "from-cyan-900/60 via-slate-900 to-teal-900/40",
  "from-indigo-900/60 via-slate-900 to-cyan-900/40",
  "from-slate-800/80 via-slate-900 to-cyan-900/30",
  "from-teal-900/60 via-slate-900 to-emerald-900/30",
  "from-blue-900/50 via-slate-900 to-cyan-900/40",
];
const fallbackGradient = (name) => GRADIENTS[(name?.charCodeAt(0) || 0) % GRADIENTS.length];

const priceLabel = (lvl) => (lvl != null ? "$".repeat(Math.max(1, Math.min(lvl, 4))) : null);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SUB-COMPONENTS                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

/** Renders 1–5 interactive or static star icons */
const StarRating = ({ value, max = 5, interactive = false, onChange }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }, (_, i) => {
      const filled = i < value;
      return (
        <button
          key={i}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onChange(i + 1) : undefined}
          className={interactive ? "cursor-pointer transition-transform hover:scale-125" : "cursor-default"}
        >
          <Star
            className={`w-5 h-5 transition-colors ${filled ? "text-accent fill-accent" : "text-muted-foreground"}`}
          />
        </button>
      );
    })}
  </div>
);

/** Avatar circle from initials */
const Avatar = ({ name, color, size = "md" }) => {
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-background shrink-0 select-none`}
      style={{ background: color || "#2dd4bf" }}
    >
      {initials}
    </div>
  );
};

/** Full-screen image lightbox */
const Lightbox = ({ photos, activeIndex, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  const photo = photos[activeIndex];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "hsla(220,20%,3%,0.96)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 glass rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 glass px-4 py-1.5 rounded-full text-sm text-muted-foreground z-10">
        {activeIndex + 1} / {photos.length}
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 glass rounded-full p-3 text-muted-foreground hover:text-primary hover:neon-glow-sm transition-all z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <div className="max-w-5xl max-h-[85vh] w-full px-20" onClick={(e) => e.stopPropagation()}>
        <img
          src={getPhotoUrl(photo.reference, 1600)}
          alt={`Photo ${activeIndex + 1}`}
          className="w-full h-full object-contain rounded-2xl"
          style={{ maxHeight: "85vh" }}
        />
      </div>

      {/* Next */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 glass rounded-full p-3 text-muted-foreground hover:text-primary hover:neon-glow-sm transition-all z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

/** Single photo thumbnail with lazy load + fallback */
const PhotoThumb = ({ reference, name, onClick, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const gradient = fallbackGradient(name);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden cursor-zoom-in group ${className}`}
    >
      {/* Fallback always rendered below */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <Scissors className="w-8 h-8 text-primary/30" strokeWidth={1.5} />
      </div>

      {!failed && (
        <>
          {!loaded && <div className="absolute inset-0 shimmer" />}
          <img
            src={getPhotoUrl(reference, 800)}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            onError={() => { setFailed(true); setLoaded(false); }}
          />
        </>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
    </div>
  );
};

/** A single review card */
const ReviewCard = ({ review, onDelete, canDelete }) => {
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-3 animate-fade-up border border-transparent hover:border-primary/10 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={review.authorName} color={review.avatarColor} />
          <div>
            <p className="font-semibold text-foreground text-sm">{review.authorName}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StarRating value={review.rating} />
          {canDelete && (
            <button
              onClick={() => onDelete(review._id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
    </div>
  );
};

/** Google review card (read-only, from Places API) */
const GoogleReviewCard = ({ review }) => (
  <div className="glass rounded-2xl p-5 space-y-3 border border-transparent hover:border-primary/10 transition-colors">
    <div className="flex items-start gap-3">
      {review.profilePhoto ? (
        <img src={review.profilePhoto} alt={review.authorName} className="w-10 h-10 rounded-full object-cover shrink-0" />
      ) : (
        <Avatar name={review.authorName} color="#06b6d4" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-semibold text-foreground text-sm">{review.authorName}</p>
          <span className="text-xs text-muted-foreground shrink-0">{review.relativeTime}</span>
        </div>
        <StarRating value={review.rating} />
      </div>
    </div>
    {review.text && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{review.text}</p>}
  </div>
);

/** Add review form */
const ReviewForm = ({ placeId, shopName, onSuccess, currentUser, onSignInRequest }) => {
  const [name, setName] = useState(currentUser?.name || "");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (!comment.trim() || comment.trim().length < 10) { setError("Comment must be at least 10 characters."); return; }

    setLoading(true);
    try {
      await submitReview(placeId, { authorName: name.trim(), rating, comment: comment.trim(), shopName });
      setDone(true);
      onSuccess();
      setTimeout(() => setDone(false), 3000);
      setName(""); setRating(0); setComment("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 space-y-5 border border-primary/10">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center neon-glow-sm">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-foreground">Write a Review</h3>
        </div>
        {!currentUser && (
          <button type="button" onClick={onSignInRequest}
            className="text-xs text-primary flex items-center gap-1 hover:underline">
            <LogIn className="w-3.5 h-3.5" /> Sign in to link review to your account
          </button>
        )}
      </div>

      {/* Logged-in user banner */}
      {currentUser && (
        <div className="flex items-center gap-3 glass rounded-xl px-4 py-3">
          {currentUser.avatar
            ? <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            : <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{currentUser.name?.[0]}</div>
          }
          <div>
            <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">Posting as yourself</p>
          </div>
        </div>
      )}

      {/* Name — hidden when logged in since we use their real name */}
      {!currentUser && (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ahmed Khan"
          maxLength={60}
          className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>
      )}

      {/* Star rating */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</label>
        <div className="flex items-center gap-3">
          <StarRating value={rating} interactive onChange={setRating} />
          <span className="text-sm text-muted-foreground">
            {rating === 0 ? "Tap to rate" : ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </span>
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience — the cut, the vibe, the service..."
          rows={4}
          maxLength={800}
          className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
        />
        <div className="text-right text-xs text-muted-foreground">{comment.length}/800</div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Review submitted! Thank you.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm neon-glow hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Submitting...</>
        ) : (
          <><Send className="w-4 h-4" /> Post Review</>
        )}
      </button>
    </form>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
const ShopDetail = () => {
  const { placeId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, isLoggedIn, setShowAuthModal } = useAuth();

  // Quick data from card navigation (shown immediately while full details load)
  const cardShop = state?.shop || null;

  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [activeTab, setActiveTab] = useState("overview"); // overview | reviews
  const [showForm, setShowForm] = useState(false);

  // Which review IDs the current session "owns" (for delete affordance)
  const [myReviewIds, setMyReviewIds] = useState([]);

  /* Load details */
  useEffect(() => {
    if (!placeId) return;
    setDetailsLoading(true);
    fetchShopDetails(placeId)
      .then((res) => setDetails(res.data))
      .catch((err) => setDetailsError(err.response?.data?.message || "Could not load shop details."))
      .finally(() => setDetailsLoading(false));
  }, [placeId]);

  /* Load our reviews */
  const loadReviews = useCallback(() => {
    setReviewsLoading(true);
    fetchReviews(placeId)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [placeId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  /* Handle new review submitted */
  const handleReviewSuccess = () => {
    loadReviews();
    setShowForm(false);
    setActiveTab("reviews");
  };

  /* Handle delete */
  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch {
      alert("Could not delete review.");
    }
  };

  /* After submitting, mark new review as "mine" */
  const handleReviewSubmitted = () => {
    handleReviewSuccess();
    // Reload so we get the new _id, then mark the most recent as mine
    setTimeout(() => {
      fetchReviews(placeId).then((res) => {
        if (res.data.length > 0) {
          setMyReviewIds((prev) => [...prev, res.data[0]._id]);
        }
        setReviews(res.data);
      });
    }, 500);
  };

  /* Lightbox helpers */
  const photos = details?.photos || [];
  const closeLightbox = () => setLightbox({ open: false, index: 0 });
  const prevPhoto = () => setLightbox((l) => ({ ...l, index: (l.index - 1 + photos.length) % photos.length }));
  const nextPhoto = () => setLightbox((l) => ({ ...l, index: (l.index + 1) % photos.length }));

  /* Merge: use details if loaded, fallback to card data */
  const shop = details || cardShop;
  const name = shop?.name || "Barber Shop";
  const isOpen = shop?.isOpen;
  const rating = shop?.rating;
  const priceDisplay = priceLabel(shop?.priceLevel);
  const allPhotos = photos;

  /* ─── SKELETON ────────────────────────────────────────────────────────── */
  if (detailsLoading && !cardShop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
          <div className="h-8 shimmer rounded-xl w-32 mb-8" />
          <div className="h-72 shimmer rounded-3xl mb-6" />
          <div className="h-10 shimmer rounded-xl w-2/3 mb-4" />
          <div className="h-5 shimmer rounded-xl w-1/2 mb-8" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i=><div key={i} className="h-32 shimmer rounded-2xl"/>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Lightbox */}
      {lightbox.open && allPhotos.length > 0 && (
        <Lightbox
          photos={allPhotos}
          activeIndex={lightbox.index}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}

      <main className="container mx-auto px-4 pt-24 pb-20 max-w-5xl">

        {/* ── Back button ──────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  PHOTO GALLERY                                                   */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="mb-8 animate-fade-up">
          {allPhotos.length === 0 ? (
            /* No photos — show one big fallback hero */
            <div className={`h-72 rounded-3xl bg-gradient-to-br ${fallbackGradient(name)} flex items-center justify-center`}>
              <div className="text-center opacity-40">
                <Scissors className="w-14 h-14 text-primary mx-auto mb-2" strokeWidth={1} />
                <p className="text-primary font-display text-sm tracking-widest uppercase">No Photos</p>
              </div>
            </div>
          ) : allPhotos.length === 1 ? (
            <PhotoThumb
              reference={allPhotos[0].reference}
              name={name}
              onClick={() => setLightbox({ open: true, index: 0 })}
              className="h-72 rounded-3xl"
            />
          ) : (
            /* Grid gallery: big hero + side thumbnails */
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-72 rounded-3xl overflow-hidden">
              {/* Hero — spans 2 rows, 2 cols */}
              <PhotoThumb
                reference={allPhotos[0].reference}
                name={name}
                onClick={() => setLightbox({ open: true, index: 0 })}
                className="col-span-2 row-span-2"
              />
              {/* Side thumbnails — up to 4 */}
              {allPhotos.slice(1, 5).map((photo, i) => (
                <div key={photo.reference} className="relative">
                  <PhotoThumb
                    reference={photo.reference}
                    name={name}
                    onClick={() => setLightbox({ open: true, index: i + 1 })}
                    className="h-full w-full"
                  />
                  {/* "See all" overlay on last visible thumb */}
                  {i === 3 && allPhotos.length > 5 && (
                    <button
                      onClick={() => setLightbox({ open: true, index: 4 })}
                      className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-sm"
                    >
                      <span className="text-sm font-semibold text-foreground">+{allPhotos.length - 5} more</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  HEADER INFO                                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 animate-fade-up-delay-1">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              {isOpen != null && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold glass ${isOpen ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-primary pulse-neon" : "bg-muted-foreground"}`} />
                  {isOpen ? "Open Now" : "Closed"}
                </span>
              )}
              {priceDisplay && (
                <span className="text-xs font-medium text-accent glass px-3 py-1 rounded-full">{priceDisplay}</span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">{name}</h1>

            {shop?.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-sm">{shop.address}</span>
              </div>
            )}

            {/* Rating row */}
            {rating != null && (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(rating)} />
                  <span className="font-bold text-foreground text-lg">{Number(rating).toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {shop?.userRatingsTotal > 0 && `${shop.userRatingsTotal} Google reviews`}
                  {reviews.length > 0 && ` · ${reviews.length} user review${reviews.length !== 1 ? "s" : ""}`}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 shrink-0 sm:items-end">
            {shop?.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="inline-flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:text-primary hover:border-primary/30 transition-all border border-transparent"
              >
                <Phone className="w-4 h-4" />
                {shop.phone}
              </a>
            )}
            {shop?.website && (
              <a
                href={shop.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-all border border-transparent"
              >
                <Globe className="w-4 h-4" />
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {shop?.googleMapsUrl && (
              <a
                href={shop.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-2.5 rounded-xl text-sm font-medium hover:neon-glow-sm transition-all"
              >
                <MapPin className="w-4 h-4" />
                View on Google Maps
              </a>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  TABS                                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="flex gap-1 glass rounded-2xl p-1 mb-8 w-fit animate-fade-up-delay-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "reviews", label: `Reviews ${reviews.length > 0 ? `(${reviews.length})` : ""}` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground neon-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  OVERVIEW TAB                                                    */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-up">

            {/* Description */}
            {(shop?.description || detailsLoading) && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-primary" />
                  About
                </h2>
                {detailsLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 shimmer rounded w-full" />
                    <div className="h-4 shimmer rounded w-5/6" />
                    <div className="h-4 shimmer rounded w-4/6" />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm leading-relaxed">{shop.description}</p>
                )}
              </div>
            )}

            {/* Opening Hours */}
            {(shop?.openingHours?.length > 0 || detailsLoading) && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Opening Hours
                </h2>
                {detailsLoading ? (
                  <div className="space-y-2">
                    {[...Array(7)].map((_, i) => <div key={i} className="h-4 shimmer rounded w-3/4" />)}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {shop.openingHours.map((line, i) => {
                      const [day, ...rest] = line.split(": ");
                      const isClosed = rest.join("").toLowerCase().includes("closed");
                      return (
                        <li key={i} className="flex items-center justify-between text-sm gap-4">
                          <span className="text-foreground font-medium w-24 shrink-0">{day}</span>
                          <span className={`text-right ${isClosed ? "text-red-400" : "text-muted-foreground"}`}>
                            {rest.join(": ")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Info pills */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Quick Info
              </h2>
              <div className="flex flex-wrap gap-2">
                {priceDisplay && (
                  <span className="glass px-3 py-1.5 rounded-full text-sm text-accent">{priceDisplay} · Price Level</span>
                )}
                {isOpen != null && (
                  <span className={`glass px-3 py-1.5 rounded-full text-sm ${isOpen ? "text-primary" : "text-muted-foreground"}`}>
                    {isOpen ? "✓ Open Now" : "✗ Currently Closed"}
                  </span>
                )}
                {shop?.types?.filter(t => !["point_of_interest","establishment"].includes(t))
                  .slice(0, 3)
                  .map(t => (
                    <span key={t} className="glass px-3 py-1.5 rounded-full text-sm text-muted-foreground capitalize">
                      {t.replace(/_/g, " ")}
                    </span>
                  ))}
              </div>
            </div>

            {/* Error */}
            {detailsError && (
              <div className="glass rounded-2xl p-5 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {detailsError} — showing basic info from search results.
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  REVIEWS TAB                                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-fade-up">

            {/* Review stats bar */}
            {(reviews.length > 0 || details?.googleReviews?.length > 0) && (
              <div className="glass rounded-2xl p-5 flex items-center gap-6 flex-wrap">
                {rating != null && (
                  <div className="text-center">
                    <div className="font-display text-4xl font-bold text-foreground neon-text">{Number(rating).toFixed(1)}</div>
                    <StarRating value={Math.round(rating)} />
                    <div className="text-xs text-muted-foreground mt-1">{shop?.userRatingsTotal} ratings</div>
                  </div>
                )}
                <div className="flex-1 min-w-[180px] space-y-1">
                  {[5,4,3,2,1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground w-4 text-right">{star}</span>
                        <Star className="w-3 h-3 text-accent fill-accent shrink-0" />
                        <div className="flex-1 bg-secondary rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-muted-foreground w-4">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Write review CTA */}
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full glass rounded-2xl p-4 border border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:neon-glow-sm transition-all flex items-center justify-center gap-2 font-semibold text-sm"
              >
                <Plus className="w-4 h-4" />
                Write a Review
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
                <ReviewForm
                  placeId={placeId}
                  shopName={name}
                  onSuccess={handleReviewSubmitted}
                  currentUser={currentUser}
                  onSignInRequest={() => setShowAuthModal(true)}
                />
              </div>
            )}

            {/* Our reviews */}
            {reviews.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  User Reviews ({reviews.length})
                </h3>
                {reviewsLoading
                  ? [1,2,3].map(i => <div key={i} className="h-28 shimmer rounded-2xl" />)
                  : reviews.map((r) => (
                      <ReviewCard
                        key={r._id}
                        review={r}
                        onDelete={handleDelete}
                        canDelete={
                          myReviewIds.includes(r._id) ||
                          (isLoggedIn && r.userId && currentUser?.id === r.userId)
                        }
                      />
                    ))
                }
              </div>
            )}

            {/* Google reviews */}
            {details?.googleReviews?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  From Google ({details.googleReviews.length})
                </h3>
                {details.googleReviews.map((r, i) => (
                  <GoogleReviewCard key={i} review={r} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!reviewsLoading && reviews.length === 0 && !details?.googleReviews?.length && (
              <div className="text-center py-16 space-y-3">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="font-display font-semibold text-foreground">No reviews yet</p>
                <p className="text-muted-foreground text-sm">Be the first to share your experience!</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default ShopDetail;
