import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";

export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16"
    >
      <div className="grid place-items-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-white/40 mb-4">
        {icon ?? <SearchX size={26} />}
      </div>
      <h3 className="font-display font-bold text-lg text-white">{title}</h3>
      {subtitle && <p className="mt-1.5 text-sm text-white/50 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
