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

// Real flight image — AI-generated glowing glass paper plane, keyed to a
// transparent cutout and bundled locally (public/images/plane-cutout.png).
const PLANE_SRC = "/images/plane-cutout.png";

/**
 * Premium cursor flight — a glowing flight image chases the cursor with
 * spring physics, banks into the direction of travel, and leaves a trail of
 * glowing particles + sparkles behind it. Pure canvas, pointer-events-none,
 * respects prefers-reduced-motion.
 */
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const plane = new Image();
    plane.src = PLANE_SRC;

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
    let angle = 0; // plane heading (radians)
    let fade = 1; // fade out when cursor leaves

    const hues = [258, 190, 320, 45]; // violet, cyan, pink, amber

    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      fade = 1;
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
      // fade out after cursor leaves the window
      if (!active) {
        fade -= 0.06;
        if (fade <= 0) {
          raf = 0;
          ctx.clearRect(0, 0, w, h);
          return;
        }
      }

      const m = mouse;
      const prevX = m.x;
      const prevY = m.y;
      // spring-like chase
      m.x += (m.tx - m.x) * 0.26;
      m.y += (m.ty - m.y) * 0.26;

      const now = performance.now();
      const dx = m.x - last.x;
      const dy = m.y - last.y;
      const dist = Math.hypot(dx, dy);

      // heading: face the direction of travel (image points right = 0 rad)
      if (dist > 1.5) {
        const target = Math.atan2(dy, dx);
        let diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        angle += diff * 0.22;
      }

      // speed → slight scale boost for flight feel
      const speed = Math.hypot(m.x - prevX, m.y - prevY);
      const scale = active ? 1 + Math.min(0.25, speed * 0.012) : 1;

      // emit trail particles while moving
      if (active && dist > 0.8 && now - lastEmit > 14) {
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

      // trail particles
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

      // ---- flight image ----
      if (plane.complete && plane.naturalWidth > 0) {
        // maintain the image's aspect ratio; ~46px tall at 1x
        const aspect = plane.naturalWidth / plane.naturalHeight;
        const hh = 46 * scale * fade;
        const hw = hh * aspect;
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(angle);
        // glow pass under the plane
        ctx.shadowBlur = 22;
        ctx.shadowColor = "rgba(139,92,246,0.9)";
        ctx.drawImage(plane, -hw / 2, -hh / 2, hw, hh);
        ctx.restore();
        ctx.shadowBlur = 0;
        // subtle bloom pass (additive) for a luminous neon feel
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.22 * fade;
        ctx.translate(m.x, m.y);
        ctx.rotate(angle);
        ctx.drawImage(plane, -hw / 2, -hh / 2, hw, hh);
        ctx.restore();
        ctx.globalAlpha = 1;
      } else {
        // fallback while the image loads — small glowing dot
        ctx.beginPath();
        ctx.arc(m.x, m.y, 4 * fade, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(167,139,250,0.9)";
        ctx.fill();
      }

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
