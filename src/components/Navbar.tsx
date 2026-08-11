import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Search, LogOut, PlusCircle, Compass, UserRound } from "lucide-react";
import { useStore } from "../store";
import { cx } from "./ui";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/events", label: "Events" },
  { to: "/clubs", label: "Clubs" },
  { to: "/calendar", label: "Calendar" },
  { to: "/announcements", label: "Updates" },
];

function Logo3D({ size = 34 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0 grid place-items-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* rotating conic ring */}
      <div
        className="absolute inset-0 rounded-xl animate-[spin_5s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, #8b5cf6, #22d3ee, #e879f9, #fbbf24, #8b5cf6)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))",
        }}
      />
      <div className="absolute inset-[3px] rounded-[10px] bg-[#0b0b16] grid place-items-center">
        <span className="font-display font-bold text-sm bg-gradient-to-br from-violet-300 to-cyan-300 bg-clip-text text-transparent">
          I
        </span>
      </div>
      {/* soft glow */}
      <div className="absolute -inset-1 rounded-2xl bg-violet-600/30 blur-md -z-10" />
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cx(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#07070f]/75 backdrop-blur-xl border-b border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between h-16 sm:h-[72px]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo3D />
          <div className="leading-tight">
            <div className="font-display font-bold text-white text-lg tracking-tight">
              IARE<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400"> Events</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/40 font-semibold hidden sm:block">
              Campus Clubs &amp; Events
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cx(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive ? "text-white" : "text-white/55 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/10 border border-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2.5">
          <Link
            to="/search"
            className="grid place-items-center h-10 w-10 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/25 transition-colors"
            aria-label="Search"
          >
            <Search size={17} />
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] hover:shadow-[0_0_36px_rgba(124,58,237,0.65)] hover:brightness-110 transition-all"
          >
            <PlusCircle size={16} /> Create
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-white/25 transition-colors"
              >
                <span
                  className={cx(
                    "grid place-items-center rounded-full text-white text-xs font-bold w-8 h-8 bg-gradient-to-br",
                    user.color
                  )}
                >
                  {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <span className="text-sm font-medium text-white/85 max-w-[90px] truncate">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  toast("Signed out. See you soon! 👋", "info");
                  nav("/");
                }}
                className="grid place-items-center h-10 w-10 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-rose-300 hover:border-rose-400/40 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold bg-white/8 border border-white/15 text-white hover:bg-white/14 transition-colors"
            >
              <UserRound size={16} /> Sign in
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden grid place-items-center h-10 w-10 rounded-full bg-white/5 border border-white/10 text-white"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mx-4 mb-4 rounded-2xl border border-white/10 bg-[#0b0b16]/95 backdrop-blur-2xl p-3 shadow-2xl"
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cx(
                  "block px-4 py-3 rounded-xl text-sm font-medium",
                  isActive ? "bg-white/10 text-white" : "text-white/60"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/8 pt-3">
            <Link
              to="/search"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80"
            >
              <Search size={15} /> Search
            </Link>
            <Link
              to="/create"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-semibold text-white"
            >
              <PlusCircle size={15} /> Create
            </Link>
            <Link
              to={user ? "/profile" : "/auth"}
              onClick={() => setOpen(false)}
              className="col-span-2 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80"
            >
              <Compass size={15} /> {user ? "My Profile" : "Sign in / Register"}
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
