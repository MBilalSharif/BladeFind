import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="relative text-center glass rounded-2xl p-12 neon-glow-sm">
        <h1 className="font-display text-7xl font-bold text-primary neon-text mb-4">404</h1>
        <p className="text-xl text-foreground mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 neon-glow transition-all"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
