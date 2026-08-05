/**
 * Sohrab Pirhadi — Academic Personal Website
 * Vanilla JS: theme, nav, scroll, publications, interactions
 */

(function () {
  "use strict";

  /* ---------- Theme ---------- */
  const THEME_KEY = "theme-preference";
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  /* ---------- Current Year ---------- */
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Mobile Navigation ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Scroll Progress ---------- */
  const progressBar = document.getElementById("scroll-progress");

  function updateScrollProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    progressBar.style.width = percent + "%";
    progressBar.setAttribute("aria-valuenow", String(percent));
  }

  /* ---------- Active Section Highlight ---------- */
  const sections = document.querySelectorAll("section[id]");

  function updateActiveNav() {
    const offset = 100;
    let current = "";

    sections.forEach(function (section) {
      const top = section.offsetTop - offset;
      if (window.scrollY >= top) {
        current = section.getAttribute("id") || "";
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href === "#" + current) {
        link.classList.add("active");
      }
    });
  }

  /* ---------- Section Reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  function revealOnScroll() {
    const trigger = window.innerHeight * 0.88;

    revealEls.forEach(function (el) {
      if (el.classList.contains("visible")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < trigger) {
        el.classList.add("visible");
      }
    });
  }

  /* ---------- Scroll Listener (throttled via rAF) ---------- */
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateScrollProgress();
      updateActiveNav();
      revealOnScroll();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- Publications ---------- */
  function renderPublications() {
    const list = document.getElementById("publications-list");
    if (!list || typeof publications === "undefined") return;

    if (!publications.length) {
      list.innerHTML = "<p>No publications listed yet.</p>";
      return;
    }

    const html = publications
      .map(function (pub) {
        const title = escapeHtml(pub.title || "Untitled");
        const authors = escapeHtml(pub.authors || "");
        const venue = escapeHtml(pub.venue || "");
        const year = escapeHtml(pub.year || "");
        const link = escapeAttr(pub.link || "#");

        return (
          '<article class="pub-card">' +
          '<div class="pub-info">' +
          '<h3 class="pub-title">' +
          title +
          "</h3>" +
          (authors ? '<p class="pub-authors">' + authors + "</p>" : "") +
          '<p class="pub-meta">' +
          (venue ? "<span>" + venue + "</span>" : "") +
          (venue && year ? " &middot; " : "") +
          (year ? '<span class="pub-year">' + year + "</span>" : "") +
          "</p>" +
          "</div>" +
          '<a href="' +
          link +
          '" class="btn btn-outline" target="_blank" rel="noopener noreferrer">View Publication</a>' +
          "</article>"
        );
      })
      .join("");

    list.innerHTML = html;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  renderPublications();

  /* ---------- Gallery ---------- */
  const galleryGrid = document.getElementById("gallery-grid");

  if (galleryGrid) {
    galleryGrid.addEventListener("click", function (e) {
      const trigger = e.target.closest(".gallery-trigger");
      if (!trigger || !galleryGrid.contains(trigger)) return;

      const item = trigger.closest(".gallery-item");
      if (!item) return;

      const willOpen = !item.classList.contains("is-open");

      galleryGrid.querySelectorAll(".gallery-item.is-open").forEach(function (openItem) {
        openItem.classList.remove("is-open");
        const openBtn = openItem.querySelector(".gallery-trigger");
        if (openBtn) openBtn.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      galleryGrid.querySelectorAll(".gallery-item.is-open").forEach(function (openItem) {
        openItem.classList.remove("is-open");
        const openBtn = openItem.querySelector(".gallery-trigger");
        if (openBtn) openBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
})();
