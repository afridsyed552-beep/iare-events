import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon, Users, CalendarDays, X, ArrowRight } from "lucide-react";
import { useAllEvents } from "../store";
import { clubs } from "../data";
import { FadeUp } from "../components/visuals";
import { cx, gradientStyle } from "../components/ui";
import { formatDate, isPast } from "../lib/format";

const quickSearches = ["Hackathon", "Drone", "Dance", "Startup", "AI", "Sports"];

export default function Search() {
  const [q, setQ] = useState("");
  const all = useAllEvents();

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { events: [], clubs: [] };
    const ev = all
      .filter((e) =>
        `${e.title} ${e.description} ${e.longDescription.join(" ")} ${e.venue} ${e.tags.join(" ")} ${e.category}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 6);
    const cl = clubs
      .filter((c) => `${c.name} ${c.tagline} ${c.description} ${c.category}`.toLowerCase().includes(query))
      .slice(0, 6);
    return { events: ev, clubs: cl };
  }, [q, all]);

  const total = results.events.length + results.clubs.length;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-28 pb-10">
      <FadeUp>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Search <span className="text-gradient">campus</span>
        </h1>
        <p className="mt-3 text-white/55">Find events, clubs, venues and workshops in one place.</p>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="relative mt-8">
          <SearchIcon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'hackathon', 'drones', 'dance', 'AI'…"
            className="field pl-[52px] py-4 text-base rounded-2xl"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/8 text-white/60 hover:text-white hover:bg-white/15 transition-colors"
              aria-label="Clear"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickSearches.map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className={cx(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                q.toLowerCase() === s.toLowerCase()
                  ? "border-transparent bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                  : "border-white/12 bg-white/[0.04] text-white/55 hover:text-white hover:border-white/25"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FadeUp>

      {q.trim() === "" ? (
        <div className="mt-14 text-center">
          <div className="mx-auto grid place-items-center h-20 w-20 rounded-3xl bg-white/[0.04] border border-white/10 text-white/30">
            <SearchIcon size={30} />
          </div>
          <p className="mt-4 text-white/45 text-sm">
            Type something above — we'll search events and clubs live.
          </p>
        </div>
      ) : total === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-white/15 p-14 text-center">
          <div className="text-4xl">🔍</div>
          <h3 className="mt-3 font-display font-bold text-white text-lg">Nothing found for "{q}"</h3>
          <p className="mt-1.5 text-sm text-white/45">Try a broader term like 'AI' or 'dance'.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {/* events */}
          {results.events.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays size={17} className="text-violet-400" /> Events
                <span className="text-xs font-semibold text-white/35">({results.events.length})</span>
              </h2>
              <div className="mt-4 space-y-3">
                {results.events.map((e, i) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/events/${e.id}`}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 hover:bg-white/[0.055] transition-all"
                    >
                      <div className="relative h-12 w-12 shrink-0 rounded-xl grid place-items-center text-xl overflow-hidden" style={gradientStyle(e.gradient[0], e.gradient[1], 135)}>
                        <span className="drop-shadow">{e.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-cyan-300">
                          {e.title}
                        </div>
                        <div className="mt-0.5 text-xs text-white/45">
                          {formatDate(e.date)} · {e.venue} · <span className="text-violet-300">{e.category}</span>
                          {isPast(e.date) && <span className="ml-2 text-white/30">(completed)</span>}
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-white/25 group-hover:text-cyan-300 transition-colors shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* clubs */}
          {results.clubs.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Users size={17} className="text-cyan-400" /> Clubs
                <span className="text-xs font-semibold text-white/35">({results.clubs.length})</span>
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {results.clubs.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link
                      to={`/clubs/${c.id}`}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 hover:bg-white/[0.055] transition-all"
                    >
                      <div className="relative h-12 w-12 shrink-0 rounded-xl grid place-items-center text-xl overflow-hidden" style={gradientStyle(c.gradient[0], c.gradient[1], 135)}>
                        <span className="drop-shadow">{c.logo}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-cyan-300">
                          {c.name}
                        </div>
                        <div className="mt-0.5 text-xs text-white/45 truncate">{c.tagline}</div>
                      </div>
                      <span className="text-[10px] font-bold text-white/35 shrink-0">{c.members.toLocaleString("en-IN")} members</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
