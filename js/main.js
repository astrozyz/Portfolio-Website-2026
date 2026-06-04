/* ==========================================
   main.js — Rendering, navigation, parallax, live stats
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMeshBackground();
  renderGames();
  renderVideos();
  initNavbar();
  initParallaxOrbs();
  initSmoothScroll();
  initTiltEffect();
  fetchLiveStats();

  AOS.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: true,
    offset: 80,
  });
});

/* ------------------------------------------
   FORMAT NUMBERS (1200 → "1.2K", 1500000 → "1.5M")
   ------------------------------------------ */

function formatNumber(num) {
  if (num == null || isNaN(num)) return "\u2014";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toLocaleString();
}

/* ------------------------------------------
   RENDER GAMES
   ------------------------------------------ */

function renderGames() {
  const grid = document.getElementById("games-grid");
  if (!grid || !GAMES.length) return;

  grid.innerHTML = GAMES.map(
    (game, i) => `
    <div class="game-card" data-aos="fade-up" data-aos-delay="${i * 100}">
      <div class="game-card-image">
        <img src="${game.thumbnail}" alt="${game.title}" loading="lazy">
      </div>
      <div class="game-card-body">
        <h3 class="game-title">${game.title}</h3>
        <div class="game-stats">
          <div class="stat">
            <span class="stat-value" id="visits-${game.universeId}">\u2014</span>
            <span class="stat-label">Visits</span>
          </div>
          <div class="stat">
            <span class="stat-value" id="ccu-${game.universeId}">\u2014</span>
            <span class="stat-label">Playing</span>
          </div>
        </div>
        <a href="https://www.roblox.com/games/${game.placeId}"
           class="game-play-btn" target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M4 2l10 6-10 6V2z"/>
          </svg>
          Play on Roblox
        </a>
      </div>
    </div>
  `
  ).join("");
}

/* ------------------------------------------
   RENDER VIDEOS
   ------------------------------------------ */

function renderVideos() {
  const container = document.getElementById("videos-container");
  if (!container || !VIDEOS.length) return;

  container.innerHTML = VIDEOS.map(
    (video, i) => `
    <div class="video-entry ${i % 2 !== 0 ? "reverse" : ""}" data-aos="fade-up" data-aos-delay="${i * 100}">
      <div class="video-wrapper">
        <iframe
          src="https://www.youtube.com/embed/${video.youtubeId}"
          title="${video.title}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.description}</p>
      </div>
    </div>
  `
  ).join("");
}

/* ------------------------------------------
   FETCH LIVE STATS (via Cloudflare Worker proxy)
   ------------------------------------------ */

async function fetchLiveStats() {
  if (!SITE_CONFIG.workerUrl) return;

  // Showcased games (have cards) + career-extra games (totals only).
  const extraGames = typeof CAREER_EXTRA !== "undefined" ? CAREER_EXTRA : [];
  const universeIds = [
    ...new Set(
      [...GAMES, ...extraGames]
        .map((g) => g.universeId)
        .filter((id) => id && typeof id === "number")
    ),
  ];

  if (!universeIds.length) return;

  // Caption reflects how many experiences feed the totals (shows immediately).
  const captionEl = document.getElementById("games-totals-caption");
  if (captionEl) {
    captionEl.textContent = `Combined across ${universeIds.length} experiences I've contributed to`;
  }

  try {
    const res = await fetch(
      `${SITE_CONFIG.workerUrl}?universeIds=${universeIds.join(",")}`
    );
    if (!res.ok) return;
    const json = await res.json();

    if (json.data) {
      let totalVisits = 0;
      let totalPlaying = 0;

      json.data.forEach((game) => {
        totalVisits += game.visits || 0;
        totalPlaying += game.playing || 0;

        // Per-card stats — only showcased games have these elements.
        const visitsEl = document.getElementById(`visits-${game.id}`);
        const ccuEl = document.getElementById(`ccu-${game.id}`);
        if (visitsEl) visitsEl.textContent = formatNumber(game.visits);
        if (ccuEl) ccuEl.textContent = formatNumber(game.playing);
      });

      // Career totals banner.
      const totalVisitsEl = document.getElementById("total-visits");
      const totalPlayingEl = document.getElementById("total-playing");
      if (totalVisitsEl) totalVisitsEl.textContent = formatNumber(totalVisits);
      if (totalPlayingEl) totalPlayingEl.textContent = formatNumber(totalPlaying);
    }
  } catch (err) {
    // Silently fail — stats will just show "—"
  }

  // Schedule next refresh
  setTimeout(fetchLiveStats, SITE_CONFIG.statsRefreshInterval);
}

/* ------------------------------------------
   NAVBAR
   ------------------------------------------ */

