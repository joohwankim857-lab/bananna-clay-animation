/* ============================================
   Don't Waste Food — Scroll-Driven Canvas Site
   GSAP + Lenis + Canvas Frame Scrubbing
   ============================================ */

// ─── Constants ───────────────────────────────
const FRAME_COUNT   = 145;
const FRAME_SPEED   = 2.0;
const IMAGE_SCALE   = 0.93; // contain mode — gives slight breathing room around the banana

const DARK_ENTER    = 0.60;
const DARK_LEAVE    = 0.80;
const DARK_FADE     = 0.04;

const MARQUEE_START = 0.05;
const MARQUEE_END   = 0.95;

// ─── DOM References ───────────────────────────
const loader       = document.getElementById("loader");
const loaderBar    = document.getElementById("loader-bar");
const loaderPct    = document.getElementById("loader-percent");
const hero         = document.getElementById("hero");
const canvasWrap   = document.getElementById("canvas-wrap");
const canvas       = document.getElementById("canvas");
const ctx          = canvas.getContext("2d");
const darkOverlay  = document.getElementById("dark-overlay");
const marqueeWrap  = document.getElementById("marquee");
const marqueeText  = marqueeWrap.querySelector(".marquee-text");
const scrollCont   = document.getElementById("scroll-container");
const scrollSects  = document.querySelectorAll(".scroll-section");
const header       = document.getElementById("site-header");

// ─── State ────────────────────────────────────
const frames      = new Array(FRAME_COUNT).fill(null);
let framesLoaded  = 0;
let currentFrame  = 0;
let bgColor       = "#F5E6D3";
let dpr           = window.devicePixelRatio || 1;

// ─── Canvas Setup ─────────────────────────────
function setupCanvas() {
  dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  canvas.style.width  = window.innerWidth  + "px";
  canvas.style.height = window.innerHeight + "px";
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    setupCanvas();
    drawFrame(currentFrame);
  }, 150);
});

// ─── Draw Frame ───────────────────────────────
function drawFrame(index) {
  const img = frames[index];
  if (!img) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.min(cw / iw, ch / ih) * IMAGE_SCALE; // contain: full banana always visible
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

// ─── Sample Background Color ──────────────────
function sampleBgColor(index) {
  const img = frames[index];
  if (!img) return;
  try {
    const oc = document.createElement("canvas");
    oc.width = 4; oc.height = 4;
    const ot = oc.getContext("2d");
    ot.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, 4, 4);
    const d = ot.getImageData(0, 0, 1, 1).data;
    bgColor = `rgb(${d[0]},${d[1]},${d[2]})`;
  } catch (e) { /* tainted canvas — ignore */ }
}

