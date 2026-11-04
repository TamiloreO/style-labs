/* Style Lab: style registry, switcher, and small page behaviours. */
(function () {
  "use strict";

  // The single list of styles lives in src/registry.json and ships as registry.js.
  var STYLES = window.STYLE_REGISTRY || [];
  if (!STYLES.length) {
    console.error("Style registry did not load");
    return;
  }

  var root = document.documentElement;
  var rail = document.getElementById("style-rail");
  var grid = document.getElementById("style-grid");
  var nameEl = document.getElementById("style-name");
  var countEl = document.getElementById("style-count");
  var sheet = document.getElementById("style-sheet");
  var openSheetBtn = document.getElementById("open-sheet");
  var fontCache = {};
  var skinSheet = document.getElementById("skin-sheet");
  var controlsSheet = document.querySelector('link[href="styles/controls.css"]');
  var prefetched = {};
  var applyToken = 0;
  var current = 0;

  function byId(id) {
    for (var i = 0; i < STYLES.length; i++) {
      if (STYLES[i].id === id) return i;
    }
    return -1;
  }

  function loadFonts(entry) {
    if (fontCache[entry.id] || !entry.fonts) return;
    fontCache[entry.id] = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = entry.fonts;
    link.setAttribute("data-style-font", entry.id);
    document.head.appendChild(link);
  }

  var buildVersion = window.__stylelabVersion || "";
  function sheetHref(id) {
    return "styles/" + id + ".css" + (buildVersion ? "?v=" + buildVersion : "");
  }

  // Swap the skin sheet before changing data-style so the new rules are ready,
  // then drop the old sheet so at most two are ever in the document.
  function ensureSheet(id, done) {
    var href = sheetHref(id);
    if (skinSheet && skinSheet.getAttribute("href") === href) {
      done(null);
      return;
    }
    var previous = skinSheet;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.id = "skin-sheet";
    link.href = href;
    var settled = false;
    function settle() {
      if (settled) return;
      settled = true;
      skinSheet = link;
      done(previous);
    }
    link.addEventListener("load", settle);
    link.addEventListener("error", settle);
    // Insert before the shared controls so its safeguards still win the cascade.
    if (controlsSheet && controlsSheet.parentNode === document.head) {
      document.head.insertBefore(link, controlsSheet);
    } else {
      document.head.appendChild(link);
    }
  }

  function prefetchSheet(id) {
    if (!id || prefetched[id]) return;
    prefetched[id] = true;
    var link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "style";
    link.href = sheetHref(id);
    document.head.appendChild(link);
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function paintState() {
    var entry = STYLES[current];
    nameEl.textContent = entry.name;
    countEl.textContent = pad(current + 1) + "/" + pad(STYLES.length);

    var rails = rail.querySelectorAll(".chip");
    for (var i = 0; i < rails.length; i++) {
      rails[i].setAttribute("aria-pressed", i === current ? "true" : "false");
      rails[i].tabIndex = i === current ? 0 : -1;
    }

    var cards = grid.querySelectorAll(".style-card");
    for (var j = 0; j < cards.length; j++) {
      cards[j].setAttribute("aria-pressed", j === current ? "true" : "false");
    }

    var active = rail.querySelector('[aria-pressed="true"]');
    if (active && typeof active.scrollIntoView === "function") {
      active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    var bg = getComputedStyle(document.body).backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
      bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    }
    if (meta && bg) meta.setAttribute("content", bg);
  }

  function apply(id, opts) {
    var index = byId(id);
    if (index < 0) index = byId("swiss");
    current = index;
    var entry = STYLES[index];
    var token = ++applyToken;
    var forward = STYLES[(index + 1) % STYLES.length];
    var backward = STYLES[(index + STYLES.length - 1) % STYLES.length];

    try {
      localStorage.setItem("stylelab:style", entry.id);
    } catch (e) {}

    if (!opts || opts.url !== false) {
      try {
        var url = new URL(window.location.href);
        url.searchParams.set("s", entry.id);
        history.replaceState(null, "", url);
      } catch (e) {}
    }

    loadFonts(entry);
    prefetchSheet(forward.id);
    loadFonts(forward);
    loadFonts(backward);

    ensureSheet(entry.id, function (previous) {
      if (token !== applyToken) return;
      root.setAttribute("data-style", entry.id);
      if (previous && previous.parentNode) previous.parentNode.removeChild(previous);
      paintState();
    });
  }

  function build() {
    var railFrag = document.createDocumentFragment();
    var gridFrag = document.createDocumentFragment();

    STYLES.forEach(function (entry, i) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.setAttribute("aria-pressed", "false");
      chip.dataset.styleId = entry.id;
      chip.innerHTML =
        '<span class="chip__dot" aria-hidden="true"></span><span>' + entry.name + "</span>";
      entry.swatch.forEach(function (color, idx) {
        chip.style.setProperty("--swatch-" + (idx + 1), color);
      });
      chip.addEventListener("click", function () {
        apply(entry.id);
      });
      chip.addEventListener("mouseenter", function () {
        loadFonts(entry);
        prefetchSheet(entry.id);
      });
      chip.addEventListener("focus", function () {
        loadFonts(entry);
        prefetchSheet(entry.id);
      });
      railFrag.appendChild(chip);

      var card = document.createElement("button");
      card.type = "button";
      card.className = "style-card";
      card.dataset.styleId = entry.id;
      card.innerHTML =
        '<span class="style-card__swatch" aria-hidden="true">' +
        entry.swatch
          .map(function (c) {
            return '<i style="background:' + c + '"></i>';
          })
          .join("") +
        "</span>" +
        '<span class="style-card__meta">' +
        pad(i + 1) +
        " / " + STYLES.length + "</span>" +
        '<span class="style-card__name">' +
        entry.name +
        "</span>" +
        '<span class="style-card__meta">' +
        entry.note +
        "</span>";
      card.addEventListener("click", function () {
        apply(entry.id);
        closeSheet();
      });
      gridFrag.appendChild(card);
    });

    rail.appendChild(railFrag);
    grid.appendChild(gridFrag);
  }

  function step(delta) {
    apply(STYLES[(current + delta + STYLES.length) % STYLES.length].id);
  }

  document.getElementById("prev-style").addEventListener("click", function () {
    step(-1);
  });
  document.getElementById("next-style").addEventListener("click", function () {
    step(1);
  });

  /* Sheet */

  var lastFocus = null;

  function openSheet() {
    lastFocus = document.activeElement;
    sheet.hidden = false;
    openSheetBtn.setAttribute("aria-expanded", "true");
    var close = sheet.querySelector(".sheet__close");
    if (close) close.focus();
  }

  function closeSheet() {
    sheet.hidden = true;
    openSheetBtn.setAttribute("aria-expanded", "false");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  openSheetBtn.addEventListener("click", function () {
    if (sheet.hidden) openSheet();
    else closeSheet();
  });

  // Secondary entry points (hero button, first card link) open the same picker.
  Array.prototype.forEach.call(document.querySelectorAll("[data-open-sheet]"), function (el) {
    el.addEventListener("click", function (event) {
      event.preventDefault();
      openSheet();
    });
  });

  sheet.addEventListener("click", function (event) {
    if (event.target.closest("[data-close-sheet]")) closeSheet();
  });

  /* Mobile nav */

  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileNav.hidden = !open;
    });
    mobileNav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        mobileNav.classList.remove("is-open");
        mobileNav.hidden = true;
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Keyboard */

  document.addEventListener("keydown", function (event) {
    var tag = (event.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || event.target.isContentEditable) return;

    if (event.key === "Tab" && !sheet.hidden) {
      var controls = Array.from(sheet.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]'));
      var first = controls[0];
      var last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    if (event.key === "Escape" && !sheet.hidden) {
      closeSheet();
      return;
    }

    // Arrows browse styles only while the switcher or the style sheet has focus,
    // so normal page scrolling keeps working everywhere else.
    var focus = document.activeElement;
    var inSwitcher = document.getElementById("switcher").contains(focus);
    var inSheet = !sheet.hidden && sheet.contains(focus) && focus !== document.body;
    if (!inSwitcher && !inSheet) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
      if (rail.contains(focus)) rail.children[current].focus({ preventScroll: true });
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
      if (rail.contains(focus)) rail.children[current].focus({ preventScroll: true });
    }
  });

  /* Boot */

  build();

  var params = new URLSearchParams(window.location.search);
  var fromUrl = params.get("s");
  var saved = null;
  try {
    saved = localStorage.getItem("stylelab:style");
  } catch (e) {}

  var validUrl = byId(fromUrl) >= 0 ? fromUrl : null;
  var validSaved = byId(saved) >= 0 ? saved : null;
  apply(validUrl || validSaved || "swiss", { url: false });
  if (fromUrl && !validUrl) {
    try {
      var clean = new URL(window.location.href);
      clean.searchParams.delete("s");
      history.replaceState(null, "", clean);
    } catch (e) {}
  }

  // Precached repeat visits: the shell and every skin are available offline.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
