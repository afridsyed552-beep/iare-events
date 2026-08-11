import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PartyPopper, CalendarDays, Clock, MapPin, Users, Image as ImageIcon,
  ArrowRight, Sparkles, ShieldCheck, Upload, X,
} from "lucide-react";
import { useStore } from "../store";
import { clubs } from "../data";
import { FadeUp } from "../components/visuals";
import { cx, gradientStyle } from "../components/ui";
import type { EventCategory, EventItem } from "../types";

const gradients: [string, string][] = [
  ["from-sky-500", "to-indigo-600"],
  ["from-emerald-500", "to-cyan-600"],
  ["from-pink-500", "to-rose-600"],
  ["from-orange-500", "to-red-600"],
  ["from-violet-500", "to-purple-700"],
  ["from-amber-500", "to-orange-600"],
  ["from-cyan-500", "to-teal-600"],
  ["from-fuchsia-500", "to-pink-600"],
  ["from-blue-500", "to-indigo-600"],
];

const emojis = ["🎤", "💻", "🏆", "🎨", "🎬", "🚀", "🤖", "🏃", "🎸", "📚", "🧠", "🌱"];

export default function CreateEvent() {
  const user = useStore((s) => s.user);
  const addEvent = useStore((s) => s.addEvent);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [clubId, setClubId] = useState(user?.isClubAdmin ? clubs[0]!.id : clubs[1]!.id);
  const [category, setCategory] = useState<EventCategory>("Workshop");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("4:00 PM");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🎤");
  const [gradientIdx, setGradientIdx] = useState(0);
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file", "error");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast("Image is too large — keep it under 4 MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.onerror = () => toast("Couldn't read that image", "error");
    reader.readAsDataURL(file);
  };

  const coverStyle: React.CSSProperties = coverImage
    ? {
        backgroundImage: `url(${coverImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : gradientStyle(gradients[gradientIdx][0], gradients[gradientIdx][1], 140);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim() || !date) {
      toast("Please fill title, venue and date", "error");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const id = `custom-${Date.now()}`;
      const event: EventItem = {
        id,
        title: title.trim(),
        clubId,
        category,
        description: description.trim() || "Details coming soon.",
        longDescription: [
          description.trim() || "Details coming soon.",
          "This event was published through the IARE Events club console.",
          "Follow the organising club's page for updates, schedule changes and last-minute announcements.",
        ],
        date: `${date}T00:00:00`,
        time,
        venue: venue.trim(),
        capacity,
        registrations: 0,
        points: 50,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6),
        gradient: gradients[gradientIdx]!,
        emoji,
        coverImage: coverImage ?? undefined,
      };
      addEvent(event);
      toast("Event published! 🎉 It's live on the Events page.", "success");
      setBusy(false);
      nav(`/events/${id}`);
    }, 800);
  };

  const previewDate = date ? `${date}T00:00:00` : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-10">
      <FadeUp>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Publish an <span className="text-gradient">event</span>
        </h1>
        <p className="mt-3 text-white/55 max-w-xl">
          {user?.isClubAdmin
            ? "Club admin console — your event goes live on the campus feed instantly."
            : "Create an event on behalf of your club. Published instantly to the campus feed."}
        </p>
      </FadeUp>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* form */}
        <FadeUp delay={0.1}>
          <form onSubmit={submit} className="glass rounded-3xl p-7 sm:p-8 space-y-6">
            {/* title */}
            <div>
              <label className="form-label">Event title *</label>
              <input
                className="field mt-2"
                placeholder="e.g. AI Workshop — Build Your First Chatbot"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* club + category */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="form-label">Organising club *</label>
                <select className="field mt-2 cursor-pointer" value={clubId} onChange={(e) => setClubId(e.target.value)}>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.logo} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Category *</label>
                <select className="field mt-2 cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
                  {["Technical", "Cultural", "Sports", "Workshop", "Seminar", "Hackathon", "Social", "Aerospace", "Robotics", "Entrepreneurship"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* date time venue */}
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="form-label">Date *</label>
                <input type="date" className="field mt-2 [color-scheme:dark]" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Time</label>
                <input className="field mt-2" placeholder="4:00 PM" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Venue *</label>
                <input className="field mt-2" placeholder="Seminar Hall A" value={venue} onChange={(e) => setVenue(e.target.value)} />
              </div>
            </div>

            {/* capacity + tags */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  className="field mt-2"
                  value={capacity}
                  onChange={(e) => setCapacity(Math.max(10, parseInt(e.target.value) || 10))}
                />
              </div>
              <div>
                <label className="form-label">Tags (comma separated)</label>
                <input className="field mt-2" placeholder="AI, Workshop, Certificate" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </div>

            {/* description */}
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="field mt-2 min-h-[110px] resize-y"
                placeholder="What's this event about? Who should come? Anything they should bring?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* look & feel */}
            <div>
              <label className="form-label flex items-center gap-2">
                <ImageIcon size={14} className="text-white/40" /> Cover look & icon
              </label>

              {/* upload cover image */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {coverImage ? (
                  <div className="relative">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="h-16 w-28 rounded-xl object-cover border border-white/20 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="absolute -top-2 -right-2 grid place-items-center h-6 w-6 rounded-full bg-rose-500 text-white border border-white/30 shadow hover:bg-rose-600 transition-colors"
                      aria-label="Remove cover image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-cyan-400/40 bg-cyan-500/8 px-4 py-3 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/15 hover:border-cyan-400/60 transition-all"
                >
                  <Upload size={14} /> {coverImage ? "Replace image" : "Upload cover image"}
                </button>
                <span className="text-[11px] text-white/35">JPG / PNG · max 4 MB</span>
              </div>
              {coverImage && (
                <p className="mt-2 text-[11px] text-emerald-300/90">✓ Image applied — it will replace the gradient on the event card.</p>
              )}
              <div className="mt-2.5 flex flex-wrap gap-2">
                {gradients.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGradientIdx(i)}
                    className={cx(
                      "h-9 w-12 rounded-lg border-2 transition-all",
                      gradientIdx === i ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    style={gradientStyle(g[0], g[1])}
                    aria-label={`gradient ${i + 1}`}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {emojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={cx(
                      "grid place-items-center h-10 w-10 rounded-xl border text-xl transition-all",
                      emoji === em ? "border-violet-400/60 bg-violet-500/15 scale-110" : "border-white/10 bg-white/[0.03] hover:border-white/25"
                    )}
                    aria-label={`icon ${em}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 py-4 text-sm font-bold text-white shadow-[0_10px_34px_rgba(124,58,237,0.5)] hover:brightness-110 disabled:opacity-60 transition-all inline-flex items-center justify-center gap-2"
            >
              {busy ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <PartyPopper size={16} /> Publish event to campus
                </>
              )}
            </button>
          </form>
        </FadeUp>

        {/* live preview */}
        <FadeUp delay={0.16}>
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="glass rounded-3xl p-6">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
                <Sparkles size={15} className="text-amber-300" /> Live preview
              </h3>
              <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
                <div className="relative h-36 overflow-hidden" style={coverStyle}>
                  {!coverImage && (
                    <>
                      <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_70%_20%,white_0%,transparent_45%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
                    </>
                  )}
                  {coverImage && <div className="absolute inset-0 bg-[#07070f]/25" />}
                  <span className="absolute top-4 left-5 text-5xl drop-shadow-lg">{emoji}</span>
                  <div className="absolute bottom-4 left-5 flex items-center gap-2">
                    <div className="rounded-xl bg-black/45 backdrop-blur border border-white/15 px-3 py-1.5 text-center leading-none">
                      <div className="font-display text-lg font-bold text-white">
                        {previewDate ? new Date(previewDate).getDate().toString().padStart(2, "0") : "--"}
                      </div>
                      <div className="text-[9px] font-bold tracking-[0.2em] text-white/60 mt-0.5">
                        {previewDate ? new Date(previewDate).toLocaleString("en-IN", { month: "short" }).toUpperCase() : "MONTH"}
                      </div>
                    </div>
                    <span className="rounded-full bg-black/35 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-white/90 border border-white/10">
                      {category}
                    </span>
                  </div>
                </div>
                <div className="bg-white/[0.03] p-4">
                  <div className="font-display font-bold text-white leading-snug line-clamp-2">
                    {title || "Your event title…"}
                  </div>
                  <div className="mt-2.5 space-y-1 text-xs text-white/50">
                    <div className="flex items-center gap-2"><CalendarDays size={12} className="text-violet-400" />{date ? new Date(previewDate!).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "Pick a date"} · {time || "—"}</div>
                    <div className="flex items-center gap-2"><Clock size={12} className="text-cyan-400" />{time || "Set a time"}</div>
                    <div className="flex items-center gap-2"><MapPin size={12} className="text-fuchsia-400" />{venue || "Venue"}</div>
                    <div className="flex items-center gap-2"><Users size={12} className="text-emerald-400" />Capacity {capacity}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-violet-400/20 bg-violet-500/8 p-5 flex gap-3">
              <ShieldCheck size={18} className="text-violet-300 shrink-0 mt-0.5" />
              <p className="text-xs text-white/55 leading-relaxed">
                Events are reviewed by the Student Activities Council. You'll be able to
                manage registrations and post updates from your dashboard.
              </p>
            </div>

            <Link to="/events" className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/5 border border-white/10 py-3 text-sm font-semibold text-white/70 hover:text-white hover:border-white/25 transition-colors">
              Browse existing events <ArrowRight size={14} />
            </Link>
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