// ─── Frame Preloader ──────────────────────────
function loadFrame(index) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      frames[index] = img;
      framesLoaded++;
      const pct = Math.round((framesLoaded / FRAME_COUNT) * 100);
      loaderBar.style.width = pct + "%";
      loaderPct.textContent = pct + "%";
      resolve();
    };
    img.onerror = resolve;
    img.src = `frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;
  });
}

async function preloadFrames() {
  setupCanvas();

  // Phase 1: first 10 frames for fast first paint
  await Promise.all(Array.from({ length: 10 }, (_, i) => loadFrame(i)));
  sampleBgColor(0);
  drawFrame(0);

  // Phase 2: remaining frames in batches of 20
  const batchSize = 20;
  for (let i = 10; i < FRAME_COUNT; i += batchSize) {
    const len = Math.min(batchSize, FRAME_COUNT - i);
    await Promise.all(Array.from({ length: len }, (_, j) => loadFrame(i + j)));
  }

  // All done — hide loader and play hero
  loader.classList.add("hidden");
  playHeroEntrance();
}

// ─── Hero Entrance ────────────────────────────
function playHeroEntrance() {
  // Initial states must be set BEFORE timeline captures "from" values
  gsap.set(".hero-label",             { y: 20, opacity: 0 });
  gsap.set(".hero-tagline",           { y: 20, opacity: 0 });
  gsap.set(".hero-scroll-indicator",  { y: 10, opacity: 0 });

  const tl = gsap.timeline();
  tl.to(".hero-label", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
    .from(".hero-word", {
      y: "100%", opacity: 0, stagger: 0.15,
      duration: 1.0, ease: "elastic.out(1, 0.55)"
    }, "-=0.2")
    .to(".hero-tagline",          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.4")
    .to(".hero-scroll-indicator", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.2");
}

// ─── Hero Transition (circle-wipe + fade) ─────
function initHeroTransition() {
  ScrollTrigger.create({
    trigger: scrollCont,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Hero fades out in first 6% of scroll
      hero.style.opacity = Math.max(0, 1 - p / 0.055);

      // Canvas circle-wipe: 1%–8% scroll range
      const wipe = Math.min(1, Math.max(0, (p - 0.01) / 0.07));
      const radius = wipe * 85;
      canvasWrap.style.clipPath = `circle(${radius}% at 50% 50%)`;
    }
  });
}

// ─── Frame Scrub ──────────────────────────────
function initFrameScrub() {
  ScrollTrigger.create({
    trigger: scrollCont,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
      const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);

      if (index !== currentFrame) {
        currentFrame = index;
        if (index % 20 === 0) sampleBgColor(index);
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    }
  });
}

// ─── Section Animation System ─────────────────
function initSectionAnimations() {
  // Tiny random rotations for the clay "pressed flat" effect on stats
  const statCards = document.querySelectorAll(".stat");
  statCards.forEach((el) => {
    const rot = (Math.random() - 0.5) * 5; // -2.5° to +2.5°
    gsap.set(el, { rotation: rot });
  });

  scrollSects.forEach((section) => {
    const type    = section.dataset.animation;
    const persist = section.dataset.persist === "true";
    const enter   = parseFloat(section.dataset.enter) / 100;
    const leave   = parseFloat(section.dataset.leave) / 100;
    const isStats = section.classList.contains("section-stats");

    const sectionInner = section.querySelector(".section-inner");
    const innerChildren = isStats
      ? Array.from(section.querySelectorAll(".stat"))
      : Array.from(section.querySelectorAll(
          ".section-label, .section-heading, .section-body, .cta-button"
        ));

    // Build entrance timeline
    const tl = gsap.timeline({ paused: true });

    if (!isStats) {
      // Animate the whole .section-inner container as a unit (carries the backdrop),
      // then stagger children within it. Avoids empty-backdrop flash.
      switch (type) {
        case "slide-left":
          gsap.set(sectionInner, { x: -70, opacity: 0 });
          tl.to(sectionInner, { x: 0, opacity: 1, duration: 0.75, ease: "power3.out" });
          break;
        case "slide-right":
          gsap.set(sectionInner, { x: 70, opacity: 0 });
          tl.to(sectionInner, { x: 0, opacity: 1, duration: 0.75, ease: "power3.out" });
          break;
        case "scale-up":
          gsap.set(sectionInner, { scale: 0.88, opacity: 0 });
          tl.to(sectionInner, { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" });
          break;
        case "clip-reveal":
          gsap.set(sectionInner, { clipPath: "inset(100% 0 0 0)", opacity: 1 });
          tl.to(sectionInner, { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "power4.inOut" });
          break;
        default:
          gsap.set(sectionInner, { y: 40, opacity: 0 });
          tl.to(sectionInner, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
      }
      // Children stagger within the now-visible container
      gsap.set(innerChildren, { y: 18, opacity: 0 });
      tl.to(innerChildren, {
        y: 0, opacity: 1, stagger: 0.12,
        duration: 0.6, ease: "power2.out"
      }, "-=0.4");

    } else {
      // Stats: individual card stagger with clay tilt effect
      gsap.set(innerChildren, { y: 65, opacity: 0 });
      tl.to(innerChildren, {
        y: 0, rotation: 0, opacity: 1,
        stagger: 0.14, duration: 0.85, ease: "power3.out"
      });
    }

    let isVisible = false;
    let hasAnimatedIn = false;

    ScrollTrigger.create({
      trigger: scrollCont,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        const inRange = p >= enter && p <= leave;

        if (inRange && !isVisible) {
          isVisible = true;
          section.style.visibility = "visible";
          tl.play();
          hasAnimatedIn = true;
        } else if (!inRange && isVisible) {
          if (persist && hasAnimatedIn && p > leave) return;
          isVisible = false;
          tl.reverse();
          tl.eventCallback("onReverseComplete", () => {
            if (!persist) section.style.visibility = "hidden";
          });
        }
      }
    });

    section.style.visibility = "hidden";
  });
}

// ─── Dark Overlay + Nav + Marquee Opacity ─────
function initDarkOverlay() {
  ScrollTrigger.create({
    trigger: scrollCont,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Dark overlay opacity
      let opacity = 0;
      if (p >= DARK_ENTER - DARK_FADE && p < DARK_ENTER) {
        opacity = (p - (DARK_ENTER - DARK_FADE)) / DARK_FADE;
      } else if (p >= DARK_ENTER && p <= DARK_LEAVE) {
        opacity = 0.9;
      } else if (p > DARK_LEAVE && p <= DARK_LEAVE + DARK_FADE) {
        opacity = 0.9 * (1 - (p - DARK_LEAVE) / DARK_FADE);
      }
      darkOverlay.style.opacity = opacity;

      // Nav color inversion
      if (opacity > 0.5) {
        header.classList.add("dark-mode");
      } else {
        header.classList.remove("dark-mode");
      }

      // Marquee opacity
      let mOpacity = 0;
      if (p >= MARQUEE_START && p <= MARQUEE_END) {
        const fadeIn  = Math.min(1, (p - MARQUEE_START) / 0.03);
        const fadeOut = Math.min(1, (MARQUEE_END - p) / 0.03);
        mOpacity = Math.min(fadeIn, fadeOut);
      }
      marqueeWrap.style.opacity = mOpacity;
    }
  });
}

// ─── Nav State (opaque after hero) ────────────
function initNavState() {
  ScrollTrigger.create({
    trigger: scrollCont,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      if (self.progress > 0.025) {
        header.style.background     = "rgba(245, 230, 211, 0.92)";
        header.style.backdropFilter = "blur(14px)";
        header.style.borderBottom   = "1px solid rgba(28, 9, 0, 0.07)";
      } else {
        header.style.background     = "transparent";
        header.style.backdropFilter = "none";
        header.style.borderBottom   = "none";
      }
    }
  });
}

// ─── Marquee Horizontal Drift ─────────────────
function initMarquee() {
  gsap.to(marqueeText, {
    xPercent: -22,
    ease: "none",
    scrollTrigger: {
      trigger: scrollCont,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    }
  });
}

// ─── Counter Animations ───────────────────────
function initCounters() {
  document.querySelectorAll(".stat-number").forEach((el) => {
    const target   = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || "0", 10);

    ScrollTrigger.create({
      trigger: el.closest(".scroll-section"),
      start: "top 85%",
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2.2,
          ease: "power1.out",
          onUpdate: function () {
            el.textContent = this.targets()[0].val.toFixed(decimals);
          }
        });
      },
      onLeaveBack: () => {
        el.textContent = decimals === 0 ? "0" : "0." + "0".repeat(decimals);
      }
    });
  });
}

// ─── CTA Button Tilt (playful) ────────────────
function initCtaTilt() {
  const btn = document.querySelector(".cta-button");
  if (!btn) return;

  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const xPct = (e.clientX - r.left) / r.width  - 0.5; // -0.5 to 0.5
    const yPct = (e.clientY - r.top)  / r.height - 0.5;
    gsap.to(btn, {
      rotationY: xPct * 12,
      rotationX: -yPct * 12,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 600,
    });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, {
      rotationX: 0, rotationY: 0,
      duration: 0.5, ease: "elastic.out(1, 0.6)"
    });
  });
}

// ─── Lenis RAF Loop ───────────────────────────
function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

// ─── Init ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  initHeroTransition();
  initFrameScrub();
  initSectionAnimations();
  initDarkOverlay();
  initNavState();
  initMarquee();
  initCounters();
  initCtaTilt();
  initLenis();

  // Start loading frames (async — calls playHeroEntrance when done)
  preloadFrames();
});
