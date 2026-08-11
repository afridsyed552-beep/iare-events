import { Link } from "react-router-dom";
import { Instagram, Github, Linkedin, Mail, MapPin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/8 bg-[#06060d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display font-bold text-xl text-white">
              IARE<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> Events</span>
            </div>
            <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-sm">
              The campus hub for clubs, events and everything that makes life at the
              Institute of Aeronautical Engineering unforgettable. Discover, join, and
              show up.
            </p>
            <div className="mt-5 flex gap-2.5">
              {[Instagram, Github, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid place-items-center h-9 w-9 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                  aria-label="social link"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white/40 mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/events" className="hover:text-white transition-colors">All events</Link></li>
              <li><Link to="/clubs" className="hover:text-white transition-colors">Clubs & societies</Link></li>
              <li><Link to="/calendar" className="hover:text-white transition-colors">Campus calendar</Link></li>
              <li><Link to="/announcements" className="hover:text-white transition-colors">Announcements</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white/40 mb-4">Get involved</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link to="/create" className="hover:text-white transition-colors">Create an event</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Student sign-up</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">Search campus</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white/40 mb-4">Campus</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="flex items-center gap-2"><MapPin size={14} className="text-violet-400" /> Dundigal, Hyderabad</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-cyan-400" /> sac@iare.ac.in</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <span>© 2026 IARE Events · Student Activities Council</span>
          <span className="flex items-center gap-1.5">
            Built with <Heart size={12} className="text-rose-400 fill-rose-400" /> by students, for students
          </span>
        </div>
      </div>
    </footer>
  );
}
