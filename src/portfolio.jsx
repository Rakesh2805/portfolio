import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

/* ─────────────────────────────────────────────
   GLOBAL STYLES  (injected once into <head>)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #0f0f0f;
  --bg2:       #141414;
  --bg3:       #1a1a1a;
  --border:    rgba(255,255,255,0.07);
  --accent:    #00b4d8;
  --accent2:   #0077b6;
  --accent3:   #90e0ef;
  --text:      #e2e8f0;
  --muted:     #6b7280;
  --danger:    #ff6b6b;
  --gold:      #ffd166;
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  overflow-x: hidden;
  line-height: 1.6;
}

::selection { background: rgba(0,180,216,0.3); }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--accent2); border-radius: 2px; }

.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
@keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-12px); }
}
@keyframes pulseGlow {
  0%,100% { box-shadow: 0 0 0 0 rgba(0,180,216,0.3); }
  50%      { box-shadow: 0 0 0 8px rgba(0,180,216,0); }
}
`;

/* ─── inject global CSS ─── */
function useGlobalCSS() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
}

/* ─── intersection-observer reveal hook ─── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
const navbarCSS = `
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  height: 60px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2.5rem;
  background: rgba(15,15,15,0.85);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  transition: background 0.3s;
}
.navbar-logo {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.35rem; font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.04em;
  text-decoration: none;
}
.navbar-logo span { color: var(--text); }
.navbar-links {
  display: flex; gap: 2rem; list-style: none;
}
.navbar-links a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: color 0.2s;
  position: relative;
  padding-bottom: 2px;
}
.navbar-links a::after {
  content: '';
  position: absolute; bottom: -2px; left: 0; right: 0;
  height: 1px; background: var(--accent);
  transform: scaleX(0); transition: transform 0.2s;
  transform-origin: left;
}
.navbar-links a:hover { color: var(--accent); }
.navbar-links a:hover::after { transform: scaleX(1); }

.hamburger {
  display: none;
  flex-direction: column; gap: 5px;
  cursor: pointer; background: none; border: none; padding: 4px;
}
.hamburger span {
  width: 22px; height: 1.5px;
  background: var(--text);
  transition: all 0.3s;
}
.hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4.5px,4.5px); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4.5px,-4.5px); }

.mobile-menu {
  display: none;
  position: fixed; top: 60px; left: 0; right: 0;
  background: rgba(15,15,15,0.97);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  flex-direction: column; gap: 0;
  z-index: 999;
  overflow: hidden;
  max-height: 0; transition: max-height 0.35s ease;
}
.mobile-menu.open { max-height: 400px; }
.mobile-menu a {
  color: var(--muted); text-decoration: none;
  padding: 1rem 2.5rem;
  font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
  border-bottom: 1px solid var(--border);
  transition: color 0.2s, background 0.2s;
}
.mobile-menu a:hover { color: var(--accent); background: rgba(0,180,216,0.04); }

@media(max-width:768px){
  .navbar-links { display: none; }
  .hamburger { display: flex; }
  .mobile-menu { display: flex; }
}
`;

function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    ["About", "#about"], ["Education", "#education"], ["Skills", "#skills"],
    ["Projects", "#projects"], ["Contact", "#contact"]
  ];
  return (
    <>
      <style>{navbarCSS}</style>
      <nav className="navbar">
        <a className="navbar-logo" href="#hero">GR<span>.</span></a>
        <ul className="navbar-links">
          {links.map(([l, h]) => (
            <li key={l}><a href={h}>{l}</a></li>
          ))}
        </ul>
        <button className={`hamburger${open ? " open" : ""}`} onClick={() => setOpen(!open)} aria-label="menu">
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-menu${open ? " open" : ""}`}>
        {links.map(([l, h]) => (
          <a key={l} href={h} onClick={() => setOpen(false)}>{l}</a>
        ))}
      </div>
    </>
  );
}

/* ══════════════════════════════════════
   HERO
══════════════════════════════════════ */
const heroCSS = `
.hero {
  min-height: 100vh;
  display: flex; align-items: center;
  padding: 80px 2.5rem 0;
  position: relative; overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0; z-index: 0;
  background: linear-gradient(135deg, #0f0f0f 0%, #0a1628 35%, #0f0f0f 65%, #0d1f1a 100%);
  background-size: 300% 300%;
  animation: gradientShift 12s ease infinite;
}
.hero-grid {
  position: absolute; inset: 0; z-index: 0;
  background-image:
    linear-gradient(rgba(0,180,216,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,180,216,0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%);
}
.hero-scanline {
  position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
}
.hero-scanline::after {
  content:'';
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(transparent, rgba(0,180,216,0.06), transparent);
  animation: scanline 6s linear infinite;
}
.hero-split {
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto; width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  gap: 2rem;
}
.hero-content {
  flex: 1; max-width: 600px;
}
.hero-globe-wrap {
  flex-shrink: 0;
  width: 420px; height: 420px;
  position: relative;
  opacity: 0; animation: fadeIn 0.8s 0.6s ease both;
}
.hero-globe-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}
.hero-globe-glow {
  position: absolute; inset: -20%; z-index: -1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,180,216,0.12) 0%, transparent 70%);
  filter: blur(30px);
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 0.6rem;
  color: var(--accent); font-size: 0.72rem;
  letter-spacing: 0.18em; text-transform: uppercase;
  margin-bottom: 1.5rem;
  opacity: 0; animation: fadeIn 0.5s 0.2s ease both;
}
.hero-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent);
  animation: pulseGlow 2s infinite;
}
.hero-name {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(2.8rem, 8vw, 6.2rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
  margin-bottom: 1rem;
  opacity: 0; animation: fadeIn 0.6s 0.35s ease both;
}
.hero-name .accent { color: var(--accent); }
.hero-title {
  font-size: clamp(0.85rem, 2vw, 1.05rem);
  color: var(--accent3);
  letter-spacing: 0.06em;
  margin-bottom: 1.5rem;
  opacity: 0; animation: fadeIn 0.6s 0.5s ease both;
}
.hero-tagline {
  color: var(--muted); font-size: 0.88rem;
  max-width: 480px; line-height: 1.9;
  margin-bottom: 2.5rem;
  opacity: 0; animation: fadeIn 0.6s 0.65s ease both;
}
.hero-cursor { animation: blink 1s step-end infinite; }
.hero-buttons {
  display: flex; gap: 1rem; flex-wrap: wrap;
  opacity: 0; animation: fadeIn 0.6s 0.8s ease both;
}
.btn-primary {
  padding: 0.75rem 1.75rem;
  background: var(--accent);
  color: #0f0f0f;
  border: none; border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  text-decoration: none; cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: var(--accent3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,180,216,0.35);
}
.btn-outline {
  padding: 0.75rem 1.75rem;
  background: transparent;
  color: var(--accent);
  border: 1px solid rgba(0,180,216,0.4);
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
  text-decoration: none; cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover {
  background: rgba(0,180,216,0.08);
  border-color: var(--accent);
  transform: translateY(-2px);
}
.hero-scroll-hint {
  position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  color: var(--muted); font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
  opacity: 0; animation: fadeIn 0.6s 1.2s ease both;
  z-index: 1;
}
.scroll-arrow {
  width: 16px; height: 16px;
  border-right: 1.5px solid var(--muted);
  border-bottom: 1.5px solid var(--muted);
  transform: rotate(45deg);
  animation: float 1.8s ease-in-out infinite;
}
@media(max-width:900px){
  .hero-split { flex-direction: column; text-align: left; }
  .hero-content { max-width: 100%; }
  .hero-globe-wrap { display: none; }
  .hero-tagline { margin-left: 0; margin-right: 0; }
  .hero-buttons { justify-content: flex-start; }
  .hero-eyebrow { justify-content: flex-start; }
}
@media(max-width:600px){
  .hero-buttons { flex-direction: column; }
  .btn-primary, .btn-outline { text-align: center; }
}
`;

