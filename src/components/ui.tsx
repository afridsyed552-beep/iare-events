import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

/** Utility for joining class names */
export function cx(...args: (string | false | null | undefined)[]): string {
  return clsx(args);
}

/** Inline style helper */
export type CSS = CSSProperties;

/** Gradient string from tailwind-ish tokens for inline styles */
export function gradientStyle(
  from: string,
  to: string,
  angle = 135
): CSSProperties {
  // tokens come as e.g. "from-sky-500" — strip prefix and use raw hex map
  const map: Record<string, string> = {
    sky500: "#0ea5e9", sky600: "#0284c7", sky400: "#38bdf8",
    indigo500: "#6366f1", indigo600: "#4f46e5", indigo700: "#4338ca", indigo400: "#818cf8",
    emerald500: "#10b981", emerald600: "#059669", emerald400: "#34d399",
    cyan500: "#06b6d4", cyan600: "#0891b2", cyan400: "#22d3ee",
    pink500: "#ec4899", pink600: "#db2777", pink400: "#f472b6",
    rose500: "#f43f5e", rose600: "#e11d48", rose400: "#fb7185",
    orange500: "#f97316", orange600: "#ea580c", orange400: "#fb923c",
    red500: "#ef4444", red600: "#dc2626", red400: "#f87171",
    violet500: "#8b5cf6", violet600: "#7c3aed", violet700: "#6d28d9", violet400: "#a78bfa",
    purple500: "#a855f7", purple600: "#9333ea", purple700: "#7e22ce", purple400: "#c084fc",
    amber500: "#f59e0b", amber600: "#d97706", amber400: "#fbbf24",
    fuchsia500: "#d946ef", fuchsia400: "#e879f9", fuchsia600: "#c026d3",
    teal500: "#14b8a6", teal600: "#0d9488", teal400: "#2dd4bf",
    green500: "#22c55e", green400: "#4ade80", green600: "#16a34a",
    blue500: "#3b82f6", blue600: "#2563eb", blue400: "#60a5fa",
    lime500: "#84cc16", lime400: "#a3e635",
    slate500: "#64748b", slate600: "#475569",
    zinc600: "#52525b",
    yellow600: "#ca8a04", yellow400: "#facc15",
  };
  const f = map[from.replace("from-", "").replace(/-/g, "")] ?? from;
  const t = map[to.replace("to-", "").replace(/-/g, "")] ?? to;
  return {
    background: `linear-gradient(${angle}deg, ${f}, ${t})`,
  };
}

export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className={cx(
        "rounded-full grid place-items-center font-bold text-white ring-2 ring-white/20 shrink-0",
        color
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join("")}
    </div>
  );
}

export function AvatarStack({
  people,
  size = 36,
  max = 5,
}: {
  people: { name: string; color: string }[];
  size?: number;
  max?: number;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex -space-x-2.5">
      {shown.map((p, i) => (
        <div key={i} style={{ zIndex: shown.length - i }}>
          <Avatar name={p.name} color={p.color} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="rounded-full grid place-items-center bg-white/10 ring-2 ring-white/20 text-white font-semibold backdrop-blur"
          style={{ width: size, height: size, fontSize: size * 0.35 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/** Small pill badge */
export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "success" | "warn" | "danger" | "glass";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-white/8 text-white/70 border-white/10",
    accent: "bg-violet-500/15 text-violet-300 border-violet-400/25",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-400/25",
    warn: "bg-amber-500/15 text-amber-300 border-amber-400/25",
    danger: "bg-rose-500/15 text-rose-300 border-rose-400/25",
    glass: "bg-white/10 text-white border-white/15",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
