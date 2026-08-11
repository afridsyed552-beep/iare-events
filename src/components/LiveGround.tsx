import { useEffect, useRef } from "react";

/**
 * LiveGround — real-time football stadium scene using REAL images
 * (downloaded photos): a real stadium photo as the backdrop, with real
 * footballer cutout photos moving independently across the pitch — each
 * walks, sprints, juggles, dances & sings or cheers on its own schedule.
 */

type Mode = "walk" | "juggle" | "dance" | "sprint" | "idle";

interface Note {
  x: number;
  y: number;
  life: number;
  glyph: string;
  seed: number;
  color: string;
}

interface PState {
  img: HTMLImageElement;
  x: number;
  yFrac: number;
  scale: number;
  speedMul: number;
  laneMin: number;
  laneMax: number;
  facing: 1 | -1;
  mode: Mode;
  modeT: number;
  duration: number;
  phase: number;
  hasBall: boolean;
  danceSeed: number;
  noteTimer: number;
  noteColor: string;
  loaded: boolean;
}

const NOTES = ["♪", "♫", "♩", "♬"];
const MODE_POOL: Mode[] = ["walk", "juggle", "dance", "sprint", "idle"];

function nextMode(prev: Mode): { mode: Mode; duration: number } {
  let mode: Mode;
  do {
    mode = MODE_POOL[Math.floor(Math.random() * MODE_POOL.length)]!;
  } while (mode === prev);
  const duration: Record<Mode, number> = {
    walk: 4 + Math.random() * 2.5,
    sprint: 3 + Math.random() * 1.5,
    juggle: 3.2 + Math.random() * 2,
    dance: 4.5 + Math.random() * 3.5,
    idle: 2.2 + Math.random() * 2,
  };
  return { mode, duration: duration[mode] };
}

const PLAYER_SRCS = [
  "/images/player-1.png",
  "/images/player-2.png",
  "/images/player-3.png",
  "/images/player-4.png",
];

const NOTE_COLORS = ["#e879f9", "#67e8f9", "#fde68a", "#a78bfa"];

/** Squad roster — each player has their own real photo, lane, depth, speed. */
function makeSquad(): PState[] {
  const defs: Array<
    Partial<PState> & { yFrac: number; laneMin: number; laneMax: number; src: string }
  > = [
    { src: PLAYER_SRCS[0]!, yFrac: 0.8, laneMin: 0.18, laneMax: 0.84, scale: 1.0, speedMul: 1.0, hasBall: true },
    { src: PLAYER_SRCS[1]!, yFrac: 0.72, laneMin: 0.1, laneMax: 0.62, scale: 0.8, speedMul: 0.85, hasBall: true },
    { src: PLAYER_SRCS[2]!, yFrac: 0.68, laneMin: 0.5, laneMax: 0.96, scale: 0.72, speedMul: 0.78, hasBall: false },
    { src: PLAYER_SRCS[3]!, yFrac: 0.64, laneMin: 0.26, laneMax: 0.8, scale: 0.6, speedMul: 0.66, hasBall: true },
  ];

  return defs.map((d, i) => {
    const img = new Image();
    img.src = d.src;
    const initial = nextMode(i % 2 === 0 ? "idle" : "walk");
    return {
      img,
      loaded: false,
      x: d.laneMin + Math.random() * (d.laneMax - d.laneMin),
      yFrac: d.yFrac,
      scale: d.scale ?? 0.6,
      speedMul: d.speedMul ?? 0.7,
      laneMin: d.laneMin,
      laneMax: d.laneMax,
      facing: Math.random() < 0.5 ? 1 : -1,
      mode: initial.mode,
      modeT: Math.random() * initial.duration,
      duration: initial.duration,
      phase: Math.random() * Math.PI * 2,
      hasBall: d.hasBall ?? false,
      danceSeed: Math.random() * Math.PI * 2,
      noteTimer: Math.random() * 0.4,
      noteColor: NOTE_COLORS[i % NOTE_COLORS.length]!,
    };
  });
}

