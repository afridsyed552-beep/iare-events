import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Toasts from "./Toasts";
import CursorTrail from "./CursorTrail";
import BackButton from "./BackButton";
import { AmbientOrbs } from "./visuals";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

/** Floating "add event" action button — hidden on the create page itself */
function Fab() {
  const { pathname } = useLocation();
  if (pathname === "/create") return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 22 }}
      className="fixed bottom-6 right-6 z-40 group"
    >
      <Link
        to="/create"
        aria-label="Add new event"
        title="Add new event"
        className="relative grid place-items-center h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400 text-white shadow-[0_10px_36px_rgba(124,58,237,0.55)] hover:shadow-[0_12px_48px_rgba(124,58,237,0.8)] hover:scale-105 active:scale-95 transition-all"
      >
        {/* pulsing halo */}
        <span className="absolute inset-0 rounded-full bg-violet-500/40 animate-ping [animation-duration:2.2s]" />
        <Plus size={24} className="relative z-10 transition-transform duration-300 group-hover:rotate-90" />
      </Link>
      <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/12 bg-[#0c0c18]/90 backdrop-blur px-3.5 py-1.5 text-xs font-semibold text-white/85 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-xl">
        Add event
      </span>
    </motion.div>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07070f] text-white antialiased">
      <ScrollToTop />
      <AmbientOrbs />
      <Navbar />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />
      <BackButton />
      <Fab />
      <CursorTrail />
      <Toasts />
    </div>
  );
}
