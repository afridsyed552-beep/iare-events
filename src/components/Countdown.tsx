import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

function Unit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative grid place-items-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-white/12 bg-white/[0.05] backdrop-blur-md overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.04]" />
        <motion.span
          key={display}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative font-display text-2xl sm:text-3xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tabular-nums"
        >
          {display}
        </motion.span>
      </div>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">{label}</span>
    </div>
  );
}

export default function Countdown({ targetIso, className, style }: { targetIso: string; className?: string; style?: CSSProperties }) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const { d, h, m, s, done } = useCountdown(target);

  if (done) {
    return (
      <div className={className} style={style}>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-300">
          🚀 It's happening now!
        </span>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <div className="flex items-center gap-2.5">
        <Unit value={d} label="Days" />
        <span className="font-display text-2xl font-bold text-white/25 -mt-6">:</span>
        <Unit value={h} label="Hours" />
        <span className="font-display text-2xl font-bold text-white/25 -mt-6">:</span>
        <Unit value={m} label="Min" />
        <span className="font-display text-2xl font-bold text-white/25 -mt-6">:</span>
        <Unit value={s} label="Sec" />
      </div>
    </div>
  );
}
