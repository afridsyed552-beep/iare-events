import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { GraduationCap, Mail, Lock, User, Fingerprint, ArrowRight } from "lucide-react";
import { useStore } from "../store";
import { cx } from "../components/ui";
import type { AppUser } from "../types";

const avatarColors = [
  "from-violet-400 to-purple-600",
  "from-cyan-400 to-blue-600",
  "from-pink-400 to-rose-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-fuchsia-400 to-pink-600",
];

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regNo, setRegNo] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [year, setYear] = useState("2nd Year");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const login = useStore((s) => s.login);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast("Please fill in email and password", "error");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      toast("Tell us your name", "error");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const user: AppUser = {
        name: mode === "signup" ? name.trim() : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email: email.trim(),
        regNo: mode === "signup" && regNo.trim() ? regNo.trim().toUpperCase() : "22CSE0000",
        branch: mode === "signup" ? branch : "CSE",
        year: mode === "signup" ? year : "2nd Year",
        color: avatarColors[Math.floor(Math.random() * avatarColors.length)]!,
        isClubAdmin: email.trim().toLowerCase().startsWith("admin"),
      };
      login(user);
      toast(mode === "signup" ? `Welcome to IARE Events, ${user.name.split(" ")[0]}! 🎉` : `Welcome back, ${user.name.split(" ")[0]}! 👋`, "success");
      if (mode === "signup") {
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 }, colors: ["#a78bfa", "#22d3ee", "#f472b6", "#fbbf24"] });
      }
      setBusy(false);
      nav("/");
    }, 900);
  };

  const quickFill = () => {
    setName("Aarav Kumar");
    setEmail("aarav.kumar@iare.ac.in");
    setRegNo("22CSE0421");
    setPassword("demo1234");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-16">
      {/* ambient */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-500/15 blur-[110px]" />

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="glow-ring rounded-[2rem] border border-white/10 bg-[#0b0b16]/90 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-[0_8px_32px_rgba(124,58,237,0.5)]">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-white">
              {mode === "signup" ? "Join the campus" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              {mode === "signup"
                ? "Create your student account in 20 seconds."
                : "Sign in to your IARE Events account."}
            </p>
          </div>

          {/* mode toggle */}
          <div className="mt-7 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cx(
                  "rounded-xl py-2.5 text-sm font-semibold transition-all",
                  mode === m ? "bg-white/12 text-white shadow" : "text-white/45 hover:text-white/75"
                )}
              >
                {m === "signup" ? "Register" : "Sign in"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                <input className="field pl-11" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type="email"
                className="field pl-11"
                placeholder="you@iare.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Fingerprint size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input className="field pl-10" placeholder="Reg no." value={regNo} onChange={(e) => setRegNo(e.target.value)} />
                </div>
                <select className="field cursor-pointer" value={branch} onChange={(e) => setBranch(e.target.value)}>
                  {["CSE", "AIML", "DS", "ECE", "EEE", "MECH", "AERO", "CIVIL"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {mode === "signup" && (
              <div className="flex gap-2">
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                  <button
                    type="button"
                    key={y}
                    onClick={() => setYear(y)}
                    className={cx(
                      "flex-1 rounded-xl border px-2 py-2 text-xs font-semibold transition-all",
                      year === y
                        ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                        : "border-white/10 bg-white/[0.03] text-white/50 hover:text-white"
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type="password"
                className="field pl-11"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
                  {mode === "signup" ? "Create my account" : "Sign in"} <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <button
            onClick={quickFill}
            className="mt-4 w-full rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-3 text-xs font-semibold text-white/45 hover:text-white/75 hover:border-white/30 transition-all"
          >
            ⚡ Quick demo — autofill a student account
          </button>

          <p className="mt-6 text-center text-[11px] text-white/30 leading-relaxed">
            Demo app — no real data is stored. Use any email/password.
            <br />
            Tip: emails starting with <span className="text-white/60 font-semibold">admin@</span> get club-admin rights.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          <Link to="/" className="text-violet-300 hover:text-violet-200 font-medium">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
