import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "bf_token";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);       // null = not logged in
  const [loading, setLoading]     = useState(true);       // true = checking stored token
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ── Restore session from localStorage on mount ── */
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) { setLoading(false); return; }

    axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then(({ data }) => {
        setUser({ ...data.user, token: stored });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY); // expired / invalid
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Called after Google credential received ── */
  const loginWithGoogle = useCallback(async (credential) => {
    const { data } = await axios.post(`${BASE_URL}/auth/google`, { credential });
    const { token, user: u } = data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser({ ...u, token });
    setShowAuthModal(false);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  /* ── Axios interceptor — attach token to every request automatically ── */
  useEffect(() => {
    const id = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(id);
  }, []);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, isLoggedIn,
      loginWithGoogle, logout,
      showAuthModal, setShowAuthModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