function FighterJet() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const SIZE = 420;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const cx = SIZE / 2, cy = SIZE / 2;
    let animId;

    const particles = [];

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      const time = Date.now() * 0.001;

      // Glow effect background
      const glowGrd = ctx.createRadialGradient(cx, cy, 30, cx, cy, 180);
      glowGrd.addColorStop(0, 'rgba(0,180,216,0.08)');
      glowGrd.addColorStop(1, 'rgba(0,180,216,0)');
      ctx.fillStyle = glowGrd;
      ctx.beginPath();
      ctx.arc(cx, cy, 200, 0, Math.PI * 2);
      ctx.fill();

      // Radar background
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 180, 216, 0.06)';
      ctx.lineWidth = 1;
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.2);
      for (let r = 30; r <= 180; r += 30) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-180, 0); ctx.lineTo(180, 0);
      ctx.moveTo(0, -180); ctx.lineTo(0, 180);
      ctx.moveTo(-127, -127); ctx.lineTo(127, 127);
      ctx.moveTo(-127, 127); ctx.lineTo(127, -127);
      ctx.stroke();
      ctx.restore();

      // Floating / Banking animation
      const floatY = Math.sin(time * 1.5) * 12;
      const bankAngle = Math.sin(time * 1.2) * 0.12;

      // Spawn engine exhaust particles
      if (Math.random() > 0.1) {
        // Left
        particles.push({
          x: cx - 25 * Math.cos(bankAngle) + (Math.random() * 8 - 4),
          y: cy + floatY - 25 * Math.sin(bankAngle) + (Math.random() * 4),
          vx: -Math.sin(bankAngle) * 5 + (Math.random() * 0.8 - 0.4),
          vy: Math.cos(bankAngle) * (4 + Math.random() * 2),
          life: 1,
          size: Math.random() * 2.5 + 1.5
        });
        // Right
        particles.push({
          x: cx + 25 * Math.cos(bankAngle) + (Math.random() * 8 - 4),
          y: cy + floatY + 25 * Math.sin(bankAngle) + (Math.random() * 4),
          vx: -Math.sin(bankAngle) * 5 + (Math.random() * 0.8 - 0.4),
          vy: Math.cos(bankAngle) * (4 + Math.random() * 2),
          life: 1,
          size: Math.random() * 2.5 + 1.5
        });
      }

      // Draw particles
      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 180, 216, ${p.life})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00b4d8';
        ctx.fill();
      }
      ctx.restore();

      // Draw B-2 Spirit Jet
      ctx.save();
      ctx.translate(cx, cy + floatY);
      ctx.rotate(bankAngle);

      // Main Body Path
      ctx.beginPath();
      ctx.moveTo(0, -90);   // Nose
      ctx.lineTo(140, 30);  // Right Tip
      ctx.lineTo(140, 50);  // Right Tip Back
      ctx.lineTo(70, 0);    // Right Inner trailing 1
      ctx.lineTo(35, 20);   // Right Inner trailing 2
      ctx.lineTo(0, 0);     // Tail center
      ctx.lineTo(-35, 20);  // Left Inner trailing 2
      ctx.lineTo(-70, 0);   // Left Inner trailing 1
      ctx.lineTo(-140, 50); // Left Tip Back
      ctx.lineTo(-140, 30); // Left Tip
      ctx.closePath();

      // Body styling
      const gradient = ctx.createLinearGradient(0, -90, 0, 50);
      gradient.addColorStop(0, '#102a43');
      gradient.addColorStop(1, '#081421');
      ctx.fillStyle = gradient;

      ctx.shadowColor = 'rgba(0,180,216, 0.4)';
      ctx.shadowBlur = 15;
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#00b4d8';
      ctx.stroke();

      // Panel lines
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(0, -85);
      ctx.lineTo(0, -10);
      ctx.moveTo(-35, -20);
      ctx.lineTo(35, -20);
      ctx.moveTo(-70, 0);
      ctx.lineTo(-35, -20);
      ctx.moveTo(70, 0);
      ctx.lineTo(35, -20);
      ctx.moveTo(-100, 20);
      ctx.lineTo(-70, 0);
      ctx.moveTo(100, 20);
      ctx.lineTo(70, 0);
      ctx.strokeStyle = 'rgba(0,180,216,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cockpit Window
      ctx.beginPath();
      ctx.moveTo(0, -65);
      ctx.lineTo(6, -53);
      ctx.lineTo(0, -48);
      ctx.lineTo(-6, -53);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 180, 216, 0.5)';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.stroke();

      // Cockpit Glint
      ctx.beginPath();
      ctx.moveTo(-2, -60);
      ctx.lineTo(2, -55);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Engine Intake / Glow Details
      ctx.fillStyle = '#030a11';
      ctx.beginPath(); ctx.rect(15, -15, 20, 15); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-35, -15, 20, 15); ctx.fill(); ctx.stroke();

      // Engine exhaust plates
      ctx.beginPath();
      ctx.moveTo(15, 0); ctx.lineTo(35, 15); ctx.lineTo(15, 10);
      ctx.moveTo(-15, 0); ctx.lineTo(-35, 15); ctx.lineTo(-15, 10);
      ctx.strokeStyle = 'rgba(0,180,216,0.6)';
      ctx.stroke();

      // Wingtip lights (biking)
      const blink = Math.sin(time * 8) > 0 ? 1 : 0.2;
      ctx.beginPath();
      ctx.arc(-138, 48, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 50, 50, ${blink})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(138, 48, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(50, 255, 50, ${blink})`;
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

function Hero() {
  return (
    <>
      <style>{heroCSS}</style>
      <section id="hero" className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-scanline" />
        <div className="hero-split">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-dot" />
              Available for opportunities
            </div>
            <h1 className="hero-name">
              Gajjelli<br /><span className="accent">Rakesh</span>
            </h1>
            <div className="hero-title">
              MERN Stack Developer &amp; Data Science Student
            </div>
            <p className="hero-tagline">
              Building scalable web applications and intelligent systems.<br />
              Passionate about clean code, automation, and modern UI.
              <span className="hero-cursor">_</span>
            </p>
            <div className="hero-buttons">
              <a href="#projects" className="btn-primary">View Projects</a>
              <a href="#contact" className="btn-outline">Contact Me</a>
            </div>
          </div>
          <div className="hero-globe-wrap">
            <div className="hero-globe-glow" />
            <FighterJet />
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>scroll</span>
          <div className="scroll-arrow" />
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════
   ABOUT
══════════════════════════════════════ */
const aboutCSS = `
.about { padding: 7rem 2.5rem; background: var(--bg2); }
.section-label {
  font-size: 0.68rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 0.75rem;
  display: flex; align-items: center; gap: 0.75rem;
}
.section-label::before {
  content:''; width: 28px; height: 1px; background: var(--accent);
}
.section-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(1.8rem,4vw,2.8rem);
  font-weight: 700; letter-spacing: -0.01em;
  margin-bottom: 3.5rem; line-height: 1.1;
}
.about-grid {
  display: grid; grid-template-columns: 280px 1fr;
  gap: 4rem; align-items: start;
  max-width: 1100px; margin: 0 auto;
}
.about-avatar-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
}
.about-avatar {
  width: 220px; height: 220px; border-radius: 12px;
  background: linear-gradient(135deg, var(--bg3) 0%, #0a1628 100%);
  border: 1px solid rgba(0,180,216,0.2);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  animation: float 5s ease-in-out infinite;
}
.about-avatar img {
  width: 190%; height: 100%;
  object-fit: cover;
  position: relative; z-index: 1;
}
.about-avatar::before {
  content:'';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,180,216,0.08), transparent);
  z-index: 2; pointer-events: none;
}
.about-badge {
  padding: 0.35rem 1rem;
  background: rgba(0,180,216,0.08);
  border: 1px solid rgba(0,180,216,0.25);
  border-radius: 100px;
  font-size: 0.7rem; color: var(--accent);
  letter-spacing: 0.08em; text-align: center;
}
.about-text p {
  color: var(--muted); font-size: 0.86rem;
  line-height: 1.95; margin-bottom: 1.25rem;
}
.about-highlights {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1rem; margin-top: 2rem;
}
.highlight-card {
  padding: 1.25rem 1.5rem;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.2s, transform 0.2s;
}
.highlight-card:hover {
  border-color: rgba(0,180,216,0.3);
  transform: translateY(-3px);
}
.highlight-icon { font-size: 1.25rem; margin-bottom: 0.5rem; }
.highlight-label {
  font-size: 0.65rem; color: var(--muted);
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 0.3rem;
}
.highlight-value {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.95rem; font-weight: 600; color: var(--text);
}
.highlight-value span { color: var(--accent); }
@media(max-width:768px){
  .about-grid { grid-template-columns: 1fr; }
  .about-avatar-wrap { flex-direction: row; align-items: center; }
  .about-highlights { grid-template-columns: 1fr 1fr; }
}
@media(max-width:480px){
  .about-highlights { grid-template-columns: 1fr; }
  .about-avatar-wrap { flex-direction: column; }
}
`;

function About() {
  return (
    <>
      <style>{aboutCSS}</style>
      <section id="about" className="about">
        <div className="section-label reveal">About Me</div>
        <h2 className="section-title reveal">Who I Am</h2>
        <div className="about-grid">
          <div className="about-avatar-wrap reveal">
            <div className="about-avatar">
              <img src="/images/admin.jpg" alt="Gajjelli Rakesh" />
            </div>
            <div className="about-badge">Open to Work</div>
          </div>
          <div className="about-text reveal reveal-delay-1">
            <p>
              I'm <strong style={{ color: "var(--text)" }}>Gajjelli Rakesh</strong>, a CSE (Data Science) undergraduate
              at Malla Reddy Engineering College, passionate about building full-stack web applications
              and intelligent systems that solve real-world problems.
            </p>
            <p>
              As a MERN Stack Developer, I design and build modular, scalable applications with a focus on performance and maintainability. I develop efficient RESTful APIs and create responsive React frontends that ensure a smooth user experience.
              My work emphasizes clean architecture, structured design patterns, and seamless system integration, including automation workflows such as attendance management using n8n.
            </p>
            <p>
              I thrive on clean architecture, meaningful UX, and continuous learning.
              Currently exploring advanced backend patterns and cloud deployment.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════
   EDUCATION
══════════════════════════════════════ */
const educationCSS = `
.education { padding: 7rem 2.5rem; background: var(--bg); }
.education-timeline {
  max-width: 900px; margin: 0 auto;
  position: relative;
  padding-left: 2.5rem;
}
.education-timeline::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--accent2), var(--accent), var(--accent3));
}
.edu-card {
  position: relative;
  padding: 2rem 2.25rem;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 2rem;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
}
.edu-card:hover {
  border-color: rgba(0,180,216,0.35);
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,180,216,0.08);
}
.edu-card::before {
  content: '';
  position: absolute;
  left: -2.5rem;
  top: 2.25rem;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--bg);
  box-shadow: 0 0 0 3px rgba(0,180,216,0.25);
  transform: translateX(-5px);
}
.edu-header {
  display: flex; align-items: center; gap: 1.25rem;
  margin-bottom: 1rem;
}
.edu-logo {
  width: 56px; height: 56px;
  border-radius: 10px;
  object-fit: contain;
  background: var(--bg3);
  border: 1px solid var(--border);
  padding: 6px;
  flex-shrink: 0;
}
.edu-logo-placeholder {
  width: 56px; height: 56px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(0,180,216,0.12), rgba(0,119,182,0.12));
  border: 1px solid rgba(0,180,216,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; flex-shrink: 0;
}
.edu-info { flex: 1; }
.edu-degree {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.15rem; font-weight: 700;
  line-height: 1.2; margin-bottom: 0.3rem;
}
.edu-school {
  font-size: 0.82rem; color: var(--accent3);
  margin-bottom: 0.15rem;
}
.edu-meta {
  display: flex; gap: 1.5rem; flex-wrap: wrap;
  margin-top: 0.75rem;
}
.edu-meta-item {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.72rem; color: var(--muted);
  letter-spacing: 0.04em;
}
.edu-meta-item span.accent { color: var(--accent); font-weight: 600; }
@media(max-width:600px){
  .education-timeline { padding-left: 1.5rem; }
  .edu-card::before { left: -1.5rem; }
  .edu-header { flex-direction: column; align-items: flex-start; }
  .edu-card { padding: 1.5rem; }
}
`;

const EDUCATION = [
  {
    icon: "🎓",
    degree: "B.Tech CSE (Data Science)",
    school: "Malla Reddy Engineering College",
    duration: "2023 — 2027",
    gpa: "8.03 / 10.0",
    logo: "/images/mrec-logo2.png",
  },
  {
    icon: "📚",
    degree: "Intermediate — MPC",
    school: "Sri Chaitanya Junior College of Science",
    duration: "2021 — 2023",
    gpa: "8.24 / 10.0",
    logo: "/images/sri-chaitanya-logo.jpg",
  },
  {
    icon: "🏫",
    degree: "SSC (10th)",
    school: "Prathibha Vidyalayam",
    duration: "2020 — 2021",
    gpa: "10 / 10.0",
    logo: "/images/prathibha-logo.png",
  },
];

function Education() {
  return (
    <>
      <style>{educationCSS}</style>
      <section id="education" className="education">
        <div className="section-label reveal">Education</div>
        <h2 className="section-title reveal">Academic Journey</h2>
        <div className="education-timeline">
          {EDUCATION.map((edu, i) => (
            <div className={`edu-card reveal reveal-delay-${(i % 4) + 1}`} key={edu.degree}>
              <div className="edu-header">
                <img
                  className="edu-logo"
                  src={edu.logo}
                  alt={edu.school}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="edu-logo-placeholder" style={{ display: 'none' }}>
                  {edu.icon}
                </div>
                <div className="edu-info">
                  <div className="edu-degree">{edu.degree}</div>
                  <div className="edu-school">{edu.school}</div>
                </div>
              </div>
              <div className="edu-meta">
                <div className="edu-meta-item">📅 {edu.duration}</div>
                <div className="edu-meta-item">📊 GPA: <span className="accent">{edu.gpa}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════
   SKILLS
══════════════════════════════════════ */
const skillsCSS = `
.skills { padding: 7rem 2.5rem; background: var(--bg); }
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.5rem;
  max-width: 1100px; margin: 0 auto;
}
.skill-card {
  padding: 1.75rem;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
}
.skill-card:hover {
  border-color: rgba(0,180,216,0.3);
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,180,216,0.1);
}
.skill-card-header {
  display: flex; align-items: center; gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.skill-card-icon { font-size: 1.2rem; }
.skill-card-label {
  font-size: 0.65rem; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--accent);
  font-weight: 500;
}
.skill-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.skill-pill {
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 3px;
  font-size: 0.72rem;
  color: var(--muted);
  background: var(--bg3);
  transition: all 0.2s; cursor: default;
}
.skill-pill:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(0,180,216,0.06);
}
`;

const SKILLS = [
  { icon: "⌨️", label: "Languages", tags: ["Python", "JavaScript", "Java"] },
  { icon: "🌐", label: "Web Dev", tags: ["HTML", "CSS", "React.js", "Node.js", "Express.js"] },
  { icon: "🗄️", label: "Databases", tags: ["MongoDB", "MySQL"] },
  { icon: "🔧", label: "Tools", tags: ["Git", "GitHub", "n8n"] },
  { icon: "📐", label: "Concepts", tags: ["OOPs", "REST APIs", "MVC Architecture"] },
];

function Skills() {
  return (
    <>
      <style>{skillsCSS}</style>
      <section id="skills" className="skills">
        <div className="section-label reveal">Technical Stack</div>
        <h2 className="section-title reveal">Skills &amp; Technologies</h2>
        <div className="skills-grid">
          {SKILLS.map((cat, i) => (
            <div className={`skill-card reveal reveal-delay-${(i % 4) + 1}`} key={cat.label}>
              <div className="skill-card-header">
                <span className="skill-card-icon">{cat.icon}</span>
                <span className="skill-card-label">{cat.label}</span>
              </div>
              <div className="skill-tags">
                {cat.tags.map(t => (
                  <span className="skill-pill" key={t}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════
   PROJECTS
══════════════════════════════════════ */
const projectsCSS = `
.projects { padding: 7rem 2.5rem; background: var(--bg2); }
.projects-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 2rem; max-width: 1100px; margin: 0 auto;
}
.project-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden;
  display: flex; flex-direction: column;
  transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
}
.project-card:hover {
  transform: translateY(-8px);
  border-color: rgba(0,180,216,0.35);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,180,216,0.07);
}
.project-banner {
  height: 160px;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.project-banner-1 {
  background: linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #091520 100%);
}
.project-banner-2 {
  background: linear-gradient(135deg, #0f1a10 0%, #0a2010 50%, #091510 100%);
}
.project-banner-icon { font-size: 3.5rem; opacity: 0.7; }
.project-banner-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(0,180,216,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,180,216,0.05) 1px, transparent 1px);
  background-size: 28px 28px;
}
.project-badge {
  position: absolute; top: 1rem; right: 1rem;
  padding: 0.2rem 0.65rem;
  background: rgba(0,180,216,0.15);
  border: 1px solid rgba(0,180,216,0.3);
  border-radius: 100px;
  font-size: 0.62rem; color: var(--accent);
  letter-spacing: 0.1em; text-transform: uppercase;
}
.project-body { padding: 1.75rem; flex: 1; display: flex; flex-direction: column; }
.project-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.25rem; font-weight: 700;
  margin-bottom: 0.75rem; line-height: 1.2;
}
.project-desc {
  color: var(--muted); font-size: 0.8rem;
  line-height: 1.85; margin-bottom: 1.25rem; flex: 1;
}
.project-features {
  list-style: none; margin-bottom: 1.5rem;
  display: flex; flex-direction: column; gap: 0.4rem;
}
.project-features li {
  font-size: 0.76rem; color: var(--muted);
  padding-left: 1.1rem; position: relative; line-height: 1.6;
}
.project-features li::before {
  content: '▸'; position: absolute; left: 0;
  color: var(--accent); font-size: 0.7rem;
}
.project-footer {
  border-top: 1px solid var(--border);
  padding: 1.25rem 1.75rem;
  display: flex; flex-wrap: wrap; gap: 0.5rem;
}
.tech-tag {
  padding: 0.22rem 0.65rem;
  background: rgba(0,180,216,0.07);
  border: 1px solid rgba(0,180,216,0.18);
  border-radius: 3px;
  font-size: 0.67rem; color: var(--accent3);
  letter-spacing: 0.04em;
}
@media(max-width:768px){
  .projects-grid { grid-template-columns: 1fr; }
}
`;

const PROJECTS = [
  {
    banner: "project-banner-1",
    icon: "🧠",
    badge: "ML / CV",
    title: "Brain Tumor Detection using CNN",
    desc: "A real-time brain tumor detection system powered by Convolutional Neural Networks, capable of classifying MRI scans with high accuracy using advanced image processing pipelines.",
    features: [
      "Trained CNN model on labeled MRI datasets with augmentation",
      "Preprocessing pipeline with normalization & feature extraction",
      "Real-time prediction interface for MRI uploads",
      "Improved accuracy via hyperparameter tuning & regularization",
    ],
    techs: ["Python", "TensorFlow", "Keras", "OpenCV", "NumPy"],
  },
  {
    banner: "project-banner-2",
    icon: "📋",
    badge: "Full Stack",
    title: "Smart Student Attendance System",
    desc: "A full-stack attendance management platform built on the MERN stack with n8n workflow automation for notifications, report generation, and real-time tracking.",
    features: [
      "RESTful APIs with JWT authentication & role-based access",
      "Automated notifications & reports via n8n integration",
      "Scalable MVC backend architecture on Node.js",
      "Responsive React frontend with real-time dashboard",
    ],
    techs: ["MongoDB", "Express.js", "React.js", "Node.js", "n8n", "JWT"],
  },
];

function Projects() {
  return (
    <>
      <style>{projectsCSS}</style>
      <section id="projects" className="projects">
        <div className="section-label reveal">Work</div>
        <h2 className="section-title reveal">Featured Projects</h2>
        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <div className={`project-card reveal reveal-delay-${i + 1}`} key={p.title}>
              <div className={`project-banner ${p.banner}`}>
                <div className="project-banner-grid" />
                <span className="project-banner-icon">{p.icon}</span>
                <span className="project-badge">{p.badge}</span>
              </div>
              <div className="project-body">
                <h3 className="project-title">{p.title}</h3>
                <p className="project-desc">{p.desc}</p>
                <ul className="project-features">
                  {p.features.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
              <div className="project-footer">
                {p.techs.map(t => <span className="tech-tag" key={t}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}




/* ══════════════════════════════════════
   CONTACT
══════════════════════════════════════ */
const contactCSS = `
.contact { padding: 7rem 2.5rem; background: var(--bg); }
.contact-grid {
  display: grid; grid-template-columns: 1fr 1.5fr;
  gap: 5rem; max-width: 1100px; margin: 0 auto; align-items: start;
}
.contact-info-text {
  color: var(--muted); font-size: 0.85rem;
  line-height: 1.95; margin-bottom: 2.5rem;
}
.contact-links { display: flex; flex-direction: column; gap: 0.85rem; }
.contact-link {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.9rem 1.25rem;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none; color: var(--text);
  font-size: 0.8rem;
  transition: all 0.2s;
}
.contact-link:hover {
  border-color: rgba(0,180,216,0.35);
  color: var(--accent);
  transform: translateX(5px);
  background: rgba(0,180,216,0.04);
}
.contact-link-icon {
  width: 36px; height: 36px;
  background: rgba(0,180,216,0.09);
  border: 1px solid rgba(0,180,216,0.15);
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.95rem; flex-shrink: 0;
}
.contact-link-label {
  font-size: 0.62rem; color: var(--muted);
  letter-spacing: 0.08em; text-transform: uppercase;
  margin-bottom: 0.1rem;
}
.contact-link-value { font-size: 0.8rem; }

