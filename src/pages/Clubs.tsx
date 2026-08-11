import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { clubs } from "../data";
import ClubCard from "../components/ClubCard";
import EmptyState from "../components/EmptyState";
import { FadeUp } from "../components/visuals";
import { cx } from "../components/ui";
import type { ClubCategory } from "../types";

const categories: (ClubCategory | "All")[] = [
  "All", "Technical", "Cultural", "Sports", "Aerospace", "Robotics", "Entrepreneurship", "Social",
];

const catInfo: Record<ClubCategory, string> = {
  Technical: "Code, build, ship",
  Cultural: "Perform & create",
  Sports: "Compete & train",
  Aerospace: "Sky's the limit",
  Robotics: "Metal meets code",
  Entrepreneurship: "Start something",
  Social: "Make a difference",
};

export default function Clubs() {
  const [cat, setCat] = useState<ClubCategory | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return clubs.filter((c) => {
      if (cat !== "All" && c.category !== cat) return false;
      if (query.trim() && !`${c.name} ${c.tagline} ${c.description}`.toLowerCase().includes(query.trim().toLowerCase()))
        return false;
      return true;
    });
  }, [cat, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-10">
      <FadeUp>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Clubs & <span className="text-gradient">societies</span>
        </h1>
        <p className="mt-3 text-white/55 max-w-xl">
          Nine communities, thousands of students. Find your people and hit Join.
        </p>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clubs…"
              className="field pl-11"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cx(
                  "shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all",
                  cat === c
                    ? "border-transparent bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_4px_18px_rgba(124,58,237,0.4)]"
                    : "border-white/12 bg-white/[0.04] text-white/60 hover:text-white hover:border-white/25"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* category summary row */}
        {cat !== "All" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300"
          >
            <Filter size={12} /> {cat} · {catInfo[cat as ClubCategory]}
          </motion.div>
        )}
      </FadeUp>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState
            title="No clubs match"
            subtitle="Try a different category or clear the search."
            action={
              <button
                onClick={() => {
                  setQuery("");
                  setCat("All");
                }}
                className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <ClubCard key={c.id} club={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
