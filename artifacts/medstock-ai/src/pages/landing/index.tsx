import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, animate as animateValue, useInView } from "framer-motion";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  cream:      "#F7F6F1",
  creamDark:  "#EEECEA",
  midnight:   "#07060D",   // near-black, slight warm undertone
  navy:       "#0D0C18",
  gold:       "#C8922A",   // champagne gold — primary accent
  goldLight:  "#D4A840",   // warm gold highlight
  goldDim:    "#8A6318",   // muted gold for secondary elements
  borderLight:"#E0DDD6",
  borderDark: "rgba(255,255,255,0.07)",
  borderGold: "rgba(200,146,42,0.18)",
  textDark:   "#0D1526",
  textMid:    "#4A5268",
  textLight:  "#EDE6DC",   // warm cream
  textDimDark:"rgba(237,230,220,0.45)",
};

// ─── Typography helpers ───────────────────────────────────────────────────────
const SERIF: React.CSSProperties = {
  fontFamily: "'DM Serif Display', Georgia, serif",
  fontStyle: "italic",
  fontWeight: 400,
};
const SANS: React.CSSProperties = {
  fontFamily: "Syne, sans-serif",
  fontWeight: 700,
  fontStyle: "normal",
};
const BODY: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontStyle: "normal",
};
// Sleek condensed font for heroic metric numbers (67%, $2.8B, 4.2×, etc.)
const NUM: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontStyle: "normal",
  fontWeight: 700,
  letterSpacing: "-0.02em",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7, ease, delay },
});
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7, ease, delay },
});

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

// ─── Count-up hook (spring-like easing, triggers once on scroll into view) ────
function useCountUp(target: number, inView: boolean, duration = 1.9) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animateValue(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => ctrl.stop();
  }, [inView]);
  return val;
}

// ─── Page scroll-progress bar (gold line at top) ─────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2,
        transformOrigin: "0%", scaleX: scrollYProgress,
        background: `linear-gradient(to right, ${C.gold}, ${C.goldLight})`,
        zIndex: 200, pointerEvents: "none",
      }}
    />
  );
}

