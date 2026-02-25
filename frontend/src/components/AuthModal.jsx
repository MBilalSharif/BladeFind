import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { X, Scissors, Shield, Star, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ─── Tiny feature pill ─────────────────────────────────────────────────────── */
const FeaturePill = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5 text-primary" />
    </div>
    {text}
  </div>
);

/* ─── Auth Modal ─────────────────────────────────────────────────────────────── */
const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  if (!showAuthModal) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      setError(err.response?.data?.message || "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed.");
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "hsla(220,20%,3%,0.88)", backdropFilter: "blur(12px)" }}
      onClick={() => setShowAuthModal(false)}
    >
      <div
        className="modal-card glass-strong rounded-3xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top neon bar ─── */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="p-8">
          {/* Close */}
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 glass rounded-full p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            style={{ position: "absolute" }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo + headline */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/15 items-center justify-center mb-4 neon-glow-sm scissors-float">
              <Scissors className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Welcome to BladeFind</h2>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Sign in to save favourites, write reviews, and track appointments
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-2.5 mb-8 p-4 rounded-2xl bg-secondary/30">
            <FeaturePill icon={MapPin}  text="Save your favourite barbers" />
            <FeaturePill icon={Star}    text="Write and manage your reviews" />
            <FeaturePill icon={Shield}  text="Your data is never sold" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Google sign-in button */}
          <div className={`transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
            {loading ? (
              <div className="w-full py-3.5 rounded-xl bg-secondary/40 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </div>
            ) : (
              /* 
                GoogleLogin renders Google's official button.
                We wrap it so it fills the container width.
                theme="filled_black" matches our dark design.
              */
              <div className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  width="320"
                />
              </div>
            )}
          </div>

          {/* Guest option */}
          <button
            onClick={() => setShowAuthModal(false)}
            className="w-full mt-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground glass transition-all"
          >
            Continue as Guest
          </button>

          <p className="text-center text-xs text-muted-foreground/60 mt-4">
            By signing in you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
