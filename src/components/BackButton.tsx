import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

/**
 * Floating back button pinned at the top-left below the navbar.
 * Goes back in history when possible, otherwise to home.
 */
export default function BackButton() {
  const { pathname } = useLocation();
  const nav = useNavigate();

  if (pathname === "/") return null;

  const goBack = () => {
    if (window.history.length > 1) nav(-1);
    else nav("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -14, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 24 }}
      className="fixed top-[4.8rem] left-4 sm:left-6 z-40"
    >
      <button
        onClick={goBack}
        aria-label="Go back"
        title="Back"
        className="group flex items-center gap-2 rounded-full border border-white/12 bg-[#0c0c18]/80 backdrop-blur-xl pl-2.5 pr-4 py-2 text-xs font-semibold text-white/75 hover:text-white hover:border-white/30 hover:bg-[#0c0c18] shadow-[0_8px_28px_rgba(0,0,0,0.45)] transition-all"
      >
        <span className="grid place-items-center h-6 w-6 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white transition-transform duration-300 group-hover:-translate-x-0.5">
          <ArrowLeft size={13} />
        </span>
        Back
      </button>
    </motion.div>
  );
}
