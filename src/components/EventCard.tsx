import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, Ticket, Sparkles } from "lucide-react";
import type { EventItem } from "../types";
import { clubById } from "../data";
import { useStore } from "../store";
import { cx, gradientStyle } from "./ui";
import { daysUntil, formatDate, isPast, plural, relativeDay } from "../lib/format";

export default function EventCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  const club = clubById(event.clubId);
  const rsvp = useStore((s) => s.rsvps[event.id]);
  const setRsvp = useStore((s) => s.setRsvp);
  const clearRsvp = useStore((s) => s.clearRsvp);
  const toast = useStore((s) => s.toast);
  const past = isPast(event.date);
  const days = daysUntil(event.date);
  const fillPct = Math.min(100, Math.round((event.registrations / event.capacity) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Link
        to={`/events/${event.id}`}
        className="flex flex-col h-full rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl overflow-hidden hover:border-white/22 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-12px_rgba(124,58,237,0.35)]"
      >
        {/* Cover */}
        <div
          className="relative h-44 overflow-hidden"
          style={gradientStyle(event.gradient[0], event.gradient[1], 140)}
        >
          <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_70%_20%,white_0%,transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
          <span className="absolute top-4 left-5 text-5xl drop-shadow-lg">{event.emoji}</span>

          {/* badges */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            {event.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/35 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-300/30">
                <Sparkles size={11} /> Featured
              </span>
            )}
            {past ? (
              <span className="rounded-full bg-black/35 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70 border border-white/20">
                Completed
              </span>
            ) : (
              <span className="rounded-full bg-black/35 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300 border border-cyan-300/30">
                {relativeDay(event.date)}
              </span>
            )}
          </div>

          {/* date chip */}
          <div className="absolute bottom-4 left-5 flex items-center gap-2.5">
            <div className="rounded-xl bg-black/45 backdrop-blur-md border border-white/15 px-3 py-1.5 text-center leading-none">
              <div className="font-display text-lg font-bold text-white">
                {new Date(event.date).getDate().toString().padStart(2, "0")}
              </div>
              <div className="text-[9px] font-bold tracking-[0.2em] text-white/60 mt-0.5">
                {new Date(event.date).toLocaleString("en-IN", { month: "short" }).toUpperCase()}
              </div>
            </div>
            <span className="rounded-full bg-black/35 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-white/90 border border-white/10">
              {event.category}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-white/45 mb-1.5">
            <span>{club?.logo}</span>
            <span>{club?.name}</span>
            {event.points ? (
              <span className="ml-auto rounded-full bg-emerald-500/12 border border-emerald-400/20 px-2 py-0.5 text-emerald-300">
                +{event.points} pts
              </span>
            ) : null}
          </div>
          <h3 className="font-display font-bold text-white text-lg leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-cyan-300 transition-all">
            {event.title}
          </h3>
          <p className="mt-2 text-sm text-white/55 leading-relaxed line-clamp-2 flex-1">
            {event.description}
          </p>

          <div className="mt-4 space-y-1.5 text-xs text-white/50">
            <div className="flex items-center gap-2">
              <CalendarDays size={13} className="text-violet-400" />
              {formatDate(event.date)} · {event.time}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-cyan-400" /> {event.venue}
            </div>
          </div>

          {/* capacity bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-white/45 font-medium">
                {plural(event.registrations, "registered")}
              </span>
              <span className={cx(fillPct >= 90 ? "text-rose-300" : "text-white/45")}>
                {fillPct >= 90 ? "Almost full!" : `${fillPct}% filled`}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${fillPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className={cx(
                  "h-full rounded-full",
                  fillPct >= 90
                    ? "bg-gradient-to-r from-rose-500 to-orange-400"
                    : "bg-gradient-to-r from-violet-500 to-cyan-400"
                )}
              />
            </div>
          </div>

          {/* footer */}
          <div className="mt-4 flex items-center gap-2">
            <span
              onClick={(e) => {
                e.preventDefault();
                if (rsvp === "going") {
                  clearRsvp(event.id);
                  toast("RSVP cancelled", "info");
                } else {
                  setRsvp(event.id, "going");
                  toast("You're going! 🎉", "success");
                }
              }}
              className={cx(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer select-none",
                rsvp === "going"
                  ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300"
                  : past
                    ? "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:brightness-110 shadow-[0_4px_16px_rgba(124,58,237,0.35)]"
              )}
            >
              {past ? (
                <>
                  <Clock size={13} /> Ended
                </>
              ) : rsvp === "going" ? (
                "✓ Going"
              ) : days === 0 ? (
                "RSVP now"
              ) : (
                <>
                  <Ticket size={13} /> RSVP
                </>
              )}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
