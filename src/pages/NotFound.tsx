import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-[7rem] sm:text-[10rem] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-cyan-400"
      >
        404
      </motion.div>
      <h1 className="font-display text-2xl font-bold text-white">Lost in campus?</h1>
      <p className="mt-2 text-white/50 max-w-sm text-sm">
        This page doesn't exist — maybe it was moved, or the event already ended.
      </p>
      <div className="mt-7 flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white hover:brightness-110 transition-all"
        >
          <ArrowLeft size={15} /> Back home
        </Link>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-6 py-3 text-sm font-bold text-white hover:bg-white/14 transition-colors"
        >
          Browse events
        </Link>
      </div>
    </div>
  );
}
