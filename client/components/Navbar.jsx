import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext.jsx";

import {useAuth} from "../../client/src/context/AuthContext.jsx";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="border-b border-ink-700 bg-ink-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-signal-500/15 font-display text-signal-400">
            {"</>"}
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-slate-100">
            Repo<span className="text-signal-400">Lens</span>
          </span>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="hidden font-display text-sm text-slate-400 sm:inline">
              {user?.name}
            </span>
            <button onClick={handleLogout} className="btn-secondary !px-3 !py-2 text-xs">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