/* Form */
.contact-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-label {
  font-size: 0.65rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--muted);
}
.form-input, .form-textarea {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.8rem 1rem;
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus, .form-textarea:focus {
  border-color: rgba(0,180,216,0.45);
  box-shadow: 0 0 0 3px rgba(0,180,216,0.06);
}
.form-input::placeholder, .form-textarea::placeholder { color: var(--muted); }
.form-textarea { resize: vertical; min-height: 130px; }
.form-submit {
  padding: 0.85rem 2rem;
  background: var(--accent);
  color: #0f0f0f;
  border: none; border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; align-self: flex-start;
  transition: all 0.2s;
}
.form-submit:hover {
  background: var(--accent3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,180,216,0.3);
}
.form-note {
  font-size: 0.68rem; color: var(--muted);
  margin-top: -0.5rem;
}
.form-status {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-size: 0.78rem;
  letter-spacing: 0.03em;
  animation: fadeIn 0.3s ease;
}
.form-status.success {
  background: rgba(0, 200, 120, 0.1);
  border: 1px solid rgba(0, 200, 120, 0.3);
  color: #00c878;
}
.form-status.error {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: var(--danger);
}
.form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
@media(max-width:900px){
  .contact-grid { grid-template-columns: 1fr; gap: 3rem; }
}
@media(max-width:520px){
  .form-row { grid-template-columns: 1fr; }
}
`;

function Contact() {
  const formRef = useRef();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    setStatus(null);

    emailjs.sendForm(
      "service_v5u4r2e",
      "template_jobrva8",
      formRef.current,
      "JEPr9D-vOz1mY1fAg"
    )
      .then(() => {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      })
      .catch(() => {
        setStatus("error");
      })
      .finally(() => {
        setSending(false);
      });
  };

  return (
    <>
      <style>{contactCSS}</style>
      <section id="contact" className="contact">
        <div className="section-label reveal">Get In Touch</div>
        <h2 className="section-title reveal">Contact Me</h2>
        <div className="contact-grid">
          <div className="reveal">
            <p className="contact-info-text">
              I'm currently open to internship opportunities, collaborative projects,
              and freelance work. Whether you have a project idea or just want to connect —
              feel free to reach out!
            </p>
            <div className="contact-links">
              {[
                { icon: "📧", label: "Email", val: "grakeshram28@gmail.com", href: "mailto:grakeshram28@gmail.com" },
                { icon: "📱", label: "Phone", val: "+91 93813 56506", href: "tel:+919381356506" },
                { icon: "💼", label: "LinkedIn", val: "Gajjelli Rakesh", href: "https://www.linkedin.com/in/gajjelli-rakesh/" },
              ].map(l => (
                <a className="contact-link" href={l.href} key={l.label}
                  target={l.label === "LinkedIn" ? "_blank" : undefined} rel="noreferrer">
                  <span className="contact-link-icon">{l.icon}</span>
                  <div>
                    <div className="contact-link-label">{l.label}</div>
                    <div className="contact-link-value">{l.val}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="reveal reveal-delay-1">
            <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input className="form-input" name="name"
                    placeholder="Ram"
                    value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Email</label>
                  <input className="form-input" name="email" type="email"
                    placeholder="ram@example.com"
                    value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" name="message"
                  placeholder="Hi Rakesh, I'd like to discuss..."
                  value={form.message} onChange={handleChange} required />
              </div>
              {status === "success" && (
                <div className="form-status success">✓ Message sent successfully! I'll get back to you soon.</div>
              )}
              {status === "error" && (
                <div className="form-status error">✗ Something went wrong. Please try again or email me directly.</div>
              )}
              <button className="form-submit" type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send Message →"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
const footerCSS = `
.footer {
  padding: 2rem 2.5rem;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 1rem;
}
.footer-left {
  font-size: 0.72rem; color: var(--muted);
}
.footer-left span { color: var(--accent); }
.footer-right {
  font-size: 0.7rem; color: var(--muted);
}
`;

function Footer() {
  return (
    <>
      <style>{footerCSS}</style>
      <footer className="footer">
        <div className="footer-left">
          © 2025 <span>Gajjelli Rakesh</span>
        </div>
        <div className="footer-right">
          grakeshram28@gmail.com
        </div>
      </footer>
    </>
  );
}

/* ══════════════════════════════════════
   ROOT APP
══════════════════════════════════════ */
export default function App() {
  useGlobalCSS();
  useReveal();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Education />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
