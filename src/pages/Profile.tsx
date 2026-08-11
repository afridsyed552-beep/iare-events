import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Ticket, Bookmark, Users, Zap, LogOut, CalendarDays,
  UserRound, ArrowRight, Megaphone, PartyPopper,
} from "lucide-react";
import { useStore, useAllEvents } from "../store";
import { clubs } from "../data";
import { FadeUp } from "../components/visuals";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import { cx, gradientStyle, Avatar } from "../components/ui";
import { formatDate, isPast } from "../lib/format";

export default function Profile() {
  const user = useStore((s) => s.user);
  const rsvps = useStore((s) => s.rsvps);
  const joinedClubs = useStore((s) => s.joinedClubs);
  const logout = useStore((s) => s.logout);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const all = useAllEvents();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-40 pb-20 text-center">
        <EmptyState
          icon={<UserRound size={26} />}
          title="You're not signed in"
          subtitle="Sign in to track your RSVPs, saved events and club memberships."
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
  const upcomingGoing = going.filter((e) => !isPast(e.date));
  const myClubs = clubs.filter((c) => joinedClubs.includes(c.id));
  const points = (going.length * 20) + (upcomingGoing.length * 10);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-10">
      {/* header card */}
      <FadeUp>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600/25 via-[#0c0c18] to-cyan-500/20 p-8 sm:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-violet-600/30 blur-[100px]" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-[90px]" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 blur-lg opacity-60" />
              <Avatar name={user.name} color={`bg-gradient-to-br ${user.color}`} size={84} />
            </div>
            <div className="flex-1 min-w-[220px]">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">{user.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/55">
                <span>{user.branch} · {user.year}</span>
                <span className="text-white/30">|</span>
                <span>{user.regNo}</span>
                <span className="text-white/30">|</span>
                <span>{user.email}</span>
              </div>
              {user.isClubAdmin && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/12 px-3 py-1 text-[11px] font-bold text-amber-300">
                  <Megaphone size={12} /> Club admin
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/registrations"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_28px_rgba(34,211,238,0.4)] hover:brightness-110 transition-all"
              >
                <Ticket size={16} /> My registrations
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/6 border border-white/12 px-5 py-3 text-sm font-bold text-white hover:bg-white/12 transition-all"
              >
                <PartyPopper size={16} /> Host event
              </Link>
              <button
                onClick={() => {
                  logout();
                  toast("Signed out", "info");
                  nav("/");
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/6 border border-white/12 px-5 py-3 text-sm font-semibold text-white/70 hover:text-white hover:border-white/25 transition-all"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </div>

          {/* stat strip */}
          <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Ticket size={16} className="text-violet-400" />, label: "Going", value: going.length, to: "/registrations" },
              { icon: <Bookmark size={16} className="text-amber-300" />, label: "Saved", value: saved.length, to: "/registrations" },
              { icon: <Users size={16} className="text-cyan-400" />, label: "Clubs", value: myClubs.length, to: "/clubs" },
              { icon: <Zap size={16} className="text-emerald-400" />, label: "Points", value: points, to: undefined },
            ].map((s) => (
              <Link
                key={s.label}
                to={s.to ?? "#"}
                onClick={(e) => { if (!s.to) e.preventDefault(); }}
                className={cx(
                  "rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur px-4 py-4 transition-all",
                  s.to ? "hover:border-white/25 hover:bg-white/[0.08]" : "cursor-default"
                )}
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                  {s.icon} {s.label}
                </div>
                <div className="mt-1.5 font-display text-2xl font-bold text-white">{s.value}</div>
              </Link>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* my events */}
      <div className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Ticket size={20} className="text-violet-400" /> My events
          </h2>
          <Link to="/events" className="text-sm font-semibold text-white/45 hover:text-white inline-flex items-center gap-1">
            Explore more <ArrowRight size={14} />
          </Link>
        </div>

        {going.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="No RSVPs yet"
              subtitle="Tap RSVP on any event to lock your spot — it'll show up here."
              action={
                <Link to="/events" className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white">
                  Browse events
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {going.slice(0, 3).map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
            {going.length > 3 && (
              <p className="mt-4 text-sm text-white/40">
                + {going.length - 3} more going · <Link to="/events" className="text-violet-300 hover:text-violet-200">view all</Link>
              </p>
            )}
          </>
        )}
      </div>

      {/* saved */}
      {saved.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Bookmark size={20} className="text-amber-300" /> Saved for later
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.slice(0, 3).map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* my clubs */}
      <div className="mt-12">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <Users size={20} className="text-cyan-400" /> My clubs
        </h2>
        {myClubs.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <p className="text-sm text-white/45">You haven't joined any clubs yet.</p>
            <Link to="/clubs" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white">
              Discover clubs <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myClubs.map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
                <Link
                  to={`/clubs/${c.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/25 hover:bg-white/[0.055] transition-all"
                >
                  <div className="relative h-[52px] w-[52px] rounded-xl grid place-items-center text-2xl shrink-0 overflow-hidden" style={gradientStyle(c.gradient[0], c.gradient[1], 135)}>
                    <span className="drop-shadow">{c.logo}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-300 group-hover:to-cyan-300">
                      {c.name}
                    </div>
                    <div className="text-xs text-white/45 mt-0.5">{c.members.toLocaleString("en-IN")} members</div>
                  </div>
                  <CalendarDays size={16} className="text-white/25 group-hover:text-cyan-300 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* upcoming reminder strip */}
      {upcomingGoing.length > 0 && (
        <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/12 to-cyan-500/12 p-6 flex flex-wrap items-center gap-4">
          <span className="text-3xl">⏰</span>
          <div className="flex-1 min-w-[200px]">
            <div className="font-display font-bold text-white">Your next event</div>
            <div className="text-sm text-white/55 mt-0.5">
              <span className="font-semibold text-white/85">{upcomingGoing[0]!.title}</span> · {formatDate(upcomingGoing[0]!.date)}
            </div>
          </div>
          <Link to={`/events/${upcomingGoing[0]!.id}`} className="rounded-full bg-white text-[#0a0a14] px-5 py-2.5 text-xs font-bold hover:bg-white/85 transition-colors">
            View details
          </Link>
        </div>
      )}
    </div>
  );
}
