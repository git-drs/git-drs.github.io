/* =====================================================================
   PULSE MUSIC · scroll choreography (GSAP + ScrollTrigger)
   Everything degrades gracefully: with no JS / reduced motion the page
   is a clean, fully readable static layout.
   ===================================================================== */
(() => {
  "use strict";
  const root = document.documentElement;
  window.__pulseReady = true;

  /* ---------- site theme toggle (works even without animation) ---------- */
  const toggle = document.querySelector(".theme-toggle");
  const meta = document.querySelector('meta[name="theme-color"]');
  const applyTheme = (t) => {
    root.setAttribute("data-theme", t);
    if (meta) meta.setAttribute("content", t === "light" ? "#fbf6f5" : "#0a0a0c");
    try { localStorage.setItem("pulse-theme", t); } catch (e) {}
  };
  applyTheme(root.getAttribute("data-theme") || "dark");
  toggle && toggle.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger || reduce) {
    root.classList.remove("js");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- helpers ---------- */
  // wrap every word in a masked span so it can slide up
  function splitWords(el) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "w";
            const i = document.createElement("span"); i.className = "wi"; i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return $$(".wi", el);
  }

  /* ---------- scroll progress bar ---------- */
  gsap.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

  /* ---------- nav hides on scroll down, returns on scroll up ---------- */
  const nav = $(".nav");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => nav.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 240),
  });

  /* ---------- cursor glow ---------- */
  if (fine) {
    const g = $(".glow");
    const gx = gsap.quickTo(g, "x", { duration: 0.9, ease: "power3" });
    const gy = gsap.quickTo(g, "y", { duration: 0.9, ease: "power3" });
    window.addEventListener("pointermove", (e) => { gx(e.clientX); gy(e.clientY); }, { passive: true });
  }

  /* ---------- 3D tilt on every phone ---------- */
  if (fine) {
    $$("[data-tilt]").forEach((p) => {
      gsap.set(p, { transformPerspective: 1000 });
      const rx = gsap.quickTo(p, "rotationX", { duration: 0.5, ease: "power3" });
      const ry = gsap.quickTo(p, "rotationY", { duration: 0.5, ease: "power3" });
      p.addEventListener("pointermove", (e) => {
        const r = p.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 18);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 14);
      });
      p.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  }

  /* ---------- split headings ---------- */
  $$("[data-split]").forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 115 });
    gsap.set(el, { visibility: "visible" });
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.06 }),
    });
  });

  /* ---------- fade-up reveals ---------- */
  gsap.set(".reveal", { y: 34 });
  ScrollTrigger.batch(".reveal", {
    start: "top 90%", once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12 }),
  });
  gsap.set(".chip", { y: 26 });
  ScrollTrigger.batch(".chip", {
    start: "top 92%", once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 }),
  });

  /* ================================================================
     HERO
     ================================================================ */
  const heroTitle = $(".hero-title span");
  heroTitle.innerHTML = "PULSE".split("").map((c) => `<span class="lt">${c}</span>`).join("");
  const letters = $$(".lt", heroTitle);

  gsap.set(".hp", { clearProps: "transform" });
  gsap.set(".hp-l", { rotation: -8, yPercent: 12 });
  gsap.set(".hp-r", { rotation: 8, yPercent: 12 });
  gsap.set(".hp-c", { yPercent: 9 });

  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 1 }, 0.1)
    .from(letters, { yPercent: 70, rotationX: -80, opacity: 0, duration: 1.5, stagger: 0.08, transformOrigin: "50% 100%" }, 0.1)
    .from(".hp-c", { yPercent: 55, opacity: 0, duration: 1.5 }, 0.45)
    .from(".hp-l", { yPercent: 60, xPercent: 40, opacity: 0, duration: 1.5 }, 0.6)
    .from(".hp-r", { yPercent: 60, xPercent: -40, opacity: 0, duration: 1.5 }, 0.7)
    .from(".hero-card", { y: 30, opacity: 0, duration: 1, stagger: 0.12 }, 0.9);
    ;

  // scroll: phones fan out, giant title drifts away
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } })
    .to(".hp-l .phone", { x: "-30vw", y: "-6vh", rotation: -16, ease: "none" }, 0)
    .to(".hp-r .phone", { x: "30vw", y: "-6vh", rotation: 16, ease: "none" }, 0)
    .to(".hp-c .phone", { y: "-12vh", scale: 1.14, ease: "none" }, 0)
    .to(".hero-title", { yPercent: -22, scale: 1.18, opacity: 0.1, ease: "none" }, 0)
    .to(".hero-card, .hero-eyebrow", { y: -60, opacity: 0, ease: "none" }, 0)
    .to(".rings", { scale: 1.4, ease: "none" }, 0);

  /* ---------- marquees: speed up with scroll velocity ---------- */
  const tracks = $$(".marq-track");
  const tweens = tracks.map((t, i) =>
    i % 2 === 0
      ? gsap.to(t, { xPercent: -25, duration: 22, ease: "none", repeat: -1 })
      : gsap.fromTo(t, { xPercent: -25 }, { xPercent: 0, duration: 26, ease: "none", repeat: -1 })
  );
  ScrollTrigger.create({
    trigger: ".marquees", start: "top bottom", end: "bottom top",
    onUpdate: (self) => {
      const v = Math.min(Math.abs(self.getVelocity()) / 220, 9);
      tweens.forEach((tw) => gsap.to(tw, { timeScale: 1 + v, duration: 0.25, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: 1, duration: 1.2 }) }));
    },
  });
  gsap.fromTo(".marq:nth-child(1) .marq-track", { skewX: 0 }, { skewX: -6, scrollTrigger: { trigger: ".marquees", scrub: 0.6, start: "top bottom", end: "bottom top" } });

  /* ================================================================
     THEME WIPE · pinned, light slides over dark
     ================================================================ */
  (() => {
    const stage = $(".wipe-stage");
    const bg = $(".wipe-bg--light");
    const line = $(".wipe-line");
    const lightImg = $(".wipe-light");
    const phone = $(".wipe-phone");
    const set = (p) => {
      const x = p * stage.clientWidth;
      bg.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
      line.style.transform = `translateX(${x}px)`;
      const r = phone.getBoundingClientRect(), s = stage.getBoundingClientRect();
      const local = Math.min(1, Math.max(0, (x - (r.left - s.left)) / r.width));
      lightImg.style.clipPath = `inset(0 ${100 - local * 100}% 0 0)`;
    };
    set(0);
    gsap.from(".wipe-intro > *", { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".wipe-intro", start: "top 80%", once: true } });
    ScrollTrigger.create({
      trigger: stage, start: "top top", end: "+=160%", pin: true, scrub: 0.5, anticipatePin: 1,
      onUpdate: (self) => set(self.progress),
      onRefresh: (self) => set(self.progress),
    });
    gsap.from(phone, { scale: 0.8, rotation: -5, opacity: 0, ease: "none", scrollTrigger: { trigger: stage, start: "top 90%", end: "top 20%", scrub: 0.5 } });
  })();

  /* ================================================================
     FEATURES · phones rise in at different speeds
     ================================================================ */
  function initDuo(duo, scope) {
    const [a, b] = [$(".duo-a", duo), $(".duo-b", duo)];
    const pa = $(".phone", a), pb = $(".phone", b);
    gsap.set([pa, pb], { transformPerspective: 1000 });
    gsap.from(pa, { y: 120, rotation: -7, scale: 0.88, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: duo, start: "top 82%", once: true } });
    gsap.from(pb, { y: 180, rotation: 7, scale: 0.88, opacity: 0, duration: 1.5, ease: "expo.out", delay: 0.15, scrollTrigger: { trigger: duo, start: "top 82%", once: true } });
    const sc = { trigger: scope, scrub: 0.8, start: "top bottom", end: "bottom top" };
    gsap.fromTo(a, { yPercent: 7, rotation: -2 }, { yPercent: -7, rotation: 2, ease: "none", scrollTrigger: sc });
    gsap.fromTo(b, { yPercent: 16, rotation: 2 }, { yPercent: -12, rotation: -2, ease: "none", scrollTrigger: sc });
  }
  $$(".feat").forEach((f) => {
    const duo = $(".duo", f);
    initDuo(duo, f);
    const blob = $(".blob", f);
    if (blob) gsap.fromTo(blob, { yPercent: -16, scale: 0.9 }, { yPercent: 16, scale: 1.1, ease: "none", scrollTrigger: { trigger: f, scrub: 0.8, start: "top bottom", end: "bottom top" } });
    const num = $(".feat-num", f);
    if (num) gsap.fromTo(num, { y: 50 }, { y: -90, ease: "none", scrollTrigger: { trigger: f, scrub: 0.6, start: "top bottom", end: "bottom top" } });
  });

  /* ---------- navigation compare ---------- */
  $$(".nav-col").forEach((col, i) => {
    gsap.from(col, { y: 110, opacity: 0, duration: 1.2, ease: "expo.out", delay: i * 0.1, scrollTrigger: { trigger: ".navs-grid", start: "top 80%", once: true } });
    initDuo($(".duo", col), col);
  });

  /* ================================================================
     PLAYER STEPPER · pinned & animated on desktop and mobile
     ================================================================ */
  const stepper = $(".stepper");
  const texts = $$(".step-text", stepper);
  const vis = $$(".step-vis", stepper);
  const dots = $$(".dot", stepper);
  const mm = gsap.matchMedia();

  // Desktop setup (two columns)
  mm.add("(min-width: 901px)", () => {
    stepper.classList.add("is-pinned");
    const n = texts.length;
    const setActive = (i) => dots.forEach((d, k) => { d.classList.toggle("is-active", k === i); d.setAttribute("aria-selected", k === i); });
    setActive(0);
    gsap.set([...texts, ...vis], { autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".stepper-stage", start: "top top", end: `+=${n * 110}%`, pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate: (self) => setActive(Math.min(n - 1, Math.floor(self.progress * n))),
      },
    });
    for (let i = 0; i < n; i++) {
      const t0 = i;
      const pa = $(".duo-a .phone", vis[i]), pb = $(".duo-b .phone", vis[i]);
      // enter
      if (i === 0) {
        tl.set([texts[i], vis[i]], { autoAlpha: 1 }, 0);
      } else {
        tl.fromTo(texts[i], { x: 90, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" }, t0)
          .fromTo(vis[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" }, t0)
          .fromTo(pa, { x: 160, y: 60, rotation: 10, scale: 0.9 }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.34, ease: "power3.out" }, t0)
          .fromTo(pb, { x: 220, y: 110, rotation: 12, scale: 0.9 }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.38, ease: "power3.out" }, t0 + 0.04);
      }
      // exit
      if (i < n - 1) {
        tl.to(texts[i], { x: -90, autoAlpha: 0, duration: 0.25, ease: "power2.in" }, t0 + 0.72)
          .to(vis[i], { autoAlpha: 0, duration: 0.25, ease: "none" }, t0 + 0.75)
          .to(pa, { x: -160, y: -40, rotation: -10, scale: 0.92, duration: 0.28, ease: "power2.in" }, t0 + 0.72)
          .to(pb, { x: -220, y: -90, rotation: -12, scale: 0.92, duration: 0.28, ease: "power2.in" }, t0 + 0.72);
      } else {
        tl.to({}, { duration: 0.3 }, t0 + 0.7); // let the last one breathe
      }
    }
    const st = tl.scrollTrigger;
    const onDot = (e) => {
      const i = +e.currentTarget.dataset.i;
      window.scrollTo({ top: st.start + (st.end - st.start) * ((i + 0.45) / n), behavior: "smooth" });
    };
    dots.forEach((d) => d.addEventListener("click", onDot));
    return () => { stepper.classList.remove("is-pinned"); dots.forEach((d) => d.removeEventListener("click", onDot)); };
  });

  // Mobile / phone setup (stacked vertical layout with tailored animations and swipe support)
  mm.add("(max-width: 900px)", () => {
    stepper.classList.add("is-pinned");
    const n = texts.length;
    const setActive = (i) => dots.forEach((d, k) => { d.classList.toggle("is-active", k === i); d.setAttribute("aria-selected", k === i); });
    setActive(0);
    gsap.set([...texts, ...vis], { autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".stepper-stage", start: "top top", end: `+=${n * 105}%`, pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate: (self) => setActive(Math.min(n - 1, Math.floor(self.progress * n))),
      },
    });
    for (let i = 0; i < n; i++) {
      const t0 = i;
      const pa = $(".duo-a .phone", vis[i]), pb = $(".duo-b .phone", vis[i]);
      // enter
      if (i === 0) {
        tl.set([texts[i], vis[i]], { autoAlpha: 1 }, 0);
      } else {
        tl.fromTo(texts[i], { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" }, t0)
          .fromTo(vis[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" }, t0)
          .fromTo(pa, { x: 55, y: 25, rotation: 5, scale: 0.94 }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.34, ease: "power3.out" }, t0)
          .fromTo(pb, { x: 75, y: 35, rotation: 6, scale: 0.94 }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.38, ease: "power3.out" }, t0 + 0.04);
      }
      // exit
      if (i < n - 1) {
        tl.to(texts[i], { y: -24, autoAlpha: 0, duration: 0.25, ease: "power2.in" }, t0 + 0.72)
          .to(vis[i], { autoAlpha: 0, duration: 0.25, ease: "none" }, t0 + 0.75)
          .to(pa, { x: -55, y: -20, rotation: -5, scale: 0.94, duration: 0.28, ease: "power2.in" }, t0 + 0.72)
          .to(pb, { x: -75, y: -25, rotation: -6, scale: 0.94, duration: 0.28, ease: "power2.in" }, t0 + 0.72);
      } else {
        tl.to({}, { duration: 0.3 }, t0 + 0.7);
      }
    }
    const st = tl.scrollTrigger;
    const onDot = (e) => {
      const i = +e.currentTarget.dataset.i;
      window.scrollTo({ top: st.start + (st.end - st.start) * ((i + 0.45) / n), behavior: "smooth" });
    };
    dots.forEach((d) => d.addEventListener("click", onDot));

    let touchStartX = 0;
    let touchStartY = 0;
    const stage = $(".stepper-stage", stepper);
    const onTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const curIdx = Math.min(n - 1, Math.floor(st.progress * n));
        if (dx < 0 && curIdx < n - 1) {
          window.scrollTo({ top: st.start + (st.end - st.start) * ((curIdx + 1 + 0.45) / n), behavior: "smooth" });
        } else if (dx > 0 && curIdx > 0) {
          window.scrollTo({ top: st.start + (st.end - st.start) * ((curIdx - 1 + 0.45) / n), behavior: "smooth" });
        }
      }
    };
    if (stage) {
      stage.addEventListener("touchstart", onTouchStart, { passive: true });
      stage.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    return () => {
      stepper.classList.remove("is-pinned");
      dots.forEach((d) => d.removeEventListener("click", onDot));
      if (stage) {
        stage.removeEventListener("touchstart", onTouchStart);
        stage.removeEventListener("touchend", onTouchEnd);
      }
    };
  });

  /* ---------- keep trigger positions right after fonts / images ---------- */
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", refresh);
})();
