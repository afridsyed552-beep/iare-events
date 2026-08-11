import { useEffect, useRef } from "react";

/**
 * LiveGround — an always-animating football stadium scene rendered on canvas.
 * A whole squad of players acts independently on the pitch: each one walks &
 * dribbles, juggles, dances & sings, sprints or cheers on their own random
 * schedule, in their own lane, at their own depth/speed, with floating
 * musical notes, cheering crowd, floodlights and a dusk sky.
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

interface Star {
  x: number;
  y: number;
  r: number;
  tw: number;
}

interface PState {
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
  jersey: string;
  shorts: string;
  skin: string;
  hair: string;
  number: string;
  noteColor: string;
}

const CROWD_COLORS = [
  "#a78bfa", "#22d3ee", "#f472b6", "#fbbf24", "#34d399", "#f87171", "#818cf8", "#e879f9",
];
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

/** Squad roster — each player has their own lane, depth, speed and look. */
function makeSquad(): PState[] {
  const defs: Array<
    Partial<PState> & { yFrac: number; laneMin: number; laneMax: number }
  > = [
    { yFrac: 0.8, laneMin: 0.16, laneMax: 0.84, scale: 1.0, speedMul: 1.0, hasBall: true, jersey: "#8b5cf6", shorts: "#1e1b4b", number: "10", noteColor: "#e879f9" },
    { yFrac: 0.705, laneMin: 0.08, laneMax: 0.58, scale: 0.8, speedMul: 0.85, hasBall: true, jersey: "#22d3ee", shorts: "#164e63", number: "7", noteColor: "#67e8f9" },
    { yFrac: 0.665, laneMin: 0.5, laneMax: 0.96, scale: 0.72, speedMul: 0.78, hasBall: false, jersey: "#f472b6", shorts: "#831843", number: "9", noteColor: "#f9a8d4" },
    { yFrac: 0.63, laneMin: 0.24, laneMax: 0.78, scale: 0.62, speedMul: 0.66, hasBall: true, jersey: "#fbbf24", shorts: "#78350f", number: "5", noteColor: "#fde68a" },
    { yFrac: 0.6, laneMin: 0.52, laneMax: 0.9, scale: 0.55, speedMul: 0.6, hasBall: false, jersey: "#34d399", shorts: "#064e3b", number: "3", noteColor: "#6ee7b7" },
    { yFrac: 0.585, laneMin: 0.1, laneMax: 0.45, scale: 0.5, speedMul: 0.55, hasBall: false, jersey: "#f87171", shorts: "#7f1d1d", number: "2", noteColor: "#fca5a5" },
  ];

  return defs.map((d, i) => {
    const skins = ["#f2c094", "#8d5a3b", "#c68642", "#f2c094", "#e8b48c"];
    const hairs = ["#3f2d20", "#111111", "#7a4a12", "#1f2937", "#3f2d20"];
    const initial = nextMode(i % 2 === 0 ? "idle" : "walk");
    return {
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
      jersey: d.jersey ?? "#8b5cf6",
      shorts: d.shorts ?? "#1e1b4b",
      skin: skins[i % skins.length]!,
      hair: hairs[i % hairs.length]!,
      number: d.number ?? `${i + 1}`,
      noteColor: d.noteColor ?? "#e879f9",
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

    // deterministic stars
    const stars: Star[] = Array.from({ length: 70 }, (_, i) => ({
      x: (i * 137.5) % 1,
      y: (i * 89.3) % 0.45,
      r: 0.6 + ((i * 7) % 10) / 8,
      tw: i * 2.1,
    }));

    // deterministic crowd rows
    const crowdRows = 7;
    const crowdCols = 90;
    const crowd: { x: number; y: number; c: string }[] = [];
    for (let r = 0; r < crowdRows; r++) {
      for (let c = 0; c < crowdCols; c++) {
        crowd.push({
          x: ((c + 0.5) / crowdCols) * 1.15 - 0.075,
          y: 0.46 + r * 0.012,
          c: CROWD_COLORS[(r * 13 + c * 7) % CROWD_COLORS.length]!,
        });
      }
    }

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

    // ---- drawing helpers ----
    const drawSky = (t: number) => {
      const g = ctx.createLinearGradient(0, 0, 0, h * 0.56);
      g.addColorStop(0, "#05050d");
      g.addColorStop(0.5, "#181038");
      g.addColorStop(1, "#3b1d78");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h * 0.58);

      for (const s of stars) {
        const a = 0.25 + 0.35 * Math.abs(Math.sin(t * 0.7 + s.tw));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#e0e7ff";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const mx = w * 0.78;
      const my = h * 0.14;
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 90);
      mg.addColorStop(0, "rgba(224,231,255,0.95)");
      mg.addColorStop(0.3, "rgba(199,210,254,0.35)");
      mg.addColorStop(1, "rgba(199,210,254,0)");
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, 90, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.arc(mx, my, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(199,210,254,0.10)";
      for (let i = 0; i < 3; i++) {
        const cx = ((i * 0.4 + t * 0.006) % 1.25) * w - w * 0.15;
        const cy = h * (0.2 + i * 0.08);
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.09, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + w * 0.05, cy - 8, w * 0.06, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawStands = (t: number) => {
      const y0 = h * 0.4;
      const y1 = h * 0.52;
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, "#171033");
      g.addColorStop(1, "#251545");
      ctx.fillStyle = g;
      ctx.fillRect(0, y0, w, y1 - y0);

      for (const c of crowd) {
        const flick = 0.75 + 0.25 * Math.abs(Math.sin(t * 1.4 + c.x * 40 + c.y * 90));
        ctx.globalAlpha = flick;
        ctx.fillStyle = c.c;
        ctx.fillRect(c.x * w, c.y * h, Math.max(2, w * 0.006), Math.max(2, w * 0.006));
      }
      ctx.globalAlpha = 1;

      for (const side of [-1, 1]) {
        const fx = side === -1 ? w * 0.05 : w * 0.95;
        const baseY = h * 0.46;
        const headY = h * 0.24;
        ctx.strokeStyle = "rgba(199,210,254,0.35)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fx, baseY);
        ctx.lineTo(fx, headY);
        ctx.stroke();

        const cone = ctx.createLinearGradient(0, headY, 0, h * 0.7);
        cone.addColorStop(0, "rgba(255,250,220,0.14)");
        cone.addColorStop(1, "rgba(255,250,220,0)");
        ctx.fillStyle = cone;
        ctx.beginPath();
        ctx.moveTo(fx - 14, headY);
        ctx.lineTo(fx + 14, headY);
        ctx.lineTo(fx + side * w * 0.55, h * 0.72);
        ctx.lineTo(fx + side * w * 0.15, h * 0.72);
        ctx.closePath();
        ctx.fill();

        const lg = ctx.createRadialGradient(fx, headY, 0, fx, headY, 26);
        lg.addColorStop(0, "rgba(255,250,220,0.9)");
        lg.addColorStop(1, "rgba(255,250,220,0)");
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(fx, headY, 26, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawPitch = () => {
      const topY = h * 0.52;
      const topW = w * 0.62;
      const xMid = w / 2;

      ctx.fillStyle = "#0c5c34";
      ctx.beginPath();
      ctx.moveTo(xMid - topW / 2, topY);
      ctx.lineTo(xMid + topW / 2, topY);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      const stripes = 6;
      for (let k = 0; k < stripes; k++) {
        if (k % 2 === 1) continue;
        const t0 = k / stripes;
        const t1 = (k + 1) / stripes;
        const x0Top = xMid + (t0 - 0.5) * topW;
        const x1Top = xMid + (t1 - 0.5) * topW;
        const x0Bot = xMid + (t0 - 0.5) * w;
        const x1Bot = xMid + (t1 - 0.5) * w;
        ctx.fillStyle = "rgba(255,255,255,0.045)";
        ctx.beginPath();
        ctx.moveTo(x0Top, topY);
        ctx.lineTo(x1Top, topY);
        ctx.lineTo(x1Bot, h);
        ctx.lineTo(x0Bot, h);
        ctx.closePath();
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xMid - topW / 2, topY);
      ctx.lineTo(0, h);
      ctx.moveTo(xMid + topW / 2, topY);
      ctx.lineTo(w, h);
      ctx.moveTo(xMid, topY);
      ctx.lineTo(xMid, h);
      const midY = (topY + h) / 2;
      ctx.moveTo(xMid + w * 0.1, midY);
      ctx.ellipse(xMid, midY, w * 0.1, w * 0.055, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w * 0.3, h * 0.9, w * 0.4, h * 0.1 - 2);
      ctx.strokeRect(w * 0.4, h * 0.945, w * 0.2, h * 0.055);

      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2.5;
      const gx = xMid;
      const gy = topY;
      ctx.beginPath();
      ctx.moveTo(gx - 20, gy - 42);
      ctx.lineTo(gx - 20, gy);
      ctx.moveTo(gx + 20, gy - 42);
      ctx.lineTo(gx + 20, gy);
      ctx.moveTo(gx - 20, gy - 42);
      ctx.lineTo(gx + 20, gy - 42);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 0.8;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(gx - 20, gy - 42 + (i * 42) / 4);
        ctx.lineTo(gx + 20, gy - 42 + (i * 42) / 4);
        ctx.stroke();
      }
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(gx - 20 + (i * 40) / 3, gy - 42);
        ctx.lineTo(gx - 20 + (i * 40) / 3, gy);
        ctx.stroke();
      }
    };

    /** Draw a player with feet at origin (caller applies translate/scale). */
    const drawPlayer = (
      facing: number,
      phase: number,
      mode: Mode,
      t: number,
      p: PState
    ) => {
      const skin = p.skin;
      const jersey = p.jersey;
      const shorts = p.shorts;
      const hair = p.hair;

      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.38)";
      ctx.beginPath();
      ctx.ellipse(0, 2, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // dance / idle bounce
      const bounce =
        mode === "dance"
          ? Math.abs(Math.sin(t * 3.2 + p.danceSeed)) * 6
          : mode === "idle"
            ? Math.abs(Math.sin(t * 2 + p.danceSeed)) * 2
            : 0;
      ctx.save();
      ctx.translate(0, -bounce);

      // legs
      const legSwing =
        mode === "dance"
          ? Math.sin(t * 4.2 + p.danceSeed) * 16
          : mode === "idle"
            ? Math.sin(t * 2.4 + p.danceSeed) * 3
            : Math.sin(phase) * 15;
      ctx.strokeStyle = shorts;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      const hipY = -26;
      for (const s of [-1, 1]) {
        const footX = s * legSwing * facing;
        const footY = 0;
        ctx.beginPath();
        ctx.moveTo(0, hipY);
        ctx.quadraticCurveTo(s * 7 * facing, hipY + 9, footX, footY);
        ctx.stroke();
        ctx.fillStyle = "#111827";
        ctx.beginPath();
        ctx.ellipse(footX + facing * 5, footY, 5.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // torso
      ctx.fillStyle = jersey;
      ctx.beginPath();
      ctx.moveTo(-9 * facing, hipY);
      ctx.lineTo(9 * facing, hipY);
      ctx.lineTo(12 * facing, hipY - 22);
      ctx.lineTo(-12 * facing, hipY - 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "bold 10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.number, 0, hipY - 8);

      // arms
      const shoulderY = hipY - 20;
      ctx.strokeStyle = jersey;
      ctx.lineWidth = 4.5;
      for (const s of [-1, 1]) {
        const shX = s * 10 * facing;
        if (mode === "dance") {
          const up = Math.PI / 2 - 0.35 + Math.sin(t * 6 + s + p.danceSeed) * 0.3;
          ctx.beginPath();
          ctx.moveTo(shX, shoulderY);
          ctx.lineTo(shX + Math.cos(up) * s * 16, shoulderY - Math.sin(up) * 16);
          ctx.stroke();
          ctx.fillStyle = skin;
          ctx.beginPath();
          ctx.arc(shX + Math.cos(up) * s * 16, shoulderY - Math.sin(up) * 16, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (mode === "idle" && s === -1) {
          // cheer: one arm waving up
          const wave = Math.sin(t * 5 + p.danceSeed) * 0.35;
          const up = Math.PI / 2 - 0.25 + wave;
          ctx.beginPath();
          ctx.moveTo(shX, shoulderY);
          ctx.lineTo(shX + Math.cos(up) * s * 16, shoulderY - Math.sin(up) * 16);
          ctx.stroke();
          ctx.fillStyle = skin;
          ctx.beginPath();
          ctx.arc(shX + Math.cos(up) * s * 16, shoulderY - Math.sin(up) * 16, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const a = Math.sin(phase + Math.PI) * 0.6 * s;
          ctx.beginPath();
          ctx.moveTo(shX, shoulderY);
          ctx.quadraticCurveTo(shX + Math.sin(a) * 10 * facing, shoulderY + 10, shX + Math.sin(a) * 18 * facing, shoulderY + 16);
          ctx.stroke();
        }
      }

      // head
      const headY = hipY - 30;
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0, headY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.arc(0, headY - 2, 7.5, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, headY - 0.5, 7.5, Math.PI * 0.62, Math.PI * 1.38);
      ctx.stroke();

      ctx.restore();
    };

    /** Draw a ball at origin with scale applied by caller. */
    const drawBall = (squash: number) => {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 6, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, 0, 7 + squash * 1.4, 7 - squash, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5, 1);
      ctx.lineTo(5, -1);
      ctx.moveTo(0, -5);
      ctx.lineTo(0, 5);
      ctx.moveTo(-4, -3);
      ctx.lineTo(4, 3);
      ctx.stroke();
      ctx.fillStyle = "#1f2937";
      ctx.beginPath();
      ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

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
          // spawn musical notes while singing
          p.noteTimer += dt;
          if (p.noteTimer > 0.28 && notes.length < 60) {
            p.noteTimer = 0;
            notes.push({
              x: p.x + (Math.random() - 0.5) * 30 * p.scale,
              y: p.yFrac * h - 96 * p.scale,
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
      drawSky(t);
      drawStands(t);

      const shift = (pointer.x - 0.5) * 14;
      ctx.save();
      ctx.translate(shift, 0);
      drawPitch();

      // players sorted far → near for correct depth overlap
      const sorted = [...players].sort((a, b) => a.yFrac - b.yFrac);
      for (const p of sorted) {
        const feetY = p.yFrac * h;
        ctx.save();
        ctx.translate(p.x, feetY);
        ctx.scale(p.scale, p.scale);

        // ball behaviour per mode
        if (p.hasBall) {
          if (p.mode === "walk" || p.mode === "sprint") {
            const b = Math.abs(Math.sin(p.phase * 2.2)) * 6;
            ctx.save();
            ctx.translate(-p.facing * 20, -b);
            ctx.scale(p.scale, p.scale);
            drawBall(Math.abs(Math.sin(t * 6)) * 0.35);
            ctx.restore();
          } else if (p.mode === "juggle") {
            const b = Math.abs(Math.sin(t * 5.5 + p.danceSeed)) * 58;
            ctx.save();
            ctx.translate(p.facing * 8, -10 - b);
            ctx.scale(p.scale, p.scale);
            drawBall(0.2);
            ctx.restore();
          } else {
            // idle / dance: ball resting, gentle bob
            ctx.save();
            ctx.translate(p.facing * 8, -6 + Math.sin(t * 3 + p.danceSeed) * 1.5);
            ctx.scale(p.scale, p.scale);
            drawBall(0.1);
            ctx.restore();
          }
        }

        drawPlayer(p.facing, p.phase, p.mode, t, p);
        ctx.restore();
      }

      // floating musical notes (world coords)
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
        ctx.font = `${14 + n.life * 10}px serif`;
        ctx.textAlign = "center";
        ctx.fillText(n.glyph, n.x, n.y);
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      const t = 3;
      ctx.clearRect(0, 0, w, h);
      drawSky(t);
      drawStands(t);
      drawPitch();
      for (const p of players) {
        ctx.save();
        ctx.translate(p.x, p.yFrac * h);
        ctx.scale(p.scale, p.scale);
        drawPlayer(p.facing, 0, "walk", t, p);
        ctx.restore();
      }
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
