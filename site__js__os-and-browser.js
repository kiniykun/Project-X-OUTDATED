/* =====================================================================
   X shell: rail, launcher, window manager, apps, Settings/About
   ===================================================================== */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var os = $("os");
  if (!os) return;
  var KEY = "x_os_v1";
  var S = { wall: "eyes", icon: -1, name: "", tag: "Resident", shape: "diamond", custom: "" };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  if (["eyes", "void", "crimson", "custom"].indexOf(S.wall) < 0 || (S.wall === "custom" && !S.wallImg)) S.wall = "eyes";
  var ICONS = [
    "images/profile-icon-01.webp",
    "images/profile-icon-02.webp",
    "images/profile-icon-03.webp",
    "images/profile-icon-04.webp",
    "images/profile-icon-05.webp",
    "images/profile-icon-06.webp",
    "images/profile-icon-07.webp",
    "images/profile-icon-08.webp",
    "images/profile-icon-09.webp",
    "images/profile-icon-10.webp",
    "images/profile-icon-11.webp",
    "images/profile-icon-12.webp",
    "images/profile-icon-13.webp",
    "images/profile-icon-14.webp",
    "images/profile-icon-15.webp",
    "images/profile-icon-16.webp"
  ];
  if (typeof S.custom !== "string") S.custom = "";
  if (typeof S.icon !== "number" || S.icon < -1 || S.icon > ICONS.length || (S.icon === ICONS.length && !S.custom)) S.icon = -1;
  if (["diamond", "square", "round"].indexOf(S.shape) < 0) S.shape = "diamond";
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }
  function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var user = "User";
  function who() { return S.name || user; }
  function iconList() { return ICONS.concat(S.custom ? [S.custom] : []); }
  // profile badge: the chosen picture (art keeps its own frame), your own upload (cut to the badge shape), or your first letter
  function paintAv() {
    var list = iconList();
    os.setAttribute("data-shape", S.shape);
    Array.prototype.forEach.call(document.querySelectorAll("#os .st-av"), function (el) {
      var pic = S.icon >= 0 && S.icon < list.length;
      el.classList.toggle("pic", pic);
      el.classList.toggle("cust", pic && S.icon === ICONS.length);
      el.innerHTML = pic ? '<img alt="" src="' + list[S.icon] + '">' : "<span>" + esc(who().charAt(0).toUpperCase()) + "</span>";
    });
    Array.prototype.forEach.call(document.querySelectorAll("#os .pn"), function (n) { n.textContent = who(); });
    Array.prototype.forEach.call(document.querySelectorAll("#os .pt"), function (n) { n.textContent = S.tag || "Resident"; });
  }
  function iconGrid() {
    return '<div class="ic-grid">' + iconList().map(function (u, i) { return '<button class="ic-pick' + (S.icon === i ? " on" : "") + '" data-i="' + i + '" aria-label="Icon ' + (i + 1) + '"><img alt="" src="' + u + '"></button>'; }).join("") + "</div>";
  }
  function bindGrid(root, again) {
    root.querySelectorAll(".ic-pick").forEach(function (b) { b.onclick = function () { S.icon = +b.dataset.i; save(); paintAv(); again(); }; });
  }
  // squares an uploaded picture and keeps it lossless (png) so it stays sharp
  function readPicture(file, done) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var n = Math.min(768, Math.min(im.width, im.height)), c = document.createElement("canvas"); c.width = c.height = n;
        var x = c.getContext("2d"); x.imageSmoothingQuality = "high";
        var s = Math.min(im.width, im.height); x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, n, n);
        done(c.toDataURL("image/png"));
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  var BETA = "Beta V1 Test Not Full Version";

  /* ---------- icons ---------- */
  var IC = {
    start: '<svg viewBox="0 0 64 64"><path d="M16 16L48 48M48 16L16 48" stroke="#5a0b0b" stroke-width="13" stroke-linecap="round"/><path d="M16 16L48 48M48 16L16 48" stroke="#e02424" stroke-width="9" stroke-linecap="round"/></svg>',
    profile: '<svg class="ico" viewBox="0 0 32 32"><rect x="1.5" y="1.5" width="29" height="29" rx="4" fill="#1d1010" stroke="#d42a2a" stroke-opacity=".55"/><path d="M16 5.5L26.5 16 16 26.5 5.5 16z" fill="none" stroke="#d42a2a" stroke-width="1.6"/><circle cx="16" cy="13.2" r="3" fill="#e9dcd0"/><path d="M10.6 21c1-3 3-4 5.4-4s4.4 1 5.4 4" fill="#e9dcd0"/></svg>',
    settings: '<svg class="ico" viewBox="0 0 32 32"><rect x="1.5" y="1.5" width="29" height="29" rx="4" fill="#1d1010" stroke="#d42a2a" stroke-opacity=".55"/><circle cx="16" cy="16" r="6" fill="#c9b8aa"/><circle cx="16" cy="16" r="8.8" fill="none" stroke="#c9b8aa" stroke-width="3" stroke-dasharray="2.6 2.6"/><circle cx="16" cy="16" r="2.6" fill="#1d1010"/></svg>',
    portal: '<svg class="ico" viewBox="0 0 32 32"><rect x="1.5" y="1.5" width="29" height="29" rx="4" fill="#1d1010" stroke="#d42a2a" stroke-opacity=".55"/><circle cx="16" cy="16" r="8.5" fill="none" stroke="#c9b8aa" stroke-width="1.6"/><ellipse cx="16" cy="16" rx="3.6" ry="8.5" fill="none" stroke="#d42a2a" stroke-width="1.4"/><path d="M7.5 16h17" stroke="#c9b8aa" stroke-width="1.4"/></svg>',
    xlogo: '<svg class="ico" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#120a0a"/><path d="M18 18L46 46M46 18L18 46" stroke="#7a0f0f" stroke-width="13" stroke-linecap="round"/><path d="M18 18L46 46M46 18L18 46" stroke="#e02424" stroke-width="9" stroke-linecap="round"/></svg>',
    search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="6.8" cy="6.8" r="4.6"/><path d="M10.4 10.4L14 14"/></svg>',
    min: '<svg viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" fill="none"/></svg>',
    max: '<svg viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" rx="1" stroke="currentColor" fill="none"/></svg>',
    rest: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor"><rect x=".5" y="2.5" width="7" height="7" rx="1"/><path d="M2.5 2.5v-1a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-1"/></svg>',
    close: '<svg viewBox="0 0 10 10"><path d="M.5.5l9 9M9.5.5l-9 9" stroke="currentColor" fill="none"/></svg>',
    plus: '<svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',
    back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8H3M7.5 3.5L3 8l4.5 4.5"/></svg>',
    fwd: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5"/></svg>',
    reload: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M13.2 8A5.2 5.2 0 113.9 4.7M13.5 2.5v3h-3"/></svg>',
    stop: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
    home: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M2 7.5L8 2.5l6 5M3.5 6.5V13.5h3.2V9.5h2.6v4h3.2V6.5"/></svg>',
    dots: '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="13" cy="8" r="1.2"/></svg>',
    lock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2"/></svg>',
    system: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><rect x="1.5" y="3" width="15" height="10" rx="1.5"/><path d="M6 16h6M9 13v3"/></svg>',
    paint: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M9 2C4.6 2 2 5 2 8.4 2 12 4.8 15 8 15c1.2 0 1.6-.8 1.3-1.6-.4-1 .2-1.9 1.2-1.9H13c1.7 0 3-1.1 3-2.9C16 5 13 2 9 2z"/><circle cx="5.5" cy="8" r=".8" fill="currentColor"/><circle cx="8" cy="5.5" r=".8" fill="currentColor"/><circle cx="11.2" cy="6" r=".8" fill="currentColor"/></svg>',
    face: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M9 1.8L16.2 9 9 16.2 1.8 9z"/><circle cx="9" cy="7.4" r="1.9"/><path d="M5.6 12.2c.8-1.7 2-2.4 3.4-2.4s2.6.7 3.4 2.4"/></svg>',
    info: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><circle cx="9" cy="9" r="7"/><path d="M9 8.2v4.3"/><circle cx="9" cy="5.6" r=".5" fill="currentColor"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5L2.5 20h19L12 3.5z"/><path d="M12 10v5"/><circle cx="12" cy="17.6" r=".6" fill="currentColor"/></svg>'
  };

  /* ---------- apps ---------- */
  var APPS = [
    { id: "browser", name: "Browser", icon: IC.portal, open: function () { openBrowser(); } },
    { id: "settings", name: "Settings", icon: IC.settings, open: function (a) { openSettings(a); } }
  ];
  function appById(id) { return APPS.filter(function (a) { return a.id === id; })[0]; }

  /* ---------- window manager ---------- */
  var wins = {}, zTop = 10, cascade = 0, focused = null;
  var winLayer = $("osWins");
  var small = function () { return window.innerWidth <= 720; };

  function createWin(o) {
    var el = h("div", "win");
    var W = Math.min(o.w || 900, window.innerWidth - 20), H = Math.min(o.h || 600, window.innerHeight - 80);
    el.style.width = W + "px"; el.style.height = H + "px";
    el.style.left = Math.max(8, (window.innerWidth - W) / 2 + (cascade - 2) * 28 + (small() ? 0 : 32)) + "px";
    el.style.top = Math.max(8, (window.innerHeight - H) / 2 + (cascade - 2) * 24) + "px";
    cascade = (cascade + 1) % 5;
    var bar = h("div", "w-bar");
    if (o.tabs) bar.appendChild(o.tabs);
    var drag = h("div", "w-drag", o.tabs ? "" : o.icon + '<span class="tb-title">' + esc(o.title) + "</span>");
    if (o.tabs) drag.style.minWidth = "64px";
    bar.appendChild(drag);
    var ctl = h("div", "w-ctl");
    var bMin = h("button", "w-min", IC.min), bMax = h("button", "w-max", IC.max), bX = h("button", "x", IC.close);
    bMin.setAttribute("aria-label", "Minimize"); bMax.setAttribute("aria-label", "Maximize"); bX.setAttribute("aria-label", "Close");
    ctl.appendChild(bMin); ctl.appendChild(bMax); ctl.appendChild(bX);
    bar.appendChild(ctl);
    var body = h("div", "w-body");
    var grip = h("div", "w-grip");
    el.appendChild(bar); el.appendChild(body); el.appendChild(grip);
    winLayer.appendChild(el);
    var w = { id: o.id, app: o.app, el: el, body: body, min: false, onClose: o.onClose };
    wins[o.id] = w;
    o.build(body, w);

    function toggleMax() { el.classList.toggle("max"); bMax.innerHTML = el.classList.contains("max") ? IC.rest : IC.max; }
    bMin.onclick = function () { minimize(w); };
    bMax.onclick = toggleMax;
    bX.onclick = function () { closeWin(w); };
    el.addEventListener("pointerdown", function () { focusWin(w); }, true);
    bar.addEventListener("dblclick", function (e) { if (!e.target.closest("button,.br-tab,.br-new,input")) toggleMax(); });

    // drag
    bar.addEventListener("pointerdown", function (e) {
      if (e.button || e.target.closest("button,.br-tab,.br-new,input")) return;
      if (el.classList.contains("max") || small()) return;
      var sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
      os.classList.add("dragging");
      var mv = function (ev) {
        el.style.left = Math.min(window.innerWidth - 60, Math.max(-el.offsetWidth + 100, ox + ev.clientX - sx)) + "px";
        el.style.top = Math.min(window.innerHeight - 100, Math.max(0, oy + ev.clientY - sy)) + "px";
      };
      var up = function () { os.classList.remove("dragging"); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
      window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    });
    // resize
    grip.addEventListener("pointerdown", function (e) {
      e.preventDefault(); e.stopPropagation();
      var sx = e.clientX, sy = e.clientY, ow = el.offsetWidth, oh = el.offsetHeight;
      os.classList.add("dragging");
      var mv = function (ev) { el.style.width = Math.max(340, ow + ev.clientX - sx) + "px"; el.style.height = Math.max(240, oh + ev.clientY - sy) + "px"; };
      var up = function () { os.classList.remove("dragging"); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
      window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    });
    focusWin(w);
    return w;
  }
  function focusWin(w) {
    if (w.min) { w.min = false; w.el.classList.remove("min"); }
    w.el.style.zIndex = ++zTop;
    Object.keys(wins).forEach(function (k) { wins[k].el.classList.toggle("focus", wins[k] === w); });
    focused = w; paintTaskbar();
  }
  function minimize(w) {
    w.min = true; w.el.classList.add("min"); w.el.classList.remove("focus");
    if (focused === w) focused = null;
    var next = Object.keys(wins).map(function (k) { return wins[k]; }).filter(function (x) { return !x.min; }).sort(function (a, b) { return b.el.style.zIndex - a.el.style.zIndex; })[0];
    if (next) focusWin(next); else paintTaskbar();
  }
  function closeWin(w) {
    if (w.onClose) w.onClose();
    w.el.remove(); delete wins[w.id]; if (focused === w) focused = null;
    var next = Object.keys(wins).map(function (k) { return wins[k]; }).filter(function (x) { return !x.min; }).sort(function (a, b) { return b.el.style.zIndex - a.el.style.zIndex; })[0];
    if (next) focusWin(next); else paintTaskbar();
  }

  /* ---------- taskbar + start ---------- */
  var tbCenter = $("tbCenter"), start = $("osStart"), startBtn;
  var tbBtns = {};
  function buildTaskbar() {
    startBtn = h("button", "tb-btn", IC.start); startBtn.setAttribute("aria-label", "Start");
    startBtn.onclick = function (e) { e.stopPropagation(); toggleStart(); };
    tbCenter.appendChild(startBtn);
    APPS.forEach(function (a) {
      var b = h("button", "tb-btn", a.icon); b.title = a.name; b.setAttribute("aria-label", a.name);
      b.onclick = function () {
        closeStart();
        var w = wins[a.id];
        if (!w) a.open();
        else if (w.min) focusWin(w);
        else if (focused === w) minimize(w);
        else focusWin(w);
      };
      tbBtns[a.id] = b; tbCenter.appendChild(b);
    });
  }
  function paintTaskbar() {
    APPS.forEach(function (a) {
      var w = wins[a.id], b = tbBtns[a.id];
      b.classList.toggle("run", !!w);
      b.classList.toggle("act", !!w && !w.min && focused === w);
    });
  }
  function openStartState() { return start.classList.contains("open"); }
  function closeStart() { start.classList.remove("open"); start.setAttribute("aria-hidden", "true"); }
  function toggleStart(focusSearch) {
    if (openStartState() && !focusSearch) { closeStart(); return; }
    $("stQ").value = ""; filterStart("");
    start.classList.add("open"); start.setAttribute("aria-hidden", "false");
    if (matchMedia("(hover: hover)").matches) setTimeout(function () { $("stQ").focus(); }, 60);
  }
  function filterStart(q) {
    q = q.trim().toLowerCase();
    Array.prototype.forEach.call($("stGrid").children, function (c) { c.style.display = !q || c.dataset.n.indexOf(q) > -1 ? "" : "none"; });
  }
  function buildStart() {
    var g = $("stGrid");
    APPS.forEach(function (a) {
      var b = h("button", "st-app", a.icon + "<span>" + esc(a.name) + "</span>"); b.dataset.n = a.name.toLowerCase();
      b.onclick = function () { closeStart(); a.open(); };
      g.appendChild(b);
    });
    var rec = $("stRec");
    [["profile", "Profile", "Name and picture", IC.face], ["personal", "Look", "Background", IC.paint], ["about", "About", "Beta V1 Test Not Full Version", IC.info]].forEach(function (r) {
      var a = appById("settings");
      var b = h("button", "st-rec", '<span class="rec-ic">' + r[3] + "</span><div><b>" + esc(r[1]) + "</b><span>" + esc(r[2]) + "</span></div>");
      b.onclick = function () { closeStart(); a.open(r[0]); };
      rec.appendChild(b);
    });
    $("stQ").addEventListener("input", function (e) { filterStart(e.target.value); });
    $("stQ").addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var q = e.target.value.trim(); if (!q) return;
      var hit = APPS.filter(function (a) { return a.name.toLowerCase().indexOf(q.toLowerCase()) > -1; })[0];
      closeStart();
      if (hit) hit.open();
    });
    $("stPwr").onclick = function () { location.reload(); };
    $("stUser").onclick = function () { closeStart(); openSettings("profile"); };
    document.addEventListener("pointerdown", function (e) {
      if (openStartState() && !start.contains(e.target) && !e.target.closest(".tb-btn")) closeStart();
    });
    document.addEventListener("keydown", function (e) {
      if (!os.classList.contains("on")) return;
      if (e.key === "Escape") closeStart();
      if (e.key === "Meta") { e.preventDefault(); toggleStart(); }
    });
  }
  function buildIcons() {
    var box = $("osIcons"), coarse = matchMedia("(hover: none)").matches;
    APPS.forEach(function (a) {
      var b = h("button", "dicon", a.icon.replace('class="ico"', 'class="ico ic"') + "<span>" + esc(a.name) + "</span>");
      b.onclick = function (e) {
        e.stopPropagation();
        if (coarse) { a.open(); return; }
        Array.prototype.forEach.call(box.children, function (c) { c.classList.remove("sel"); }); b.classList.add("sel");
      };
      b.ondblclick = function () { a.open(); };
      b.onkeydown = function (e) { if (e.key === "Enter") a.open(); };
      box.appendChild(b);
    });
    os.querySelector(".wall").addEventListener("pointerdown", function () {
      Array.prototype.forEach.call(box.children, function (c) { c.classList.remove("sel"); }); closeStart();
    });
  }
  var wNoteT = 0;
  function buildWidgets() {
    var box = $("osW"); if (!box) return;
    box.innerHTML =
      '<section class="wc"><h4>Signed in</h4><div class="wc-me"><b></b><span></span></div></section>' +
      '<section class="wc"><h4>Jump</h4><div class="wc-grid">' + SITE_TILES.map(function (t, k) { return '<button type="button" data-k="' + k + '" title="' + t[0] + '">' + siteIcon(t[0]) + "<span>" + t[0] + "</span></button>"; }).join("") + "</div></section>" +
      '<section class="wc"><h4>Recent</h4><div class="wc-rec"></div></section>' +
      '<section class="wc"><h4>Note</h4><textarea class="wc-note" maxlength="400" placeholder="Leave yourself a note" spellcheck="false"></textarea></section>';
    var ta = box.querySelector(".wc-note"); ta.value = S.note || "";
    ta.oninput = function () { S.note = ta.value; clearTimeout(wNoteT); wNoteT = setTimeout(save, 300); };
    ta.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    function rec() {
      var r = (S.recent || []).slice(0, 4), el = box.querySelector(".wc-rec");
      el.innerHTML = r.length ? r.map(function (x, k) { return '<button type="button" data-r="' + k + '">' + esc(x.h) + "</button>"; }).join("") : '<p>Nothing opened yet.</p>';
    }
    window.__osRec = rec; rec();
    box.addEventListener("click", function (e) {
      var k = e.target.closest("[data-k]"), r = e.target.closest("[data-r]");
      if (k) openBrowserTo(SITE_TILES[+k.dataset.k][1]);
      else if (r && S.recent && S.recent[+r.dataset.r]) openBrowserTo(S.recent[+r.dataset.r].u);
    });
    me();
  }
  function me() {
    var b = document.querySelector("#osW .wc-me b"), t = document.querySelector("#osW .wc-me span");
    if (b) b.textContent = who(); if (t) t.textContent = S.tag || "Resident";
  }
  function tick() {
    var d = new Date();
    var d1 = $("osD1"), d2 = $("osD2");
    if (d1) d1.textContent = d.toLocaleDateString([], { weekday: "long" });
    if (d2) d2.textContent = d.toLocaleDateString([], { day: "numeric", month: "long" }) + "  \u00b7  " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    me();
    $("clkT").textContent = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    $("clkD").textContent = d.toLocaleDateString([], { month: "numeric", day: "numeric" });
  }

  /* =================================================================
     BROWSER  (the X web browser)
     ================================================================= */
  var IC_EXT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5h4v4M13.5 2.5L7.5 8.5M12 9.5v3a1 1 0 01-1 1H3.5a1 1 0 01-1-1V5a1 1 0 011-1h3"/></svg>';
  // only http(s) addresses are allowed; "example.com" becomes https://example.com
  function normUrl(v) {
    v = String(v || "").trim(); if (!v) return "";
    if (!/^[a-z][a-z0-9+.\-]*:/i.test(v)) v = "https://" + v;
    try { var u = new URL(v); return /^https?:$/.test(u.protocol) ? u.href : ""; } catch (e) { return ""; }
  }
  var SJ_DEFAULT = atob("aHR0cHM6Ly9pZGstZXB4by5vbnJlbmRlci5jb20=");
  var SITE_TILES = [["DuckDuckGo", "https://duckduckgo.com/"], ["Google", "https://www.google.com/"], ["YouTube", "https://www.youtube.com/"], ["Reddit", "https://www.reddit.com/"], ["GitHub", "https://github.com/"], ["Discord", "https://discord.com/app"], ["Roblox", "https://www.roblox.com/"], ["Wikipedia", "https://en.wikipedia.org/"]];
  var SITE_ICONS = {
    DuckDuckGo: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    Google: '<circle cx="12" cy="12" r="8.5"/><path d="M12 12h8.2M20.2 12a8.2 8.2 0 01-2.4 5.8"/>',
    YouTube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z"/>',
    Reddit: '<ellipse cx="12" cy="14" rx="8" ry="5.5"/><circle cx="9" cy="13.5" r=".9"/><circle cx="15" cy="13.5" r=".9"/><path d="M9.5 16.5q2.5 1.4 5 0M12 8.5l1.3-4.5 4 1"/><circle cx="18.2" cy="5.2" r="1.2"/>',
    GitHub: '<circle cx="6.5" cy="5.5" r="2.2"/><circle cx="6.5" cy="18.5" r="2.2"/><circle cx="17.5" cy="9" r="2.2"/><path d="M6.5 7.7v8.6M17.5 11.2c0 4-5 2.5-9.5 5.4"/>',
    Discord: '<path d="M5 6.5q7-3 14 0l1.8 10.5q-3 2.2-5.6 2.6l-1-2h-4.4l-1 2Q6.2 19.2 3.2 17z"/><circle cx="9" cy="12.2" r="1.4"/><circle cx="15" cy="12.2" r="1.4"/>',
    Roblox: '<rect x="5.5" y="5.5" width="13" height="13" rx="1.5" transform="rotate(14 12 12)"/><rect x="10.3" y="10.3" width="3.4" height="3.4" transform="rotate(14 12 12)"/>',
    Wikipedia: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c-3 3-3 14 0 17M12 3.5c3 3 3 14 0 17"/>'
  };
  function siteIcon(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + SITE_ICONS[n] + "</svg>"; }
  var browserGo = null;
  function openBrowserTo(u) { openBrowser(); if (browserGo) browserGo(u); }
  function openBrowser() {
    if (wins.browser) { focusWin(wins.browser); return; }
    createWin({
      id: "browser", app: "browser", title: "Browser", icon: IC.portal, w: 1000, h: 680,
      build: function (body) {
        var SEARCH = "https://duckduckgo.com/?q=";
        var cur = "", atHome = true, timer = 0;
        function sjBase() { var o = S.sjBase; if (!o || /project-x-p6fe\.onrender\.com/i.test(o)) return SJ_DEFAULT; return o; }
        function pxOn() { return S.pxOn !== false; }
        function frameUrl(u) { return pxOn() ? sjBase() + "/go.html?url=" + encodeURIComponent(u) : u; }
        var bar = h("div", "pt-bar",
          '<button class="pt-b" type="button" data-a="reload" aria-label="Reload" title="Reload">' + IC.reload + "</button>" +
          '<button class="pt-b" type="button" data-a="home" aria-label="Home page" title="Home page">' + IC.home + "</button>" +
          '<form class="pt-url" autocomplete="off" novalidate>' + IC.lock + '<input class="pt-in" type="text" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Address or search" placeholder="Search or enter a web address"></form>' +
          '<button class="pt-px" type="button" data-a="px" title="Proxy settings"></button>' +
          '<button class="pt-b" type="button" data-a="ext" aria-label="Open in a new tab" title="Open in a new tab">' + IC_EXT + "</button>");
        var panel = h("div", "pt-panel",
          '<b>Proxy</b><span>Sites open through your Scramjet address below. Change it only if you move the proxy.</span>' +
          '<input class="pt-pi pt-pb" type="url" placeholder="Use a different proxy (leave empty for the default)" autocapitalize="off" autocorrect="off" spellcheck="false">' +
          '<div class="pt-pr"><button type="button" class="xbtn pri" data-a="pxsave">Save and use</button><button type="button" class="xbtn" data-a="pxoff">Turn off</button><button type="button" class="xbtn" data-a="pxclose">Close</button></div>');
        var note = h("div", "pt-note", '<span class="pt-note-t"></span><button class="pt-note-b" type="button" data-a="ext">Open in a new tab</button><button class="pt-x" type="button" data-a="x" aria-label="Dismiss">&times;</button>');
        var wrap = h("div", "pt-wrap", '<div class="pt-prog"></div><div class="pt-load">Loading&hellip;</div>');
        var TILES = SITE_TILES, tIc = siteIcon;
        var home = h("div", "pt-home on",
          '<canvas class="pt-cv"></canvas><div class="pt-vig"></div>' +
          '<div class="pt-hc">' +
            '<div class="pt-hx pt-a" style="--d:0" data-t="X">X</div>' +
            '<form class="pt-hs pt-a" style="--d:1" autocomplete="off" novalidate>' + IC.search + '<input class="pt-hi" type="text" inputmode="search" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Search" placeholder="Search DuckDuckGo or enter an address"></form>' +
            '<div class="pt-idx pt-a" style="--d:2">' + TILES.map(function (t, k) { return '<button type="button" class="pt-tile" data-t="' + k + '"><i>' + tIc(t[0]) + '</i><b>' + t[0] + '</b></button>'; }).join("") + '</div>' +
            '<div class="pt-rec pt-a" style="--d:3"></div>' +
          '</div>');
        wrap.appendChild(home);
        var f = document.createElement("iframe");
        f.className = "pt-frame"; f.title = "Browser";
        f.setAttribute("allow", "fullscreen; clipboard-read; clipboard-write; autoplay; encrypted-media; picture-in-picture; geolocation; microphone; camera");
        f.setAttribute("allowfullscreen", "");
        wrap.appendChild(f);
        body.appendChild(bar); body.appendChild(panel); body.appendChild(note); body.appendChild(wrap);
        var inp = bar.querySelector(".pt-in"), form = bar.querySelector(".pt-url"), noteT = note.querySelector(".pt-note-t"), pxBtn = bar.querySelector(".pt-px");
        var pb = panel.querySelector(".pt-pb");

        function paintPx() { pxBtn.textContent = pxOn() ? "Scramjet on" : "Proxy off"; pxBtn.classList.toggle("on", pxOn()); }
        function showNote(txt) { noteT.textContent = txt; note.classList.add("on"); }
        function isReplitDev(u) { try { return /\.replit\.dev$/i.test(new URL(u).hostname); } catch (e) { return false; } }
        // what the person typed: an address, or words to search for
        function smart(v) {
          v = String(v || "").trim(); if (!v) return "";
          if (/^[a-z][a-z0-9+.\-]*:\/\//i.test(v)) return normUrl(v);
          if (!/\s/.test(v) && (/^localhost(:\d+)?(\/|$)/i.test(v) || /^[^\s\/]+\.[a-z]{2,}(:\d+)?([\/?#]|$)/i.test(v))) return normUrl(v);
          return SEARCH + encodeURIComponent(v);
        }
        function goHome() {
          atHome = true; cur = ""; inp.value = ""; clearTimeout(timer);
          note.classList.remove("on"); wrap.classList.remove("loading", "ready");
          f.src = "about:blank"; home.classList.add("on"); if (home.__refresh) home.__refresh();
        }
        function go(u) {
          atHome = false; home.classList.remove("on");
          cur = u; if (window.__ptRemember) window.__ptRemember(u); inp.value = u.replace(/^https:\/\//i, "");
          wrap.classList.remove("ready"); wrap.classList.add("loading");
          note.classList.remove("on"); clearTimeout(timer);
          if (!pxOn() && isReplitDev(u)) showNote("Replit keeps dev links private and only shows them to the signed-in owner, so this usually stays blank inside another page. In Replit, open Networking and turn off Private preview, or Publish the app and paste the public link above.");
          else timer = setTimeout(function () { if (!wrap.classList.contains("ready")) showNote(pxOn() ? "Still loading. Heavy sites can be slow or break through the proxy." : "Still loading. If it stays blank, turn the proxy on or open the page in a new tab."); }, 9000);
          f.src = frameUrl(u);
        }
        f.addEventListener("load", function () {
          wrap.classList.add("ready"); wrap.classList.remove("loading"); clearTimeout(timer);
          if (!pxOn() && !isReplitDev(cur)) {
            showNote("Blank page or an error face? That site may not allow being shown here. Turn the proxy on to open it.");
            timer = setTimeout(function () { note.classList.remove("on"); }, 7000);
          }
        });
        // the proxy tells us which real address the page is on, so the bar stays correct after clicking links
        function onMsg(e) {
          if (!document.body.contains(f)) { window.removeEventListener("message", onMsg); return; }
          if (atHome) return;
          if (e.source !== f.contentWindow || !e.data || !e.data.px || typeof e.data.url !== "string") return;
          var u = normUrl(e.data.url); if (!u) return;
          cur = u; inp.value = u.replace(/^https:\/\//i, "");
        }
        window.addEventListener("message", onMsg);
        form.onsubmit = function (e) {
          e.preventDefault();
          var u = smart(inp.value);
          if (!u) { inp.classList.add("bad"); setTimeout(function () { inp.classList.remove("bad"); }, 700); return; }
                    inp.blur(); go(u);
        };
        inp.addEventListener("focus", function () { setTimeout(function () { try { inp.select(); } catch (e) {} }, 0); });
        function openExt() {
          if (!cur) return;
          var a = document.createElement("a"); a.href = cur; a.target = "_blank"; a.rel = "noopener noreferrer";
          a.style.display = "none"; document.body.appendChild(a); a.click(); a.remove();
        }
        function cleanBase(v) { v = String(v || "").trim().replace(/\/+$/, ""); var u = normUrl(v); return u ? u.replace(/\/+$/, "") : ""; }
        bar.addEventListener("click", function (e) {
          var b = e.target.closest("[data-a]"); if (!b) return;
          if (b.dataset.a === "reload") { if (!atHome) go(cur); }
          else if (b.dataset.a === "home") goHome();
          else if (b.dataset.a === "ext") openExt();
          else if (b.dataset.a === "px") { pb.value = (S.sjBase && S.sjBase !== SJ_DEFAULT && !/project-x-p6fe\.onrender\.com/i.test(S.sjBase)) ? S.sjBase : ""; panel.classList.toggle("on"); }
        });
        panel.addEventListener("click", function (e) {
          var b = e.target.closest("[data-a]"); if (!b) return;
          if (b.dataset.a === "pxsave") {
            var raw = String(pb.value || "").trim(), base = raw ? cleanBase(raw) : "";
            if (raw && !base) { showNote("That address doesn't look right."); return; }
            S.sjBase = base || ""; S.pxOn = true; save(); paintPx(); panel.classList.remove("on"); if (!atHome) go(cur);
          } else if (b.dataset.a === "pxoff") { S.pxOn = false; save(); paintPx(); panel.classList.remove("on"); if (!atHome) go(cur); }
          else panel.classList.remove("on");
        });
        note.addEventListener("click", function (e) {
          var b = e.target.closest("[data-a]"); if (!b) return;
          if (b.dataset.a === "ext") openExt(); else note.classList.remove("on");
        });
        var hf = home.querySelector(".pt-hs"), hi = home.querySelector(".pt-hi");
        var alive = function () { return document.body.contains(home); };
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        function renderRecent() {
          var r = (S.recent || []).slice(0, 4), box = home.querySelector(".pt-rec");
          if (!r.length) { box.innerHTML = ""; return; }
          box.innerHTML = "<span>Recent</span>" + r.map(function (x, k) { return '<button type="button" data-r="' + k + '">' + esc(x.h) + "</button>"; }).join("");
        }
        function remember(u) {
          try {
            var o = new URL(u), host = o.hostname.replace(/^www\./, "");
            if (/^(www\.)?duckduckgo\.com$/.test(o.hostname) && /[?&]q=/.test(o.search)) return;
            S.recent = [{ h: host, u: o.origin + "/" }].concat((S.recent || []).filter(function (x) { return x.h !== host; })).slice(0, 4); save(); if (window.__osRec) window.__osRec();
          } catch (e) {}
        }
        window.__ptRemember = remember;
        home.addEventListener("pointermove", function (e) {
          var hr = home.getBoundingClientRect(); home.style.setProperty("--mx", (e.clientX - hr.left) + "px"); home.style.setProperty("--my", (e.clientY - hr.top) + "px");
        });
        // slow red embers
        var cv = home.querySelector(".pt-cv"), cx2 = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0, P = [];
        function mkE(init) { return { x: Math.random() * W, y: init ? Math.random() * H : H + 12, r: .5 + Math.random() * 1.6, v: .15 + Math.random() * .45, ph: Math.random() * 6.28, sw: .3 + Math.random() * .8, a: .3 + Math.random() * .6 }; }
        function scene(t) {
          if (!alive()) return;
          if (atHome && wins.browser) {
            var w = cv.clientWidth, hh = cv.clientHeight;
            if (w && (w !== W || hh !== H)) { W = w; H = hh; cv.width = W * dpr; cv.height = H * dpr; cx2.setTransform(dpr, 0, 0, dpr, 0, 0); P = []; }
            if (W) {
              cx2.clearRect(0, 0, W, H);
              var want = Math.min(55, Math.floor(W / 14)); while (P.length < want) P.push(mkE(true));
              for (var i = 0; i < P.length; i++) {
                var q = P[i]; q.y -= q.v; q.x += Math.sin(t / 1100 + q.ph) * q.sw * .4;
                if (q.y < -12) { P[i] = mkE(false); continue; }
                var fl = .55 + .45 * Math.sin(t / 140 + q.ph * 3), fd = q.y < H * .3 ? q.y / (H * .3) : 1, al = q.a * fl * fd;
                cx2.fillStyle = "rgba(224,36,36," + (al * .14).toFixed(3) + ")"; cx2.beginPath(); cx2.arc(q.x, q.y, q.r * 4, 0, 6.283); cx2.fill();
                cx2.fillStyle = "rgba(255,90,60," + al.toFixed(3) + ")"; cx2.beginPath(); cx2.arc(q.x, q.y, q.r, 0, 6.283); cx2.fill();
              }
            }
          }
          requestAnimationFrame(scene);
        }
        home.addEventListener("click", function (e) { var r = e.target.closest("[data-r]"); if (r) go(S.recent[+r.dataset.r].u); });
        renderRecent();
        if (!reduce) requestAnimationFrame(scene);
        home.__refresh = function () { renderRecent(); };
        hf.onsubmit = function (e) { e.preventDefault(); var u = smart(hi.value); if (!u) return; hi.value = ""; hi.blur(); go(u); };
        home.addEventListener("click", function (e) { var t = e.target.closest("[data-t]"); if (t) go(TILES[+t.dataset.t][1]); });
        paintPx();
        browserGo = go;
        goHome();
      }
    });
  }

  /* =================================================================
     PROFILE EDITOR  (Settings > Profile > Customize)
     ================================================================= */
  function editorHTML() {
    return '<div class="pf-card"><span class="st-av big"></span><div class="pf-fields">' +
      '<label>Name</label><input class="pf-in pf-n pf-name" maxlength="16" placeholder="Your name" autocomplete="off" spellcheck="false">' +
      '<label>Tagline</label><input class="pf-in pf-tag" maxlength="32" placeholder="Resident" autocomplete="off" spellcheck="false"></div></div>' +
      '<h3>Profile selection</h3><div class="pf-grid"></div>' +
      '<div class="pf-row"><button class="xbtn pf-up" type="button">Upload your own</button><button class="xbtn pf-rm" type="button">Use my letter instead</button><input type="file" class="pf-file" accept="image/*" hidden><span class="pf-msg"></span></div>' +
      '<h3>Badge shape</h3><div class="seg pf-shape"></div>';
  }
  function bindEditor(pf, fillName) {
    var nameIn = pf.querySelector(".pf-name"), tagIn = pf.querySelector(".pf-tag"), msg = pf.querySelector(".pf-msg");
    nameIn.value = S.name || (fillName ? user : ""); tagIn.value = S.tag;
    nameIn.oninput = function () { S.name = nameIn.value.trim() === user ? "" : nameIn.value.trim(); save(); paintAv(); };
    tagIn.oninput = function () { S.tag = tagIn.value.trim(); save(); paintAv(); };
    function drawGrid() { var g = pf.querySelector(".pf-grid"); g.innerHTML = iconGrid(); bindGrid(g, drawGrid); }
    function drawShape() {
      var seg = pf.querySelector(".pf-shape"); seg.innerHTML = "";
      [["diamond", "Diamond"], ["square", "Square"], ["round", "Round"]].forEach(function (s) {
        var b = h("button", S.shape === s[0] ? "on" : "", s[1]); b.type = "button";
        b.onclick = function () { S.shape = s[0]; save(); paintAv(); drawShape(); };
        seg.appendChild(b);
      });
    }
    pf.querySelector(".pf-up").onclick = function () { pf.querySelector(".pf-file").click(); };
    pf.querySelector(".pf-file").onchange = function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      readPicture(f, function (uri) {
        S.custom = uri; S.icon = ICONS.length;
        msg.textContent = save() ? "" : "Too big to remember after a reload, but it works for now.";
        paintAv(); drawGrid();
      });
      e.target.value = "";
    };
    pf.querySelector(".pf-rm").onclick = function () { S.icon = -1; save(); paintAv(); drawGrid(); };
    var rs = pf.querySelector(".pf-reset");
    if (rs) rs.onclick = function () { S.name = ""; S.tag = "Resident"; S.shape = "diamond"; S.icon = -1; S.custom = ""; save(); nameIn.value = fillName ? user : ""; tagIn.value = S.tag; paintAv(); drawGrid(); drawShape(); };
    drawGrid(); drawShape(); paintAv();
  }
  function readWallpaper(file, done) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement("canvas");
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); done(c.toDataURL("image/jpeg", .85));
      };
      im.onerror = function () { done(""); };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  function wallsHTML() {
    var list = [["eyes", "Eyes"], ["void", "Void"], ["crimson", "Crimson"]];
    if (S.wallImg) list.push(["custom", "Yours"]);
    return '<div class="walls">' + list.map(function (k) {
      return '<button class="wl' + (S.wall === k[0] ? " on" : "") + '" data-w="' + k[0] + '" aria-label="' + k[1] + '" type="button"><i' + (k[0] === "custom" ? ' style="background-image:url(' + S.wallImg + ')"' : "") + '></i><em>' + k[1] + "</em></button>";
    }).join("") + '<button class="wl wl-up" type="button" data-up="1"><b>+</b>Upload picture</button></div><div class="wl-msg"></div><input type="file" class="wl-file" accept="image/*" hidden>';
  }
  function bindWalls(root, again) {
    root.querySelectorAll(".wl[data-w]").forEach(function (b) { b.onclick = function () { S.wall = b.dataset.w; save(); applyTheme(); again(); }; });
    var up = root.querySelector(".wl-up"), fi = root.querySelector(".wl-file"), msg = root.querySelector(".wl-msg");
    if (up && fi) {
      up.onclick = function () { fi.click(); };
      fi.onchange = function (e) {
        var f = e.target.files && e.target.files[0]; if (!f) return;
        readWallpaper(f, function (uri) {
          if (!uri) { if (msg) msg.textContent = "Could not read that picture."; return; }
          S.wallImg = uri; S.wall = "custom"; var ok = save(); applyTheme(); again();
          var m2 = root.querySelector(".wl-msg"); if (m2 && !ok) m2.textContent = "Too big to remember after a reload, but it works for now.";
        });
        e.target.value = "";
      };
    }
  }

  /* =================================================================
     SETTINGS (with About)
     ================================================================= */
  function openSettings(page) {
    if (wins.settings) { focusWin(wins.settings); if (wins.settings.goto && typeof page === "string") wins.settings.goto(page); return; }
    createWin({
      id: "settings", app: "settings", title: "Settings", icon: IC.settings, w: 940, h: 620,
      build: function (body, w) {
        var wrap = h("div", "set"), nav = h("div", "set-nav"), main = h("div", "set-main");
        var me = h("button", "set-me", '<span class="st-av"></span><div><b class="pn"></b><span class="pt"></span></div>'); me.type = "button"; me.setAttribute("aria-label", "Profile"); me.onclick = function () { goto("profile"); }; nav.appendChild(me);
        var pages = [["system", "System", IC.system], ["profile", "Profile", IC.face], ["personal", "Look", IC.paint], ["about", "About", IC.info]];
        var btns = {};
        pages.forEach(function (p) { var b = h("button", "set-i", p[2] + "<span>" + p[1] + "</span>"); b.onclick = function () { goto(p[0]); }; btns[p[0]] = b; nav.appendChild(b); });
        wrap.appendChild(nav); wrap.appendChild(main); body.appendChild(wrap);

        function card(l, sub, r) { return '<div class="scard"><div class="l"><b>' + l + "</b>" + (sub ? "<span>" + sub + "</span>" : "") + '</div><div class="r">' + r + "</div></div>"; }
        function betaBanner() { return '<div class="beta-banner">' + IC.warn + "<div><b>" + BETA + "</b><span>This is an early preview of X. Some features are missing or unfinished and may change at any time.</span></div></div>"; }
        var render = {
          system: function () {
            return "<h1>System</h1>" + betaBanner() +
              '<div class="hero-card">' + IC.xlogo.replace("ico", "ico big") + "<div><b>Project X</b><span>" + BETA + "</span></div></div>" +
              "<h3>Display</h3>" + card("Screen size", "Current window size of X", window.innerWidth + " &times; " + window.innerHeight);
          },
          profile: function () {
            return "<h1>Profile</h1>" +
              '<div class="pf-card"><span class="st-av big"></span><div class="pf-fields"><b class="pn"></b><span class="pt"></span></div><button class="xbtn pri pf-cust" type="button">Customize</button></div>';
          },
          customize: function () {
            return '<button class="xbtn pf-back" type="button">&lsaquo; Profile</button><h1 style="margin-top:14px">Customize</h1>' + editorHTML() + '<div class="pf-row" style="margin-top:26px"><button class="xbtn pf-reset" type="button">Reset profile</button></div>';
          },
          personal: function () {
            return "<h1>Look</h1><h3>Background</h3>" + wallsHTML();
          },
          about: function () {
            return "<h1>About</h1>" + betaBanner() +
              '<div class="hero-card">' + IC.xlogo.replace("ico", "ico big") + "<div><b>Project X</b><span>Beta V1</span></div></div>" +
              "<h3>This X</h3>" +
              card("Name", "", "X") + card("Edition", "", "Beta V1") + card("Version", "", "Beta V1") +
              card("Build", "", BETA) + card("Signed in as", "", esc(who())) +
              card("Display", "", window.innerWidth + " &times; " + window.innerHeight) +
              "<h3>Release status</h3>" + card(BETA, "Thanks for testing! Report anything that looks broken.", "Beta V1");
          }
        };
        function goto(k) {
          Object.keys(btns).forEach(function (x) { btns[x].classList.toggle("on", x === k || (k === "customize" && x === "profile")); });
          main.innerHTML = render[k](); main.scrollTop = 0;
          if (k === "profile") main.querySelector(".pf-cust").onclick = function () { goto("customize"); };
          if (k === "customize") { bindEditor(main, true); main.querySelector(".pf-back").onclick = function () { goto("profile"); }; }
          if (k === "personal") bindWalls(main, function () { goto("personal"); });
        }
        paintAv();
        w.goto = goto;
        goto(typeof page === "string" && render[page] ? page : "system");
      }
    });
  }

  function applyTheme() {
    os.setAttribute("data-wall", S.wall);
    var wl = os.querySelector(".wall"); if (wl) wl.style.backgroundImage = (S.wall === "custom" && S.wallImg) ? "url(" + S.wallImg + ")" : "";
  }

  /* ---------- boot ---------- */
  var booted = false;
  window.bootOS = function (name) {
    if (booted) return; booted = true;
    user = name || "User";
    paintAv();
    applyTheme(); buildTaskbar(); buildStart(); buildIcons(); buildWidgets(); tick(); setInterval(tick, 10000);
    os.classList.add("on");
    requestAnimationFrame(function () { requestAnimationFrame(function () { os.classList.add("show"); }); });
    document.documentElement.classList.add("os-on");
  };
  window.addEventListener("resize", function () { /* windows stay where they are; mobile CSS handles small screens */ });
})();
