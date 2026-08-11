import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Ticket, Bookmark, CalendarDays, Clock, MapPin, Zap, UserRound,
  ArrowRight, QrCode, CheckCircle2, Clock4, PartyPopper,
} from "lucide-react";
import { useStore, useAllEvents } from "../store";
import { clubById } from "../data";
import { FadeUp } from "../components/visuals";
import EmptyState from "../components/EmptyState";
import { cx, gradientStyle } from "../components/ui";
import { formatDate, isPast, plural } from "../lib/format";
import type { EventItem } from "../types";

/** Deterministic registration id per user + event, e.g. IARE-2026-A7K2 */
function regId(email: string, eventId: string, date: string): string {
  const year = new Date(date).getFullYear();
  let h = 0;
  for (const c of `${email}|${eventId}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[h % chars.length], h = Math.floor(h / chars.length);
  return `IARE-${year}-${code}`;
}

/** Decorative CSS "QR" block for the ticket */
function QrBlock({ seed }: { seed: string }) {
  let h = 0;
  for (const c of seed) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < 81; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push(h % 100 < 46);
  }
  return (
    <div className="grid grid-cols-9 gap-[2px] rounded-lg bg-white p-2 w-[74px] h-[74px] shrink-0">
      {cells.map((on, i) => (
        <span
          key={i}
          className={cx("rounded-[1px]", on ? "bg-[#0b0b16]" : "bg-transparent", i < 9 && i < 3 ? "bg-[#0b0b16]" : "")}
        />
      ))}
    </div>
  );
}

function TicketCard({
  event,
  userEmail,
  status,
}: {
  event: EventItem;
  userEmail: string;
  status: "confirmed" | "attended";
}) {
  const club = clubById(event.clubId);
  const fillPct = Math.min(100, Math.round((event.registrations / event.capacity) * 100));
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl hover:border-white/25 transition-all"
    >
      {/* ticket perforation side */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/8 hidden sm:block" />
      <div className="absolute left-1/2 -translate-x-1/2 top-0 h-4 w-4 rounded-full bg-[#07070f] border border-white/10 hidden sm:block -translate-y-1/2" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-4 w-4 rounded-full bg-[#07070f] border border-white/10 hidden sm:block translate-y-1/2" />

      <div className="grid sm:grid-cols-[1fr_auto] gap-5 p-6">
        {/* left: event info */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/45">
            <span>{club?.logo} {club?.name}</span>
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-white/60">{event.category}</span>
            <span
              className={cx(
                "ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                status === "attended"
                  ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-300"
                  : "border-cyan-400/30 bg-cyan-500/12 text-cyan-300"
              )}
            >
              {status === "attended" ? <CheckCircle2 size={11} /> : <CheckCircle2 size={11} />}
              {status === "attended" ? "Attended" : "Confirmed"}
            </span>
          </div>

          <h3 className="mt-2 font-display font-bold text-white text-lg leading-snug">
            {event.emoji} {event.title}
          </h3>

          <div className="mt-3 grid gap-1.5 text-xs text-white/55 sm:grid-cols-2">
            <span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-violet-400" /> {formatDate(event.date)}</span>
            <span className="flex items-center gap-1.5"><Clock size={13} className="text-cyan-400" /> {event.time}</span>
            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-fuchsia-400" /> {event.venue}</span>
            <span className="flex items-center gap-1.5">
              <Zap size={13} className="text-emerald-400" />
              {event.points ? `+${event.points} points on attendance` : "Free entry"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/40">
            <span>
              Registration ID:{" "}
              <span className="font-mono font-bold text-white/75">{regId(userEmail, event.id, event.date)}</span>
            </span>
            <span>
              Seat: <span className="font-bold text-white/70">{fillPct}% filled · {plural(Math.max(0, event.capacity - event.registrations), "spot")} left</span>
            </span>
          </div>
        </div>

        {/* right: QR + actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
          <div className="flex items-center gap-3 sm:flex-col">
            <QrBlock seed={regId(userEmail, event.id, event.date)} />
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/35 text-center flex items-center gap-1">
              <QrCode size={10} /> Scan at entry
            </span>
          </div>
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/12 px-4 py-2 text-xs font-bold text-white/80 hover:text-white hover:border-white/30 transition-colors"
          >
            Event page <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* cover strip */}
      <div className="h-1.5 w-full" style={gradientStyle(event.gradient[0], event.gradient[1])} />
    </motion.div>
  );
}

export default function Registrations() {
  const user = useStore((s) => s.user);
  const rsvps = useStore((s) => s.rsvps);
  const all = useAllEvents();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-40 pb-20 text-center">
        <EmptyState
          icon={<UserRound size={26} />}
          title="You're not signed in"
          subtitle="Sign in to see your event registrations and tickets."
          action={
            <Link to="/auth" className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white hover:brightness-110 transition-all">
              Sign in / Register
            </Link>
          }
        />
      </div>
    );
  }

  const going = all.filter((e) => rsvps[e.id] === "going");
  const saved = all.filter((e) => rsvps[e.id] === "saved");
  const upcoming = going.filter((e) => !isPast(e.date));
  const attended = going.filter((e) => isPast(e.date));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-28 pb-10">
      <FadeUp>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
              My <span className="text-gradient">registrations</span>
            </h1>
            <p className="mt-3 text-white/55 max-w-xl">
              Your tickets and RSVPs — show the QR at the venue entrance to check in.
            </p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:border-white/25 transition-colors"
          >
            <UserRound size={15} /> My profile
          </Link>
        </div>
      </FadeUp>

      {/* stats strip */}
      <FadeUp delay={0.08}>
        <div className="mt-7 grid grid-cols-3 gap-3">
          {[
            { icon: <Ticket size={16} className="text-cyan-400" />, label: "Confirmed", value: upcoming.length },
            { icon: <CheckCircle2 size={16} className="text-emerald-400" />, label: "Attended", value: attended.length },
            { icon: <Bookmark size={16} className="text-amber-300" />, label: "Saved", value: saved.length },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                {s.icon} {s.label}
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-white">{s.value}</div>
            </div>
          ))}
        </div>
      </FadeUp>

      {/* confirmed tickets */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Ticket size={18} className="text-cyan-400" /> Upcoming tickets
        </h2>
        {upcoming.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<PartyPopper size={26} />}
              title="No registrations yet"
              subtitle="RSVP to an event and your ticket will appear here instantly."
              action={
                <Link to="/events" className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white">
                  Browse events
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {upcoming.map((e) => (
              <TicketCard key={e.id} event={e} userEmail={user.email} status="confirmed" />
            ))}
          </div>
        )}
      </div>

      {/* attended */}
      {attended.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" /> Attended
          </h2>
          <div className="mt-4 space-y-4">
            {attended.map((e) => (
              <TicketCard key={e.id} event={e} userEmail={user.email} status="attended" />
            ))}
          </div>
        </div>
      )}

      {/* saved */}
      {saved.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Bookmark size={18} className="text-amber-300" /> Saved for later
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {saved.map((e) => (
              <Link
                key={e.id}
                to={`/events/${e.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 hover:bg-white/[0.055] transition-all"
              >
                <div
                  className="h-12 w-12 shrink-0 rounded-xl grid place-items-center text-xl overflow-hidden"
                  style={gradientStyle(e.gradient[0], e.gradient[1], 135)}
                >
                  <span className="drop-shadow">{e.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-cyan-300">
                    {e.title}
                  </div>
                  <div className="mt-0.5 text-xs text-white/45">{formatDate(e.date)} · {e.venue}</div>
                </div>
                <span className="text-[10px] rounded-full bg-amber-500/12 border border-amber-400/25 px-2.5 py-1 font-bold text-amber-300">
                  Saved
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* reminder strip */}
      {upcoming.length > 0 && (
        <FadeUp delay={0.1}>
          <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/12 to-violet-500/12 p-6 flex flex-wrap items-center gap-4">
            <span className="text-3xl">🎟️</span>
            <div className="flex-1 min-w-[220px]">
              <div className="font-display font-bold text-white">Your next event</div>
              <div className="text-sm text-white/55 mt-0.5">
                <span className="font-semibold text-white/85">{upcoming[0]!.title}</span> · {formatDate(upcoming[0]!.date)} · {upcoming[0]!.venue}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <Clock4 size={13} className="text-cyan-400" /> Show your QR at the gate
            </div>
          </div>
        </FadeUp>
      )}
    </div>
  );
}
