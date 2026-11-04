/* Liquid Glass water field.
 *
 * A small two-buffer wave simulation painted on a canvas that sits behind the
 * glass panels. Because the panels use backdrop-filter, the ripples are
 * refracted and blurred by the material instead of sitting on top of it.
 *
 * Ripples are injected by pointer movement, taps and page scrolling, so the
 * surface reacts to swipes and wheel input the way water would.
 *
 * Runs only while the liquid-glass skin is active, and never under
 * prefers-reduced-motion.
 */
(function () {
  "use strict";

  var STYLE = "liquid-glass";
  var CELL = 5; // px of page per simulation cell
  var DAMPING = 0.981;
  var IDLE_STOP = 3200; // ms without input before the loop sleeps

  var canvas = null;
  var ctx = null;
  var cols = 0;
  var rows = 0;
  var cur = null;
  var prev = null;
  var image = null;
  var pixels = null;

  var running = false;
  var frame = 0;
  var lastFrame = 0;
  var lastInput = 0;
  var lastScroll = 0;
  var pointer = { x: -1, y: -1, t: 0 };
  var demoTimer = 0;

  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var demo = false;
  try {
    demo = new URLSearchParams(location.search).get("ripple") === "demo";
  } catch (e) {
    demo = false;
  }

  function build() {
    if (canvas) return true;
    if (!document.body) return false;
    canvas = document.createElement("canvas");
    canvas.className = "liquid-field";
    canvas.setAttribute("aria-hidden", "true");
    ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      canvas = null;
      return false;
    }
    document.body.appendChild(canvas);
    return true;
  }

  function size() {
    var w = window.innerWidth || 1024;
    var h = window.innerHeight || 768;
    var nextCols = Math.max(40, Math.round(w / CELL));
    var nextRows = Math.max(28, Math.round(h / CELL));
    if (nextCols === cols && nextRows === rows) return;
    cols = nextCols;
    rows = nextRows;
    canvas.width = cols;
    canvas.height = rows;
    cur = new Float32Array(cols * rows);
    prev = new Float32Array(cols * rows);
    image = ctx.createImageData(cols, rows);
    pixels = image.data;
  }

  function drop(cx, cy, rx, ry, strength) {
    if (!cur) return;
    var ax = Math.max(1.2, rx);
    var ay = Math.max(1.2, ry === undefined ? rx : ry);
    var x0 = Math.max(1, Math.floor(cx - ax));
    var x1 = Math.min(cols - 2, Math.ceil(cx + ax));
    var y0 = Math.max(1, Math.floor(cy - ay));
    var y1 = Math.min(rows - 2, Math.ceil(cy + ay));
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var dx = (x - cx) / ax;
        var dy = (y - cy) / ay;
        var d2 = dx * dx + dy * dy;
        if (d2 > 1) continue;
        var falloff = 1 - d2;
        cur[y * cols + x] -= strength * falloff * falloff;
      }
    }
    lastInput = performance.now();
  }

  function step() {
    for (var y = 1; y < rows - 1; y++) {
      var row = y * cols;
      for (var x = 1; x < cols - 1; x++) {
        var i = row + x;
        var v = (cur[i - 1] + cur[i + 1] + cur[i - cols] + cur[i + cols]) * 0.5 - prev[i];
        prev[i] = v * DAMPING;
      }
    }
    var swap = cur;
    cur = prev;
    prev = swap;
  }

  function paint() {
    var out = pixels;
    var phase = performance.now() * 0.00042;
    var i = 0;
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++, i += 4) {
        var here = y * cols + x;
        if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) {
          out[i + 3] = 0;
          continue;
        }
        var dx = cur[here + 1] - cur[here - 1];
        var dy = cur[here + cols] - cur[here - cols];
        var slope = dx * 0.9 + dy * 0.6;
        // Curvature gives the thin bright crests that read as water.
        var lap = (cur[here - 1] + cur[here + 1] + cur[here - cols] + cur[here + cols]) * 0.25 - cur[here];
        var swell = Math.sin(x * 0.16 + y * 0.11 + phase) * 0.0016;
        var s = slope + lap * 7 + swell;
        if (s > 0) {
          out[i] = 226;
          out[i + 1] = 244;
          out[i + 2] = 255;
          out[i + 3] = Math.min(255, Math.round(s * 1150));
        } else {
          out[i] = 44;
          out[i + 1] = 84;
          out[i + 2] = 152;
          out[i + 3] = Math.min(215, Math.round(-s * 860));
        }
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  function ambient() {
    var x = cols * (0.18 + Math.random() * 0.64);
    var y = rows * (0.24 + Math.random() * 0.52);
    drop(x, y, 3.6, 3, 0.1);
  }

  function loop(now) {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    if (now - lastFrame < 16) return;
    lastFrame = now;
    if (now - lastInput > 1600 && Math.random() < 0.02) ambient();
    if (now - lastInput > IDLE_STOP) {
      // Sleep until the next input, the surface is flat by now.
      frame = 0;
      running = false;
      return;
    }
    step();
    paint();
  }

  function start() {
    if (running || !build()) return;
    size();
    if (!cur) return;
    running = true;
    lastInput = performance.now();
    drop(cols * 0.5, rows * 0.4, 7, 5, 0.6);
    if (demo && !demoTimer) {
      demoTimer = setInterval(function () {
        drop(cols * (0.15 + Math.random() * 0.7), rows * (0.2 + Math.random() * 0.6), 7, 4, 0.6);
      }, 300);
    }
    if (!frame) frame = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (demoTimer) {
      clearInterval(demoTimer);
      demoTimer = 0;
    }
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function wake() {
    if (!running) start();
    lastInput = performance.now();
  }

  function onPointer(event) {
    if (!running) return;
    var target = event.target;
    if (target && target.closest && target.closest(".switcher, .sheet")) return;
    var x = (event.clientX / (window.innerWidth || 1)) * cols;
    var y = (event.clientY / (window.innerHeight || 1)) * rows;
    var now = performance.now();
    var speed = 0;
    if (pointer.t) {
      var dt = Math.max(8, now - pointer.t);
      speed = Math.hypot(x - pointer.x, y - pointer.y) / dt;
    }
    pointer.x = x;
    pointer.y = y;
    pointer.t = now;
    wake();
    if (event.type === "pointerdown") {
      drop(x, y, 4.5, 4.5, 0.7);
    } else {
      drop(x, y, 2.2, 1.6, Math.min(0.42, 0.07 + speed * 3.4));
    }
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    var delta = y - lastScroll;
    lastScroll = y;
    if (!delta) return;
    wake();
    var strength = Math.min(0.55, Math.abs(delta) * 0.007);
    var band = rows * 0.6;
    for (var k = 0; k < 4; k++) {
      drop(cols * (0.1 + Math.random() * 0.8), band + (Math.random() - 0.5) * rows * 0.2, 7, 1.8, strength);
    }
  }

  function sync() {
    var wanted =
      document.documentElement.getAttribute("data-style") === STYLE &&
      !(reduce && reduce.matches);
    if (wanted) start();
    else stop();
  }

  function onResize() {
    if (!running) return;
    cols = 0;
    rows = 0;
    size();
    drop(cols * 0.5, rows * 0.5, 7, 7, 0.5);
  }

  var resizeTimer = 0;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 180);
    },
    { passive: true }
  );
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerdown", onPointer, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else sync();
  });

  if (reduce && reduce.addEventListener) reduce.addEventListener("change", sync);

  if (document.documentElement.getAttribute("data-style") === STYLE && document.body) sync();
  else if (document.documentElement.getAttribute("data-style") === STYLE) {
    document.addEventListener("DOMContentLoaded", sync, { once: true });
  }

  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-style"],
  });
})();
