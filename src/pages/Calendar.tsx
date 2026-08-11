import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Clock } from "lucide-react";
import { useAllEvents } from "../store";
import { FadeUp } from "../components/visuals";
import { cx, gradientStyle } from "../components/ui";
import { dayNames, monthNames, plural } from "../lib/format";
import type { EventItem } from "../types";

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: startDay }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Calendar() {
  const all = useAllEvents();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const eventsByDay = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    for (const e of all) {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (map[key] ??= []).push(e);
    }
    return map;
  }, [all]);

  const cells = buildMonthGrid(year, month);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const move = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  };

  const monthEvents = useMemo(
    () => all.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }),
    [all, year, month]
  );

  const selectedDefault = `${year}-${month}-${today.getDate()}`;
  const [selected, setSelected] = useState<string>(selectedDefault);
  const selectedDay = parseInt(selected.split("-")[2] ?? "1", 10);
  const selectedEvents = eventsByDay[`${year}-${month}-${selectedDay}`] ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-10">
      <FadeUp>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Campus <span className="text-gradient">calendar</span>
        </h1>
        <p className="mt-3 text-white/55 max-w-xl">
          Every event on one map of the month. Click a day to see what's on.
        </p>
      </FadeUp>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* month grid */}
        <FadeUp delay={0.1}>
          <div className="glass rounded-3xl p-5 sm:p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                {monthNames[month]} <span className="text-white/40">{year}</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => move(-1)}
                  className="grid place-items-center h-10 w-10 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/25 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  onClick={() => move(1)}
                  className="grid place-items-center h-10 w-10 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/25 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/35 py-1.5">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} />;
                const key = `${year}-${month}-${day}`;
                const dayEvents = eventsByDay[key] ?? [];
                const isToday = key === todayKey;
                const isSelected = key === selected;
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={cx(
                      "cal-cell relative min-h-[64px] sm:min-h-[84px] rounded-xl border p-1.5 flex flex-col items-center sm:items-start text-left transition-all",
                      isSelected
                        ? "border-violet-400/60 bg-violet-500/15 shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                        : isToday
                          ? "border-cyan-400/40 bg-cyan-500/8"
                          : "border-white/8 bg-white/[0.025] hover:bg-white/[0.06]"
                    )}
                  >
                    <span
                      className={cx(
                        "font-display text-xs sm:text-sm font-bold grid place-items-center h-6 w-6 rounded-full",
                        isToday ? "bg-gradient-to-br from-violet-500 to-cyan-400 text-white" : "text-white/70"
                      )}
                    >
                      {day}
                    </span>
                    <div className="mt-1 flex flex-col gap-1 w-full">
                      {dayEvents.slice(0, 2).map((e) => (
                        <span
                          key={e.id}
                          className="hidden sm:block h-1.5 w-full rounded-full"
                          style={gradientStyle(e.gradient[0], e.gradient[1])}
                          title={e.title}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="hidden sm:block text-[9px] font-bold text-white/45">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                      {dayEvents.length === 0 && <span className="hidden sm:block h-1.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-white/40">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Selected</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Today</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500" /> Events</span>
            </div>
          </div>
        </FadeUp>

        {/* side panel */}
        <div className="space-y-5">
          <FadeUp delay={0.16}>
            <div className="glass rounded-3xl p-6">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <CalendarDays size={18} className="text-violet-400" />
                {monthNames[month]} {selectedDay}, {year}
              </h3>
              {selectedEvents.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-white/12 p-6 text-center text-sm text-white/40">
                  Free day 🌤 — no events scheduled.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {selectedEvents.map((e) => (
                    <Link
                      key={e.id}
                      to={`/events/${e.id}`}
                      className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 hover:bg-white/[0.06] transition-all"
                    >
                      <div className="relative h-12 w-12 shrink-0 rounded-xl grid place-items-center text-xl overflow-hidden" style={gradientStyle(e.gradient[0], e.gradient[1], 135)}>
                        <span className="drop-shadow">{e.emoji}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-cyan-300 leading-snug">
                          {e.title}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/45">
                          <span className="flex items-center gap-1"><Clock size={11} /> {e.time}</span>
                          <span className="flex items-center gap-1"><MapPin size={11} /> {e.venue}</span>
                        </div>
                        <span className="mt-1.5 inline-block text-[10px] font-bold text-white/35 uppercase tracking-wider">
                          {e.category}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </FadeUp>

          {/* month overview */}
          <FadeUp delay={0.22}>
            <div className="glass rounded-3xl p-6">
              <h3 className="font-display font-bold text-white text-lg">
                {monthNames[month]} at a glance
              </h3>
              <div className="mt-4 space-y-2.5">
                {monthEvents.length === 0 && (
                  <p className="text-sm text-white/40">Nothing planned this month yet.</p>
                )}
                {[...monthEvents]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((e) => (
                    <Link
                      key={e.id}
                      to={`/events/${e.id}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5 transition-colors"
                    >
                      <span
                        className="grid place-items-center h-9 w-9 rounded-lg text-xs font-bold text-white shrink-0"
                        style={gradientStyle(e.gradient[0], e.gradient[1], 135)}
                      >
                        {new Date(e.date).getDate()}
                      </span>
                      <span className="text-sm font-medium text-white/75 truncate">{e.title}</span>
                      <span className="ml-auto text-[10px] text-white/35 shrink-0">
                        {plural(e.registrations, "spot")}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
