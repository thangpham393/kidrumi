// Small self-contained celebration helpers: confetti + kid-friendly sounds.
// No external libraries or asset files — confetti is drawn on a throwaway
// canvas and sounds are synthesized with the Web Audio API.

let audioCtx: AudioContext | null = null;

function getAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  // Browsers start the context suspended until a user gesture — pressing a
  // keypad button counts, so resuming here is safe.
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

/** Happy ascending arpeggio for a correct answer. */
export function playSuccess() {
  const ac = getAudio();
  if (!ac) return;
  const now = ac.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = now + i * 0.09;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/** Gentle descending "oops" for a wrong answer — soft, not harsh. */
export function playWrong() {
  const ac = getAudio();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(311.13, now); // Eb4
  osc.frequency.exponentialRampToValueAtTime(196, now + 0.25); // → G3
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.36);
}

const CONFETTI_COLORS = [
  "#8a7bf5",
  "#ffd23f",
  "#4caf7d",
  "#ff6b6b",
  "#4d9eff",
  "#ff9f43",
];

/** Burst of confetti flying out from (originX, originY) then falling. */
export function confettiBurst(originX?: number, originY?: number) {
  if (typeof document === "undefined") return;
  // Respect users who prefer reduced motion.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const W = window.innerWidth;
  const H = window.innerHeight;
  const ox = originX ?? W / 2;
  const oy = originY ?? H / 3;
  const dpr = window.devicePixelRatio || 1;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  document.body.appendChild(canvas);

  const N = 96;
  const parts = Array.from({ length: N }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6, // bias upward for a "pop"
      size: 6 + Math.random() * 7,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.32,
    };
  });

  const gravity = 0.22;
  const start = performance.now();
  let raf = 0;

  const frame = (now: number) => {
    ctx.clearRect(0, 0, W, H);
    const life = (now - start) / 1500;
    let alive = false;
    for (const p of parts) {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      if (life < 1 && p.y < H + 40) alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (alive) {
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(frame);
}