// ─── Word-by-word reveal (clip + slide from below) ────────────────────────────
function WordReveal({ text, delay = 0, style }: { text: string; delay?: number; style?: React.CSSProperties }) {
  const words = text.split(" ");
  return (
    <span style={{ display: "inline" }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
          <motion.span
            initial={{ y: "110%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.07 }}
            style={{ display: "inline-block", ...style }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

// ─── Hero inline metric (counts up on mount with spring easing) ───────────────
function HeroMetric({ num, prefix, suffix, decimals, label, bg, br }: {
  num: number; prefix: string; suffix: string; decimals: number;
  label: string; bg: string; br: string;
}) {
  const [go, setGo] = useState(false);
  const count = useCountUp(num, go, 1.6);
  useEffect(() => { const t = setTimeout(() => setGo(true), 700); return () => clearTimeout(t); }, []);
  return (
    <div style={{ flex: 1, padding: "14px 16px", background: bg, borderRight: br, textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(22px, 2.6vw, 30px)", fontWeight: 700, color: C.gold, lineHeight: 1 }}>
        {prefix}{count.toFixed(decimals)}{suffix}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: "rgba(237,230,220,0.35)", marginTop: 5, lineHeight: 1.3 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Magnetic button (moves slightly toward cursor) ───────────────────────────
function MagneticBtn({ onClick, style, className, children }: {
  onClick?: () => void; style?: React.CSSProperties; className?: string; children: React.ReactNode;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.14, y: (e.clientY - r.top - r.height / 2) * 0.14 });
  };
  return (
    <motion.button
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      style={style}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ─── AI Typing effect (hero headline cycles through crisis words) ─────────────
const TYPED_WORDS = ["chaos.", "stockouts.", "emergencies.", "crises.", "delays.", "waste."];

function TypedWord() {
  const [wordIdx, setWordIdx] = useState(0);
  const [chars, setChars] = useState(TYPED_WORDS[0].length);
  const [phase, setPhase] = useState<"typing" | "paused" | "deleting">("paused");

  useEffect(() => {
    const word = TYPED_WORDS[wordIdx];

    if (phase === "paused") {
      const t = setTimeout(() => setPhase("deleting"), 2500);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (chars === 0) {
        setWordIdx((w) => (w + 1) % TYPED_WORDS.length);
        setPhase("typing");
        return;
      }
      const t = setTimeout(() => setChars((c) => c - 1), 38 + Math.random() * 18);
      return () => clearTimeout(t);
    }

    // typing
    if (chars < word.length) {
      const t = setTimeout(() => setChars((c) => c + 1), 68 + Math.random() * 48);
      return () => clearTimeout(t);
    }
    setPhase("paused");
    return undefined;
  }, [phase, chars, wordIdx]);

  return (
    <span style={{ display: "inline" }}>
      {TYPED_WORDS[wordIdx].slice(0, chars)}
      <span
        className="lp-cursor-blink"
        style={{
          display: "inline-block",
          width: "0.055em",
          height: "0.78em",
          background: C.gold,
          marginLeft: "0.08em",
          verticalAlign: "middle",
          borderRadius: 1,
        }}
      />
    </span>
  );
}

// ─── Feature card with 3D tilt + cursor-glow ─────────────────────────────────
function FeatureCard({ f, i, borderStyle }: {
  f: { title: string; desc: string; accent: string; icon: React.ReactNode };
  i: number;
  borderStyle: React.CSSProperties;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const [hovered, setHovered] = useState(false);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    setTilt({ rx: (ny - 0.5) * -7, ry: (nx - 0.5) * 7, gx: nx * 100, gy: ny * 100 });
  };
  const onLeave = () => { setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 }); setHovered(false); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 + 0.1 }}
      className="lp-feat-cell"
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      style={{
        ...borderStyle,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: hovered ? "transform 0.1s ease" : "transform 0.55s ease",
        background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, ${f.accent}12 0%, transparent 65%)`,
        willChange: "transform",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${f.accent}18`, color: f.accent,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
        boxShadow: hovered ? `0 0 20px ${f.accent}35` : "none",
        transition: "box-shadow 0.25s ease",
      }}>
        {f.icon}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, fontWeight: 600, color: "rgba(255,255,255,0.88)", marginBottom: 10, letterSpacing: "-0.01em" }}>
        {f.title}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: "rgba(237,230,220,0.45)", lineHeight: 1.65 }}>
        {f.desc}
      </div>
      {/* Accent bar at bottom that appears on hover */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${f.accent}, transparent)`, transformOrigin: "center", borderRadius: 1 }}
      />
    </motion.div>
  );
}

// ─── Particle Field (hero floating gold dust) ─────────────────────────────────
const PARTICLE_DATA = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  x: (i * 137.508) % 100,
  y: (i * 97.31) % 100,
  size: 1.1 + (i % 5) * 0.65,
  delay: (i * 0.43) % 5.5,
  dur: 6 + (i % 4) * 2.8,
  maxOpacity: 0.04 + (i % 6) * 0.035,
  colorIdx: i % 3,
}));
function ParticleField() {
  const colors = [C.gold, C.textLight, C.goldLight];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
      {PARTICLE_DATA.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: colors[p.colorIdx],
            willChange: "transform, opacity",
          }}
          animate={{ y: [-6, -44, -6], opacity: [0, p.maxOpacity, 0], scale: [0.4, 1, 0.4] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Ambient orbs (slow-drifting glow for dark sections) ──────────────────────
function AmbientOrbs() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <motion.div
        animate={{ x: [0, 28, 0], y: [0, -22, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-10%", left: "-8%", width: "55%", height: "75%",
          background: `radial-gradient(ellipse at 40% 45%, ${C.gold}0C 0%, transparent 65%)`,
          filter: "blur(64px)" }}
      />
      <motion.div
        animate={{ x: [0, -22, 0], y: [0, 18, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "48%", height: "62%",
          background: `radial-gradient(ellipse at 60% 55%, rgba(180,100,20,0.09) 0%, transparent 65%)`,
          filter: "blur(56px)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        style={{ position: "absolute", top: "32%", right: "8%", width: "30%", height: "42%",
          background: `radial-gradient(ellipse at 50% 50%, ${C.gold}07 0%, transparent 70%)`,
          filter: "blur(48px)" }}
      />
    </div>
  );
}

// ─── Label ───────────────────────────────────────────────────────────────────
function Label({ children, dark }: { children: string; dark?: boolean }) {
  return (
    <p
      style={{
        ...BODY,
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: dark ? "rgba(255,255,255,0.35)" : C.textMid,
        marginBottom: "18px",
      }}
    >
      {children}
    </p>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function HR({ dark }: { dark?: boolean }) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `1px solid ${dark ? C.borderDark : C.borderLight}`,
        margin: 0,
      }}
    />
  );
}

function useLandingTheme() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "light";
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ onDemo }: { onDemo: () => void }) {
  const isLight = useLandingTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const links = ["Platform", "Features", "Pricing", "Customers"];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled || menuOpen ? (isLight ? "rgba(250,248,244,0.96)" : "rgba(7,6,13,0.96)") : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(18px)" : "none",
          borderBottom: scrolled || menuOpen ? `1px solid ${isLight ? C.borderLight : C.borderDark}` : "none",
          transition: "background 0.35s, backdrop-filter 0.35s, border 0.35s",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between" style={{ padding: "16px 20px" }}>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <motion.div
              initial={{ scale: 0.5, rotate: -24, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              style={{
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: scrolled ? `0 0 0 1.5px ${C.gold}55, 0 0 16px ${C.gold}28` : `0 0 0 0px transparent`,
                transition: "box-shadow 0.45s ease",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12.5 4.25V10.75L7 14L1.5 10.75V4.25L7 1Z" stroke="white" strokeWidth="1.4" />
                <path d="M7 4.5V9.5M4.5 7H9.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
              style={{ ...SANS, fontSize: 15, color: isLight ? C.textDark : "#fff", letterSpacing: "-0.01em" }}
            >
              MedStock
              <motion.span animate={{ color: scrolled ? C.goldLight : C.gold }} transition={{ duration: 0.4 }} style={{ color: C.gold }}>AI</motion.span>
            </motion.span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                style={{ ...BODY, fontSize: 13, color: isLight ? C.textMid : "rgba(255,255,255,0.5)", textDecoration: "none" }}
                className="hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => navigate("/app")}
              style={{ ...BODY, fontSize: 13, color: isLight ? C.textMid : "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", padding: "6px 2px" }}
              className="hover:text-white transition-colors"
            >
              Sign in
            </button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onDemo}
              className="lp-nav-demo"
              style={{ ...BODY, fontSize: 13, fontWeight: 600, color: "#0A0810", background: C.gold, border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", letterSpacing: "-0.01em" }}
            >
              Book a demo
            </motion.button>
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onDemo}
              className="lp-nav-demo"
              style={{ ...BODY, fontSize: 12, fontWeight: 600, color: "#0A0810", background: C.gold, border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}
            >
              Book a demo
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{ background: "none", border: `1px solid ${isLight ? C.borderLight : C.borderDark}`, borderRadius: 8, cursor: "pointer", padding: "7px 9px", color: isLight ? C.textDark : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 5.5H15M3 9H15M3 12.5H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease }}
            className="fixed z-40 left-0 right-0 md:hidden"
            style={{
              top: 57,
              background: isLight ? "rgba(250,248,244,0.98)" : "rgba(7,6,13,0.98)",
              backdropFilter: "blur(24px)",
              borderBottom: `1px solid ${isLight ? C.borderLight : C.borderDark}`,
              padding: "4px 20px 20px",
            }}
          >
            {links.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                style={{ ...BODY, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 16, color: isLight ? C.textDark : "rgba(255,255,255,0.72)", padding: "14px 0", borderBottom: `1px solid ${isLight ? C.borderLight : "rgba(255,255,255,0.05)"}`, textDecoration: "none" }}
              >
                {item}
                <span style={{ color: isLight ? C.textMid : "rgba(255,255,255,0.2)", fontSize: 20, lineHeight: 1 }}>›</span>
              </a>
            ))}
            <button
              onClick={() => { navigate("/app"); setMenuOpen(false); }}
              style={{ ...BODY, display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", fontSize: 16, color: isLight ? C.textMid : "rgba(255,255,255,0.32)", padding: "14px 0 4px", background: "none", border: "none", cursor: "pointer" }}
            >
              Sign in
              <span style={{ fontSize: 20, lineHeight: 1 }}>›</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Hero floating data panel ────────────────────────────────────────────────
const SPARKLINE_POINTS = [40,55,38,62,45,70,52,80,60,88,65,72,90,78,95];
function Sparkline({ color }: { color: string }) {
  const w = 120, h = 36;
  const min = Math.min(...SPARKLINE_POINTS), max = Math.max(...SPARKLINE_POINTS);
  const pts = SPARKLINE_POINTS.map((v, i) => {
    const x = (i / (SPARKLINE_POINTS.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)" />
    </svg>
  );
}

function HeroVisual() {
  const items = [
    { drug: "Amoxicillin 500mg", status: "CRITICAL", pct: 11, color: "#D95F3B" },
    { drug: "Paracetamol IV 1g",  status: "ADEQUATE", pct: 74, color: "#7CAE7A" },
    { drug: "Insulin Glargine",   status: "LOW",      pct: 28, color: C.gold },
    { drug: "Ondansetron 4mg",    status: "ADEQUATE", pct: 81, color: "#7CAE7A" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 36, y: 16 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.65, ease, delay: 0.4 }}
      style={{ position: "relative", width: "100%", maxWidth: 440 }}
    >
      {/* Ambient gold glow */}
      <div style={{
        position: "absolute", top: "10%", left: "5%", right: "5%", bottom: "-5%",
        background: `radial-gradient(ellipse at 55% 50%, ${C.gold}1A 0%, transparent 68%)`,
        filter: "blur(48px)", pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Main inventory card ── */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "relative", zIndex: 1,
          background: "rgba(14,12,22,0.92)",
          border: `1px solid ${C.borderGold}`,
          borderRadius: 18,
          backdropFilter: "blur(28px)",
          overflow: "hidden",
          boxShadow: `0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(200,146,42,0.14)`,
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(200,146,42,0.09)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(200,146,42,0.03)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#D95F3B", display: "inline-block", boxShadow: "0 0 6px #D95F3B" }}
            />
            <span style={{ ...BODY, fontSize: 11, fontWeight: 700, color: "rgba(237,230,220,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Inventory Intelligence
            </span>
          </div>
          <span style={{ ...BODY, fontSize: 10, color: "rgba(237,230,220,0.18)", letterSpacing: "0.04em" }}>
            City General · Live
          </span>
        </div>

        {/* Stock rows */}
        <div style={{ padding: "10px 18px 6px" }}>
          {items.map((item, i) => (
            <motion.div
              key={item.drug}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.08, duration: 0.28, ease }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 0",
                borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, flexShrink: 0, boxShadow: `0 0 4px ${item.color}99` }} />
              <span style={{ ...BODY, fontSize: 12, color: "rgba(237,230,220,0.7)", flex: 1, letterSpacing: "-0.01em" }}>
                {item.drug}
              </span>
              <div style={{ width: 72, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, flexShrink: 0 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ delay: 0.65 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                  style={{ height: "100%", background: item.color, borderRadius: 2 }}
                />
              </div>
              <span style={{ ...SANS, fontSize: 11.5, fontWeight: 700, color: item.color, width: 30, textAlign: "right", letterSpacing: "-0.02em" }}>
                {item.pct}%
              </span>
            </motion.div>
          ))}
        </div>

        {/* AI alert */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.28 }}
          style={{
            margin: "4px 18px 16px",
            background: "linear-gradient(135deg, rgba(200,146,42,0.12), rgba(200,146,42,0.04))",
            border: "1px solid rgba(200,146,42,0.24)",
            borderRadius: 10, padding: "10px 12px",
            display: "flex", alignItems: "flex-start", gap: 9,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
            <path d="M7 1L8.5 5.5H13L9.5 8L10.75 12.5L7 10L3.25 12.5L4.5 8L1 5.5H5.5L7 1Z" fill={C.gold} />
          </svg>
          <div>
            <div style={{ ...BODY, fontSize: 10.5, fontWeight: 700, color: C.gold, marginBottom: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              AI Alert
            </div>
            <div style={{ ...BODY, fontSize: 11, color: "rgba(237,230,220,0.4)", lineHeight: 1.5 }}>
              Amoxicillin surge in 8 days — reorder 2,400 units now.
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Second card: AI Demand Forecast sparkline ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.35, ease }}
        animate-loop={{ y: [0, 5, 0] }}
        style={{
          marginTop: 12, position: "relative", zIndex: 1,
          background: "rgba(14,12,22,0.88)",
          border: "1px solid rgba(200,146,42,0.12)",
          borderRadius: 14,
          backdropFilter: "blur(20px)",
          padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div>
          <div style={{ ...BODY, fontSize: 10, color: "rgba(237,230,220,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            30-day demand forecast
          </div>
          <div style={{ ...NUM, fontSize: 22, fontWeight: 700, color: "#7CAE7A", lineHeight: 1 }}>
            +23.4%
          </div>
          <div style={{ ...BODY, fontSize: 10.5, color: "rgba(237,230,220,0.28)", marginTop: 2 }}>
            vs last cycle · 97.2% confidence
          </div>
        </div>
        <Sparkline color="#7CAE7A" />
      </motion.div>

      {/* Floating stat badge — top right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.25, ease }}
        style={{
          position: "absolute", top: -22, right: -18, zIndex: 3,
          background: "rgba(12,10,20,0.97)",
          border: `1px solid ${C.borderGold}`,
          borderRadius: 12, padding: "9px 13px",
          boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 0 1px ${C.borderGold}`,
          display: "flex", alignItems: "center", gap: 7,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 12L7 2M3 6L7 2L11 6" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <div style={{ ...NUM, fontSize: 17, color: C.gold, lineHeight: 1 }}>67%</div>
          <div style={{ ...BODY, fontSize: 9.5, color: "rgba(237,230,220,0.32)", marginTop: 1 }}>expiry losses cut</div>
        </div>
      </motion.div>

      {/* Floating stat badge — bottom left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.25, ease }}
        style={{
          position: "absolute", bottom: -22, left: -18, zIndex: 3,
          background: "rgba(12,10,20,0.97)",
          border: "1px solid rgba(124,174,122,0.28)",
          borderRadius: 12, padding: "9px 13px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", gap: 7,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7CAE7A", display: "inline-block", boxShadow: "0 0 5px #7CAE7A" }} />
        <div>
          <div style={{ ...NUM, fontSize: 17, color: "#7CAE7A", lineHeight: 1 }}>4.2×</div>
          <div style={{ ...BODY, fontSize: 9.5, color: "rgba(237,230,220,0.32)", marginTop: 1 }}>crisis response</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onDemo }: { onDemo: () => void }) {
  const [, navigate] = useLocation();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const [mouse, setMouse] = useState({ x: -400, y: -400 });

  return (
    <section
      ref={ref}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setMouse({ x: -400, y: -400 })}
      style={{
        background: C.midnight,
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* ── Layered background ── */}

      {/* Large warm gold ambient glow — right side */}
      <div style={{
        position: "absolute", top: "-10%", right: "-5%",
        width: "65%", height: "80%",
        background: `radial-gradient(ellipse at 70% 40%, ${C.gold}18 0%, ${C.gold}06 35%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Warm amber glow — bottom left */}
      <div style={{
        position: "absolute", bottom: "-5%", left: "-5%",
        width: "45%", height: "55%",
        background: `radial-gradient(ellipse at 30% 70%, rgba(180,100,20,0.08) 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />

      {/* Settled ambient glow — behind hero text (breathing, not overwhelming) */}
      <div
        className="lp-hero-glow"
        style={{
          position: "absolute",
          top: "12%",
          left: "4%",
          width: 480,
          height: 380,
          background: `radial-gradient(ellipse at 38% 50%, ${C.gold}12 0%, ${C.gold}05 45%, transparent 72%)`,
          filter: "blur(48px)",
          pointerEvents: "none",
          borderRadius: "50%",
        }}
      />

      {/* Floating particle field */}
      <ParticleField />

      {/* Interactive cursor glow */}
      <div style={{
        position: "absolute",
        pointerEvents: "none",
        left: 0, top: 0,
        width: 440, height: 440,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.gold}0E 0%, transparent 68%)`,
        filter: "blur(36px)",
        zIndex: 2,
        transform: `translate(${mouse.x - 220}px, ${mouse.y - 220}px)`,
        transition: "transform 0.09s linear",
        willChange: "transform",
      }} />

      {/* Subtle horizontal rule lines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(200,146,42,0.04) 79px, rgba(200,146,42,0.04) 80px)`,
      }} />

      {/* Very faint vertical lines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 119px, rgba(255,255,255,0.02) 119px, rgba(255,255,255,0.02) 120px)`,
      }} />

      {/* Content */}
      <motion.div style={{ y, opacity }} className="relative z-10 w-full">
        <div
          className="lp-hero-inner max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: text content ── */}
            <div>
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease, delay: 0.05 }}
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}
              >
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  background: "rgba(200,146,42,0.08)",
                  border: "1px solid rgba(200,146,42,0.22)",
                  borderRadius: 100, padding: "5px 13px 5px 8px",
                }}>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, display: "inline-block", boxShadow: `0 0 5px ${C.gold}` }}
                  />
                  <span style={{ ...BODY, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold }}>
                    Hospital Supply Chain Intelligence
                  </span>
                </div>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease, delay: 0.12 }}
                style={{ margin: "0 0 8px", lineHeight: 1.0, letterSpacing: "-0.03em" }}
              >
                <span style={{ ...SANS, fontSize: "clamp(44px, 5.6vw, 78px)", color: C.textLight, display: "block" }}>
                  Stop losing
                </span>
                <span style={{ ...SANS, fontSize: "clamp(44px, 5.6vw, 78px)", color: C.textLight, display: "block" }}>
                  millions to
                </span>
                <span style={{ ...SERIF, fontSize: "clamp(49px, 6.2vw, 86px)", color: C.gold, display: "block", lineHeight: 0.98 }}>
                  supply chain
                </span>
                <span style={{ ...SERIF, fontSize: "clamp(49px, 6.2vw, 86px)", color: C.gold, display: "block", lineHeight: 1.0 }}>
                  <TypedWord />
                </span>
              </motion.h1>

              {/* Accent tagline */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease, delay: 0.3 }}
                style={{ marginBottom: 22, marginTop: 16 }}
              >
                <span style={{ ...SANS, fontSize: "clamp(14px, 1.8vw, 20px)", color: "rgba(237,230,220,0.32)", letterSpacing: "-0.01em" }}>
                  — Precision AI eliminates that.
                </span>
              </motion.div>

              {/* Body */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease, delay: 0.38 }}
                style={{ ...BODY, fontSize: "clamp(14px, 1.5vw, 16px)", color: C.textDimDark, lineHeight: 1.75, maxWidth: 410, marginBottom: 32 }}
              >
                Real-time inventory visibility, predictive demand forecasts, and automated
                crisis coordination — before stockouts become emergencies.
              </motion.p>

              {/* Inline metrics row — counts up on mount */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease, delay: 0.46 }}
                style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 36, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(200,146,42,0.12)" }}
              >
                <HeroMetric num={67}  prefix="" suffix="%" decimals={0} label="Expiry loss reduction" bg="rgba(200,146,42,0.06)" br="1px solid rgba(200,146,42,0.1)" />
                <HeroMetric num={2.8} prefix="$" suffix="B" decimals={1} label="Wastage prevented"    bg="rgba(200,146,42,0.03)" br="1px solid rgba(200,146,42,0.1)" />
                <HeroMetric num={4.2} prefix="" suffix="×" decimals={1} label="Faster crisis response" bg="rgba(200,146,42,0.06)" br="none" />
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease, delay: 0.54 }}
                className="lp-cta-btns"
                style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 36 }}
              >
                <MagneticBtn
                  onClick={onDemo}
                  className="lp-btn-primary-pulse lp-btn-shimmer"
                  style={{
                    ...SANS,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#09070F",
                    background: `linear-gradient(135deg, ${C.goldLight} 0%, ${C.gold} 100%)`,
                    border: "none",
                    borderRadius: 10,
                    padding: "15px 30px",
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                    boxShadow: `0 4px 18px ${C.gold}28`,
                    minHeight: 48,
                  }}
                >
                  Book a demo
                </MagneticBtn>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => navigate("/app")}
                  className="lp-btn-outline"
                  style={{
                    ...BODY,
                    fontSize: 14,
                    color: "rgba(237,230,220,0.45)",
                    background: "transparent",
                    border: "1px solid rgba(237,230,220,0.1)",
                    borderRadius: 10,
                    padding: "15px 28px",
                    cursor: "pointer",
                    minHeight: 48,
                  }}
                >
                  Open live dashboard →
                </motion.button>
              </motion.div>

              {/* Compliance strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.68 }}
                style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 8 }}
              >
                {["HIPAA Compliant", "SOC 2 Type II", "ISO 27001", "HL7 FHIR"].map((s, i) => (
                  <React.Fragment key={s}>
                    {i > 0 && (
                      <span style={{ width: 1, height: 10, background: "rgba(255,255,255,0.08)", display: "inline-block", margin: "0 12px" }} />
                    )}
                    <span style={{ ...BODY, fontSize: 10.5, color: "rgba(237,230,220,0.2)", letterSpacing: "0.05em" }}>
                      {s}
                    </span>
                  </React.Fragment>
                ))}
              </motion.div>
            </div>

            {/* ── Right: floating data panel (desktop) ── */}
            <div className="hidden lg:flex items-center justify-center">
              <HeroVisual />
            </div>

          </div>

          {/* ── Mobile teaser panel ── */}
          <motion.div
            className="block lg:hidden"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.5 }}
            style={{ marginTop: 40 }}
          >
            <div style={{
              background: "rgba(10,9,20,0.96)",
              border: `1px solid ${C.borderDark}`,
              borderRadius: 16,
              overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${C.borderDark}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}
                  />
                  <span style={{ ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)" }}>
                    Inventory Intelligence · Live
                  </span>
                </div>
                <span style={{ ...BODY, fontSize: 10, color: "rgba(255,255,255,0.18)" }}>City General Hospital</span>
              </div>
              {/* Drug rows */}
              {[
                { drug: "Amoxicillin 500mg", pct: 11, color: "#C45B5B", status: "CRITICAL" },
                { drug: "Paracetamol IV 1g",  pct: 74, color: C.gold,     status: "HEALTHY" },
                { drug: "Insulin Glargine",   pct: 28, color: "#D4854A",  status: "LOW" },
                { drug: "Ondansetron 4mg",    pct: 81, color: "#7CAE7A",  status: "HEALTHY" },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: i < arr.length - 1 ? `1px solid ${C.borderDark}` : "none" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ ...BODY, fontSize: 12, color: "rgba(255,255,255,0.55)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.drug}</span>
                  <div style={{ width: 52, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, flexShrink: 0 }}>
                    <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 2, opacity: 0.85 }} />
                  </div>
                  <span style={{ ...NUM, fontSize: 12, color: item.color, width: 24, textAlign: "right", flexShrink: 0 }}>{item.pct}%</span>
                  <span style={{ ...BODY, fontSize: 9, fontWeight: 600, color: item.color, letterSpacing: "0.06em", width: 46, textAlign: "right", flexShrink: 0, opacity: 0.8 }}>{item.status}</span>
                </div>
              ))}
              {/* AI insight strip */}
              <div style={{ padding: "10px 16px", background: `${C.gold}0A`, borderTop: `1px solid ${C.gold}18` }}>
                <span style={{ ...BODY, fontSize: 10.5, color: `${C.gold}CC` }}>
                  ⚡ AI alert: Amoxicillin critically low — auto-order triggered for 3 suppliers
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Bottom fade — cinematic blend into next section */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 240,
        background: `linear-gradient(to bottom, ${C.cream}00 0%, ${C.cream}0A 22%, ${C.cream}88 60%, ${C.cream}EE 82%, ${C.cream} 100%)`,
        pointerEvents: "none",
        zIndex: 5,
      }} />
    </section>
  );
}

