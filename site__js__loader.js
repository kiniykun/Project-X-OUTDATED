  // List the code files to load. Add your real files here later (scripts, data, etc.).
  // Each entry is loaded for real and the bar moves as each one finishes.
  const FILES = [
    // { name: "game.js", url: "game.js" },
    // { name: "levels.json", url: "levels.json" },
  ];

  // ---------- saved progress ----------
  const SAVE_KEY = "x_save_v1";
  const S = { fast: false, grain: true, crumble: true, redeemed: false, profiles: [], cursorUnlocked: false, cursors: [], cursorId: null, curRotate: true, curSize: 44 };
  try { Object.assign(S, JSON.parse(localStorage.getItem(SAVE_KEY) || "{}")); } catch (e) {}
  if (!Array.isArray(S.profiles)) S.profiles = [];
  if (!Array.isArray(S.cursors)) S.cursors = [];
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }

  const loading = document.getElementById("loading");
  const home = document.getElementById("home");
  const bar = document.getElementById("bar");
  const percent = document.getElementById("percent");
  const fileName = document.getElementById("fileName");
  let ready = false;

  function setProgress(done, total, name) {
    const p = total === 0 ? 100 : Math.round((done / total) * 100);
    bar.style.width = p + "%";
    percent.textContent = p + "%";
    if (name) fileName.textContent = "Loading " + name;
  }

  function loadFile(file) {
    return new Promise((resolve) => {
      const isScript = file.url.endsWith(".js");
      if (isScript) {
        const s = document.createElement("script");
        s.src = file.url;
        s.onload = s.onerror = () => resolve();
        document.body.appendChild(s);
      } else {
        fetch(file.url).then(() => resolve(), () => resolve());
      }
    });
  }

  // Things that really have to be ready before the menu can show
  let flatURL = null, flatImg = null, flatCanvas = null;
  const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
  const decodeImg = (img) => withTimeout(
    img.decode ? img.decode().catch(() => {}) : new Promise((r) => { img.complete ? r() : (img.onload = r); }), 8000);

  // Flatten the red 2011X look into one plain picture. The crumble effect copies the
  // menu into many pieces, and many live filtered copies would crash a phone.
  function buildFlat(img) {
    return new Promise((resolve) => {
      try {
        const w = 520, h = Math.round(w * img.naturalHeight / img.naturalWidth);
        const cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        const cx = cv.getContext("2d");
        cx.drawImage(img, 0, 0, w, h);
        const im = cx.getImageData(0, 0, w, h), d = im.data;
        const cl = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
        const a = -42 * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
        const H = [
          0.213 + co * 0.787 - si * 0.213, 0.715 - co * 0.715 - si * 0.715, 0.072 - co * 0.072 + si * 0.928,
          0.213 - co * 0.213 + si * 0.143, 0.715 + co * 0.285 + si * 0.140, 0.072 - co * 0.072 - si * 0.283,
          0.213 - co * 0.213 - si * 0.787, 0.715 - co * 0.715 + si * 0.715, 0.072 + co * 0.928 + si * 0.072];
        const k = 5;
        const S = [
          0.213 + 0.787 * k, 0.715 - 0.715 * k, 0.072 - 0.072 * k,
          0.213 - 0.213 * k, 0.715 + 0.285 * k, 0.072 - 0.072 * k,
          0.213 - 0.213 * k, 0.715 - 0.715 * k, 0.072 + 0.928 * k];
        for (let y = 0; y < h; y++) {
          const v = y / h;
          const mv = Math.min(1, v / 0.10) * (1 - cl((v - 0.62) / 0.38));
          for (let x = 0; x < w; x++) {
            const o = (y * w + x) * 4;
            const L = (0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2]) / 255;
            const c = cl((L - 0.5) * 1.15 + 0.5);
            const r1 = cl(1.351 * c), g1 = cl(1.203 * c), b1 = cl(0.937 * c);
            const r2 = cl(H[0] * r1 + H[1] * g1 + H[2] * b1);
            const g2 = cl(H[3] * r1 + H[4] * g1 + H[5] * b1);
            const b2 = cl(H[6] * r1 + H[7] * g1 + H[8] * b1);
            const r3 = cl(S[0] * r2 + S[1] * g2 + S[2] * b2);
            const g3 = cl(S[3] * r2 + S[4] * g2 + S[5] * b2);
            const b3 = cl(S[6] * r2 + S[7] * g2 + S[8] * b2);
            d[o] = r3 * 0.75 * 255; d[o + 1] = g3 * 0.75 * 255; d[o + 2] = b3 * 0.75 * 255;
            d[o + 3] = d[o + 3] * cl(x / w / 0.38) * mv * 0.9;
          }
        }
        cx.putImageData(im, 0, 0);
        flatCanvas = cv;
        resolve();
      } catch (e) { resolve(); }
    });
  }

  // If the flat picture couldn't be made, still let him crumble: one shared copy of the
  // original, with a cheap red tint.
  let rawURL = null;
  function buildRaw(img) {
    return fetch(img.src).then((r) => r.blob()).then((b) => { rawURL = URL.createObjectURL(b); }).catch(() => {});
  }

  const ASSETS = [
    { name: "unifrakturcook.ttf", run: () => withTimeout(document.fonts.load('700 64px UnifrakturCook'), 5000) },
    { name: "grenzegotisch.ttf",  run: () => withTimeout(document.fonts.load('600 24px "Grenze Gotisch"'), 5000) },
    { name: "2011x.webp",   run: () => decodeImg(document.querySelector("#home .hero")) },
    { name: "cream.jpg",    run: () => decodeImg(document.querySelector("#profiles .cream img")) },
    { name: "pieces.png",   run: () => buildFlat(document.querySelector("#home .hero")) },
    { name: "hands.webp",   run: () => decodeImg(document.querySelector("#hands img")) },
  ];

  async function startLoading() {
    const started = performance.now();
    const all = [
      ...ASSETS,
      ...FILES.map((f) => ({ name: f.name, run: () => loadFile(f) })),
    ];
    for (let i = 0; i < all.length; i++) {
      setProgress(i, all.length, all[i].name);
      await all[i].run();
    }
    setProgress(all.length, all.length, "done");
    const left = 1200 - (performance.now() - started);   // never flash past instantly
    if (left > 0) await new Promise((r) => setTimeout(r, left));
    await new Promise((r) => setTimeout(r, 300));
    ready = true;
    loading.classList.add("ready");
  }

  let leaving = false;

  // Break a screen into pieces that fall away, right edge first
  // Is the crumble effect on? (Settings toggle + the phone's reduced-motion setting)
  const fx = () => S.crumble && !matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Breaks any screen into pieces that fall away, right edge first.
  // keep = selector of one overlay inside the screen: only that part falls (the rest stays put).
  function crumble(el, keep) {
    try {
      const W = innerWidth, H = innerHeight;
      const size = Math.max(W, H) / (el === settings ? 6 : 5);
      const cols = Math.ceil(W / size), rows = Math.ceil(H / size);
      const layer = document.createElement("div");
      layer.style.cssText = "position:fixed;inset:0;z-index:30;pointer-events:none;overflow:hidden";

      // One copy first, then copy that, so any big picture is only duplicated once
      const base = el.cloneNode(true);
      base.querySelectorAll(".hero, .exe, canvas").forEach((n) => n.remove());
      const msg = base.querySelector("#clickMsg");
      if (msg) msg.style.animation = "none";
      if (keep) [...base.children].forEach((c) => { if (!c.matches(keep)) c.style.display = "none"; });
      const bg = keep ? "transparent" : "var(--bg)";

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const tile = document.createElement("div");
          tile.style.cssText = `position:absolute;left:${c*size}px;top:${r*size}px;width:${size+1}px;height:${size+1}px;overflow:hidden;background:${bg};will-change:transform,opacity`;
          const copy = base.cloneNode(true);
          copy.style.cssText = `position:absolute;inset:auto;left:${-c*size}px;top:${-r*size}px;width:${W}px;height:${H}px;z-index:auto${keep ? ";background:transparent" : ""}`;
          tile.appendChild(copy);
          layer.appendChild(tile);

          const dx = (Math.random() - 0.5) * 90;
          const dy = H * (0.35 + Math.random() * 0.5);
          const rot = (Math.random() - 0.5) * 70;
          const delay = (cols - 1 - c) * 80 + Math.random() * 140 + r * 12;
          tile.animate([
            { transform: "none", opacity: 1, offset: 0 },
            { transform: `translate(${dx * 0.1}px, ${dy * 0.03}px) rotate(${rot * 0.15}deg)`, opacity: 1, offset: 0.22 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0, offset: 1 }
          ], { duration: 1100, delay, easing: "ease-in", fill: "both" });
        }
      }
      document.body.appendChild(layer);
      setTimeout(() => layer.remove(), 1100 + (cols * 80) + 400);
    } catch (e) { /* if the effect fails, just switch screens */ }
  }

  // The home screen is painted once into a plain picture (background, 2011x, menu text)
  // and that picture is cut into pieces. No live copies of the page, so it stays smooth
  // on phones and 2011x is always part of it.
  function crumbleHome() {
    try {
      const W = innerWidth, H = innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const snap = document.createElement("canvas");
      snap.width = Math.round(W * dpr); snap.height = Math.round(H * dpr);
      const g = snap.getContext("2d");
      g.scale(dpr, dpr);
      g.fillStyle = "#120a0a"; g.fillRect(0, 0, W, H);

      const hero = home.querySelector(".hero");
      const r = hero.getBoundingClientRect();
      const edgeMask = (o, w, h) => {
        o.globalCompositeOperation = "destination-in";
        let m = o.createLinearGradient(0, 0, w, 0);
        m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(.38, "rgba(0,0,0,1)");
        o.fillStyle = m; o.fillRect(0, 0, w, h);
        m = o.createLinearGradient(0, 0, 0, h);
        m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(.1, "rgba(0,0,0,1)"); m.addColorStop(.62, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0)");
        o.fillStyle = m; o.fillRect(0, 0, w, h);
        o.globalCompositeOperation = "source-over";
      };
      try {
        g.globalCompositeOperation = "screen";            // same blend he has on the home screen
        if (flatCanvas) {
          g.drawImage(flatCanvas, r.left, r.top, r.width, r.height);   // same look as the live one
        } else {
          const oc = document.createElement("canvas");
          oc.width = Math.max(1, Math.round(r.width * dpr)); oc.height = Math.max(1, Math.round(r.height * dpr));
          const o = oc.getContext("2d");
          if ("filter" in o) {
            o.filter = "grayscale(1) contrast(1.15) sepia(1) hue-rotate(-42deg) saturate(5) brightness(0.75)";
            o.drawImage(hero, 0, 0, oc.width, oc.height);
            o.filter = "none";
          } else {
            o.drawImage(hero, 0, 0, oc.width, oc.height);
            o.globalCompositeOperation = "saturation"; o.fillStyle = "#808080"; o.fillRect(0, 0, oc.width, oc.height);
            o.globalCompositeOperation = "multiply";   o.fillStyle = "rgb(240,92,78)"; o.fillRect(0, 0, oc.width, oc.height);
            o.globalCompositeOperation = "source-over";
          }
          edgeMask(o, oc.width, oc.height);
          g.globalAlpha = 0.9; g.drawImage(oc, r.left, r.top, r.width, r.height); g.globalAlpha = 1;
        }
        g.globalCompositeOperation = "source-over";
      } catch (e) {
        g.globalCompositeOperation = "source-over";
        g.globalAlpha = 0.6; g.drawImage(hero, r.left, r.top, r.width, r.height); g.globalAlpha = 1;
      }

      // the dark overlay that sits over him on the home screen
      let lg = g.createLinearGradient(0, 0, W, 0);
      lg.addColorStop(0, "rgba(18,10,10,1)"); lg.addColorStop(.35, "rgba(18,10,10,.75)"); lg.addColorStop(.7, "rgba(18,10,10,0)");
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
      const rg = g.createRadialGradient(W * .75, H * .4, 0, W * .75, H * .4, Math.max(W, H) * .75);
      rg.addColorStop(.3, "rgba(18,10,10,0)"); rg.addColorStop(1, "rgba(18,10,10,.7)");
      g.fillStyle = rg; g.fillRect(0, 0, W, H);

      // menu
      [...document.querySelectorAll("#menu button")].forEach((b, n) => {
        const br = b.getBoundingClientRect(), cs = getComputedStyle(b);
        g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        if ("letterSpacing" in g) g.letterSpacing = cs.letterSpacing;
        g.textBaseline = "middle";
        const on = b.classList.contains("sel");
        g.fillStyle = on ? "#e8d8d8" : "#7d6a6a";
        if (on) { g.shadowColor = "rgba(176,32,32,.45)"; g.shadowBlur = 14; }
        g.fillText(b.textContent, br.left + 34, br.top + br.height / 2);
        g.shadowBlur = 0;
        if (on) { g.fillStyle = "#8c1a1a"; g.fillRect(br.left, br.top + br.height / 2 - 1, 22, 2); }
      });
      const v = home.querySelector(".version"), vr = v.getBoundingClientRect(), vs = getComputedStyle(v);
      g.font = `${vs.fontWeight} ${vs.fontSize} ${vs.fontFamily}`; g.fillStyle = "rgba(217,207,207,.85)"; g.textBaseline = "middle";
      g.fillText(v.textContent, vr.left, vr.top + vr.height / 2);

      const size = Math.max(W, H) / 4;
      const cols = Math.ceil(W / size), rows = Math.ceil(H / size);
      const layer = document.createElement("div");
      layer.style.cssText = "position:fixed;inset:0;z-index:5;pointer-events:none;overflow:hidden";
      for (let c = 0; c < cols; c++) {
        for (let rr = 0; rr < rows; rr++) {
          const px = Math.round(size * dpr);
          const tile = document.createElement("canvas");
          tile.width = px; tile.height = px;
          tile.getContext("2d").drawImage(snap, Math.round(c * size * dpr), Math.round(rr * size * dpr), px, px, 0, 0, px, px);
          tile.style.cssText = `position:absolute;left:${c * size}px;top:${rr * size}px;width:${size}px;height:${size}px;will-change:transform,opacity`;
          layer.appendChild(tile);
          const dx = (Math.random() - 0.5) * 90;
          const dy = H * (0.35 + Math.random() * 0.5);
          const rot = (Math.random() - 0.5) * 70;
          const delay = (cols - 1 - c) * 90 + Math.random() * 140 + rr * 14;
          tile.animate([
            { transform: "none", opacity: 1, offset: 0 },
            { transform: `translate(${dx * 0.1}px, ${dy * 0.03}px) rotate(${rot * 0.15}deg)`, opacity: 1, offset: 0.22 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0, offset: 1 }
          ], { duration: 1200, delay, easing: "ease-in", fill: "both" });
        }
      }
      document.body.appendChild(layer);
      setTimeout(() => layer.remove(), 1200 + cols * 90 + 500);
    } catch (e) { /* just switch screens */ }
  }

  function goHome() {
    if (leaving) return;
    leaving = true;
    const calm = !fx();
    if (!calm) {
      crumble(loading);
      home.classList.add("enter");
      setTimeout(() => home.classList.remove("enter"), 950);
    }
    home.classList.add("active");
    loading.classList.remove("active");
  }

  // Pressing Enter: the main menu crumbles away
  let entered = false;
  function enterMenu() {
    if (entered) return;
    entered = true;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches || !S.crumble;
    profiles.classList.add("active");
    pSelect(1, true);
    if (!calm) crumbleHome();
    home.classList.remove("active");
    setTimeout(() => { profilesReady = true; }, 1100);
  }

  // ---------- profile select ----------
  const profiles = document.getElementById("profiles");
  const hands = document.getElementById("hands");
  const row = document.getElementById("row");
  let pItems = [];
  let pSel = 1, profilesReady = false, chosen = false, active = null;
  const COLORS = ["#8c1a1a", "#3d5a80", "#2f6b4a", "#9a6a22", "#6a3f86", "#555a62"];

  if (S.creamUnlocked) row.querySelector(".cream").classList.remove("gone");
  function refreshItems() { pItems = [...row.querySelectorAll(".item:not(.gone)")]; }
  function renderCustom() {
    row.querySelectorAll(".item.custom").forEach((n) => n.remove());
    S.profiles.forEach((p) => {
      const d = document.createElement("div");
      d.className = "item custom"; d.dataset.id = p.id;
      const av = document.createElement("div"); av.className = "av";
      const clip = document.createElement("div"); clip.className = "clip";
      if (p.photo) {
        const im = document.createElement("img"); im.alt = ""; im.src = p.photo; im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
        clip.appendChild(im);
      } else {
        clip.style.background = `radial-gradient(circle at 35% 30%, ${p.color}, #140c0c 130%)`;
        const sp = document.createElement("span"); sp.textContent = (p.name[0] || "?").toUpperCase();
        clip.appendChild(sp);
      }
      av.appendChild(clip);
      const nm = document.createElement("div"); nm.className = "nm"; nm.textContent = p.name;
      d.append(av, nm); row.appendChild(d);
    });
    refreshItems();
  }
  renderCustom();

  function centerRow(snap) {
    const el = pItems[pSel];
    if (!el) return;
    if (snap) row.classList.add("snap");
    row.style.transform = `translateX(${-(el.offsetLeft + el.offsetWidth / 2) + row.parentElement.clientWidth / 2}px)`;
    if (snap) { row.offsetWidth; row.classList.remove("snap"); }
  }
  function pSelect(i, snap) {
    pSel = Math.max(0, Math.min(pItems.length - 1, i));
    pItems.forEach((el, n) => el.classList.toggle("sel", n === pSel));
    centerRow(snap);
  }
  addEventListener("resize", () => centerRow(true));

  function choose() {
    if (chosen) return;
    const el = pItems[pSel], id = el.dataset.id;
    if (id === "add") { if (S.redeemed) showCreate(); else showDenied(); return; }
    chosen = true;
    active = id === "cream" ? { name: "Cream", pw: "idkedmond" } : S.profiles.find((p) => p.id === id);
    profiles.classList.add("chosen");
    if (id !== "cream") { setTimeout(lockIn, 700); return; }
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) { hands.style.opacity = 0.45; setTimeout(() => { hands.style.opacity = 0; setTimeout(lockIn, 600); }, 500); return; }
    setTimeout(flicker, 900);
  }
  // he fades in, holds for a moment, flickers once and is gone
  function flicker() {
    if (!chosen) return;
    const a = hands.animate([
      { opacity: 0, transform: "scale(1.07)", offset: 0 },
      { opacity: 1, transform: "scale(1)", offset: 0.26 },
      { opacity: 1, offset: 0.5 },
      { opacity: 0.15, offset: 0.58 },
      { opacity: 0.95, offset: 0.66 },
      { opacity: 0.3, offset: 0.74 },
      { opacity: 1, offset: 0.82 },
      { opacity: 0, offset: 0.9 },
      { opacity: 0, offset: 1 }
    ], { duration: 1000, easing: "ease-out", fill: "none" });
    a.onfinish = () => setTimeout(lockIn, 120);
  }

  // The chosen profile slides to the side and the password box comes up
  const pw = document.getElementById("pw");
  const pwMsg = document.getElementById("pwMsg");
  const whoEl = document.querySelector("#profiles .login .who");
  let locked = false, solved = false;
  function lockIn() {
    if (locked || !chosen) return;
    locked = true;
    const el = pItems[pSel];
    whoEl.textContent = active.name;
    const avW = el.querySelector(".av").offsetWidth;
    const target = 30 + avW * 0.3;                       // centre of the small avatar
    row.style.transform = `translateX(${target - (el.offsetLeft + el.offsetWidth / 2)}px)`;
    profiles.classList.add("locked");
    if (matchMedia("(hover: hover)").matches) setTimeout(() => pw.focus(), 900);
  }
  function tryPassword() {
    if (solved || !active) return;
    if (pw.value === active.pw) {
      solved = true;
      pw.blur();
      profiles.classList.add("solved");
      pwMsg.textContent = "";
      startStory(active.name);
    } else {
      pwMsg.textContent = "That password is wrong";
      profiles.classList.remove("wrong"); void profiles.offsetWidth;
      profiles.classList.add("wrong");
      pw.value = "";
    }
  }
  document.getElementById("pwGo").addEventListener("click", tryPassword);
  pw.addEventListener("keydown", (e) => { if (e.key === "Enter") tryPassword(); });
  pw.addEventListener("input", () => { if (!solved) { pwMsg.textContent = ""; profiles.classList.remove("wrong"); } });

  // permission error (until the code is redeemed)
  const deniedEl = document.getElementById("denied");
  let denied = false;
  function showDenied() { denied = true; profiles.classList.add("denied-on"); }
  function hideDenied(quiet) {
    if (quiet !== true && denied && fx()) crumble(profiles, ".denied");
    denied = false; profiles.classList.remove("denied-on");
  }
  deniedEl.addEventListener("click", () => hideDenied());

  // create a profile (after the code is redeemed)
  const cName = document.getElementById("cName"), cPw = document.getElementById("cPw"), cMsg = document.getElementById("cMsg"), cColors = document.getElementById("cColors");
  let creating = false, cColor = COLORS[0];
  let editId = null;
  COLORS.forEach((c, n) => {
    const b = document.createElement("button");
    b.type = "button"; b.style.background = c; b.setAttribute("aria-label", "Colour " + (n + 1));
    if (n === 0) b.classList.add("on");
    b.addEventListener("click", () => { cColor = c; [...cColors.children].forEach((x) => x.classList.toggle("on", x === b)); if (typeof paintPreview === "function") paintPreview(); });
    cColors.appendChild(b);
  });
  const cFile = document.getElementById("cFile"), cPrev = document.getElementById("cPrev"), cPrevL = document.getElementById("cPrevL"), cRm = document.getElementById("cRm");
  let cPhoto = null;
  function paintPreview() {
    cPrev.querySelectorAll("img").forEach((n) => n.remove());
    cPrev.style.background = cColor;
    cPrevL.textContent = (cName.value.trim()[0] || "?").toUpperCase();
    cPrevL.style.display = cPhoto ? "none" : "";
    if (cPhoto) { const im = document.createElement("img"); im.alt = ""; im.src = cPhoto; cPrev.appendChild(im); }
    cRm.hidden = !cPhoto;
  }
  document.getElementById("cUp").addEventListener("click", () => cFile.click());
  cRm.addEventListener("click", () => { cPhoto = null; cFile.value = ""; paintPreview(); });
  cName.addEventListener("input", paintPreview);
  cFile.addEventListener("change", () => {
    const f = cFile.files && cFile.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => {
      try {
        const N = 256, cv = document.createElement("canvas"); cv.width = cv.height = N;
        const w = im.naturalWidth, h = im.naturalHeight, side = Math.min(w, h);
        cv.getContext("2d").drawImage(im, (w - side) / 2, (h - side) / 2, side, side, 0, 0, N, N);   // square crop from the middle
        cPhoto = cv.toDataURL("image/jpeg", 0.86);
        cMsg.textContent = "";
      } catch (e) { cMsg.textContent = "Couldn't use that picture."; }
      URL.revokeObjectURL(url); paintPreview();
    };
    im.onerror = () => { URL.revokeObjectURL(url); cMsg.textContent = "That file isn't a picture."; };
    im.src = url;
  });
  function setMode(edit, id) {
    editId = edit ? id : null;
    profiles.classList.toggle("edit-on", !!edit); profiles.classList.toggle("edit-cream", !!edit && id === "cream");
    document.querySelector("#create h2").textContent = edit ? "Customize profile" : "New profile";
    document.querySelector("#create .sub").textContent = edit ? "Change the name and picture shown on the user screen." : "Pick a name, a colour and a password.";
    document.getElementById("cGo").textContent = edit ? "Save" : "Create";
  }
  function showCreate() { setMode(false); creating = true; cName.value = ""; cPw.value = ""; cMsg.textContent = ""; cPhoto = null; cFile.value = ""; paintPreview(); profiles.classList.add("create-on"); }
  function hideCreate(quiet) {
    if (quiet !== true && creating && fx()) crumble(profiles, ".create");
    creating = false; profiles.classList.remove("create-on"); cName.blur(); cPw.blur(); setMode(false);
  }
  function makeProfile() {
    if (editId) { saveEdit(); return; }
    const name = cName.value.trim(), pass = cPw.value;
    if (!name) { cMsg.textContent = "Pick a name first."; return; }
    if (S.profiles.some((p) => p.name.toLowerCase() === name.toLowerCase()) || name.toLowerCase() === "cream") { cMsg.textContent = "That name is taken."; return; }
    if (pass.length < 4) { cMsg.textContent = "Password needs at least 4 characters."; return; }
    const p = { id: "p" + Date.now().toString(36), name, color: cColor, pw: pass, photo: cPhoto };
    S.profiles.push(p); save();
    renderCustom();
    hideCreate();
    pSelect(pItems.findIndex((el) => el.dataset.id === p.id));
  }
  // customize the profile you just clicked (needs its password)
  const creamImg = document.querySelector("#row .cream img");
  const creamOrig = creamImg ? creamImg.src : "";
  function applyCream() {
    const c = S.cream || {};
    const nm = document.querySelector("#row .cream .nm"); if (nm) nm.textContent = c.name || "Cream";
    if (creamImg) creamImg.src = c.photo || creamOrig;
  }
  applyCream();
  function relock() {
    if (!locked) return;
    const el = pItems[pSel]; if (!el) return;
    const avW = el.querySelector(".av").offsetWidth;
    row.style.transform = `translateX(${30 + avW * 0.3 - (el.offsetLeft + el.offsetWidth / 2)}px)`;
  }
  function showEdit() {
    const id = pItems[pSel].dataset.id, p = id === "cream" ? (S.cream || {}) : S.profiles.find((x) => x.id === id);
    if (!p) return;
    setMode(true, id);
    creating = true; cMsg.textContent = ""; cFile.value = ""; cPw.value = "";
    cName.value = p.name || (id === "cream" ? "Cream" : "");
    if (id !== "cream") cColor = p.color;
    [...cColors.children].forEach((x, i) => x.classList.toggle("on", COLORS[i] === cColor));
    cPhoto = p.photo || (id === "cream" ? creamOrig : null); paintPreview();
    profiles.classList.add("create-on");
  }
  function saveEdit() {
    const id = editId, name = cName.value.trim();
    if (!name) { cMsg.textContent = "Pick a name first."; return; }
    const clash = (n) => n.toLowerCase() === name.toLowerCase();
    if (S.profiles.some((p) => p.id !== id && clash(p.name)) || (id !== "cream" && clash("Cream")) || (id === "cream" && S.profiles.some((p) => clash(p.name)))) { cMsg.textContent = "That name is taken."; return; }
    if (id === "cream") { S.cream = { name: name === "Cream" ? "" : name, photo: cPhoto === creamOrig ? null : cPhoto }; applyCream(); active.name = name; }
    else { const p = S.profiles.find((x) => x.id === id); p.name = name; p.color = cColor; p.photo = cPhoto; active = p; renderCustom(); }
    save();
    pItems.forEach((el, n) => el.classList.toggle("sel", n === pSel));
    whoEl.textContent = name;
    hideCreate(true);
    relock();
  }
  document.getElementById("lczBtn").addEventListener("click", () => {
    if (!locked || solved || !active || creating) return;
    if (pw.value !== active.pw) {
      pwMsg.textContent = pw.value ? "That password is wrong" : "Enter your password, then press Customize";
      profiles.classList.remove("wrong"); void profiles.offsetWidth; profiles.classList.add("wrong");
      return;
    }
    showEdit();
  });
  document.getElementById("cGo").addEventListener("click", makeProfile);
  document.getElementById("cCancel").addEventListener("click", () => hideCreate());
  [cName, cPw].forEach((i) => i.addEventListener("keydown", (e) => { if (e.key === "Enter") makeProfile(); }));
  [cName, cPw].forEach((i) => i.addEventListener("input", () => { cMsg.textContent = ""; }));

  // back to the main menu from the profile screen
  function resetProfiles() {
    hideDenied(true); hideCreate(true);
    hands.getAnimations().forEach((a) => a.cancel());
    hands.style.opacity = 0;
    profiles.classList.remove("chosen", "locked", "solved", "wrong");
    chosen = false; locked = false; solved = false; active = null;
    pw.value = ""; pwMsg.textContent = "";
    pSelect(1, true);
  }
  document.getElementById("pback").addEventListener("click", () => {
    if (fx()) crumble(profiles);
    resetProfiles();
    profilesReady = false; entered = false;
    profiles.classList.remove("active");
    home.classList.add("active");
  });

  row.addEventListener("click", (e) => {
    const el = e.target.closest(".item");
    if (!el || !profilesReady || chosen || denied || creating) return;
    pSelect(pItems.indexOf(el));
    choose();
  });
  let tx = null;
  profiles.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  profiles.addEventListener("touchend", (e) => {
    if (tx === null || !profilesReady || chosen || denied || creating) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 40) pSelect(pSel + (dx < 0 ? 1 : -1));
  }, { passive: true });
  document.addEventListener("keydown", (e) => {
    if (!profilesReady || chosen || !profiles.classList.contains("active")) return;
    if (denied) { if (["Enter", " ", "Escape"].includes(e.key)) hideDenied(); return; }
    if (creating) { if (e.key === "Escape") hideCreate(); return; }
    if (e.key === "ArrowRight") pSelect(pSel + 1);
    if (e.key === "ArrowLeft") pSelect(pSel - 1);
    if (e.key === "Enter" || e.key === " ") choose();
  });


  // ---------- after the password: black, dialogue, then the eyes ----------
  const story = document.getElementById("story"), sayEl = document.getElementById("say");
  const eyesEl = document.getElementById("eyes"), eyeL = document.getElementById("eyeL"), eyeR = document.getElementById("eyeR");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // writes text letter by letter, a bit uneven like handwriting. parts = [{t, cls}]
  async function writeLine(el, parts, speed) {
    el.textContent = "";
    const chars = [];
    parts.forEach((p) => [...p.t].forEach((c) => {
      const sp = document.createElement("span");
      sp.className = "ch" + (p.cls ? " " + p.cls : "");
      sp.textContent = c;
      sp.style.setProperty("--r", (Math.random() * 3 - 1.5).toFixed(2) + "deg");
      sp.style.setProperty("--y", (Math.random() * 2.4 - 1.2).toFixed(2) + "px");
      el.appendChild(sp); chars.push({ sp, big: !!p.cls });
    }));
    for (const c of chars) {
      c.sp.classList.add("in");
      await wait(c.big ? speed * 2.4 : (c.sp.textContent === " " ? speed * 0.5 : speed + Math.random() * 40));
    }
  }

  let eyesOn = false, ex = [0, 0], ey = [0, 0];
  function trackEyes(t) {
    if (!eyesOn) return;
    [eyeL, eyeR].forEach((eye, i) => {
      const r = eye.getBoundingClientRect();
      const cx = r.left + r.width / 2 - ex[i], cy = r.top + r.height / 2 - ey[i];     // where the eye rests (without its own movement)
      let tx, ty;
      if (havePointer) {
        const dx = px - cx, dy = py - cy, dist = Math.hypot(dx, dy) || 1;
        const reach = Math.tanh(dist / 220) * r.width * 0.55;                         // looks further the further the cursor is
        tx = dx / dist * reach; ty = dy / dist * reach;
      } else {                                                                         // nobody has moved yet: slow drift
        tx = Math.sin(t / 1700 + i * 1.7) * r.width * 0.12; ty = Math.cos(t / 2100 + i) * r.width * 0.08;
      }
      ex[i] += (tx - ex[i]) * 0.14; ey[i] += (ty - ey[i]) * 0.14;
      eye.style.transform = `translate3d(${ex[i].toFixed(2)}px, ${ey[i].toFixed(2)}px, 0)`;
    });
    requestAnimationFrame(trackEyes);
  }
  function scheduleBlink() {
    return; // blinking disabled
    if (!eyesOn) return;
    setTimeout(() => {
      if (!eyesOn) return;
      eyeL.classList.add("blink"); setTimeout(() => eyeR.classList.add("blink"), 35);
      setTimeout(() => { eyeL.classList.remove("blink"); eyeR.classList.remove("blink"); }, 300);
      scheduleBlink();
    }, 2600 + Math.random() * 4200);
  }

  let storyStarted = false;
  async function startStory(name) {
    if (storyStarted) return;
    storyStarted = true;
    await wait(450);
    story.classList.add("on");                      // everything goes black
    await wait(1300);
    await writeLine(document.getElementById("l1"), [{ t: "Welcome to " }, { t: "X", cls: "gx" }], 95);
    await wait(650);
    await writeLine(document.getElementById("l2"), [{ t: name }], 110);
    await wait(2000);
    sayEl.classList.add("gone");                    // the words fade away
    await wait(1400);
    eyesEl.classList.add("on");                     // then the eyes open in the dark
    eyeL.classList.add("flick"); setTimeout(() => eyeR.classList.add("flick"), 90);
    eyesOn = true; requestAnimationFrame(trackEyes);
    await wait(3200);                               // the eyes stay as the desktop wallpaper
    if (window.bootOS) window.bootOS(name);
  }

  // ---------- settings ----------
  const settings = document.getElementById("settings");
  const grainEl = document.querySelector(".grain");
  function ensureGothic() {
    if (document.getElementById("gothlink")) return;
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.id = "gothlink";
    l.href = "https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@400;600&family=Architects+Daughter&display=swap";
    document.head.appendChild(l);
  }
  function applySettings() {
    document.documentElement.classList.toggle("fast", !!S.fast);
    if (!S.fast) ensureGothic();
    grainEl.style.display = S.grain ? "" : "none";
    settings.querySelectorAll("[data-key]").forEach((b) => b.setAttribute("aria-checked", S[b.dataset.key] ? "true" : "false"));
  }
  settings.querySelectorAll("[data-key]").forEach((b) => b.addEventListener("click", () => {
    S[b.dataset.key] = !S[b.dataset.key]; save(); applySettings();
  }));
  applySettings();

  let inSettings = false;
  function openSettings() { inSettings = true; settings.classList.add("active"); if (fx()) crumbleHome(); home.classList.remove("active"); settings.querySelector(".set-list").scrollTop = 0; }
  function closeSettings() { closeCode(true); if (fx()) crumble(settings); inSettings = false; settings.classList.remove("active"); home.classList.add("active"); }
  document.getElementById("setBack").addEventListener("click", closeSettings);

  // ---------- cursors ----------
  const curReveal = document.getElementById("curReveal"), curBox = document.getElementById("curBox"), curFile = document.getElementById("curFile");
  const curMsg = document.getElementById("curMsg"), curCount = document.getElementById("curCount");
  const curSize = document.getElementById("curSize"), curSizeV = document.getElementById("curSizeV");
  const cursorEl = document.getElementById("cursor"), cursorImg = cursorEl.querySelector("img");
  const MAX_CURSORS = 24;
  const seenTiles = new Set();
  let curShown = false;

  const NONE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 3l14 8-6 1.6L10 19z"/></svg>';
  function tile(cls, html) { const t = document.createElement("div"); t.className = "cur-tile " + cls; t.setAttribute("role", "button"); t.tabIndex = 0; t.innerHTML = html; return t; }
  function renderCursors() {
    curBox.innerHTML = "";
    let n = 0;
    const mark = (t, key) => { if (!seenTiles.has(key)) { seenTiles.add(key); t.classList.add("new"); t.style.setProperty("--d", Math.min(n, 14) * 0.04 + "s"); } n++; };
    const add = tile("add", "+<small>Upload</small>");
    add.addEventListener("click", () => curFile.click());
    mark(add, "add"); curBox.appendChild(add);
    const none = tile("none" + (S.cursorId ? "" : " sel"), NONE_SVG + "<small>Default</small>");
    none.addEventListener("click", () => { S.cursorId = null; save(); renderCursors(); applyCursor(); });
    mark(none, "none"); curBox.appendChild(none);
    S.cursors.forEach((c) => {
      const t = tile("" + (S.cursorId === c.id ? "sel" : ""), '<img alt="">');
      t.querySelector("img").src = c.src;
      const x = document.createElement("span"); x.className = "x"; x.textContent = "×"; t.appendChild(x);
      x.addEventListener("click", (e) => {
        e.stopPropagation();
        t.classList.add("out");
        setTimeout(() => {
          S.cursors = S.cursors.filter((k) => k.id !== c.id);
          if (S.cursorId === c.id) S.cursorId = null;
          save(); renderCursors(); applyCursor();
        }, 260);
      });
      t.addEventListener("click", () => { S.cursorId = c.id; save(); renderCursors(); applyCursor(); });
      mark(t, c.id); curBox.appendChild(t);
    });
    curCount.textContent = S.cursors.length + " / " + MAX_CURSORS;
  }

  function applyCursor() {
    const c = S.cursors.find((k) => k.id === S.cursorId);
    document.documentElement.classList.toggle("has-cursor", !!c);
    if (c) { cursorImg.src = c.src; cursorEl.style.setProperty("--cs", S.curSize + "px"); }
    else cursorEl.classList.remove("show");
    curSize.value = S.curSize; curSizeV.textContent = S.curSize;
  }
  function showCursorGroup(on, animate) {
    curReveal.classList.toggle("on", on);
    curReveal.setAttribute("aria-hidden", on ? "false" : "true");
    if (on) { renderCursors(); applyCursor(); }
  }
  curSize.addEventListener("input", () => { S.curSize = +curSize.value; curSizeV.textContent = S.curSize; cursorEl.style.setProperty("--cs", S.curSize + "px"); });
  curSize.addEventListener("change", save);

  // upload: shrink to fit 128px, keep transparency, save as PNG
  function shrink(file, max) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        try {
          const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
          const w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
          const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
          cv.getContext("2d").drawImage(im, 0, 0, w, h);
          resolve(cv.toDataURL("image/png"));
        } catch (e) { reject(e); }
        URL.revokeObjectURL(url);
      };
      im.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad")); };
      im.src = url;
    });
  }
  curFile.addEventListener("change", async () => {
    const files = [...curFile.files]; curFile.value = "";
    let added = 0, problem = "";
    for (const f of files) {
      if (S.cursors.length >= MAX_CURSORS) { problem = "That's the limit (" + MAX_CURSORS + " cursors). Delete one first."; break; }
      try {
        let src = await shrink(f, 128);
        if (src.length > 140000) src = await shrink(f, 72);
        const c = { id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), src };
        S.cursors.push(c);
        if (!save()) { S.cursors.pop(); problem = "Not enough storage on this device for that one."; break; }
        S.cursorId = c.id; save(); added++;
      } catch (e) { problem = "One of those files isn't a picture."; }
    }
    curMsg.textContent = problem;
    renderCursors(); applyCursor();
    if (added) curBox.scrollTop = curBox.scrollHeight;
  });

  // The cursor itself: follows the pointer and smoothly turns to face the direction of travel
  let px = 0, py = 0, vx = 0, vy = 0, lastX = null, lastY = null, curAng = 0, tgtAng = 0, havePointer = false, hideT = 0, lastT = 0;
  function onMove(e) {
    px = e.clientX; py = e.clientY; havePointer = true;
    if (lastX !== null) { vx += (px - lastX - vx) * 0.35; vy += (py - lastY - vy) * 0.35; }
    lastX = px; lastY = py;
    if (S.curRotate && Math.hypot(vx, vy) > 1.4) tgtAng = Math.atan2(vx, -vy) * 180 / Math.PI;   // 0 = up, 90 = right, 180 = down, -90 = left (diagonals in between)
    if (document.documentElement.classList.contains("has-cursor")) { cursorEl.classList.add("show"); clearTimeout(hideT); if (e.pointerType === "touch") hideT = setTimeout(() => cursorEl.classList.remove("show"), 900); }
    if (!ticking) { ticking = true; lastT = performance.now(); requestAnimationFrame(tick); }
  }
  let ticking = false;
  function tick(t) {
    const dt = Math.min(64, t - lastT); lastT = t;
    vx *= 0.9; vy *= 0.9;                                    // movement fades when the pointer stops, so the cursor keeps its last direction
    if (!S.curRotate) tgtAng = 0;
    let d = ((tgtAng - curAng + 540) % 360) - 180;           // shortest way round
    curAng += d * (1 - Math.exp(-dt / 85));
    cursorEl.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${curAng.toFixed(2)}deg)`;
    if (Math.abs(d) > 0.05 || Math.hypot(vx, vy) > 0.05) requestAnimationFrame(tick); else ticking = false;
  }
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", (e) => { lastX = null; onMove(e); cursorEl.style.setProperty("--press", ".86"); }, { passive: true });
  addEventListener("pointerup", () => cursorEl.style.setProperty("--press", "1"), { passive: true });
  addEventListener("pointercancel", () => cursorEl.style.setProperty("--press", "1"), { passive: true });
  document.documentElement.addEventListener("pointerleave", () => cursorEl.classList.remove("show"));

  // ---------- Enter Code ----------
  const codeModal = document.getElementById("codeModal"), codeIn = document.getElementById("codeIn"), codeMsg = document.getElementById("codeMsg");
  function openCode() { codeIn.value = ""; codeMsg.textContent = ""; codeMsg.className = "m"; codeModal.classList.add("on"); if (matchMedia("(hover: hover)").matches) setTimeout(() => codeIn.focus(), 250); }
  function closeCode(quiet) {
    if (quiet !== true && codeModal.classList.contains("on") && fx()) crumble(settings, ".modal");
    codeModal.classList.remove("on"); codeIn.blur();
  }
  function ok(msg) { codeMsg.className = "m ok"; codeMsg.textContent = msg; codeIn.value = ""; codeIn.blur(); }
  function redeem() {
    const v = codeIn.value.trim().toLowerCase();
    if (!v) { codeMsg.className = "m"; codeMsg.textContent = "Type a code first."; return; }
    if (v === "profile") {
      if (S.redeemed) { codeMsg.className = "m ok"; codeMsg.textContent = "Already redeemed."; return; }
      S.redeemed = true; save(); ok("Redeemed");
    } else if (v === "cursor") {
      if (S.cursorUnlocked) { codeMsg.className = "m ok"; codeMsg.textContent = "Already redeemed."; return; }
      S.cursorUnlocked = true; save(); ok("Redeemed");
      setTimeout(() => { closeCode(true); showCursorGroup(true); setTimeout(() => curReveal.scrollIntoView({ behavior: "smooth", block: "start" }), 120); }, 900);
    } else if (v === "949") {
      if (S.creamUnlocked) { codeMsg.className = "m ok"; codeMsg.textContent = "Already redeemed."; return; }
      S.creamUnlocked = true; save(); row.querySelector(".cream").classList.remove("gone"); renderCustom(); ok("Redeemed");
    } else { codeMsg.className = "m"; codeMsg.textContent = "That code isn't valid."; }
  }
  document.getElementById("codeBtn").addEventListener("click", openCode);
  document.getElementById("codeCancel").addEventListener("click", () => closeCode());
  document.getElementById("codeGo").addEventListener("click", redeem);
  codeIn.addEventListener("keydown", (e) => { if (e.key === "Enter") redeem(); });
  codeModal.addEventListener("click", (e) => { if (e.target === codeModal) closeCode(); });
  showCursorGroup(S.cursorUnlocked);
  applyCursor();

  // Reset progress (tap twice)
  const resetLbl = document.getElementById("resetLbl");
  let resetArm = 0;
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!resetArm) {
      resetLbl.textContent = "Tap again to confirm";
      resetArm = setTimeout(() => { resetArm = 0; resetLbl.textContent = "Reset progress"; }, 3000);
      return;
    }
    clearTimeout(resetArm); resetArm = 0;
    S.redeemed = false; S.creamUnlocked = false; row.querySelector(".cream").classList.add("gone"); S.profiles = []; S.cursorUnlocked = false; S.cursors = []; S.cursorId = null; save(); showCursorGroup(false); applyCursor(); renderCustom(); pSel = Math.min(pSel, pItems.length - 1);
    resetLbl.textContent = "Progress reset";
    setTimeout(() => { resetLbl.textContent = "Reset progress"; }, 1800);
  });
  document.addEventListener("keydown", (e) => {
    if (!inSettings || e.key !== "Escape") return;
    if (codeModal.classList.contains("on")) closeCode(); else closeSettings();
  });

  loading.addEventListener("click", () => { if (ready) goHome(); });
  document.addEventListener("keydown", (e) => { if (ready && !leaving && loading.classList.contains("active")) { goHome(); e.stopImmediatePropagation(); } });

  // Home menu: hover or arrow keys pick an item
  const items = [...document.querySelectorAll("#menu button")];
  let sel = 0;
  function select(i) {
    sel = (i + items.length) % items.length;
    items.forEach((b, n) => b.classList.toggle("sel", n === sel));
  }
  items.forEach((b, n) => b.addEventListener("mouseenter", () => select(n)));
  items[0].addEventListener("click", enterMenu);
  items[1].addEventListener("click", openSettings);
  document.addEventListener("keydown", (e) => {
    if (!home.classList.contains("active")) return;
    if (e.key === "ArrowDown") select(sel + 1);
    if (e.key === "ArrowUp") select(sel - 1);
    if (e.key === "Enter") items[sel].click();
  });

  startLoading();
