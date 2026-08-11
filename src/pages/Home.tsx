import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Users,
  Ticket,
  Search,
  Sparkles,
  Megaphone,
  Compass,
  CalendarPlus2,
} from "lucide-react";
import { Hero3D, FadeUp, SectionHeading } from "../components/visuals";
import EventCard from "../components/EventCard";
import ClubCard from "../components/ClubCard";
import Countdown from "../components/Countdown";
import { events, clubs, announcements, clubById } from "../data";
import { useAllEvents } from "../store";
import { cx, gradientStyle } from "../components/ui";
import { formatDate, relativeDay, timeAgo } from "../lib/format";

const catColors: Record<string, string> = {
  Technical: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  Cultural: "border-pink-400/30 bg-pink-500/10 text-pink-300",
  Sports: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  Workshop: "border-teal-400/30 bg-teal-500/10 text-teal-300",
  Seminar: "border-blue-400/30 bg-blue-500/10 text-blue-300",
  Hackathon: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  Social: "border-green-400/30 bg-green-500/10 text-green-300",
  Aerospace: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  Robotics: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  Entrepreneurship: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300",
};

export default function Home() {
  const all = useAllEvents();
  const upcoming = all.filter((e) => e.date >= new Date().toISOString().slice(0, 10));
  const featured = upcoming.filter((e) => e.isFeatured).slice(0, 3);
  const nextEvent = [...upcoming].sort((a, b) => a.date.localeCompare(b.date))[0];
  const trending = [...clubs].sort((a, b) => b.members - a.members).slice(0, 6);

  return (
    <div>
      {/* ============ HERO ============ */}
      <Hero3D>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] backdrop-blur px-4 py-1.5 text-xs font-semibold text-white/75 mb-6"
        >
          <Sparkles size={13} className="text-amber-300" />
          SkyFiesta 2026 registrations are LIVE
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.04] text-white"
        >
          Your campus,
          <br />
          <span className="text-gradient">in full colour.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-6 max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed"
        >
          Discover every club, hackathon, fest and workshop at IARE. RSVP in one tap,
          earn participation points, and never miss what's happening on campus again.
        </motion.p>

        {/* search bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-9 w-full max-w-xl"
        >
          <Link
            to="/search"
            className="glow-ring group flex items-center gap-3 rounded-2xl bg-[#0c0c18]/80 backdrop-blur-xl px-5 py-4 border border-white/10 shadow-2xl"
          >
            <Search size={19} className="text-white/40 group-hover:text-violet-300 transition-colors" />
            <span className="flex-1 text-left text-sm text-white/35">
              Search events, clubs, workshops…
            </span>
            <kbd className="hidden sm:block rounded-lg bg-white/8 border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/50">
              ENTER
            </kbd>
          </Link>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_rgba(124,58,237,0.5)] hover:shadow-[0_8px_44px_rgba(124,58,237,0.75)] hover:brightness-110 transition-all"
          >
            <CalendarDays size={17} /> Explore events
          </Link>
          <Link
            to="/clubs"
            className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/14 transition-colors backdrop-blur"
          >
            <Users size={17} /> Find your club
          </Link>
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mt-12 grid grid-cols-3 gap-3 sm:gap-6"
        >
          {[
            { value: "24+", label: "Events this semester" },
            { value: "9", label: "Active clubs" },
            { value: "9.3k", label: "Students connected" },
          ].map((s) => (
            <div key={s.label} className="px-2">
              <div className="font-display text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-violet-300 to-cyan-300">
                {s.value}
              </div>
              <div className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </Hero3D>

      {/* ============ TICKER ============ */}
      <div className="relative border-y border-white/8 bg-[#0a0a15]/80 backdrop-blur overflow-hidden py-3.5">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[...announcements, ...announcements].map((a, i) => (
            <Link
              key={`${a.id}-${i}`}
              to="/announcements"
              className="mx-6 inline-flex items-center gap-2 text-xs sm:text-sm text-white/55 hover:text-white transition-colors"
            >
              <Megaphone size={13} className="text-violet-400 shrink-0" />
              <span className="font-semibold text-white/80">{a.title}</span>
              <span className="hidden sm:inline text-white/35">· {timeAgo(a.date)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ============ FEATURED EVENTS ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Happening now"
            title="Featured events"
            subtitle="The ones everyone's talking about. RSVP before they fill up."
          />
          <FadeUp delay={0.15}>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:border-white/25 transition-colors"
            >
              View all <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(featured.length ? featured : upcoming.slice(0, 3)).map((e, i) => (
            <EventCard key={e.id} event={e} index={i} />
          ))}
        </div>
      </section>

      {/* ============ NEXT BIG THING COUNTDOWN ============ */}
      {nextEvent && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-24">
          <FadeUp>
            <div
              className="relative overflow-hidden rounded-[2rem] border border-white/10 p-8 sm:p-14"
              style={gradientStyle(nextEvent.gradient[0], nextEvent.gradient[1], 130)}
            >
              <div className="absolute inset-0 bg-[#07070f]/72" />
              <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_80%_10%,white_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/40 border border-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 backdrop-blur">
                    <Sparkles size={13} /> Next big thing
                  </div>
                  <h3 className="mt-5 font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
                    {nextEvent.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-white/70 leading-relaxed">
                    {nextEvent.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
                    <span className="font-semibold">{formatDate(nextEvent.date)}</span>
                    <span className="text-white/40">·</span>
                    <span>{nextEvent.time}</span>
                    <span className="text-white/40">·</span>
                    <span>{nextEvent.venue}</span>
                  </div>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to={`/events/${nextEvent.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white text-[#0a0a14] px-6 py-3 text-sm font-bold hover:bg-white/90 transition-colors"
                    >
                      <Ticket size={16} /> Get details
                    </Link>
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/35 border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur">
                      {relativeDay(nextEvent.date)} · {nextEvent.registrations}/{nextEvent.capacity} RSVP'd
                    </span>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <Countdown targetIso={nextEvent.date} />
                </div>
              </div>
            </div>
          </FadeUp>
        </section>
      )}

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-28">
        <SectionHeading
          eyebrow="Explore"
          title="Find your scene"
          subtitle="Whatever you're into, there's a crew and an event for it."
          center
        />
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            { label: "Hackathons", icon: "💻", cat: "Technical" },
            { label: "Aerospace", icon: "✈️", cat: "Aerospace" },
            { label: "Robotics", icon: "🤖", cat: "Robotics" },
            { label: "Music & Dance", icon: "🎶", cat: "Cultural" },
            { label: "Sports", icon: "🏆", cat: "Sports" },
            { label: "Workshops", icon: "🛠️", cat: "Workshop" },
            { label: "Startups", icon: "🚀", cat: "Entrepreneurship" },
            { label: "Seminars", icon: "🎤", cat: "Seminar" },
            { label: "Volunteering", icon: "🤝", cat: "Social" },
            { label: "Films & Drama", icon: "🎬", cat: "Cultural" },
          ].map((c, i) => (
            <FadeUp key={c.label} delay={i * 0.04}>
              <Link
                to={`/events?cat=${encodeURIComponent(c.cat)}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur px-4 py-6 hover:border-white/25 hover:bg-white/[0.07] hover:-translate-y-1 transition-all"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{c.icon}</span>
                <span className="text-sm font-semibold text-white/75 group-hover:text-white">{c.label}</span>
              </Link>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ============ TRENDING CLUBS ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Communities"
            title="Trending clubs"
            subtitle="Join the crews that make campus feel like home."
          />
          <FadeUp delay={0.15}>
            <Link
              to="/clubs"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:border-white/25 transition-colors"
            >
              All clubs <ArrowRight size={15} />
            </Link>
          </FadeUp>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((c, i) => (
            <ClubCard key={c.id} club={c} index={i} />
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-28">
        <SectionHeading eyebrow="Simple" title="How it works" center />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <Compass size={22} />,
              title: "Discover",
              body: "Browse events and clubs with smart filters, live capacity bars and personalized picks.",
              color: "from-violet-600 to-fuchsia-500",
            },
            {
              icon: <Ticket size={22} />,
              title: "RSVP in one tap",
              body: "Lock your spot instantly. Save events, get reminders, and track participation points.",
              color: "from-cyan-500 to-teal-500",
            },
            {
              icon: <CalendarPlus2 size={22} />,
              title: "Show up & earn",
              body: "Attend, collect points, join club crews — and host your own events with the club console.",
              color: "from-amber-500 to-orange-600",
            },
          ].map((s, i) => (
            <FadeUp key={s.title} delay={i * 0.1}>
              <div className="group relative h-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur p-7 overflow-hidden hover:border-white/22 transition-colors">
                <div className={cx("absolute -top-12 -right-12 h-36 w-36 rounded-full blur-3xl opacity-25 group-hover:opacity-50 transition-opacity bg-gradient-to-br", s.color)} />
                <div className={cx("relative grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br text-white shadow-lg", s.color)}>
                  {s.icon}
                </div>
                <h3 className="relative mt-5 font-display font-bold text-xl text-white">{s.title}</h3>
                <p className="relative mt-2.5 text-sm text-white/55 leading-relaxed">{s.body}</p>
                <span className="relative mt-4 inline-block font-display text-5xl font-bold text-white/6">
                  0{i + 1}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-28">
        <FadeUp>
          <div className="glow-ring relative overflow-hidden rounded-[2rem] bg-[#0c0c18] border border-white/10 px-8 py-14 sm:px-14 text-center">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[42rem] rounded-full bg-violet-600/25 blur-[110px]" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
                Ready to make this semester <span className="text-gradient">unmissable?</span>
              </h2>
              <p className="mt-4 max-w-xl mx-auto text-white/55">
                Join a club, grab your first RSVP, or publish an event for your society —
                it all starts here.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_rgba(124,58,237,0.5)] hover:brightness-110 transition-all"
                >
                  Create free account <ArrowRight size={16} />
                </Link>
                <Link
                  to="/calendar"
                  className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/14 transition-colors"
                >
                  <CalendarDays size={16} /> View calendar
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* featured clubs strip for fun */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-20">
        <div className="flex flex-wrap items-center justify-center gap-3 opacity-70">
          {clubs.slice(0, 8).map((c) => (
            <Link
              key={c.id}
              to={`/clubs/${c.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/55 hover:text-white hover:border-white/25 hover:bg-white/[0.07] transition-colors"
            >
              <span>{c.logo}</span> {clubById(c.id)?.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