function initNavbar() {
  const navbar = document.querySelector(".navbar");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileOverlay = document.getElementById("mobile-menu-overlay");

  // Scroll-triggered background
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileOverlay.classList.toggle("active");
    menuToggle.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });

  // Close mobile menu on link click
  mobileOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileOverlay.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    });
  });

  // Highlight active section in nav
  const sections = document.querySelectorAll(".section");
  const desktopLinks = document.querySelectorAll(".nav-links-desktop a");
  const navItems = desktopLinks;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach((item) => {
            item.classList.toggle(
              "active",
              item.getAttribute("href") === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ------------------------------------------
   SMOOTH SCROLL (for browsers without CSS support)
   ------------------------------------------ */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

/* ------------------------------------------
   MESH BACKGROUND — ambient pulsing triangular network
   (inspired by the BMW Vision Next 100 faceted skin)
   ------------------------------------------ */

function initMeshBackground() {
  const canvas = document.getElementById("mesh-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CELL = 92;        // triangle size in px (larger = sparser)
  const JITTER = 0.32;    // mesh irregularity (0 = perfect grid)
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const BUCKETS = 16;     // brightness levels for batched seam strokes

  // Colors sampled around --bg-primary so the mesh blends into the page
  const BASE = [18, 18, 18];       // page background (#121212)
  const SEAM_LOW = [23, 24, 28];   // resting seam (very faint — just above background)
  const SEAM_HIGH = [40, 43, 52];  // seam at pulse peak (faint cool tint)
  const FACET_SWING = 7;           // per-triangle shading range

  let width = 0, height = 0, cols = 0, rows = 0;
  let lastW = 0, lastH = 0;
  let edges = [];
  let facetLayer = null;

  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
  const rand = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };

  function build() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    lastW = width;
    lastH = height;
    canvas.width = Math.round(width * DPR);
    canvas.height = Math.round(height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    cols = Math.ceil(width / CELL) + 2;
    rows = Math.ceil(height / CELL) + 2;

    // Jittered point grid with one cell of bleed on every side
    const pts = [];
    for (let j = 0; j <= rows; j++) {
      const row = [];
      for (let i = 0; i <= cols; i++) {
        const onEdge = i === 0 || j === 0 || i === cols || j === rows;
        const jx = onEdge ? 0 : (rand(i, j) - 0.5) * 2 * JITTER * CELL;
        const jy = onEdge ? 0 : (rand(i + 99, j + 17) - 0.5) * 2 * JITTER * CELL;
        row.push({ x: (i - 1) * CELL + jx, y: (j - 1) * CELL + jy });
      }
      pts.push(row);
    }

    // Static facet layer — rendered once, then blitted each frame
    facetLayer = document.createElement("canvas");
    facetLayer.width = canvas.width;
    facetLayer.height = canvas.height;
    const fctx = facetLayer.getContext("2d");
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fctx.fillStyle = `rgb(${BASE[0]},${BASE[1]},${BASE[2]})`;
    fctx.fillRect(0, 0, width, height);

    const fillTri = (p, q, r, shade) => {
      const v = Math.round(FACET_SWING * (shade - 0.5));
      fctx.fillStyle = `rgb(${clamp(BASE[0] + v)},${clamp(BASE[1] + v)},${clamp(BASE[2] + v)})`;
      fctx.beginPath();
      fctx.moveTo(p.x, p.y);
      fctx.lineTo(q.x, q.y);
      fctx.lineTo(r.x, r.y);
      fctx.closePath();
      fctx.fill();
    };

    // Triangles (2 per cell, alternating diagonal for an interlocked look)
    // + de-duped seam edges with precomputed midpoints
    edges = [];
    const seen = new Set();
    const addEdge = (a, b) => {
      const key = a.x <= b.x
        ? `${a.x.toFixed(1)},${a.y.toFixed(1)}|${b.x.toFixed(1)},${b.y.toFixed(1)}`
        : `${b.x.toFixed(1)},${b.y.toFixed(1)}|${a.x.toFixed(1)},${a.y.toFixed(1)}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 });
    };

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = pts[j][i], b = pts[j][i + 1], c = pts[j + 1][i], d = pts[j + 1][i + 1];
        let t1, t2;
        if ((i + j) % 2 === 0) { t1 = [a, b, d]; t2 = [a, d, c]; }
        else { t1 = [a, b, c]; t2 = [b, d, c]; }
        fillTri(t1[0], t1[1], t1[2], rand(i * 2 + 3, j * 2 + 5));
        fillTri(t2[0], t2[1], t2[2], rand(i * 2 + 7, j * 2 + 1));
        addEdge(t1[0], t1[1]); addEdge(t1[1], t1[2]); addEdge(t1[2], t1[0]);
        addEdge(t2[0], t2[1]); addEdge(t2[1], t2[2]); addEdge(t2[2], t2[0]);
      }
    }
  }

  function draw(t) {
    if (!facetLayer) return;
    ctx.drawImage(facetLayer, 0, 0, width, height);
    ctx.lineWidth = 1;

    // Two slow, long-wavelength diagonal waves → organic shimmer (not stripes)
    const buckets = Array.from({ length: BUCKETS }, () => new Path2D());
    for (const e of edges) {
      const w1 = Math.sin(e.mx * 0.0041 + e.my * 0.0059 - t * 0.00060);
      const w2 = Math.sin(e.mx * -0.0055 + e.my * 0.0033 - t * 0.00042);
      let pulse = (w1 + w2) * 0.25 + 0.5;       // 0..1
      pulse = pulse * pulse * (3 - 2 * pulse);   // smoothstep for a softer pulse
      const bi = Math.min(BUCKETS - 1, Math.max(0, (pulse * (BUCKETS - 1)) | 0));
      buckets[bi].moveTo(e.ax, e.ay);
      buckets[bi].lineTo(e.bx, e.by);
    }
    for (let bi = 0; bi < BUCKETS; bi++) {
      const k = bi / (BUCKETS - 1);
      const r = Math.round(SEAM_LOW[0] + (SEAM_HIGH[0] - SEAM_LOW[0]) * k);
      const g = Math.round(SEAM_LOW[1] + (SEAM_HIGH[1] - SEAM_LOW[1]) * k);
      const b = Math.round(SEAM_LOW[2] + (SEAM_HIGH[2] - SEAM_LOW[2]) * k);
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.stroke(buckets[bi]);
    }
  }

  let rafId = 0;
  let last = 0;
  const FRAME_MS = 1000 / 30; // gentle 30fps cap for a background layer

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    if (now - last < FRAME_MS) return;
    last = now;
    draw(now);
  }

  function start() {
    build();
    if (reduceMotion) { draw(0); return; } // single static render, no animation
    cancelAnimationFrame(rafId);
    last = 0;
    rafId = requestAnimationFrame(loop);
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    // Rebuild only when the canvas's own box actually changes. On mobile the
    // URL bar showing/hiding does NOT change 100lvh, so clientHeight stays put
    // and the mesh never snaps; real resizes/orientation changes still rebuild.
    if (canvas.clientWidth === lastW && canvas.clientHeight === lastH) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      if (reduceMotion) draw(0);
    }, 200);
  });

  start();
}

/* ------------------------------------------
   PARALLAX GLOW ORBS
   ------------------------------------------ */

function initParallaxOrbs() {
  const orbs = document.querySelectorAll(".glow-orb");
  if (!orbs.length) return;

  let ticking = false;

  function updateOrbs() {
    const scrollY = window.scrollY;
    orbs.forEach((orb) => {
      const speed = parseFloat(orb.dataset.speed) || 0.1;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateOrbs);
      ticking = true;
    }
  });
}

/* ------------------------------------------
   3D TILT HOVER EFFECT
   ------------------------------------------ */

function initTiltEffect() {
  var tiltConfig = {
    "value-card":     { rotate: 6, scale: 1.03 },
    "sw-column":      { rotate: 4, scale: 1.02 },
    "expertise-card": { rotate: 4, scale: 1.02 },
    "game-card":      { rotate: 2, scale: 1.01 },
    "games-totals":   { rotate: 2, scale: 1.01 },
  };

  function applyTilt(el) {
    var cfg = tiltConfig["value-card"];
    if (el.classList.contains("sw-column")) cfg = tiltConfig["sw-column"];
    if (el.classList.contains("expertise-card")) cfg = tiltConfig["expertise-card"];
    if (el.classList.contains("game-card")) cfg = tiltConfig["game-card"];
    if (el.classList.contains("games-totals")) cfg = tiltConfig["games-totals"];

    el.removeAttribute("data-aos");
    el.removeAttribute("data-aos-delay");
    el.classList.remove("aos-animate");
    el.style.transform = "";
    el.style.transition = "transform 0.08s ease-out, box-shadow 0.08s ease-out";
    el.style.opacity = "1";

    el.addEventListener("mousemove", (e) => {
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -cfg.rotate;
      var rotateY = ((x - rect.width / 2) / (rect.width / 2)) * cfg.rotate;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${cfg.scale})`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  }

  var tiltApplied = false;
  function applyAll() {
    if (tiltApplied) return;
    tiltApplied = true;
    document.querySelectorAll(".value-card, .sw-column, .expertise-card, .game-card, .games-totals").forEach(applyTilt);
  }

  // Only enable the mouse-follow tilt when a precise pointer (mouse/trackpad) is
  // present — PC, or a tablet/iPad with a mouse. Touch-only devices skip it
  // entirely (hover is broken on touch). Re-checks if a mouse is connected later.
  var pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  function checkPointer() {
    if (pointerQuery.matches) applyAll();
  }
  setTimeout(checkPointer, 1500);
  if (pointerQuery.addEventListener) {
    pointerQuery.addEventListener("change", checkPointer);
  } else if (pointerQuery.addListener) {
    pointerQuery.addListener(checkPointer); // older Safari
  }
}
