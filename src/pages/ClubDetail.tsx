import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  CalendarDays,
  Trophy,
  Check,
  UserPlus,
  Instagram,
  Github,
  Linkedin,
  Youtube,
  Globe,
} from "lucide-react";
import { clubs, events } from "../data";
import { useStore } from "../store";
import { cx, gradientStyle, Avatar } from "../components/ui";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import { FadeUp } from "../components/visuals";
import { formatDate } from "../lib/format";

const socialIcon: Record<string, typeof Instagram> = {
  Instagram,
  Github,
  Linkedin,
  Youtube,
  Website: Globe,
};

export default function ClubDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const club = clubs.find((c) => c.id === id);
  const joined = useStore((s) => (id ? s.joinedClubs.includes(id) : false));
  const joinClub = useStore((s) => s.joinClub);
  const leaveClub = useStore((s) => s.leaveClub);
  const toast = useStore((s) => s.toast);

  if (!club) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-40 pb-20">
        <EmptyState
          title="Club not found"
          action={
            <Link to="/clubs" className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white">
              Back to clubs
            </Link>
          }
        />
      </div>
    );
  }

  const clubEvents = events.filter((e) => e.clubId === club.id);
  const upcoming = clubEvents.filter((e) => e.date >= new Date().toISOString().slice(0, 10));
  const past = clubEvents.filter((e) => e.date < new Date().toISOString().slice(0, 10));

  return (
    <div className="relative pt-16">
      {/* banner */}
      <div className="relative h-[38vh] min-h-[300px] overflow-hidden" style={gradientStyle(club.gradient[0], club.gradient[1], 130)}>
        <div className="absolute inset-0 bg-[#07070f]/45" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_70%_20%,white_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -bottom-24 -left-10 text-[16rem] opacity-25 rotate-[-8deg] select-none pointer-events-none">
          {club.logo}
        </div>
        <div className="absolute inset-0 mx-auto max-w-7xl px-4 sm:px-6 flex flex-col justify-end pb-24">
          <button
            onClick={() => nav(-1)}
            className="mb-5 inline-flex items-center gap-2 self-start rounded-full bg-black/35 backdrop-blur border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white hover:border-white/30 transition-colors"
          >
            <ArrowLeft size={14} /> All clubs
          </button>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="rounded-full bg-black/40 backdrop-blur border border-white/15 px-3 py-1.5 uppercase tracking-wider text-white/85">
                {club.category} · est. {club.founded}
              </span>
              <span className="rounded-full bg-black/40 backdrop-blur border border-white/15 px-3 py-1.5 text-white/70">
                {club.members.toLocaleString("en-IN")} members
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl sm:text-6xl font-bold text-white tracking-tight">
              {club.logo} {club.name}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-[-3.2rem] relative z-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* left */}
          <div className="space-y-6 min-w-0">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-7">
              <h2 className="font-display text-lg font-bold text-white">About</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/65">{club.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
                    <Users size={14} className="text-violet-400" /> Membership
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold text-white">
                    {club.members.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-white/45">students on the roster</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
                    <CalendarDays size={14} className="text-cyan-400" /> Upcoming
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold text-white">{upcoming.length}</div>
                  <div className="text-xs text-white/45">events on the calendar</div>
                </div>
              </div>
            </motion.div>

            {/* officers */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="glass rounded-3xl p-7">
              <h2 className="font-display text-lg font-bold text-white">Leadership team</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {club.officers.map((o, i) => (
                  <div key={o.name} className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/22 transition-colors">
                    <Avatar name={o.name} color={`bg-gradient-to-br ${o.color}`} size={44} />
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{o.name}</div>
                      <div className="text-xs text-white/45">{o.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* achievements */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="glass rounded-3xl p-7">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Trophy size={18} className="text-amber-300" /> Track record
              </h2>
              <ul className="mt-5 space-y-3.5">
                {club.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/65 leading-relaxed">
                    <span className="mt-1 grid place-items-center h-5 w-5 rounded-full bg-amber-400/15 border border-amber-400/25 text-amber-300 text-[10px] font-bold shrink-0">
                      ★
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* upcoming events */}
            <div>
              <h2 className="font-display text-xl font-bold text-white">Upcoming events</h2>
              {upcoming.length === 0 ? (
                <div className="mt-4 glass rounded-3xl p-8 text-center text-sm text-white/50">
                  Nothing scheduled yet — check back soon.
                </div>
              ) : (
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  {upcoming.map((e, i) => (
                    <EventCard key={e.id} event={e} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* past */}
            {past.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-white">Recent highlights</h2>
                <div className="mt-4 space-y-3">
                  {past.map((e) => (
                    <Link
                      key={e.id}
                      to={`/events/${e.id}`}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/22 transition-all"
                    >
                      <span className="text-2xl">{e.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">{e.title}</div>
                        <div className="text-xs text-white/40">{formatDate(e.date)} · {e.venue}</div>
                      </div>
                      <span className="text-xs rounded-full bg-white/6 border border-white/10 px-3 py-1 text-white/50">
                        {e.registrations.toLocaleString("en-IN")} joined
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* right */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <div className="glow-ring rounded-3xl border border-white/10 bg-[#0c0c18]/90 backdrop-blur-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-2xl grid place-items-center text-3xl overflow-hidden shrink-0" style={gradientStyle(club.gradient[0], club.gradient[1], 135)}>
                    <span className="drop-shadow">{club.logo}</span>
                  </div>
                  <div>
                    <div className="font-display font-bold text-white leading-tight">{club.name}</div>
                    <div className="text-xs text-white/45">{club.tagline}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (joined) {
                      leaveClub(club.id);
                      toast(`Left ${club.name}`, "info");
                    } else {
                      joinClub(club.id);
                      toast(`Welcome to ${club.name}! 🎉`, "success");
                    }
                  }}
                  className={cx(
                    "mt-5 w-full rounded-2xl py-4 text-sm font-bold transition-all",
                    joined
                      ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25"
                      : "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_10px_34px_rgba(124,58,237,0.55)] hover:brightness-110"
                  )}
                >
                  {joined ? (
                    <span className="inline-flex items-center gap-2"><Check size={16} /> Member — tap to leave</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><UserPlus size={16} /> Join this club</span>
                  )}
                </button>
                <p className="mt-3 text-center text-[11px] text-white/35">
                  {joined ? "You're in the roster — see you at the next meet!" : "Free to join. Open to all IARE students."}
                </p>
              </div>
            </motion.div>

            {/* socials */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="glass rounded-3xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Follow along</h3>
              <div className="space-y-2">
                {club.socials.map((s) => {
                  const Icon = socialIcon[s.label] ?? Globe;
                  return (
                    <a
                      key={s.label}
                      href="#"
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors"
                    >
                      <Icon size={15} className="text-violet-400" />
                      <span className="font-medium">{s.label}</span>
                      <span className="ml-auto text-xs text-white/40">{s.handle}</span>
                    </a>
                  );
                })}
              </div>
            </motion.div>

            {/* featured clubs */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="glass rounded-3xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Other clubs</h3>
              <div className="space-y-2">
                {clubs.filter((c) => c.id !== club.id).slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    to={`/clubs/${c.id}`}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xl">{c.logo}</span>
                    <span className="text-sm font-medium text-white/75 truncate">{c.name}</span>
                    <span className="ml-auto text-[10px] text-white/30">{c.members.toLocaleString("en-IN")}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
