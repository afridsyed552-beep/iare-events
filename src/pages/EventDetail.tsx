import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Ticket,
  Bookmark,
  Share2,
  Trophy,
  Zap,
  Check,
  Sparkles,
} from "lucide-react";
import { allEvents, findEvent, useStore } from "../store";
import { clubById } from "../data";
import EventCard from "../components/EventCard";
import Countdown from "../components/Countdown";
import EmptyState from "../components/EmptyState";
import { AvatarStack } from "../components/ui";
import { cx, gradientStyle } from "../components/ui";
import { daysUntil, formatDate, isPast, plural, relativeDay } from "../lib/format";
import type { EventItem } from "../types";

// deterministic pseudo-attendees from event id
function attendeesFor(event: EventItem) {
  const names = [
    "Aarav S.", "Meera J.", "Kiran K.", "Ananya S.", "Rohit M.", "Ishita B.",
    "Pranav S.", "Sneha R.", "Nikhil A.", "Farhan A.", "Priya S.", "Dev A.",
    "Tanvi D.", "Riya K.", "Vikram I.", "Arjun R.", "Shreya K.", "Lakshmi D.",
  ];
  const colors = [
    "from-violet-400 to-purple-600", "from-cyan-400 to-blue-600", "from-pink-400 to-rose-600",
    "from-emerald-400 to-teal-600", "from-amber-400 to-orange-600", "from-fuchsia-400 to-pink-600",
  ];
  const hash = event.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = Math.min(6, Math.max(3, 3 + (hash % 4)));
  const out: { name: string; color: string }[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ name: names[(hash + i * 3) % names.length]!, color: colors[(hash + i) % colors.length]! });
  }
  return out;
}

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const event = id ? findEvent(id) : undefined;
  const rsvp = useStore((s) => (id ? s.rsvps[id] : null));
  const setRsvp = useStore((s) => s.setRsvp);
  const clearRsvp = useStore((s) => s.clearRsvp);
  const toast = useStore((s) => s.toast);

  useEffect(() => {
    if (!event) return;
    document.title = `${event.title} · IARE Events`;
    return () => {
      document.title = "IARE Events · Campus Clubs & Events";
    };
  }, [event]);

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-40 pb-20">
        <EmptyState
          title="Event not found"
          subtitle="This event may have been removed by its organisers."
          action={
            <Link to="/events" className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white">
              Back to events
            </Link>
          }
        />
      </div>
    );
  }

  const club = clubById(event.clubId);
  const past = isPast(event.date);
  const days = daysUntil(event.date);
  const fillPct = Math.min(100, Math.round((event.registrations / event.capacity) * 100));
  const attendees = attendeesFor(event);
  const similar = allEvents()
    .filter(
      (e) =>
        e.id !== event.id &&
        !isPast(e.date) &&
        (e.category === event.category || e.clubId === event.clubId)
    )
    .slice(0, 2);

  const handleRsvp = () => {
    if (past) return;
    if (rsvp === "going") {
      clearRsvp(event.id);
      toast("RSVP cancelled", "info");
      return;
    }
    setRsvp(event.id, "going");
    toast("You're going! 🎉", "success");
    confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 }, colors: ["#a78bfa", "#22d3ee", "#f472b6", "#fbbf24"] });
  };

  return (
    <div className="relative pt-16">
      {/* ===== hero band ===== */}
      <div
        className="relative h-[42vh] min-h-[320px] overflow-hidden"
        style={
          event.coverImage
            ? { backgroundImage: `url(${event.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
            : gradientStyle(event.gradient[0], event.gradient[1], 135)
        }
      >
        <div className="absolute inset-0 bg-[#07070f]/55" />
        {!event.coverImage && (
          <>
            <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_75%_15%,white_0%,transparent_45%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:22px_22px]" />
          </>
        )}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 h-56 w-[90%] rounded-[100%] bg-black/30 blur-3xl" />

        <div className="absolute inset-0 mx-auto max-w-7xl px-4 sm:px-6 flex flex-col justify-end pb-24">
          <button
            onClick={() => nav(-1)}
            className="mb-5 inline-flex items-center gap-2 self-start rounded-full bg-black/35 backdrop-blur border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white hover:border-white/30 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-black/40 backdrop-blur border border-white/15 px-3 py-1.5 uppercase tracking-wider text-white/85">
                {event.category}
              </span>
              {event.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 border border-amber-300/30 px-3 py-1.5 text-amber-300">
                  <Sparkles size={12} /> Featured
                </span>
              )}
              {past ? (
                <span className="rounded-full bg-black/40 border border-white/15 px-3 py-1.5 text-white/70">Completed</span>
              ) : (
                <span className="rounded-full bg-cyan-400/15 border border-cyan-300/30 px-3 py-1.5 text-cyan-300">
                  {relativeDay(event.date)}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] max-w-4xl">
              {event.emoji} {event.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ===== body ===== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-[-3rem] relative z-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* left column */}
          <div className="space-y-6 min-w-0">
            {/* info chips */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="glass rounded-3xl p-6 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: <CalendarDays size={18} className="text-violet-400" />, label: "Date", value: formatDate(event.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
                  { icon: <Clock size={18} className="text-cyan-400" />, label: "Time", value: event.time },
                  { icon: <MapPin size={18} className="text-fuchsia-400" />, label: "Venue", value: event.venue },
                  { icon: <Users size={18} className="text-emerald-400" />, label: "Capacity", value: `${event.registrations.toLocaleString("en-IN")} / ${event.capacity.toLocaleString("en-IN")} RSVP'd` },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <span className="grid place-items-center h-11 w-11 rounded-xl bg-white/6 border border-white/10 shrink-0">{row.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{row.label}</div>
                      <div className="mt-1 text-sm font-semibold text-white/90 leading-snug">{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* description */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="glass rounded-3xl p-7">
              <h2 className="font-display text-xl font-bold text-white">About this event</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-white/65">
                {event.longDescription.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {event.tags.map((t) => (
                  <span key={t} className="rounded-full bg-white/6 border border-white/10 px-3 py-1 text-xs font-semibold text-white/65">
                    #{t}
                  </span>
                ))}
              </div>
              {event.prizes && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/8 p-4">
                  <Trophy size={18} className="text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Prizes</div>
                    <div className="mt-1 text-sm font-medium text-amber-100/90">{event.prizes}</div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* organizer */}
            {club && (
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                <Link to={`/clubs/${club.id}`} className="glass group rounded-3xl p-6 flex flex-wrap items-center gap-5 hover:border-white/22 transition-colors">
                  <div className="relative h-16 w-16 rounded-2xl grid place-items-center text-3xl overflow-hidden shrink-0" style={gradientStyle(club.gradient[0], club.gradient[1], 135)}>
                    <span className="drop-shadow">{club.logo}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Organised by</div>
                    <div className="mt-0.5 font-display font-bold text-white text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-cyan-300">
                      {club.name}
                    </div>
                    <div className="text-sm text-white/50">{club.members.toLocaleString("en-IN")} members · est. {club.founded}</div>
                  </div>
                  <span className="rounded-full bg-white/6 border border-white/12 px-4 py-2 text-xs font-bold text-white/75 group-hover:bg-white/12 transition-colors">
                    Visit club →
                  </span>
                </Link>
              </motion.div>
            )}

            {/* similar events */}
            {similar.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-white">You might also like</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  {similar.slice(0, 2).map((e, i) => (
                    <EventCard key={e.id} event={e} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* right column — sticky RSVP panel */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <div className="glow-ring relative rounded-3xl border border-white/10 bg-[#0c0c18]/90 backdrop-blur-xl p-6">
                {!past && days <= 7 && (
                  <Countdown targetIso={event.date} className="flex justify-center pb-5 border-b border-white/8 mb-5" />
                )}
                {!past && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-white/50 font-medium">{plural(event.registrations, "student")} going</span>
                      <span className={cx(fillPct >= 90 ? "text-rose-300 font-bold" : "text-white/50")}>
                        {fillPct}% filled
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className={cx("h-full rounded-full transition-all duration-700",
                          fillPct >= 90 ? "bg-gradient-to-r from-rose-500 to-orange-400" : "bg-gradient-to-r from-violet-500 to-cyan-400")}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <AvatarStack people={attendees} />
                      <span className="text-xs text-white/40">{event.registrations - event.capacity <= 0 ? `${Math.max(0, event.capacity - event.registrations)} spots left` : "Sold out"}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRsvp}
                  disabled={past}
                  className={cx(
                    "w-full rounded-2xl py-4 text-sm font-bold transition-all",
                    past
                      ? "bg-white/6 text-white/35 cursor-not-allowed border border-white/10"
                      : rsvp === "going"
                        ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25"
                        : "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_10px_34px_rgba(124,58,237,0.55)] hover:brightness-110 hover:shadow-[0_10px_44px_rgba(124,58,237,0.8)]"
                  )}
                >
                  {past ? (
                    <span className="inline-flex items-center gap-2"><Clock size={16} /> Event completed</span>
                  ) : rsvp === "going" ? (
                    <span className="inline-flex items-center gap-2"><Check size={16} /> You're going — tap to cancel</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><Ticket size={16} /> {days === 0 ? "RSVP — happening today!" : "RSVP for this event"}</span>
                  )}
                </button>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (rsvp === "saved") {
                        clearRsvp(event.id);
                        toast("Removed from saved", "info");
                      } else {
                        setRsvp(event.id, "saved");
                        toast("Saved — we'll remind you ⭐", "success");
                      }
                    }}
                    className={cx(
                      "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-all",
                      rsvp === "saved"
                        ? "bg-amber-500/12 border-amber-400/30 text-amber-300"
                        : "bg-white/5 border-white/12 text-white/70 hover:text-white hover:border-white/25"
                    )}
                  >
                    <Bookmark size={14} className={rsvp === "saved" ? "fill-amber-300" : ""} />
                    {rsvp === "saved" ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href).catch(() => {});
                      toast("Link copied to clipboard 🔗", "success");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/12 px-3 py-3 text-xs font-semibold text-white/70 hover:text-white hover:border-white/25 transition-all"
                  >
                    <Share2 size={14} /> Share
                  </button>
                </div>

                {event.points ? (
                  <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-500/8 border border-emerald-400/15 px-4 py-3">
                    <Zap size={15} className="text-emerald-300" />
                    <span className="text-xs text-white/60">
                      Earn <span className="font-bold text-emerald-300">+{event.points} participation points</span> by attending
                    </span>
                  </div>
                ) : null}
              </div>
            </motion.div>

            {/* mini club card on mobile fallback */}
            {!club && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-3xl p-5 text-sm text-white/55">
                Organised by an IARE society.
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
