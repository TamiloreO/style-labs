/* Staged figure and artwork viewport.
 *
 * Two skins need behaviour rather than styling:
 *   data-scrollytelling moves the hero figure beside the three steps and marks
 *   the step in view, so the chart and the copy describe the same thing.
 *   zoomable-canvas makes the artwork itself pannable and zoomable.
 *
 * Both mount on stylelab:stylechange and unwind completely when the skin
 * changes, so no other skin inherits a moved figure or a transform.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var STAGED = "data-scrollytelling";
  var CANVAS = "zoomable-canvas";
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  /* ---------------------------------------------------------------- staged */

  var figure = null;
  var slot = null;
  var homeParent = null;
  var homeNext = null;
  var observer = null;
  var numEl = null;

  function mountStage() {
    if (figure) return;
    figure = document.querySelector(".hero__art");
    slot = document.querySelector("[data-figure-slot]");
    if (!figure || !slot) return;
    homeParent = figure.parentNode;
    homeNext = figure.nextSibling;
    slot.hidden = false;
    slot.appendChild(figure);
    figure.classList.add("hero__art--staged");
    numEl = figure.querySelector(".art__num");

    var cards = document.querySelectorAll("#work .card");
    if (!cards.length || !("IntersectionObserver" in window)) return;
    Array.prototype.forEach.call(cards, function (card, i) {
      card.setAttribute("data-step", String(i + 1));
    });
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var step = entry.target.getAttribute("data-step") || "1";
          if (figure) figure.setAttribute("data-step", step);
          if (numEl) numEl.textContent = "0" + step;
        });
      },
      { rootMargin: "-38% 0px -42% 0px", threshold: 0 }
    );
    Array.prototype.forEach.call(cards, function (card) {
      observer.observe(card);
    });
  }

  function unmountStage() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    Array.prototype.forEach.call(document.querySelectorAll("#work .card"), function (card) {
      card.removeAttribute("data-step");
    });
    if (!figure) return;
    figure.classList.remove("hero__art--staged");
    figure.removeAttribute("data-step");
    if (numEl) numEl.textContent = "01";
    if (homeParent) homeParent.insertBefore(figure, homeNext);
    if (slot) slot.hidden = true;
    figure = null;
    slot = null;
    homeParent = null;
    homeNext = null;
    numEl = null;
  }

  /* ------------------------------------------------------------- viewport */

  var viewport = null;
  var panel = null;
  var zoomBar = null;
  var scale = 1;
  var tx = 0;
  var ty = 0;
  var drag = null;
  var originalLabel = "";
  var MAX_SCALE = 2.6;
  var MIN_SCALE = 1;

  function bounds() {
    var w = viewport ? viewport.clientWidth : 0;
    var h = viewport ? viewport.clientHeight : 0;
    return { x: Math.max(0, (w * scale - w) / 2), y: Math.max(0, (h * scale - h) / 2) };
  }

  function clamp() {
    var b = bounds();
    tx = Math.min(b.x, Math.max(-b.x, tx));
    ty = Math.min(b.y, Math.max(-b.y, ty));
  }

  function render() {
    if (!panel) return;
    panel.style.transformOrigin = "50% 50%";
    panel.style.transform =
      "translate(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px) scale(" + scale.toFixed(3) + ")";
  }

  function zoomBy(factor) {
    scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
    clamp();
    render();
  }

  function reset() {
    scale = 1;
    tx = 0;
    ty = 0;
    render();
  }

  function onKey(event) {
    var key = event.key;
    var step = 26;
    if (key === "ArrowLeft") tx += step;
    else if (key === "ArrowRight") tx -= step;
    else if (key === "ArrowUp") ty += step;
    else if (key === "ArrowDown") ty -= step;
    else if (key === "+" || key === "=") zoomBy(1.2);
    else if (key === "-" || key === "_") zoomBy(1 / 1.2);
    else if (key === "0") reset();
    else return;
    event.preventDefault();
    if (key.indexOf("Arrow") === 0) {
      clamp();
      render();
    }
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, tx: tx, ty: ty };
    viewport.classList.add("is-dragging");
    if (viewport.setPointerCapture) viewport.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!drag) return;
    tx = drag.tx + (event.clientX - drag.x);
    ty = drag.ty + (event.clientY - drag.y);
    clamp();
    render();
  }

  function onPointerUp(event) {
    if (!drag) return;
    drag = null;
    if (viewport) viewport.classList.remove("is-dragging");
    if (viewport && viewport.releasePointerCapture) {
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch (e) {}
    }
  }

  function onControl(event) {
    var action = event.target && event.target.getAttribute("data-art-zoom");
    if (!action) return;
    if (action === "in") zoomBy(1.25);
    else if (action === "out") zoomBy(1 / 1.25);
    else reset();
  }

  function mountZoom() {
    if (viewport) return;
    viewport = document.getElementById("art-viewport");
    panel = document.getElementById("art-panel");
    zoomBar = document.querySelector(".art__zoom");
    if (!viewport || !panel || !zoomBar) {
      viewport = null;
      panel = null;
      zoomBar = null;
      return;
    }
    scale = 1;
    tx = 0;
    ty = 0;
    originalLabel = viewport.getAttribute("aria-label") || "";
    viewport.classList.add("is-zoomable");
    viewport.setAttribute("tabindex", "0");
    viewport.setAttribute("role", "group");
    viewport.setAttribute(
      "aria-label",
      "Hero artwork. Arrow keys pan, plus and minus zoom, zero resets."
    );
    viewport.addEventListener("keydown", onKey);
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerUp);
    zoomBar.addEventListener("click", onControl);
  }

  function unmountZoom() {
    if (!viewport) return;
    viewport.removeEventListener("keydown", onKey);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", onPointerUp);
    viewport.removeEventListener("pointercancel", onPointerUp);
    zoomBar.removeEventListener("click", onControl);
    viewport.classList.remove("is-zoomable", "is-dragging");
    viewport.setAttribute("tabindex", "-1");
    viewport.removeAttribute("role");
    viewport.setAttribute("aria-label", originalLabel);
    panel.style.transform = "";
    panel.style.transformOrigin = "";
    viewport = null;
    panel = null;
    zoomBar = null;
    drag = null;
    scale = 1;
    tx = 0;
    ty = 0;
  }

  /* --------------------------------------------------------------- wiring */

  function applySkin(id) {
    if (id === STAGED) mountStage();
    else unmountStage();
    if (id === CANVAS) mountZoom();
    else unmountZoom();
  }

  document.addEventListener("stylelab:stylechange", function (event) {
    applySkin(event.detail && event.detail.id);
  });

  applySkin(root.getAttribute("data-style"));

  if (reduce && reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (!panel) return;
      reset();
    });
  }
})();
