/* ==========================================
   main.js — Rendering, navigation, parallax, live stats
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
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

  const universeIds = GAMES.map((g) => g.universeId)
    .filter((id) => id && typeof id === "number");

  if (!universeIds.length) return;

  try {
    const res = await fetch(
      `${SITE_CONFIG.workerUrl}?universeIds=${universeIds.join(",")}`
    );
    if (!res.ok) return;
    const json = await res.json();

    if (json.data) {
      json.data.forEach((game) => {
        const visitsEl = document.getElementById(`visits-${game.id}`);
        const ccuEl = document.getElementById(`ccu-${game.id}`);
        if (visitsEl) visitsEl.textContent = formatNumber(game.visits);
        if (ccuEl) ccuEl.textContent = formatNumber(game.playing);
      });
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
  };

  function applyTilt(el) {
    var cfg = tiltConfig["value-card"];
    if (el.classList.contains("sw-column")) cfg = tiltConfig["sw-column"];
    if (el.classList.contains("expertise-card")) cfg = tiltConfig["expertise-card"];
    if (el.classList.contains("game-card")) cfg = tiltConfig["game-card"];

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

  setTimeout(() => {
    document.querySelectorAll(".value-card, .sw-column, .expertise-card, .game-card").forEach(applyTilt);
  }, 1500);
}