export default function LiveGround() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stadium = new Image();
    stadium.src = "/images/stadium.jpg";

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const players: PState[] = makeSquad();
    const notes: Note[] = [];
    const pointer = { x: 0.5, y: 0.5 };
    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX / w;
      pointer.y = e.clientY / h;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    let last = performance.now();

    /** Draw a real player photo, feet anchored at (0,0), facing dir, bob. */
    const drawPhotoPlayer = (p: PState, bob: number, tilt: number, alpha = 1) => {
      if (!p.loaded || !p.img.complete || p.img.naturalWidth === 0) return;
      const ratio = p.img.naturalHeight / p.img.naturalWidth;
      // desired visual height in canvas units (before p.scale is applied by caller)
      const baseH = 128;
      const iw = baseH / ratio;
      const ih = baseH;
      ctx.save();
      ctx.globalAlpha = alpha;
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.ellipse(0, 2, iw * 0.36, ih * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(0, -bob);
      ctx.rotate(tilt);
      if (p.facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(p.img, -iw / 2, -ih, iw, ih);
      ctx.restore();
    };

    /** Drawn ball (realistic shaded), anchored at (0,0), radius ~9. */
    const drawBall = (squash = 0) => {
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 7, 9, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // body
      const g = ctx.createRadialGradient(-3, -4, 1, 0, 0, 10);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.55, "#e5e7eb");
      g.addColorStop(1, "#9ca3af");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, 9 + squash * 1.5, 9 - squash, 0, 0, Math.PI * 2);
      ctx.fill();
      // panels
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-6.5, 1.5);
      ctx.lineTo(6.5, -1.5);
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.moveTo(-5.5, -4.5);
      ctx.lineTo(5.5, 4.5);
      ctx.stroke();
      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.arc(0, 0, 3.1, 0, Math.PI * 2);
      ctx.fill();
    };

    /** Cover-fit the stadium photo onto the canvas. */
    const drawStadium = () => {
      if (!stadium.complete || stadium.naturalWidth === 0) {
        // placeholder gradient until photo loads
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#0b0b1e");
        g.addColorStop(1, "#1c1340");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        return;
      }
      const imgRatio = stadium.naturalWidth / stadium.naturalHeight;
      const cRatio = w / h;
      let dw = w;
      let dh = h;
      let dx = 0;
      let dy = 0;
      if (imgRatio > cRatio) {
        dh = h;
        dw = h * imgRatio;
        dx = (w - dw) / 2;
      } else {
        dw = w;
        dh = w / imgRatio;
        dy = (h - dh) / 2;
      }
      ctx.drawImage(stadium, dx, dy, dw, dh);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      // mark loaded
      for (const p of players) {
        if (!p.loaded && p.img.complete && p.img.naturalWidth > 0) p.loaded = true;
      }

      // ---- update each player independently ----
      for (const p of players) {
        p.modeT += dt;
        if (p.modeT >= p.duration) {
          const n = nextMode(p.mode);
          p.mode = n.mode;
          p.duration = n.duration;
          p.modeT = 0;
        }

        const phaseSpeed =
          p.mode === "sprint" ? 13 : p.mode === "walk" ? 8 : p.mode === "dance" ? 5 : p.mode === "juggle" ? 2 : 1;
        p.phase += dt * phaseSpeed * p.speedMul;

        // lane movement
        const base = w * 0.05 * p.speedMul * p.scale;
        if (p.mode === "walk" || p.mode === "sprint") {
          const speed = base * (p.mode === "sprint" ? 2.1 : 1);
          p.x += p.facing * speed * dt;
          if (p.x >= p.laneMax * w) {
            p.x = p.laneMax * w;
            p.facing = -1;
          } else if (p.x <= p.laneMin * w) {
            p.x = p.laneMin * w;
            p.facing = 1;
          }
        } else if (p.mode === "dance") {
          p.x += Math.sin(t * 2.4 + p.danceSeed) * w * 0.012 * dt * 60;
          p.x = Math.max(p.laneMin * w, Math.min(p.laneMax * w, p.x));
          p.facing = Math.cos(t * 2.4 + p.danceSeed) >= 0 ? 1 : -1;
          p.noteTimer += dt;
          if (p.noteTimer > 0.3 && notes.length < 60) {
            p.noteTimer = 0;
            notes.push({
              x: p.x + (Math.random() - 0.5) * 30 * p.scale,
              y: p.yFrac * h - 150 * p.scale,
              life: 1,
              glyph: NOTES[Math.floor(Math.random() * NOTES.length)]!,
              seed: Math.random() * Math.PI * 2,
              color: p.noteColor,
            });
          }
        }
      }

      // ---- render ----
      ctx.clearRect(0, 0, w, h);
      drawStadium();

      // subtle darkening for hero readability (on top of photo)
      ctx.fillStyle = "rgba(7,7,15,0.35)";
      ctx.fillRect(0, 0, w, h);

      const shift = (pointer.x - 0.5) * 10;
      ctx.save();
      ctx.translate(shift, 0);

      // players sorted far → near for depth overlap
      const sorted = [...players].sort((a, b) => a.yFrac - b.yFrac);
      for (const p of sorted) {
        const feetY = p.yFrac * h;

        // per-mode bob & tilt
        let bob = 0;
        let tilt = 0;
        if (p.mode === "walk") bob = Math.abs(Math.sin(p.phase * 2)) * 2.5;
        else if (p.mode === "sprint") bob = Math.abs(Math.sin(p.phase * 2)) * 4.5;
        else if (p.mode === "juggle") bob = Math.abs(Math.sin(t * 5 + p.danceSeed)) * 6;
        else if (p.mode === "dance") {
          bob = Math.abs(Math.sin(t * 3.2 + p.danceSeed)) * 7;
          tilt = Math.sin(t * 2.8 + p.danceSeed) * 0.07;
        } else if (p.mode === "idle") bob = Math.abs(Math.sin(t * 2 + p.danceSeed)) * 1.5;

        // ball follows the player
        if (p.hasBall && p.loaded) {
          ctx.save();
          ctx.translate(p.x + p.facing * 26 * p.scale, feetY);
          ctx.scale(p.scale, p.scale);
          if (p.mode === "juggle") {
            const b = Math.abs(Math.sin(t * 5.5 + p.danceSeed)) * 70;
            ctx.translate(0, -10 - b);
            drawBall(0.25);
          } else if (p.mode === "walk" || p.mode === "sprint") {
            const b = Math.abs(Math.sin(p.phase * 2.2)) * 8;
            ctx.translate(0, -b);
            drawBall(Math.abs(Math.sin(t * 6)) * 0.35);
          } else {
            ctx.translate(0, -7 + Math.sin(t * 3 + p.danceSeed) * 1.5);
            drawBall(0.1);
          }
          ctx.restore();
        }

        // player photo
        ctx.save();
        ctx.translate(p.x, feetY);
        ctx.scale(p.scale, p.scale);
        drawPhotoPlayer(p, bob, tilt);
        ctx.restore();
      }

      // floating musical notes
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i]!;
        n.y -= dt * 46;
        n.x += Math.sin(n.life * 5 + n.seed) * 0.7;
        n.life -= dt * 0.28;
        if (n.life <= 0) {
          notes.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = n.life * 0.9;
        ctx.fillStyle = n.color;
        ctx.font = `${15 + n.life * 11}px serif`;
        ctx.textAlign = "center";
        ctx.fillText(n.glyph, n.x, n.y);
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      drawStadium();
      ctx.fillStyle = "rgba(7,7,15,0.35)";
      ctx.fillRect(0, 0, w, h);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      notes.length = 0;
      ctx.clearRect(0, 0, w, h);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
    />
  );
}
