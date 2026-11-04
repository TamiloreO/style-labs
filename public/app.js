/* Style Lab: style registry, switcher, and small page behaviours. */
(function () {
  "use strict";

  var FAMILY = "https://fonts.googleapis.com/css2?family=";

  var STYLES = [
    {
      id: "claymorphism",
      name: "Claymorphism",
      note: "Soft moulded plastic",
      swatch: ["#efe9fb", "#c6b4f2", "#f6b8d0"],
      fonts: FAMILY + "Baloo+2:wght@400..800&family=Nunito:wght@300..800&display=swap",
    },
    {
      id: "cybercore",
      name: "Cybercore",
      note: "Terminal green technical",
      swatch: ["#070b09", "#b8f36a", "#2e3a33"],
      fonts: FAMILY + "Chakra+Petch:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap",
    },
    {
      id: "neo-brutalism",
      name: "Neo-brutalism",
      note: "Hard edges, loud blocks",
      swatch: ["#f4f0e4", "#ff5d3b", "#ffd23f"],
      fonts: FAMILY + "Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap",
    },
    {
      id: "scrapbook",
      name: "Scrapbook",
      note: "Taped notes, textured paper",
      swatch: ["#f3ecda", "#92a28a", "#d99e7c"],
      fonts: FAMILY + "Caveat:wght@400..700&family=DM+Sans:wght@300..700&display=swap",
    },
    {
      id: "surrealism",
      name: "Surrealism",
      note: "Dreamlike impossible scale",
      swatch: ["#f7cfc2", "#c9b8f0", "#a9d9cd"],
      fonts: FAMILY + "Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=DM+Sans:wght@300..700&display=swap",
    },
    {
      id: "y2k",
      name: "Y2K aesthetic",
      note: "Chrome, bubbles, gloss",
      swatch: ["#ff2ea6", "#c9d4ff", "#2ef2ff"],
      fonts: FAMILY + "Unbounded:wght@300..800&family=Outfit:wght@300..700&display=swap",
    },
    {
      id: "pixel-art",
      name: "Pixel art",
      note: "Eight-bit blocky",
      swatch: ["#141a2e", "#f6c945", "#e4572e"],
      fonts: FAMILY + "Press+Start+2P&family=VT323&display=swap",
    },
    {
      id: "synthwave",
      name: "Synthwave",
      note: "Neon grid, sunset chrome",
      swatch: ["#1a0b3a", "#ff2d95", "#22e2ff"],
      fonts: FAMILY + "Monoton&family=Outfit:wght@200..700&display=swap",
    },
    {
      id: "glassmorphism",
      name: "Glassmorphism",
      note: "Frosted layered panels",
      swatch: ["#8ab6ff", "#ffffff", "#ff9ecb"],
      fonts: FAMILY + "Manrope:wght@300..800&display=swap",
    },
    {
      id: "neumorphism",
      name: "Neumorphism",
      note: "Extruded soft UI",
      swatch: ["#e3e8ef", "#ffffff", "#c3cad6"],
      fonts: FAMILY + "Nunito+Sans:opsz,wght@6..12,300..800&display=swap",
    },
    {
      id: "bento",
      name: "Bento grid",
      note: "Tidy modular mosaic",
      swatch: ["#ffffff", "#ffe3c2", "#cfe4ff"],
      fonts: FAMILY + "Inter+Tight:wght@300..800&display=swap",
    },
    {
      id: "editorial",
      name: "Editorial design",
      note: "Magazine columns, big serif",
      swatch: ["#fbf8f1", "#1b1a17", "#b02a1c"],
      fonts: FAMILY + "Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300..700&display=swap",
    },
    {
      id: "swiss",
      name: "Swiss design",
      note: "Grid, rules, one red",
      swatch: ["#ffffff", "#111111", "#e5311f"],
      fonts: FAMILY + "Archivo:wght@300..800&family=Inter:wght@300..700&display=swap",
    },
    {
      id: "minimalism",
      name: "Minimalism",
      note: "Near nothing, all air",
      swatch: ["#fafaf8", "#d8d8d2", "#111111"],
      fonts: FAMILY + "Inter+Tight:wght@200..600&display=swap",
    },
    {
      id: "maximalism",
      name: "Maximalism",
      note: "Dense, loud, layered",
      swatch: ["#ff3d81", "#f9e04b", "#2b3bff"],
      fonts: FAMILY + "Anton&family=Bricolage+Grotesque:wght@300..800&display=swap",
    },
    {
      id: "luxury-typography",
      name: "Luxury typography",
      note: "Couture serif, wide tracking",
      swatch: ["#14120f", "#d8c9a9", "#f5f1e8"],
      fonts: FAMILY + "Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Jost:wght@200..600&display=swap",
    },
    {
      id: "conceptual-sketch",
      name: "Conceptual sketch",
      note: "Pencil wireframe notes",
      swatch: ["#fbfaf6", "#2b2b2b", "#7a93a8"],
      fonts: FAMILY + "Caveat:wght@400..700&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap",
    },
    {
      id: "ethereal",
      name: "Ethereal",
      note: "Weightless glow",
      swatch: ["#f4f7fb", "#cfd9ff", "#ffe6f0"],
      fonts: FAMILY + "Tenor+Sans&family=Jost:wght@200..500&display=swap",
    },
    {
      id: "bohemian",
      name: "Bohemian",
      note: "Earthy arches, hand warmth",
      swatch: ["#efe4d2", "#b4643c", "#7c8a5a"],
      fonts: FAMILY + "Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Karla:wght@300..700&display=swap",
    },
    {
      id: "victorian",
      name: "Victorian",
      note: "Ornament, engraving, symmetry",
      swatch: ["#2a1418", "#e8dcc3", "#8c1d2b"],
      fonts: FAMILY + "IM+Fell+English:ital@0;1&family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=EB+Garamond:ital,wght@0,400..600&display=swap",
    },
    {
      id: "cyberpunk",
      name: "Cyberpunk",
      note: "Acid neon HUD",
      swatch: ["#08090c", "#eaff00", "#00f0ff"],
      fonts: FAMILY + "Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap",
    },
    {
      id: "wabi-sabi",
      name: "Wabi-sabi",
      note: "Paper, ink, imperfection",
      swatch: ["#f2ece1", "#3d3a33", "#9c6b4f"],
      fonts: FAMILY + "Shippori+Mincho:wght@400..800&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap",
    },
  ];

  var root = document.documentElement;
  var rail = document.getElementById("style-rail");
  var grid = document.getElementById("style-grid");
  var nameEl = document.getElementById("style-name");
  var countEl = document.getElementById("style-count");
  var sheet = document.getElementById("style-sheet");
  var openSheetBtn = document.getElementById("open-sheet");
  var fontCache = {};
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

    root.setAttribute("data-style", entry.id);
    loadFonts(entry);
    paintState();

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

    // Warm the next style's fonts so browsing feels instant.
    loadFonts(STYLES[(index + 1) % STYLES.length]);
    loadFonts(STYLES[(index + STYLES.length - 1) % STYLES.length]);
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
})();
