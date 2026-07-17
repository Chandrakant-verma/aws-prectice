import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/axios.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "repolens_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token is stored, verify it against /auth/me to
  // restore the session. Until this resolves, `loading` stays true so
  // ProtectedRoute doesn't prematurely bounce a logged-in user.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.data.user);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: loggedInUser } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const { token, user: registeredUser } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
