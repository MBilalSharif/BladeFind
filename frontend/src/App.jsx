import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import Index from "./pages/Index";
import ShopListing from "./pages/ShopListing";
import MapView from "./pages/MapView";
import ShopDetail from "./pages/ShopDetail";
import NotFound from "./pages/NotFound";

const VISITED_KEY = "bf_visited";

function App() {
  const { isLoggedIn, loading, setShowAuthModal } = useAuth();

  /* Show auth modal on first-ever visit — after auth check resolves */
  useEffect(() => {
    if (loading) return;
    if (isLoggedIn) return;
    const visited = sessionStorage.getItem(VISITED_KEY);
    if (!visited) {
      sessionStorage.setItem(VISITED_KEY, "1");
      // Small delay so the page hero renders first
      const t = setTimeout(() => setShowAuthModal(true), 1200);
      return () => clearTimeout(t);
    }
  }, [loading, isLoggedIn, setShowAuthModal]);

  return (
    <>
      {/* Global auth modal — lives outside routes so it persists across navigation */}
      <AuthModal />

      <Routes>
        <Route path="/"              element={<Index />} />
        <Route path="/shops"         element={<ShopListing />} />
        <Route path="/shops/:placeId" element={<ShopDetail />} />
        <Route path="/map"           element={<MapView />} />
        <Route path="*"              element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
