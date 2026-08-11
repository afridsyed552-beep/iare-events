import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, CalendarDays, Check } from "lucide-react";
import type { Club } from "../types";
import { useStore } from "../store";
import { cx, gradientStyle } from "./ui";
import { events } from "../data";
import TiltCard from "./TiltCard";

export default function ClubCard({ club, index = 0 }: { club: Club; index?: number }) {
  const joined = useStore((s) => s.joinedClubs.includes(club.id));
  const joinClub = useStore((s) => s.joinClub);
  const leaveClub = useStore((s) => s.leaveClub);
  const toast = useStore((s) => s.toast);
  const clubEvents = events.filter((e) => e.clubId === club.id && e.date >= new Date().toISOString().slice(0, 10)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <TiltCard className="h-full rounded-3xl">
        <div className="flex flex-col h-full rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl overflow-hidden transition-all duration-300 group-hover:border-white/22 group-hover:shadow-[0_24px_60px_-12px_rgba(34,211,238,0.3)]">
          {/* header band */}
          <div className="relative h-20 overflow-hidden" style={gradientStyle(club.gradient[0], club.gradient[1], 120)}>
            <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_80%_10%,white_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:16px_16px]" />
            <span className="absolute -bottom-9 left-6 text-[70px] drop-shadow-xl">{club.logo}</span>
          </div>

          <div className="flex flex-col flex-1 p-5 pt-0">
            <div className="flex items-end justify-between mt-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                  {club.category}
                </span>
                <h3 className="font-display font-bold text-white text-xl leading-tight mt-0.5">
                  {club.name}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (joined) {
                    leaveClub(club.id);
                    toast(`Left ${club.name}`, "info");
                  } else {
                    joinClub(club.id);
                    toast(`Joined ${club.name}! 🎉`, "success");
                  }
                }}
                className={cx(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                  joined
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                    : "bg-white/10 text-white border border-white/15 hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:border-transparent"
                )}
              >
                {joined ? (
                  <>
                    <Check size={12} /> Joined
                  </>
                ) : (
                  "Join"
                )}
              </button>
            </div>

            <p className="mt-2.5 text-sm text-white/55 leading-relaxed line-clamp-2 flex-1">
              {club.tagline}
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <Users size={13} className="text-violet-400" />
                {club.members.toLocaleString("en-IN")} members
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} className="text-cyan-400" />
                {clubEvents} upcoming
              </span>
            </div>

            <Link
              to={`/clubs/${club.id}`}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs font-semibold text-white/80 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all"
            >
              Explore club →
            </Link>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}
