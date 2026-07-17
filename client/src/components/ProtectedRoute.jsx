import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Loader } from "./Loader.jsx";

/**
 * Guards routes that require a logged-in user.
 * Crucially: while `loading` is true (session still being verified
 * against /auth/me), we show a loader instead of redirecting — only
 * once loading is false AND there's no user do we bounce to /login.
 * Otherwise a page refresh on /dashboard would incorrectly redirect
 * a logged-in user.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Verifying session…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
