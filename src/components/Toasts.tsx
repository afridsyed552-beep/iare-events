import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import { useStore } from "../store";

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-400" />,
  info: <Info size={18} className="text-cyan-400" />,
  error: <XCircle size={18} className="text-rose-400" />,
};

export default function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(92vw,360px)]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="flex items-center gap-3 rounded-2xl border border-white/12 bg-[#0d0d1a]/90 backdrop-blur-xl px-4 py-3.5 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
          >
            {icons[t.type]}
            <span className="flex-1 text-sm font-medium text-white/90">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-white/35 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
