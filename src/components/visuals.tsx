import { type ReactNode } from "react";
import { motion } from "framer-motion";
import LiveGround from "./LiveGround";

export function Hero3D({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">
      {/* live animated sports ground */}
      <div className="absolute inset-0">
        <LiveGround />
      </div>

      {/* readability gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07070f]/75 via-transparent to-[#07070f]" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_35%,#07070f_96%)]" />

      {/* content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-16 max-w-4xl">
        {children}
      </div>
    </div>
  );
}

/** Animated entrance wrapper */
export function FadeUp({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Section heading with accent */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <FadeUp className={center ? "text-center" : ""}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-violet-300 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-white/60 text-base sm:text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
    </FadeUp>
  );
}

/** Decorative blurred orbs used as page background accents */
export function AmbientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-violet-600/16 blur-[130px]" />
      <div className="absolute top-1/3 -right-48 h-[30rem] w-[30rem] rounded-full bg-cyan-500/12 blur-[130px]" />
      <div className="absolute bottom-0 left-1/4 h-[26rem] w-[26rem] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:32px_32px]" />
    </div>
  );
}
