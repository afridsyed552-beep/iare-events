import { useEffect, useRef } from "react";

/**
 * LiveGround — an always-animating football stadium scene rendered on canvas.
 * A player walks, dribbles, juggles, sings and dances on the pitch, with a
 * bouncing football, floating musical notes, cheering crowd, floodlights and
 * a dusk sky. It runs continuously, so the background is "live".
 */

type Mode = "walk" | "juggle" | "dance" | "sprint";

interface Note {
  x: number;
  y: number;
  life: number;
  glyph: string;
  seed: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  tw: number;
}

const CROWD_COLORS = [
  "#a78bfa", "#22d3ee", "#f472b6", "#fbbf24", "#34d399", "#f87171", "#818cf8", "#e879f9",
];
const NOTES = ["♪", "♫", "♩", "♬"];

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

    const pointer = { x: 0.5, y: 0.5 };
    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX / w;
      pointer.y = e.clientY / h;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const anim = { phase: 0, noteTimer: 0 };
    const notes: Note[] = [];
    let raf = 0;
    let last = performance.now();

    const modeAt = (t: number): Mode => {
      const m = t % 18;
      if (m < 5) return "walk";
      if (m < 8.5) return "juggle";
      if (m < 14) return "dance";
      return "sprint";
    };

    // ---- drawing helpers ----
    const drawSky = (t: number) => {
      const g = ctx.createLinearGradient(0, 0, 0, h * 0.56);
      g.addColorStop(0, "#05050d");
      g.addColorStop(0.5, "#181038");
      g.addColorStop(1, "#3b1d78");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h * 0.58);

      // stars
      for (const s of stars) {
        const a = 0.25 + 0.35 * Math.abs(Math.sin(t * 0.7 + s.tw));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#e0e7ff";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // moon
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

      // drifting clouds
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
      // band of stands behind the pitch
      const y0 = h * 0.4;
      const y1 = h * 0.52;
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, "#171033");
      g.addColorStop(1, "#251545");
      ctx.fillStyle = g;
      ctx.fillRect(0, y0, w, y1 - y0);

      // crowd dots
      for (const c of crowd) {
        const flick = 0.75 + 0.25 * Math.abs(Math.sin(t * 1.4 + c.x * 40 + c.y * 90));
        ctx.globalAlpha = flick;
        ctx.fillStyle = c.c;
        ctx.fillRect(c.x * w, c.y * h, Math.max(2, w * 0.006), Math.max(2, w * 0.006));
      }
      ctx.globalAlpha = 1;

      // floodlights
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
        // light cone
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
        // lamp glow
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

      // base turf
      ctx.fillStyle = "#0c5c34";
      ctx.beginPath();
      ctx.moveTo(xMid - topW / 2, topY);
      ctx.lineTo(xMid + topW / 2, topY);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // mow stripes (perspective trapezoids)
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

      // pitch lines
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      // touchlines
      ctx.beginPath();
      ctx.moveTo(xMid - topW / 2, topY);
      ctx.lineTo(0, h);
      ctx.moveTo(xMid + topW / 2, topY);
      ctx.lineTo(w, h);
      // halfway
      ctx.moveTo(xMid, topY);
      ctx.lineTo(xMid, h);
      // center circle
      const midY = (topY + h) / 2;
      ctx.moveTo(xMid + w * 0.1, midY);
      ctx.ellipse(xMid, midY, w * 0.1, w * 0.055, 0, 0, Math.PI * 2);
      ctx.stroke();

      // penalty box (viewer side, stylized)
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w * 0.3, h * 0.9, w * 0.4, h * 0.1 - 2);
      ctx.strokeRect(w * 0.4, h * 0.945, w * 0.2, h * 0.055);

      // far goal
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
      // net
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

    const drawPlayer = (
      x: number,
      feetY: number,
      facing: number,
      phase: number,
      mode: Mode,
      t: number
    ) => {
      const skin = "#f2c094";
      const jersey = "#8b5cf6";
      const shorts = "#1e1b4b";
      const hair = "#3f2d20";
      const sock = "#ffffff";

      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.38)";
      ctx.beginPath();
      ctx.ellipse(x, feetY, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // dance bounce
      const bounce = mode === "dance" ? Math.abs(Math.sin(t * 3.2)) * 5 : 0;
      const py = feetY - bounce;

      // legs
      const legSwing = mode === "dance" ? Math.sin(t * 4.2) * 16 : Math.sin(phase) * 15;
      ctx.strokeStyle = shorts;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      const hipY = py - 26;
      for (const s of [-1, 1]) {
        const footX = x + s * legSwing * facing;
        const footY = py;
        ctx.beginPath();
        ctx.moveTo(x, hipY);
        ctx.quadraticCurveTo(x + s * 7 * facing, hipY + 9, footX, footY);
        ctx.stroke();
        // shoe
        ctx.fillStyle = "#111827";
        ctx.beginPath();
        ctx.ellipse(footX + facing * 5, footY, 5.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // torso (jersey)
      ctx.fillStyle = jersey;
      ctx.beginPath();
      ctx.moveTo(x - 9 * facing, hipY);
      ctx.lineTo(x + 9 * facing, hipY);
      ctx.lineTo(x + 12 * facing, hipY - 22);
      ctx.lineTo(x - 12 * facing, hipY - 22);
      ctx.closePath();
      ctx.fill();
      // jersey number
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "bold 10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("10", x, hipY - 8);

      // arms
      const shoulderY = hipY - 20;
      const armSwing = mode === "dance" ? Math.sin(t * 4.2 + Math.PI) * 0.9 : Math.sin(phase + Math.PI) * 0.6;
      ctx.strokeStyle = jersey;
      ctx.lineWidth = 4.5;
      for (const s of [-1, 1]) {
        const shX = x + s * 10 * facing;
        if (mode === "dance") {
          // arms up, waving
          const up = Math.PI / 2 - 0.35 + Math.sin(t * 6 + s) * 0.25;
          ctx.beginPath();
          ctx.moveTo(shX, shoulderY);
          ctx.lineTo(shX + Math.cos(up) * s * 16, shoulderY - Math.sin(up) * 16);
          ctx.stroke();
          // hand
          ctx.fillStyle = skin;
          ctx.beginPath();
          ctx.arc(shX + Math.cos(up) * s * 16, shoulderY - Math.sin(up) * 16, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const a = armSwing * s;
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
      ctx.arc(x, headY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      // hair
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.arc(x, headY - 2, 7.5, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      // headband (sporty)
      ctx.strokeStyle = sock;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, headY - 0.5, 7.5, Math.PI * 0.62, Math.PI * 1.38);
      ctx.stroke();
    };

    const drawBall = (x: number, y: number, squash = 0) => {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(x, y + 6, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(x, y, 7 + squash * 1.4, 7 - squash, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 1);
      ctx.lineTo(x + 5, y - 1);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.moveTo(x - 4, y - 3);
      ctx.lineTo(x + 4, y + 3);
      ctx.stroke();
      ctx.fillStyle = "#1f2937";
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const mode = modeAt(t);

      // phase accumulates for walk cycles
      anim.phase += dt * (mode === "sprint" ? 13 : mode === "walk" ? 8 : mode === "dance" ? 5 : 3);

      ctx.clearRect(0, 0, w, h);
      drawSky(t);
      drawStands(t);

      // mouse parallax on the pitch layer
      const shift = (pointer.x - 0.5) * 14;
      ctx.save();
      ctx.translate(shift, 0);

      drawPitch();

      // player motion
      const local = t % 18;
      let px = w * 0.5;
      let py = h * 0.8;
      let facing = 1;
      let ballX = px;
      let ballY = py;
      let ballBounce = 0;

      if (mode === "walk" || mode === "sprint") {
        const u = local / (mode === "walk" ? 5 : 4);
        const start = mode === "walk" ? w * 0.16 : w * 0.82;
        const end = mode === "walk" ? w * 0.82 : w * 0.16;
        px = start + (end - start) * (1 - Math.cos(u * Math.PI)) / 2;
        facing = u < 0.5 ? 1 : -1;
        const ph = anim.phase;
        ballBounce = Math.abs(Math.sin(ph * 2.2)) * 6;
        ballX = px - facing * 20;
        ballY = py - ballBounce;
      } else if (mode === "juggle") {
        px = w * 0.82;
        facing = -1;
        const b = Math.abs(Math.sin(t * 5.5));
        ballX = px + facing * 8;
        ballY = py - 8 - b * 58;
      } else {
        // dance
        px = w * 0.82 + Math.sin(t * 2.4) * w * 0.05;
        facing = Math.cos(t * 2.4) >= 0 ? 1 : -1;
        ballX = px - facing * 34;
        ballY = py;
        // spawn musical notes while singing/dancing
        anim.noteTimer += dt;
        if (anim.noteTimer > 0.24 && notes.length < 40) {
          anim.noteTimer = 0;
          notes.push({
            x: px + (Math.random() - 0.5) * 40,
            y: py - 96,
            life: 1,
            glyph: NOTES[Math.floor(Math.random() * NOTES.length)]!,
            seed: Math.random() * Math.PI * 2,
          });
        }
      }

      drawBall(ballX, ballY, Math.abs(Math.sin(t * 6)) * 0.35);
      drawPlayer(px, py, facing, anim.phase, mode, t);

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
        ctx.fillStyle = n.seed % 2 < 1 ? "#e879f9" : "#67e8f9";
        ctx.font = `${16 + n.life * 10}px serif`;
        ctx.textAlign = "center";
        ctx.fillText(n.glyph, n.x, n.y);
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      // static single frame for reduced-motion users
      const t = 3;
      ctx.clearRect(0, 0, w, h);
      drawSky(t);
      drawStands(t);
      drawPitch();
      drawBall(w * 0.5 - 20, h * 0.8, 0);
      drawPlayer(w * 0.5, h * 0.8, 1, 0, "walk", t);
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
