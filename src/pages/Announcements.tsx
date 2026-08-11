import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Megaphone, AlertTriangle, AlertCircle, Bell, ArrowRight } from "lucide-react";
import { announcements, clubById } from "../data";
import { FadeUp } from "../components/visuals";
import { cx } from "../components/ui";
import { formatDate, timeAgo } from "../lib/format";

const priorityMeta = {
  urgent: { label: "Urgent", icon: AlertTriangle, cls: "border-rose-400/30 bg-rose-500/10 text-rose-300" },
  important: { label: "Important", icon: AlertCircle, cls: "border-amber-400/30 bg-amber-500/10 text-amber-300" },
  normal: { label: "Update", icon: Megaphone, cls: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300" },
};

const filterOrder: ("all" | "urgent" | "important")[] = ["all", "urgent", "important"];

export default function Announcements() {
  const [filter, setFilter] = useState<"all" | "urgent" | "important">("all");

  const list = useMemo(() => {
    const sorted = [...announcements].sort((a, b) => b.date.localeCompare(a.date));
    if (filter === "all") return sorted;
    return sorted.filter((a) => a.priority === filter);
  }, [filter]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-28 pb-10">
      <FadeUp>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
          <span className="text-gradient">Announcements</span>
        </h1>
        <p className="mt-3 text-white/55">
          Official updates from clubs and the Student Activities Council.
        </p>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="mt-7 flex gap-2">
          {filterOrder.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cx(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                filter === f
                  ? "border-transparent bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                  : "border-white/12 bg-white/[0.04] text-white/55 hover:text-white hover:border-white/25"
              )}
            >
              {f === "all" ? `All (${announcements.length})` : f}
            </button>
          ))}
        </div>
      </FadeUp>

      <div className="mt-7 space-y-4">
        {list.map((a, i) => {
          const meta = priorityMeta[a.priority];
          const Icon = meta.icon;
          const club = a.clubId ? clubById(a.clubId) : undefined;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3) }}
              className={cx(
                "relative overflow-hidden rounded-3xl border bg-white/[0.03] backdrop-blur p-6 sm:p-7 transition-colors hover:bg-white/[0.05]",
                a.priority === "urgent" ? "border-rose-400/20" : "border-white/10"
              )}
            >
              {a.priority === "urgent" && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />
              )}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider", meta.cls)}>
                  <Icon size={11} /> {meta.label}
                </span>
                {club && (
                  <Link
                    to={`/clubs/${club.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/60 hover:text-white transition-colors"
                  >
                    {club.logo} {club.name}
                  </Link>
                )}
                <span className="ml-auto text-[11px] text-white/35">{timeAgo(a.date)} · {formatDate(a.date)}</span>
              </div>
              <h2 className="mt-3.5 font-display text-lg sm:text-xl font-bold text-white leading-snug">
                {a.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{a.body}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/35">
                <Bell size={12} className="text-violet-400" /> Posted by <span className="font-semibold text-white/60">{a.author}</span>
              </div>
            </motion.div>
          );
        })}

        {list.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center text-white/45 text-sm">
            No {filter} announcements right now.
          </div>
        )}
      </div>

      <FadeUp delay={0.2}>
        <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-r from-violet-600/15 to-cyan-500/15 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display font-bold text-white">Run a club? Share an update.</div>
            <div className="text-sm text-white/55 mt-1">Post announcements from your club dashboard.</div>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white hover:brightness-110 transition-all"
          >
            Create event / update <ArrowRight size={14} />
          </Link>
        </div>
      </FadeUp>
    </div>
  );
}
