import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  hue: number;
  sparkle: boolean;
}

/**
 * Premium cursor trail — a comet head chases the mouse with spring-like
 * smoothing while a trail of glowing particles flies behind it.
 * Pure canvas, pointer-events-none, respects prefers-reduced-motion.
 */
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

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

    const mouse = { x: -200, y: -200, tx: -200, ty: -200 };
    const last = { x: -200, y: -200 };
    const particles: Particle[] = [];
    let raf = 0;
    let active = false;
    let lastEmit = 0;

    const hues = [258, 190, 320, 45]; // violet, cyan, pink, amber

    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      if (!active) {
        active = true;
        last.x = mouse.x = mouse.tx;
        last.y = mouse.y = mouse.ty;
        loop();
      }
    };
    const onLeave = () => {
      active = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    const drawSparkle = (x: number, y: number, size: number, hue: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(performance.now() / 900);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * size * 0.35, Math.sin(a + Math.PI / 4) * size * 0.35);
      }
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue}, 95%, 75%, ${alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${hue}, 95%, 65%, ${alpha})`;
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      if (!active) {
        raf = 0;
        ctx.clearRect(0, 0, w, h);
        return;
      }
      const m = mouse;
      // smooth chase — spring-like lerp
      m.x += (m.tx - m.x) * 0.22;
      m.y += (m.ty - m.y) * 0.22;

      const now = performance.now();
      const dx = m.x - last.x;
      const dy = m.y - last.y;
      const dist = Math.hypot(dx, dy);

      // emit a trail of particles while moving
      if (dist > 0.8 && now - lastEmit > 14) {
        const count = Math.min(3, 1 + Math.floor(dist / 5));
        for (let i = 0; i < count; i++) {
          const t = i / count;
          particles.push({
            x: last.x + dx * t + (Math.random() - 0.5) * 3,
            y: last.y + dy * t + (Math.random() - 0.5) * 3,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 - 0.12,
            life: 1,
            size: 1.4 + Math.random() * 2.4,
            hue: hues[Math.floor(Math.random() * hues.length)]!,
            sparkle: Math.random() < 0.16,
          });
        }
        last.x = m.x;
        last.y = m.y;
        lastEmit = now;
      }

      ctx.clearRect(0, 0, w, h);

      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        if (p.sparkle) {
          drawSparkle(p.x, p.y, p.size * p.life * 1.6, p.hue, p.life * 0.85);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${p.life * 0.75})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `hsla(${p.hue}, 95%, 65%, ${p.life})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // comet head — glowing orb chasing the cursor
      const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 22);
      glow.addColorStop(0, "rgba(255,255,255,0.95)");
      glow.addColorStop(0.25, "rgba(167,139,250,0.55)");
      glow.addColorStop(1, "rgba(167,139,250,0)");
      ctx.beginPath();
      ctx.arc(m.x, m.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(m.x, m.y, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#a78bfa";
      ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(loop);
    };

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      particles.length = 0;
      ctx.clearRect(0, 0, w, h);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[95]"
    />
  );
}