// ─── Trusted By strip (infinite marquee ticker) ───────────────────────────────
function TrustedBy() {
  const logos = [
    "Mayo Clinic Network", "HCA Healthcare", "Ascension Health",
    "Kaiser Permanente", "Cleveland Clinic", "Johns Hopkins",
    "Northwell Health", "Tenet Healthcare", "CommonSpirit Health",
  ];
  const doubled = [...logos, ...logos];
  return (
    <section style={{ background: C.cream, padding: "44px 0 52px", borderBottom: `1px solid ${C.borderLight}`, overflow: "hidden" }}>
      <motion.div {...fadeIn()} style={{ textAlign: "center", marginBottom: 28, padding: "0 32px" }}>
        <span style={{ ...BODY, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.textMid, fontWeight: 500 }}>
          Trusted by leading hospital networks
        </span>
      </motion.div>
      {/* Fade edges */}
      <div style={{
        WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}>
        <div className="lp-marquee-fwd">
          {doubled.map((name, i) => (
            <div key={i} style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
              <span style={{ ...SANS, fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: "-0.01em", opacity: 0.5, padding: "0 36px", whiteSpace: "nowrap" }}>
                {name}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.borderLight, display: "inline-block", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Intro (2-col, light) ─────────────────────────────────────────────────────
function Intro() {
  const [, navigate] = useLocation();
  return (
    <section className="lp-section" style={{ background: C.cream, position: "relative", overflow: "hidden" }}>
      {/* Blend into Stats (navy) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(to bottom, ${C.navy}00 0%, ${C.navy}12 25%, ${C.navy}99 68%, ${C.navy} 100%)`, pointerEvents: "none", zIndex: 3 }} />
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center" style={{ position: "relative", zIndex: 1 }}>
        {/* Left */}
        <motion.div {...fadeUp()}>
          <Label>About the platform</Label>
          <h2 style={{ margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            <span style={{ ...SANS, fontSize: "clamp(28px, 3.5vw, 46px)", color: C.textDark, display: "block" }}>
              Hospital procurement
            </span>
            <span style={{ ...SERIF, fontSize: "clamp(30px, 3.8vw, 50px)", color: C.textDark, display: "block" }}>
              reimagined.
            </span>
          </h2>
          <p style={{ ...BODY, fontSize: 15, color: C.textMid, lineHeight: 1.75, maxWidth: 440, marginBottom: 32 }}>
            MedStock AI is a purpose-built intelligence layer for hospital supply chains. We connect your inventory, your suppliers, and your crisis network — giving procurement teams the foresight to act before problems become emergencies.
          </p>
          <motion.button
            whileHover={{ x: 4 }}
            onClick={() => navigate("/app")}
            style={{
              ...BODY,
              fontSize: 13,
              fontWeight: 600,
              color: C.gold,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              letterSpacing: "-0.01em",
            }}
          >
            View live dashboard →
          </motion.button>
        </motion.div>

        {/* Right — abstract data visual */}
        <motion.div {...fadeUp(0.15)}>
          <div
            style={{
              background: C.midnight,
              borderRadius: 20,
              padding: 28,
              border: `1px solid rgba(255,255,255,0.06)`,
            }}
          >
            {/* Mini dashboard mockup */}
            <div style={{ ...BODY, fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 18, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Live inventory — current facility
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { drug: "Amoxicillin 500mg", status: "CRITICAL", color: "#EF4444", pct: 12 },
                { drug: "Paracetamol IV", status: "ADEQUATE", color: "#7CAE7A", pct: 78 },
                { drug: "Insulin Glargine", status: "LOW", color: "#F59E0B", pct: 31 },
              ].map((d) => (
                <div
                  key={d.drug}
                  style={{
                    background: `${d.color}08`,
                    border: `1px solid ${d.color}20`,
                    borderRadius: 12,
                    padding: "14px 14px 12px",
                  }}
                >
                  <div style={{ ...BODY, fontSize: 10, color: d.color, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                    {d.status}
                  </div>
                  <div style={{ ...NUM, fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                    {d.pct}%
                  </div>
                  <div style={{ ...BODY, fontSize: 10.5, color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>
                    {d.drug}
                  </div>
                  {/* Bar */}
                  <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 10 }}>
                    <div style={{ height: "100%", width: `${d.pct}%`, background: d.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
            {/* AI insight strip */}
            <div
              style={{
                background: `${C.gold}10`,
                border: `1px solid ${C.gold}28`,
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                <path d="M7 1L8.5 5.5H13L9.5 8L10.75 12.5L7 10L3.25 12.5L4.5 8L1 5.5H5.5L7 1Z" fill={C.gold} />
              </svg>
              <div>
                <div style={{ ...BODY, fontSize: 11.5, fontWeight: 600, color: C.gold, marginBottom: 2 }}>
                  AI Forecast Alert
                </div>
                <div style={{ ...BODY, fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>
                  Demand surge predicted in 8 days. Reorder suggested from the preferred supplier network.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Stats (dark) ─────────────────────────────────────────────────────────────
const STATS = [
  { value: "$2.8B", label: "Hospital drug wastage",    sub: "Per year, US hospitals alone",           num: 2.8, prefix: "$", suffix: "B", decimals: 1, fill: 85, accent: "#E07070" },
  { value: "67%",  label: "Reduction in expiry losses", sub: "First year for MedStock customers",      num: 67,  prefix: "",  suffix: "%", decimals: 0, fill: 67, accent: C.gold },
  { value: "23%",  label: "Fewer stockout incidents",  sub: "AI forecasting vs manual ordering",      num: 23,  prefix: "",  suffix: "%", decimals: 0, fill: 23, accent: "#7CAE7A" },
  { value: "4.2×", label: "Faster crisis resolution",  sub: "Network matching vs phone calls",        num: 4.2, prefix: "",  suffix: "×", decimals: 1, fill: 84, accent: C.goldLight },
];

function StatCell({ s, i, borderRight }: { s: typeof STATS[0]; i: number; borderRight: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const rawCount = useCountUp(s.num, isInView, 1.9);
  const rawFill  = useCountUp(s.fill, isInView, 1.9);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
      className="lp-stats-cell"
      style={{ borderRight, borderBottom: `1px solid ${C.borderDark}`, position: "relative", overflow: "hidden" }}
    >
      {/* Ambient accent glow behind number */}
      <motion.div
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 1.2, delay: i * 0.1 + 0.3 }}
        style={{ position: "absolute", top: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${s.accent}18 0%, transparent 70%)`, pointerEvents: "none" }}
      />
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(42px, 5.2vw, 64px)", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 12, position: "relative" }}>
        {s.prefix}{rawCount.toFixed(s.decimals)}{s.suffix}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: 6, lineHeight: 1.4 }}>
        {s.label}
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.textDimDark, lineHeight: 1.5, marginBottom: 20 }}>
        {s.sub}
      </div>
      {/* Animated progress bar */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 1 }}>
        <div
          className="lp-stat-bar-fill"
          style={{ height: "100%", width: `${rawFill}%`, background: `linear-gradient(to right, ${s.accent}70, ${s.accent})`, borderRadius: 1 }}
        />
      </div>
    </motion.div>
  );
}

function Stats() {
  return (
    <section className="lp-section" style={{ background: C.navy, position: "relative", overflow: "hidden" }} id="platform">
      <AmbientOrbs />
      {/* Blend into Problem (cream) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(to bottom, ${C.cream}00 0%, ${C.cream}12 25%, ${C.cream}99 68%, ${C.cream} 100%)`, pointerEvents: "none", zIndex: 3 }} />
      <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
        <motion.div {...fadeIn()} style={{ marginBottom: 64 }}>
          <Label dark>The cost of inaction</Label>
          <h2 style={{ margin: 0, lineHeight: 1.12, letterSpacing: "-0.025em", maxWidth: 560 }}>
            <span style={{ display: "block" }}>
              <WordReveal text="Every delayed order" delay={0.08} style={{ ...SANS, fontSize: "clamp(30px, 4vw, 52px)", color: C.textLight }} />
            </span>
            <span style={{ display: "block" }}>
              <WordReveal text="costs" delay={0.24} style={{ ...SERIF, fontSize: "clamp(32px, 4.2vw, 54px)", color: C.textLight }} />
              {"\u00A0"}
              <WordReveal text="lives" delay={0.3} style={{ ...SERIF, fontSize: "clamp(32px, 4.2vw, 54px)", color: "#E07070" }} />
              <WordReveal text=" and capital." delay={0.42} style={{ ...SANS, fontSize: "clamp(30px, 4vw, 52px)", color: C.textLight }} />
            </span>
          </h2>
        </motion.div>

        <HR dark />

        <div className="lp-stats-grid grid grid-cols-2 lg:grid-cols-4" style={{ marginTop: 0 }}>
          {STATS.map((s, i) => (
            <StatCell
              key={i}
              s={s}
              i={i}
              borderRight={i < 3 ? `1px solid ${C.borderDark}` : "none"}
            />
          ))}
        </div>
        <HR dark />
      </div>
    </section>
  );
}

// ─── Problem (light, 2-col) ───────────────────────────────────────────────────
const PROBLEMS = [
  { title: "Drugs expire on shelves", desc: "No batch-level visibility until write-off time. Millions in usable medication destroyed each year.", n: "01" },
  { title: "Stockouts delay critical care", desc: "Manual reorder systems can't react to demand spikes. Nurses scramble while surgeries get postponed.", n: "02" },
  { title: "Crisis coordination by phone", desc: "When supply fails, procurement calls 15 hospitals manually hoping someone has surplus stock.", n: "03" },
  { title: "Forecasting by gut feeling", desc: "Historical data lives in disconnected ERP silos. Procurement teams guess at next month's demand.", n: "04" },
];

function Problem() {
  return (
    <section className="lp-section" style={{ background: C.cream, position: "relative", overflow: "hidden" }}>
      {/* Blend into Features (midnight) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(to bottom, ${C.midnight}00 0%, ${C.midnight}12 25%, ${C.midnight}99 68%, ${C.midnight} 100%)`, pointerEvents: "none", zIndex: 3 }} />
      <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div {...fadeUp()} className="lp-problem-sticky" style={{ position: "sticky", top: 120 }}>
            <Label>The broken status quo</Label>
            <h2 style={{ margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              <span style={{ ...SANS, fontSize: "clamp(26px, 3.2vw, 44px)", color: C.textDark, display: "block" }}>
                Most hospitals still run
              </span>
              <span style={{ ...SERIF, fontSize: "clamp(28px, 3.5vw, 47px)", color: C.textDark, display: "block" }}>
                procurement like it's 1995.
              </span>
            </h2>
            <p style={{ ...BODY, fontSize: 15, color: C.textMid, lineHeight: 1.75, maxWidth: 400 }}>
              Manual spreadsheets, reactive ordering, phone-based crisis coordination. Meanwhile patients wait, drugs expire, and CFOs panic over waste reports.
            </p>
          </motion.div>

          {/* Right — problem cards (slide from right) */}
          <div className="space-y-px" style={{ background: C.borderLight }}>
            {PROBLEMS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.09 + 0.05 }}
                whileHover={{ x: 4 }}
                style={{ background: C.cream, padding: "28px 28px 26px", cursor: "default" }}
              >
                <div className="flex items-start gap-5">
                  <motion.span
                    initial={{ color: C.borderLight }}
                    whileHover={{ color: C.gold }}
                    transition={{ duration: 0.2 }}
                    style={{ ...BODY, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginTop: 4, minWidth: 24 }}
                  >
                    {p.n}
                  </motion.span>
                  <div>
                    <div style={{ ...BODY, fontSize: 15, fontWeight: 600, color: C.textDark, marginBottom: 6, letterSpacing: "-0.01em" }}>
                      {p.title}
                    </div>
                    <div style={{ ...BODY, fontSize: 13.5, color: C.textMid, lineHeight: 1.65 }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features (dark) ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: "AI Demand Forecasting",
    desc: "30, 60, and 90-day demand predictions built from your consumption history. Manual override always available.",
    accent: C.gold,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 13L6 9L9 11L13 6L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="5" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Real-Time Inventory",
    desc: "Live stock levels across all departments. CRITICAL / LOW / ADEQUATE status updated continuously.",
    accent: C.goldLight,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 4V3M12 4V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 9H13M5 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Expiry Prevention",
    desc: "Batch-level tracking with financial impact estimates. AI-suggested redistribution before the loss.",
    accent: "#D4854A",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5V9.5L12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Crisis Network",
    desc: "When shortages hit, AI matches your deficit to surplus at nearby hospitals in minutes, not hours.",
    accent: "#C45B5B",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L11 7H16L12 10.5L13.5 16L9 12.5L4.5 16L6 10.5L2 7H7L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Proactive Alerts",
    desc: "Low stock, expiry risk, overstock, and forecast anomalies — surfaced before they become problems.",
    accent: C.gold,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2C9 2 4 5 4 10.5V14H14V10.5C14 5 9 2 9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 14C7 15.1 7.9 16 9 16C10.1 16 11 15.1 11 14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Executive Dashboard",
    desc: "KPIs your CFO will actually care about: wastage trend, forecast accuracy, and stockout rate.",
    accent: C.goldDim,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="2" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="6" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="8" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

function Features() {
  return (
    <section className="lp-section" style={{ background: C.midnight, position: "relative", overflow: "hidden" }} id="features">
      <AmbientOrbs />
      {/* Blend into DemoPreview (cream) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(to bottom, ${C.cream}00 0%, ${C.cream}12 25%, ${C.cream}99 68%, ${C.cream} 100%)`, pointerEvents: "none", zIndex: 3 }} />
      <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
        <motion.div {...fadeIn()} style={{ marginBottom: 64 }}>
          <Label dark>Platform capabilities</Label>
          <h2 style={{ margin: 0, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            <WordReveal text="Everything you need." delay={0.08} style={{ ...SANS, fontSize: "clamp(28px, 3.8vw, 50px)", color: C.textLight }} />
            {" "}
            <WordReveal text="Nothing you don't." delay={0.32} style={{ ...SERIF, fontSize: "clamp(30px, 4vw, 52px)", color: C.gold }} />
          </h2>
        </motion.div>

        <HR dark />

        <div className="lp-feat-grid grid md:grid-cols-2 lg:grid-cols-3" style={{ borderBottom: `1px solid ${C.borderDark}` }}>
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={i}
              f={f}
              i={i}
              borderStyle={{
                borderRight: (i % 3 !== 2) ? `1px solid ${C.borderDark}` : "none",
                borderBottom: `1px solid ${C.borderDark}`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Preview (light) ────────────────────────────────────────────────
const TABS = [
  {
    label: "Command Center",
    accent: C.gold,
    metrics: [
      { label: "Critical Items", value: "4", color: "#C45B5B" },
      { label: "Expiring <30d", value: "8", color: "#D4854A" },
      { label: "Forecast Acc.", value: "84.6%", color: C.gold },
      { label: "SKUs Tracked", value: "15", color: C.goldLight },
    ],
    bars: [45, 60, 38, 78, 52, 88, 46, 70, 34, 85, 40, 62],
    chartLabel: "Wastage trend — last 6 months",
  },
  {
    label: "AI Forecasts",
    accent: C.goldLight,
    metrics: [
      { label: "30-Day Demand", value: "420u", color: C.goldLight },
      { label: "Confidence", value: "±12%", color: C.gold },
      { label: "Stockout Risk", value: "High", color: "#C45B5B" },
      { label: "Horizon", value: "90 days", color: C.goldDim },
    ],
    bars: [55, 58, 62, 60, 70, 74, 72, 80, 78, 84, 88, 92],
    chartLabel: "Predicted demand — next 12 weeks",
  },
  {
    label: "Crisis Network",
    accent: "#C45B5B",
    metrics: [
      { label: "Active Requests", value: "4", color: "#C45B5B" },
      { label: "Surplus Listings", value: "5", color: "#D4854A" },
      { label: "Best Match", value: "96%", color: C.gold },
      { label: "Network Status", value: "Live", color: C.goldLight },
    ],
    bars: [20, 35, 28, 60, 45, 80, 55, 72, 40, 90, 65, 88],
    chartLabel: "Network transfer activity",
  },
];

function DemoPreview() {
  const [active, setActive] = useState(0);
  const [, navigate] = useLocation();
  const tab = TABS[active];

  return (
    <section className="lp-section" style={{ background: C.cream, position: "relative", overflow: "hidden" }} id="platform">
      {/* Blend into Testimonials (midnight) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(to bottom, ${C.midnight}00 0%, ${C.midnight}12 25%, ${C.midnight}99 68%, ${C.midnight} 100%)`, pointerEvents: "none", zIndex: 3 }} />
      <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 56 }}>
          <Label>Live product preview</Label>
          <h2 style={{ margin: "0 0 14px", lineHeight: 1.1, letterSpacing: "-0.022em" }}>
            <span style={{ ...SANS, fontSize: "clamp(26px, 3.2vw, 44px)", color: C.textDark }}>
              The command center{" "}
            </span>
            <span style={{ ...SERIF, fontSize: "clamp(28px, 3.5vw, 47px)", color: C.textDark }}>
              your team will rely on.
            </span>
          </h2>
          <p style={{ ...BODY, fontSize: 15, color: C.textMid, lineHeight: 1.65, maxWidth: 420 }}>
            Real data. Real decisions. Preview each module below.
          </p>
        </motion.div>

        <motion.div
          {...fadeIn(0.15)}
          style={{
            background: C.navy,
            borderRadius: 20,
            border: `1px solid rgba(255,255,255,0.07)`,
            overflow: "hidden",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: `1px solid ${C.borderDark}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(239,68,68,0.45)", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(245,158,11,0.45)", display: "inline-block" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(34,197,94,0.45)", display: "inline-block" }} />
            </div>
            {/* Tabs */}
            <div className="lp-demo-tabs" style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10 }}>
              {TABS.map((t, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    ...BODY,
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "5px 12px",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                  }}
                  animate={{
                    background: active === i ? `${t.accent}20` : "transparent",
                    color: active === i ? t.accent : "rgba(255,255,255,0.32)",
                  }}
                >
                  {t.label}
                </motion.button>
              ))}
            </div>
            <span className="lp-demo-url" style={{ ...BODY, fontSize: 11, color: "rgba(255,255,255,0.18)" }}>
              medstockai.com/app
            </span>
          </div>

          {/* Content */}
          <div style={{ padding: 24 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {tab.metrics.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        padding: "16px 16px 14px",
                        borderRadius: 12,
                        background: `${m.color}08`,
                        border: `1px solid ${m.color}20`,
                      }}
                    >
                      <div style={{ ...NUM, fontSize: 24, color: m.color, marginBottom: 4 }}>
                        {m.value}
                      </div>
                      <div style={{ ...BODY, fontSize: 11, color: "rgba(255,255,255,0.32)" }}>
                        {m.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 20 }}>
                  <p style={{ ...BODY, fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.02em", marginBottom: 14 }}>
                    {tab.chartLabel}
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                    {tab.bars.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                        style={{
                          flex: 1,
                          borderRadius: "3px 3px 0 0",
                          minWidth: 0,
                          background: `linear-gradient(to top, ${tab.accent}70, ${tab.accent}20)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${C.borderDark}`,
            }}
          >
            <span style={{ ...BODY, fontSize: 11.5, color: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
              Live · Updated 2s ago
            </span>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/app")}
              style={{
                ...BODY,
                fontSize: 12,
                fontWeight: 600,
                color: active === 2 ? "#fff" : C.midnight,
                background: tab.accent,
                border: "none",
                borderRadius: 8,
                padding: "7px 16px",
                cursor: "pointer",
              }}
            >
              Open dashboard →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials (dark) ──────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "We cut expired drug write-offs by 71% in Q1. The AI redistribution suggestions alone paid for three years of subscription fees.",
    name: "Dr. Priya Nair",
    role: "Chief Pharmacy Officer",
    hospital: "Apollo Hospitals Group",
    initial: "P",
    accent: C.gold,
  },
  {
    quote: "Crisis coordination used to take three hours of phone calls. Now our network matches surplus to shortage in under five minutes.",
    name: "Rajesh Kumar",
    role: "VP Supply Chain",
    hospital: "Fortis Healthcare",
    initial: "R",
    accent: C.goldLight,
  },
  {
    quote: "Forecast accuracy at 84%+ is genuinely impressive. We finally have confidence in procurement decisions instead of flying blind.",
    name: "Dr. Meera Sharma",
    role: "Medical Director",
    hospital: "Manipal Hospitals",
    initial: "M",
    accent: C.goldDim,
  },
];

function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <section className="lp-section" style={{ background: C.midnight, position: "relative", overflow: "hidden" }} id="customers">
      <AmbientOrbs />
      {/* Blend into Pricing (cream) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(to bottom, ${C.cream}00 0%, ${C.cream}12 25%, ${C.cream}99 68%, ${C.cream} 100%)`, pointerEvents: "none", zIndex: 3 }} />
      <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 64 }}>
          <Label dark>Customer stories</Label>
          <h2 style={{ margin: 0, lineHeight: 1.08, letterSpacing: "-0.025em" }}>
            <span style={{ ...SANS, fontSize: "clamp(26px, 3.5vw, 48px)", color: C.textLight }}>
              Trusted by procurement{" "}
            </span>
            <span style={{ ...SERIF, fontSize: "clamp(28px, 3.7vw, 50px)", color: C.textLight }}>
              leaders across India.
            </span>
          </h2>
        </motion.div>

        <HR dark />

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            style={{ padding: "64px 0 48px" }}
          >
            {/* Large quote mark */}
            <div style={{ ...SERIF, fontSize: 80, color: `${t.accent}25`, lineHeight: 0.6, marginBottom: 32, userSelect: "none" }}>
              "
            </div>
            <p style={{
              ...SERIF,
              fontSize: "clamp(20px, 2.4vw, 30px)",
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.55,
              letterSpacing: "-0.01em",
              maxWidth: 760,
              marginBottom: 40,
            }}>
              {t.quote}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: `${t.accent}18`,
                  border: `1px solid ${t.accent}30`,
                  color: t.accent,
                  ...SANS,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {t.initial}
              </div>
              <div>
                <div style={{ ...BODY, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em" }}>
                  {t.name}
                </div>
                <div style={{ ...BODY, fontSize: 12.5, color: C.textDimDark }}>
                  {t.role} · {t.hospital}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <HR dark />

        {/* Progress dots with fill animation */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 28 }}>
          {TESTIMONIALS.map((tItem, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{ position: "relative", height: 4, width: active === i ? 52 : 14, borderRadius: 2, border: "none", cursor: "pointer", padding: 0, background: "rgba(255,255,255,0.12)", transition: "width 0.35s ease", overflow: "hidden" }}
            >
              {active === i && (
                <motion.div
                  key={active}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5.5, ease: "linear" }}
                  style={{ position: "absolute", inset: 0, background: tItem.accent, borderRadius: 2 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing (light) ─────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter",
    monthly: 490,
    annual: 390,
    desc: "For single-facility teams getting started with AI procurement.",
    accent: C.goldDim,
    features: ["1 hospital facility", "Up to 500 SKUs", "AI demand forecasting", "Real-time inventory dashboard", "Email alerts", "Standard support"],
  },
  {
    name: "Clinical",
    monthly: 1490,
    annual: 1190,
    desc: "The complete intelligence suite for serious procurement teams.",
    accent: C.gold,
    featured: true,
    features: ["Up to 5 facilities", "Unlimited SKUs", "Full AI forecasting suite", "Expiry & wastage prevention", "Crisis network (5 partners)", "Priority support + SLA"],
  },
  {
    name: "Enterprise",
    monthly: 0,
    annual: 0,
    desc: "For hospital groups requiring custom deployments and integrations.",
    accent: C.goldLight,
    features: ["Unlimited facilities", "Custom AI model training", "Full crisis network access", "ERP / HIS integration", "Dedicated CSM", "On-premise option"],
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const [, navigate] = useLocation();

  return (
    <section className="lp-section" style={{ background: C.cream, position: "relative", overflow: "hidden" }} id="pricing">
      {/* Blend into CTA (navy) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(to bottom, ${C.navy}00 0%, ${C.navy}12 25%, ${C.navy}99 68%, ${C.navy} 100%)`, pointerEvents: "none", zIndex: 3 }} />
      <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 64 }}>
          <Label>Pricing</Label>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <h2 style={{ margin: 0, lineHeight: 1.1, letterSpacing: "-0.022em" }}>
              <span style={{ ...SANS, fontSize: "clamp(26px, 3.2vw, 44px)", color: C.textDark }}>
                Pays for itself{" "}
              </span>
              <span style={{ ...SERIF, fontSize: "clamp(28px, 3.5vw, 47px)", color: C.textDark }}>
                in 30 days.
              </span>
            </h2>
            {/* Toggle */}
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: 4,
                background: "rgba(0,0,0,0.05)",
                border: `1px solid ${C.borderLight}`,
                borderRadius: 10,
              }}
            >
              {["Monthly", "Annual"].map((label, i) => (
                <motion.button
                  key={label}
                  onClick={() => setAnnual(i === 1)}
                  style={{
                    ...BODY,
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "7px 16px",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                  }}
                  animate={{
                    color: (annual ? i === 1 : i === 0) ? C.textDark : C.textMid,
                    background: (annual ? i === 1 : i === 0) ? "#fff" : "transparent",
                  }}
                >
                  {label}
                  {i === 1 && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: `${C.gold}18`,
                        color: C.gold,
                        fontWeight: 600,
                      }}
                    >
                      –20%
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <HR />

        <div className="lp-price-grid grid md:grid-cols-3" style={{ borderBottom: `1px solid ${C.borderLight}` }}>
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.08)}
              className="lp-price-cell"
              style={{
                borderRight: i < 2 ? `1px solid ${C.borderLight}` : "none",
                borderBottom: `1px solid ${C.borderLight}`,
                position: "relative",
                background: plan.featured ? `${plan.accent}04` : C.cream,
              }}
            >
              {plan.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: plan.accent,
                    borderRadius: "0 0 2px 2px",
                  }}
                />
              )}
              <div style={{ ...BODY, fontSize: 11, fontWeight: 600, color: plan.accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
                {plan.name}
              </div>
              <div style={{ marginBottom: 8 }}>
                {plan.monthly === 0 ? (
                  <span style={{ ...SANS, fontSize: 36, color: C.textDark, letterSpacing: "-0.04em" }}>
                    Custom
                  </span>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={annual ? "a" : "m"}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        style={{ ...SANS, fontSize: 40, color: C.textDark, letterSpacing: "-0.04em", display: "inline-block" }}
                      >
                        ${annual ? plan.annual : plan.monthly}
                      </motion.span>
                    </AnimatePresence>
                    <span style={{ ...BODY, fontSize: 13, color: C.textMid, marginBottom: 6 }}>/month</span>
                  </div>
                )}
              </div>
              <p style={{ ...BODY, fontSize: 13.5, color: C.textMid, lineHeight: 1.6, marginBottom: 28 }}>
                {plan.desc}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ ...BODY, fontSize: 13.5, color: C.textDark, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: plan.accent, fontSize: 11, fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/app")}
                style={{
                  ...BODY,
                  width: "100%",
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "11px 0",
                  borderRadius: 9,
                  cursor: "pointer",
                  background: plan.featured ? plan.accent : "transparent",
                  color: plan.featured ? C.midnight : plan.accent,
                  border: plan.featured ? "none" : `1.5px solid ${plan.accent}35`,
                  letterSpacing: "-0.01em",
                }}
              >
                {plan.monthly === 0 ? "Contact sales" : "Start free trial"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA (dark) ──────────────────────────────────────────────────────────────
function CTA({ onDemo }: { onDemo: () => void }) {
  const [, navigate] = useLocation();

  return (
    <section className="lp-section" style={{ background: C.navy, padding: "120px 32px", position: "relative", overflow: "hidden" }}>
      <AmbientOrbs />
      {/* Blend into Footer (midnight) */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
        background: `linear-gradient(to bottom, ${C.midnight}00 0%, ${C.midnight}12 25%, ${C.midnight}99 68%, ${C.midnight} 100%)`, pointerEvents: "none", zIndex: 3 }} />
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center" style={{ position: "relative", zIndex: 1 }}>
        {/* Left */}
        <motion.div {...fadeUp()}>
          <Label dark>Ready to start?</Label>
          <h2 style={{ margin: "0 0 24px", lineHeight: 1.08, letterSpacing: "-0.025em" }}>
            <span style={{ ...SANS, fontSize: "clamp(30px, 4vw, 52px)", color: C.textLight, display: "block" }}>
              Start saving
            </span>
            <span style={{ ...SERIF, fontSize: "clamp(32px, 4.3vw, 55px)", color: C.gold, display: "block" }}>
              tomorrow.
            </span>
            <span style={{ ...SANS, fontSize: "clamp(28px, 3.5vw, 46px)", color: "rgba(255,255,255,0.4)", display: "block", marginTop: 4 }}>
              Not next quarter.
            </span>
          </h2>
          <div className="lp-cta-btns" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onDemo}
              className="lp-btn-shimmer"
              style={{ ...SANS, fontSize: 14, fontWeight: 700, color: C.midnight, background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, border: "none", borderRadius: 10, padding: "14px 28px", cursor: "pointer", letterSpacing: "-0.01em" }}
            >
              Book a demo
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/app")}
              style={{ ...BODY, fontSize: 14, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.borderDark}`, borderRadius: 10, padding: "14px 28px", cursor: "pointer" }}
              className="lp-btn-outline hover:text-white transition-colors"
            >
              Open live dashboard →
            </motion.button>
          </div>
        </motion.div>

        {/* Right — contact-style info block like Ocean Crest's footer section */}
        <motion.div {...fadeUp(0.15)}>
          <div className="lp-cta-infoblock" style={{ borderLeft: `1px solid ${C.borderDark}`, paddingLeft: 48 }}>
            {[
              { label: "Product", value: "AI-powered hospital supply chain intelligence" },
              { label: "Coverage", value: "50+ hospitals across India & Southeast Asia" },
              { label: "Deployment", value: "Cloud SaaS · HL7 FHIR · API-first" },
              { label: "Support", value: "24/7 for Clinical & Enterprise plans" },
              { label: "Contact", value: "hello@medstockai.com" },
            ].map((item) => (
              <div
                key={item.label}
                style={{ padding: "18px 0", borderBottom: `1px solid ${C.borderDark}` }}
              >
                <div style={{ ...BODY, fontSize: 11, fontWeight: 500, color: C.textDimDark, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>
                  {item.label}
                </div>
                <div style={{ ...BODY, fontSize: 14.5, color: "rgba(255,255,255,0.75)", letterSpacing: "-0.01em" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: C.midnight, borderTop: `1px solid ${C.borderDark}` }}>
      <div className="lp-footer-wrap max-w-6xl mx-auto">
        <div className="lp-footer-grid grid md:grid-cols-4 gap-12" style={{ marginBottom: 56 }}>
          {/* Brand */}
          <div className="md:col-span-1">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L12.5 4.25V10.75L7 14L1.5 10.75V4.25L7 1Z" stroke="white" strokeWidth="1.4" />
                  <path d="M7 4.5V9.5M4.5 7H9.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ ...SANS, fontSize: 14, color: "#fff" }}>
                MedStock<span style={{ color: C.gold }}>AI</span>
              </span>
            </div>
            <p style={{ ...BODY, fontSize: 13, color: C.textDimDark, lineHeight: 1.7, maxWidth: 220 }}>
              AI-powered hospital supply chain intelligence for the modern procurement team.
            </p>
          </div>

          {/* Links */}
          {[
            { title: "Product", links: ["Dashboard", "AI Forecasting", "Expiry Management", "Crisis Network"] },
            { title: "Company", links: ["About", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security"] },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ ...BODY, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18 }}>
                {col.title}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href={link === "Contact" ? "mailto:hello@medstockai.com" : "#"}
                      style={{ ...BODY, fontSize: 13.5, color: "rgba(255,255,255,0.38)", textDecoration: "none" }}
                      className="hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <HR dark />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, paddingTop: 28 }}>
          <p style={{ ...BODY, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            © 2026 MedStock AI. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ ...BODY, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Demo Modal ───────────────────────────────────────────────────────────────
function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState({ name: "", hospital: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) { setTimeout(() => { setStep("form"); setForm({ name: "", hospital: "", email: "", role: "" }); }, 400); }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setStep("success");
    setTimeout(() => { onClose(); navigate("/app?welcome=1"); }, 2400);
  };

  const roles = ["Chief Pharmacy Officer", "VP Supply Chain", "Procurement Manager", "Medical Director", "CFO / Finance", "IT / System Admin", "Other"];

  const inputStyle: React.CSSProperties = {
    ...BODY,
    width: "100%",
    fontSize: 14,
    color: "#fff",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "11px 14px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease }}
            style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 440,
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.1)",
                background: C.navy,
                pointerEvents: "auto",
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                {step === "form" ? (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ padding: "28px 28px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div>
                        <h2 style={{ ...SANS, fontSize: 22, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                          Book a demo
                        </h2>
                        <p style={{ ...BODY, fontSize: 13.5, color: C.textDimDark, margin: 0, lineHeight: 1.55 }}>
                          See MedStock AI in your hospital's context.
                        </p>
                      </div>
                      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>
                        ×
                      </button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                      <input required placeholder="Hospital / organization" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} style={inputStyle} />
                      <input required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                      <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, color: form.role ? "#fff" : "rgba(255,255,255,0.35)" }}>
                        <option value="" disabled>Your role</option>
                        {roles.map((r) => <option key={r} value={r} style={{ color: "#000" }}>{r}</option>)}
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{
                          ...SANS,
                          fontSize: 14,
                          fontWeight: 700,
                          color: C.midnight,
                          background: loading ? `${C.gold}99` : `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                          border: "none",
                          borderRadius: 9,
                          padding: "13px 0",
                          cursor: loading ? "not-allowed" : "pointer",
                          marginTop: 4,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {loading ? "Sending…" : "Request demo →"}
                      </motion.button>
                      <p style={{ ...BODY, fontSize: 11.5, color: "rgba(255,255,255,0.22)", textAlign: "center", margin: 0 }}>
                        No credit card required. We'll reach out within 24 hours.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ padding: 48, textAlign: "center" }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
                    <h3 style={{ ...SANS, fontSize: 20, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                      You're on the list.
                    </h3>
                    <p style={{ ...BODY, fontSize: 14, color: C.textDimDark, lineHeight: 1.6, margin: "0 0 24px" }}>
                      Our team will reach out within 24 hours. Taking you to the dashboard…
                    </p>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.4, ease: "linear" }}
                        style={{ height: "100%", background: `linear-gradient(to right, ${C.gold}, ${C.goldLight})`, borderRadius: 2 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Live Activity Toast ───────────────────────────────────────────────────────
const ACTIVITY_FEED = [
  { hospital: "Apollo Hospitals, Mumbai", action: "prevented an Amoxicillin stockout", time: "2m ago" },
  { hospital: "Fortis Healthcare, Delhi", action: "saved ₹4.2L in expiry waste this week", time: "5m ago" },
  { hospital: "AIIMS New Delhi", action: "resolved a critical shortage in 4 hours", time: "8m ago" },
  { hospital: "Manipal Hospitals, Bangalore", action: "auto-reordered 2,400 units via AI forecast", time: "11m ago" },
  { hospital: "Max Healthcare, Gurgaon", action: "flagged 3 near-expiry SKUs for reallocation", time: "14m ago" },
  { hospital: "Narayana Health, Hyderabad", action: "cut emergency procurement by 40%", time: "18m ago" },
];
function LiveActivityToast() {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(t);
  }, [dismissed]);
  useEffect(() => {
    if (!visible || dismissed) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % ACTIVITY_FEED.length); setVisible(true); }, 350);
    }, 6000);
    return () => clearInterval(t);
  }, [visible, dismissed]);
  if (dismissed) return null;
  const item = ACTIVITY_FEED[idx];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.3, ease }}
          style={{ position: "fixed", bottom: 28, left: 24, zIndex: 200, background: "rgba(13,12,24,0.96)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px 12px 12px", display: "flex", alignItems: "flex-start", gap: 10, maxWidth: 310, boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(200,146,42,0.07)" }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", marginTop: 5, flexShrink: 0, boxShadow: "0 0 6px #22c55e88", display: "block" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ ...BODY, fontSize: 12.5, color: "rgba(237,230,220,0.88)", lineHeight: 1.45, display: "block" }}>
              <strong style={{ color: C.gold }}>{item.hospital}</strong>{" "}{item.action}
            </span>
            <span style={{ ...BODY, fontSize: 10.5, color: "rgba(237,230,220,0.3)", marginTop: 3, display: "block" }}>{item.time}</span>
          </div>
          <button onClick={() => { setVisible(false); setTimeout(() => setDismissed(true), 350); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.22)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0, marginTop: 1 }}>×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Press Mentions ────────────────────────────────────────────────────────────
function PressMentions() {
  const outlets = ["ET Healthworld", "Economic Times", "Inc42", "YourStory", "Business Standard", "The Hindu BusinessLine", "Mint"];
  return (
    <section style={{ background: C.cream, padding: "20px 32px", borderBottom: `1px solid ${C.borderLight}` }}>
      <div className="max-w-6xl mx-auto" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
        <span style={{ ...BODY, fontSize: 10.5, fontWeight: 500, color: C.textMid, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>As seen in</span>
        <div style={{ width: 1, height: 14, background: C.borderLight, flexShrink: 0 }} />
        {outlets.map((name) => (
          <span key={name} style={{ ...SANS, fontSize: 11.5, fontWeight: 700, color: C.textMid, opacity: 0.38, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{name}</span>
        ))}
      </div>
    </section>
  );
}

// ─── Live Stats Strip ──────────────────────────────────────────────────────────
function LiveStatsStrip() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });
  const savings = useCountUp(84.2, inView, 2.2);
  const skus = useCountUp(4.2, inView, 2.4);
  const items = [
    { value: `₹${savings.toFixed(1)}Cr`, label: "Saved this month" },
    { value: "47+", label: "Hospitals protected" },
    { value: "98.6%", label: "System uptime" },
    { value: `${skus.toFixed(1)}M+`, label: "SKUs monitored daily" },
  ];
  return (
    <section ref={ref} style={{ background: C.midnight, borderTop: `1px solid ${C.borderDark}`, borderBottom: `1px solid ${C.borderDark}` }}>
      <div className="max-w-6xl mx-auto lp-stats-strip">
        {items.map((item, i) => (
          <div key={i} className="lp-stats-strip-cell" style={{ borderRight: i < 3 ? `1px solid ${C.borderDark}` : "none", padding: "22px 16px", textAlign: "center" }}>
            <div style={{ ...NUM, fontSize: 27, color: C.gold, letterSpacing: "-0.02em", lineHeight: 1 }}>{item.value}</div>
            <div style={{ ...BODY, fontSize: 10.5, color: "rgba(237,230,220,0.3)", marginTop: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Case Study Spotlight ──────────────────────────────────────────────────────
function CaseStudySpotlight() {
  return (
    <section className="lp-section" style={{ background: C.cream, position: "relative", overflow: "hidden" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp()} style={{ marginBottom: 52 }}>
          <Label>Case study</Label>
          <h2 style={{ margin: 0, lineHeight: 1.1, letterSpacing: "-0.022em" }}>
            <span style={{ ...SANS, fontSize: "clamp(26px,3.2vw,44px)", color: C.textDark, display: "block" }}>How City General cut</span>
            <span style={{ ...SERIF, fontSize: "clamp(28px,3.5vw,47px)", color: C.textDark, display: "block" }}>₹2.3Cr in waste in 90 days.</span>
          </h2>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <motion.div {...fadeUp(0.08)} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {[
              { step: "01", title: "The problem", body: "City General was losing ₹26L/month to expired stock — mostly surgical consumables with no visibility beyond a quarterly audit. Stockouts caused 14 surgery delays in one month alone." },
              { step: "02", title: "MedStock AI deployed", body: "Within 48 hours of onboarding, the AI catalogued 4,200 SKUs, set dynamic safety stock levels per department, and flagged ₹1.8Cr of stock at imminent expiry risk." },
              { step: "03", title: "Outcome at 90 days", body: "Expiry waste dropped 89%. Emergency purchases fell 40%. Stockout incidents went from 14 to 0. The procurement team now operates 3 hours per week instead of 3 days." },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", gap: 18 }}>
                <span style={{ ...NUM, fontSize: 13, color: C.gold, opacity: 0.45, paddingTop: 2, flexShrink: 0 }}>{item.step}</span>
                <div>
                  <div style={{ ...SANS, fontSize: 13.5, color: C.textDark, marginBottom: 6, letterSpacing: "-0.01em" }}>{item.title}</div>
                  <p style={{ ...BODY, fontSize: 14, color: C.textMid, lineHeight: 1.72, margin: 0 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </motion.div>
          <motion.div {...fadeUp(0.16)}>
            <div style={{ background: C.midnight, borderRadius: 20, padding: 36, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
              <div style={{ ...BODY, fontSize: 10.5, fontWeight: 600, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>Results at 90 days</div>
              {[
                { label: "Expiry waste reduced", value: "89%", color: "#22c55e" },
                { label: "Emergency purchases down", value: "40%", color: C.gold },
                { label: "Stockout incidents", value: "0", color: "#22c55e" },
                { label: "Total savings", value: "₹2.3Cr", color: C.gold },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ ...BODY, fontSize: 13, color: "rgba(237,230,220,0.5)" }}>{item.label}</span>
                  <span style={{ ...NUM, fontSize: 26, color: item.color, letterSpacing: "-0.02em" }}>{item.value}</span>
                </div>
              ))}
              <blockquote style={{ margin: "24px 0 0" }}>
                <p style={{ ...BODY, fontSize: 13.5, color: "rgba(237,230,220,0.68)", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                  "We were flying blind. MedStock AI gave us 30-day forward visibility for the first time. ROI was visible within the first week."
                </p>
                <cite style={{ ...BODY, fontSize: 11.5, color: C.gold, marginTop: 10, display: "block", fontStyle: "normal" }}>
                  — Dr. Kavita Rao, Supply Chain Director, City General Hospital
                </cite>
              </blockquote>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Integrations Grid ─────────────────────────────────────────────────────────
const INTEGRATIONS = [
  { name: "SAP", desc: "ERP sync" }, { name: "Oracle Health", desc: "EHR / HIS" },
  { name: "Epic Systems", desc: "Clinical" }, { name: "Meditech", desc: "Hospital IS" },
  { name: "HL7 FHIR", desc: "Data standard" }, { name: "GS1 / RFID", desc: "Barcode / IoT" },
  { name: "PharmEasy B2B", desc: "Supplier" }, { name: "REST API", desc: "Custom connect" },
];
function IntegrationsGrid() {
  return (
    <section className="lp-section" style={{ background: C.navy, position: "relative", overflow: "hidden" }} id="integrations">
      <AmbientOrbs />
      <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 52, textAlign: "center" }}>
          <Label dark>Integrations</Label>
          <h2 style={{ margin: 0, lineHeight: 1.1 }}>
            <span style={{ ...SANS, fontSize: "clamp(26px,3.2vw,44px)", color: C.textLight, display: "block" }}>Works with your</span>
            <span style={{ ...SERIF, fontSize: "clamp(28px,3.5vw,47px)", color: C.gold, display: "block" }}>existing stack.</span>
          </h2>
          <p style={{ ...BODY, fontSize: 15, color: "rgba(237,230,220,0.4)", maxWidth: 440, margin: "14px auto 0", lineHeight: 1.65 }}>
            Connect your HIS, ERP, and supplier systems in under 48 hours. No IT project required.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {INTEGRATIONS.map((item, i) => (
            <motion.div key={i} {...fadeUp(i * 0.05)} whileHover={{ y: -3, borderColor: "rgba(200,146,42,0.28)" }}
              style={{ background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "22px 16px", textAlign: "center", transition: "border-color 0.25s ease" }}>
              <div style={{ ...SANS, fontSize: 14, color: C.textLight, marginBottom: 5, letterSpacing: "-0.01em" }}>{item.name}</div>
              <div style={{ ...BODY, fontSize: 10.5, color: "rgba(237,230,220,0.3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>
        <motion.p {...fadeUp(0.3)} style={{ textAlign: "center", marginTop: 32, ...BODY, fontSize: 13, color: "rgba(237,230,220,0.28)" }}>
          + Webhook support · custom connectors · offline-first mobile scanner app
        </motion.p>
      </div>
    </section>
  );
}

// ─── ROI Calculator ────────────────────────────────────────────────────────────
function ROICalculator() {
  const [beds, setBeds] = useState(300);
  const [budget, setBudget] = useState(50);
  const annualBudget = budget * 120000;
  const savedExpiry = annualBudget * 0.042 * 0.85;
  const savedStockouts = Math.round(beds * 0.014) * 15000 * 12 * 0.88;
  const totalSaved = savedExpiry + savedStockouts;
  const platformCost = beds < 200 ? 600000 : beds < 500 ? 1200000 : 2400000;
  const roiMultiple = Math.max(0, (totalSaved - platformCost) / platformCost);
  const fmt = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${Math.round(n).toLocaleString()}`;
  return (
    <section className="lp-section" style={{ background: C.cream }}>
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} style={{ marginBottom: 52, textAlign: "center" }}>
          <Label>ROI calculator</Label>
          <h2 style={{ margin: 0, lineHeight: 1.1 }}>
            <span style={{ ...SANS, fontSize: "clamp(26px,3.2vw,44px)", color: C.textDark, display: "block" }}>See your savings</span>
            <span style={{ ...SERIF, fontSize: "clamp(28px,3.5vw,47px)", color: C.textDark, display: "block" }}>before day one.</span>
          </h2>
          <p style={{ ...BODY, fontSize: 15, color: C.textMid, maxWidth: 400, margin: "14px auto 0", lineHeight: 1.65 }}>Adjust your hospital parameters and see a realistic savings projection.</p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div {...fadeUp(0.08)} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {[
              { label: "Hospital beds", value: beds, display: `${beds}`, min: 50, max: 2000, step: 25, lo: "50 beds", hi: "2,000 beds", set: setBeds },
              { label: "Monthly supply budget", value: budget, display: `₹${budget}L`, min: 5, max: 500, step: 5, lo: "₹5L", hi: "₹500L", set: setBudget },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ ...BODY, fontSize: 14, color: C.textDark, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ ...NUM, fontSize: 24, color: C.textDark, letterSpacing: "-0.02em" }}>{s.display}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={(e) => s.set(+e.target.value)} style={{ width: "100%", accentColor: C.gold, cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ ...BODY, fontSize: 11, color: C.textMid }}>{s.lo}</span>
                  <span style={{ ...BODY, fontSize: 11, color: C.textMid }}>{s.hi}</span>
                </div>
              </div>
            ))}
            <div style={{ background: `${C.gold}0E`, border: `1px solid ${C.gold}22`, borderRadius: 12, padding: "14px 18px" }}>
              <p style={{ ...BODY, fontSize: 12, color: C.textMid, lineHeight: 1.6, margin: 0 }}>Based on industry benchmarks: avg 4.2% supply budget lost to expiry waste, ₹15,000 per stockout incident. Actual results may vary.</p>
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.16)}>
            <div style={{ background: C.midnight, borderRadius: 20, padding: 32, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 24px 64px rgba(0,0,0,0.16)", position: "sticky", top: 100 }}>
              <div style={{ ...BODY, fontSize: 10.5, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 18 }}>Your estimated annual savings</div>
              <motion.div key={`${beds}-${budget}`} initial={{ opacity: 0.5, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
                <div style={{ ...NUM, fontSize: 52, color: "#22c55e", letterSpacing: "-0.03em", lineHeight: 1 }}>{fmt(totalSaved)}</div>
                <div style={{ ...BODY, fontSize: 12, color: "rgba(237,230,220,0.3)", marginTop: 6, marginBottom: 26 }}>per year in expiry waste + stockout prevention</div>
                <div>
                  {[
                    { label: "Expiry waste savings", value: fmt(savedExpiry), color: C.gold },
                    { label: "Stockout prevention", value: fmt(savedStockouts), color: C.gold },
                    { label: "Platform cost (annual)", value: `–${fmt(platformCost)}`, color: "rgba(237,230,220,0.3)" },
                    { label: "Net ROI multiple", value: `${roiMultiple.toFixed(1)}×`, color: "#22c55e" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ ...BODY, fontSize: 12.5, color: "rgba(237,230,220,0.42)" }}>{item.label}</span>
                      <span style={{ ...NUM, fontSize: 18, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Comparison Table ──────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { feature: "Real-time stock visibility", ms: true, manual: false, erp: "partial" },
  { feature: "AI demand forecasting (30-day)", ms: true, manual: false, erp: false },
  { feature: "Expiry waste prevention", ms: true, manual: false, erp: "partial" },
  { feature: "Crisis coordination network", ms: true, manual: false, erp: false },
  { feature: "48-hour deployment", ms: true, manual: true, erp: false },
  { feature: "HL7 FHIR native", ms: true, manual: false, erp: "partial" },
  { feature: "Predictive stockout alerts", ms: true, manual: false, erp: false },
  { feature: "Multi-department visibility", ms: true, manual: false, erp: "partial" },
];
function ComparisonTable() {
  return (
    <section className="lp-section" style={{ background: C.cream, paddingTop: 0 }}>
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} style={{ marginBottom: 48, textAlign: "center" }}>
          <Label>Compare</Label>
          <h2 style={{ margin: 0, lineHeight: 1.1 }}>
            <span style={{ ...SANS, fontSize: "clamp(26px,3.2vw,44px)", color: C.textDark, display: "block" }}>Why switch from</span>
            <span style={{ ...SERIF, fontSize: "clamp(28px,3.5vw,47px)", color: C.textDark, display: "block" }}>what you have today?</span>
          </h2>
        </motion.div>
        <motion.div {...fadeUp(0.1)} style={{ border: `1px solid ${C.borderLight}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: C.midnight }}>
            <div style={{ padding: "18px 24px" }} />
            {[{ label: "MedStock AI", hi: true }, { label: "Spreadsheets", hi: false }, { label: "Legacy ERP", hi: false }].map((col) => (
              <div key={col.label} style={{ padding: "18px 12px", textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ ...SANS, fontSize: 12, color: col.hi ? C.gold : "rgba(237,230,220,0.32)" }}>{col.label}</span>
              </div>
            ))}
          </div>
          {COMPARE_ROWS.map((row, i) => (
            <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: i % 2 === 0 ? C.cream : C.creamDark, borderTop: `1px solid ${C.borderLight}` }}>
              <div style={{ padding: "14px 24px", display: "flex", alignItems: "center" }}>
                <span style={{ ...BODY, fontSize: 13.5, color: C.textDark }}>{row.feature}</span>
              </div>
              {([row.ms, row.manual, row.erp] as Array<boolean | string>).map((val, j) => (
                <div key={j} style={{ padding: "14px 12px", textAlign: "center", borderLeft: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {val === true ? <span style={{ color: "#22c55e", fontSize: 17, fontWeight: 700 }}>✓</span>
                  : val === false ? <span style={{ color: C.borderLight, fontSize: 16 }}>✗</span>
                  : <span style={{ ...BODY, fontSize: 11.5, color: C.goldDim, fontWeight: 500 }}>Partial</span>}
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Does MedStock AI store patient data?", a: "No. MedStock AI operates purely on inventory and procurement metadata. No patient health records, clinical data, or PII are ever processed or stored by our platform. We are HIPAA-compliant by design, with a dedicated BAA available on request." },
  { q: "How long does deployment take?", a: "Most hospitals are fully operational within 48 hours. We provide a lightweight connector kit that integrates with your existing HIS or ERP, and our onboarding team handles the full configuration on your behalf." },
  { q: "Does it work without an existing ERP?", a: "Absolutely. Many of our hospital clients started on Excel-based procurement. MedStock AI offers a clean CSV import pathway and can operate standalone with barcode or RFID scanning — no prior ERP required." },
  { q: "What happens if the AI makes a wrong forecast?", a: "All forecasts include uncertainty bands clearly labelled with confidence scores. Human procurement officers always retain override control. We track forecast accuracy daily and surface any degradation automatically." },
  { q: "What's the contract commitment?", a: "Clinical and Enterprise plans are billed monthly or annually with no minimum term lock-in. The Enterprise plan includes a 90-day performance guarantee — if you don't save 5× the cost, we refund the difference." },
  { q: "Is my supply data shared with other hospitals?", a: "Never. Your data is yours — isolated in a dedicated encrypted tenant, not shared, sold, or used to train models for other clients. Each tenant has its own encryption keys." },
];
function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="lp-section" style={{ background: C.cream }}>
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp()} style={{ marginBottom: 52, textAlign: "center" }}>
          <Label>FAQ</Label>
          <h2 style={{ margin: 0, lineHeight: 1.1 }}>
            <span style={{ ...SANS, fontSize: "clamp(26px,3.2vw,44px)", color: C.textDark, display: "block" }}>Questions from</span>
            <span style={{ ...SERIF, fontSize: "clamp(28px,3.5vw,47px)", color: C.textDark, display: "block" }}>procurement teams.</span>
          </h2>
        </motion.div>
        <div>
          {FAQS.map((faq, i) => (
            <motion.div key={i} {...fadeUp(i * 0.04)} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}>
                <span style={{ ...BODY, fontSize: 15, fontWeight: 500, color: C.textDark, lineHeight: 1.45 }}>{faq.q}</span>
                <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ display: "inline-block", fontSize: 22, color: C.gold, lineHeight: 1, flexShrink: 0, fontWeight: 300 }}>+</motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                    <p style={{ ...BODY, fontSize: 14.5, color: C.textMid, lineHeight: 1.72, paddingBottom: 22, margin: 0 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Blog / Intelligence Preview ───────────────────────────────────────────────
const BLOG_POSTS = [
  { tag: "Supply Chain", title: "The true cost of a hospital stockout — and why spreadsheets can't prevent them", excerpt: "When a hospital runs out of a critical injectable, the consequences ripple far beyond the missing SKU. We break down the full financial and clinical cost.", date: "Apr 2026", read: "5 min" },
  { tag: "AI + Forecasting", title: "How rolling 30-day AI forecasts beat 12-month procurement cycles", excerpt: "Traditional procurement plans on historical averages. AI forecasts on real-time signals — seasonal patterns, admission surges, supplier disruptions.", date: "Mar 2026", read: "6 min" },
  { tag: "Compliance", title: "ISO 27001 in healthcare: what IT teams need to know before buying SaaS", excerpt: "Procurement heads are asking tougher questions about data sovereignty. Here's what ISO 27001 actually means for your supply chain vendor.", date: "Feb 2026", read: "4 min" },
];
function BlogPreview() {
  return (
    <section className="lp-section" style={{ background: C.cream, borderTop: `1px solid ${C.borderLight}` }}>
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp()} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 52 }}>
          <div>
            <Label>Intelligence</Label>
            <h2 style={{ margin: 0, lineHeight: 1.08 }}>
              <span style={{ ...SANS, fontSize: "clamp(22px,2.8vw,38px)", color: C.textDark, display: "block" }}>From the MedStock</span>
              <span style={{ ...SERIF, fontSize: "clamp(24px,3vw,41px)", color: C.textDark, display: "block" }}>intelligence desk.</span>
            </h2>
          </div>
          <span style={{ ...BODY, fontSize: 13, color: C.gold, fontWeight: 600, cursor: "pointer" }}>View all articles →</span>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)} whileHover={{ y: -4 }} style={{ cursor: "pointer" }}>
              <div style={{ height: 138, background: `linear-gradient(135deg, ${C.midnight} 0%, ${C.navy} 100%)`, borderRadius: "14px 14px 0 0", border: `1px solid ${C.borderLight}`, display: "flex", alignItems: "flex-end", padding: 18 }}>
                <span style={{ ...BODY, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase", background: `${C.gold}18`, padding: "4px 10px", borderRadius: 4 }}>{post.tag}</span>
              </div>
              <div style={{ background: C.creamDark, borderRadius: "0 0 14px 14px", border: `1px solid ${C.borderLight}`, borderTop: "none", padding: 20 }}>
                <h3 style={{ ...SANS, fontSize: 14, color: C.textDark, margin: "0 0 10px", lineHeight: 1.45, letterSpacing: "-0.01em" }}>{post.title}</h3>
                <p style={{ ...BODY, fontSize: 13, color: C.textMid, lineHeight: 1.65, margin: "0 0 16px" }}>{post.excerpt}</p>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ ...BODY, fontSize: 11, color: C.textMid }}>{post.date}</span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.borderLight, display: "inline-block" }} />
                  <span style={{ ...BODY, fontSize: 11, color: C.textMid }}>{post.read} read</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <ScrollProgress />
      <LiveActivityToast />
      <Navbar onDemo={() => setDemoOpen(true)} />
      <Hero onDemo={() => setDemoOpen(true)} />
      <TrustedBy />
      <PressMentions />
      <LiveStatsStrip />
      <Intro />
      <Stats />
      <CaseStudySpotlight />
      <Problem />
      <Features />
      <IntegrationsGrid />
      <DemoPreview />
      <ROICalculator />
      <ComparisonTable />
      <Testimonials />
      <Pricing />
      <FAQAccordion />
      <CTA onDemo={() => setDemoOpen(true)} />
      <BlogPreview />
      <Footer />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
