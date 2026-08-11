import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, LayoutGrid, List, CalendarX2, PlusCircle } from "lucide-react";
import { useAllEvents } from "../store";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import { FadeUp } from "../components/visuals";
import { cx } from "../components/ui";
import { isPast } from "../lib/format";
import type { EventCategory } from "../types";

const categories: (EventCategory | "All")[] = [
  "All", "Technical", "Cultural", "Sports", "Workshop",
  "Seminar", "Hackathon", "Social", "Aerospace", "Robotics", "Entrepreneurship",
];

const sortOptions = [
  { id: "soonest", label: "Soonest first" },
  { id: "newest", label: "Newest added" },
  { id: "popular", label: "Most popular" },
  { id: "capacity", label: "Almost full" },
];

export default function Events() {
  const [params, setParams] = useSearchParams();
  const catParam = params.get("cat") ?? "All";
  const qParam = params.get("q") ?? "";

  const all = useAllEvents();
  const [query, setQuery] = useState(qParam);
  const [sort, setSort] = useState("soonest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showPast, setShowPast] = useState(false);

  const setCategory = (c: string) => {
    const next = new URLSearchParams(params);
    if (c === "All") next.delete("cat");
    else next.set("cat", c);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = all.filter((e) => {
      if (catParam !== "All" && e.category !== catParam) return false;
      if (query.trim() && !`${e.title} ${e.description} ${e.venue} ${e.tags.join(" ")}`
        .toLowerCase().includes(query.trim().toLowerCase())) return false;
      if (!showPast && isPast(e.date)) return false;
      return true;
    });
    switch (sort) {
      case "newest":
        list = [...list].sort((a, b) => b.date.localeCompare(a.date));
        break;
      case "popular":
        list = [...list].sort((a, b) => b.registrations - a.registrations);
        break;
      case "capacity": {
        list = [...list].sort(
          (a, b) => b.registrations / b.capacity - a.registrations / a.capacity
        );
        break;
      }
      default:
        list = [...list].sort((a, b) => a.date.localeCompare(b.date));
    }
    return list;
  }, [all, catParam, query, sort, showPast]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-10">
      <FadeUp>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Events <span className="text-gradient">hub</span>
            </h1>
            <p className="mt-3 text-white/55 max-w-xl">
              Everything happening on campus — filter by category, search, and RSVP before seats run out.
            </p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_rgba(124,58,237,0.5)] hover:shadow-[0_8px_44px_rgba(124,58,237,0.75)] hover:brightness-110 transition-all group"
          >
            <PlusCircle size={17} className="transition-transform group-hover:rotate-90" />
            Add new event
          </Link>
        </div>
      </FadeUp>

      {/* search + controls */}
      <FadeUp delay={0.1}>
        <div className="mt-8 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                const next = new URLSearchParams(params);
                if (e.target.value) next.set("q", e.target.value);
                else next.delete("q");
                setParams(next, { replace: true });
              }}
              placeholder="Search events, venues, tags…"
              className="field pl-11"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 lg:w-52">
              <SlidersHorizontal size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="field pl-10 appearance-none cursor-pointer">
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex rounded-2xl border border-white/12 bg-white/[0.04] p-1">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cx(
                    "grid place-items-center h-10 w-11 rounded-xl transition-colors",
                    view === v ? "bg-white/12 text-white" : "text-white/40 hover:text-white/70"
                  )}
                  aria-label={`${v} view`}
                >
                  {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* category chips */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none]">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cx(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
                catParam === c
                  ? "border-transparent bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_4px_18px_rgba(124,58,237,0.4)]"
                  : "border-white/12 bg-white/[0.04] text-white/60 hover:text-white hover:border-white/25"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-white/40">
          <span>
            {filtered.length} event{filtered.length === 1 ? "" : "s"}
            {catParam !== "All" && ` · ${catParam}`}
          </span>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="accent-violet-500 h-3.5 w-3.5"
            />
            Include completed
          </label>
        </div>
      </FadeUp>

      {/* results */}
      <div className="mt-7">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarX2 size={26} />}
            title="No events found"
            subtitle="Try a different category, clear the search, or check back soon — new events drop every week."
            action={
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
                className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white"
              >
                Clear filters
              </button>
            }
          />
        ) : view === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
              >
                <EventRow event={e} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact list row (used in list view)
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { EventItem } from "../types";
import { clubById } from "../data";
import { gradientStyle } from "../components/ui";
import { formatDate, relativeDay } from "../lib/format";

function EventRow({ event }: { event: EventItem }) {
  const club = clubById(event.clubId);
  const past = isPast(event.date);
  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 hover:border-white/22 hover:bg-white/[0.055] transition-all"
    >
      <div
        className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl overflow-hidden grid place-items-center text-2xl"
        style={gradientStyle(event.gradient[0], event.gradient[1], 135)}
      >
        <span className="drop-shadow">{event.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/45">
          <span>{club?.logo} {club?.name}</span>
          <span className="rounded-full bg-white/8 px-2 py-0.5 text-white/60">{event.category}</span>
          {!past && (
            <span className="rounded-full bg-cyan-500/12 border border-cyan-400/20 px-2 py-0.5 text-cyan-300">
              {relativeDay(event.date)}
            </span>
          )}
        </div>
        <h3 className="mt-1 font-display font-bold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-cyan-300">
          {event.title}
        </h3>
      </div>
      <div className="flex items-center gap-4 text-xs text-white/50 shrink-0">
        <span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-violet-400" />{formatDate(event.date)}</span>
        <span className="hidden md:flex items-center gap-1.5"><MapPin size={13} className="text-cyan-400" />{event.venue}</span>
        <span className="flex items-center gap-1.5"><Users size={13} className="text-emerald-400" />{event.registrations}/{event.capacity}</span>
      </div>
    </Link>
  );
}
