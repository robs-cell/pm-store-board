/* Paint Masters Store Board
   Open /?store=albany (store_id from the Stores tab).
   Testing helpers: &slide=3 pins one slide, &sample=1 forces the built-in sample data. */
(function () {
  "use strict";

  // ---------- palette (Paint Chip) ----------
  const NAVY = "#0e2a52", INK = "#14233a", MUTE = "#5b6675", BLUE = "#1f6fd1", LB = "#8fd0f5";
  const CORAL = "#ff6a4d", GREEN = "#22b573", PINK = "#e84b8a", PURPLE = "#7b5cd6", ORANGE = "#f08a24";
  const STRIPE = [NAVY, BLUE, LB, GREEN, CORAL, PINK, PURPLE, NAVY];
  const CHIPS = [BLUE, CORAL, GREEN, PINK, PURPLE, ORANGE, NAVY, LB];
  const STEP_COLORS = [BLUE, CORAL, GREEN, PINK, PURPLE, NAVY];
  const TINT = { [BLUE]: "#e3eefb", [CORAL]: "#ffe9e4", [GREEN]: "#e2f6ec", [PINK]: "#fde6ef", [PURPLE]: "#ece7fb", [LB]: "#e2f2fd", [NAVY]: "#e4e9f0", [ORANGE]: "#fdeedd" };
  const TEXTC = { [LB]: BLUE, [ORANGE]: "#b85a0a" };   // darker label text where the chip color is too light
  const D = "font-family:'Archivo Black',sans-serif;font-weight:400";
  const K = "font-family:'Figtree',sans-serif;font-weight:900";

  const params = new URLSearchParams(location.search);
  const PIN = params.has("slide") ? Number(params.get("slide")) : null;
  const FORCE_SAMPLE = params.get("sample") === "1";

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const yes = (v) => /^(y|yes|true|1|x)$/i.test(String(v || "").trim());
  const tc = (c) => TEXTC[c] || c;

  // ---------- data ----------
  let DATA = null, WX = null, STORE = null;

  async function getJSON(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(url + " " + r.status);
    return r.json();
  }
  function remember(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function recall(key) { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; } }

  async function loadData() {
    if (!FORCE_SAMPLE) {
      try {
        const d = await getJSON("/api/data");
        if (d && d.configured && d.tabs) { remember("pm-board-data", d); return d; }
      } catch (e) { console.warn("Sheet unavailable, using last good copy or sample", e); }
      const last = recall("pm-board-data");
      if (last) return last;
    }
    return getJSON("sample-data.json");
  }

  async function loadWeather(store) {
    const key = "pm-board-wx-" + store.store_id;
    if (!FORCE_SAMPLE && store.lat && store.lon) {
      try {
        const w = await getJSON(`/api/weather?lat=${store.lat}&lon=${store.lon}`);
        if (w && w.hours && w.hours.length) { remember(key, w); return w; }
      } catch (e) { console.warn("Weather unavailable", e); }
      const last = recall(key);
      if (last) return last;
    }
    return sampleWeather();
  }

  function sampleWeather() {
    const start = new Date(); start.setMinutes(0, 0, 0);
    const temps = [54, 57, 61, 64, 67, 68, 69, 69, 67, 64, 61, 58], rhs = [71, 66, 58, 52, 46, 44, 42, 42, 46, 50, 56, 62];
    return { sample: true, hours: temps.map((t, i) => ({ time: new Date(start.getTime() + i * 3600e3).toISOString(), temp: t, rh: rhs[i], short: "Sample" })) };
  }

  const tab = (name) => (DATA && DATA.tabs && DATA.tabs[name]) || [];
  const products = () => tab("Products");
  const product = (pn) => products().find((p) => String(p.part_number).toLowerCase() === String(pn || "").toLowerCase());
  function text(slide) {
    const o = {};
    tab("Slide Text").filter((r) => r.slide === slide).forEach((r) => { o[r.field] = r.value; });
    return o;
  }
  const price = (v) => (String(v || "").trim() ? esc(v) : "Ask us");

  // ---------- product pictures ----------
  function driveId(link) {
    const m = String(link || "").match(/\/d\/([A-Za-z0-9_-]{10,})/) || String(link || "").match(/[?&]id=([A-Za-z0-9_-]{10,})/);
    return m ? m[1] : null;
  }
  function photoUrl(p) {
    const link = (p && p.photo_link || "").trim();
    if (!link) return null;
    const id = driveId(link);
    if (id) return "/api/img?id=" + id;
    return /^https?:\/\//.test(link) ? link : null;
  }
  const DRAW = {
    can: (c) => `<ellipse cx="50" cy="88" rx="30" ry="6" fill="#000" opacity=".08"/><rect x="20" y="22" width="60" height="64" rx="5" fill="${c}"/><ellipse cx="50" cy="22" rx="30" ry="7" fill="#d9dde3"/><ellipse cx="50" cy="22" rx="22" ry="4.5" fill="#bfc5cd"/><rect x="20" y="40" width="60" height="28" fill="#fff" opacity=".92"/><rect x="28" y="47" width="30" height="5" rx="2" fill="${c}"/><rect x="28" y="56" width="44" height="4" rx="2" fill="#c9ced6"/>`,
    tube: (c) => `<ellipse cx="50" cy="90" rx="20" ry="4" fill="#000" opacity=".08"/><path d="M30 14h40l-4 66H34z" fill="${c}"/><rect x="40" y="80" width="20" height="10" rx="2" fill="#2b3442"/><rect x="30" y="10" width="40" height="7" rx="2" fill="#c9ced6"/><rect x="36" y="34" width="28" height="22" rx="2" fill="#fff" opacity=".92"/><rect x="40" y="40" width="16" height="4" rx="2" fill="${c}"/>`,
    pump: (c) => `<ellipse cx="50" cy="91" rx="24" ry="4" fill="#000" opacity=".08"/><rect x="26" y="34" width="48" height="56" rx="8" fill="${c}"/><rect x="40" y="22" width="20" height="14" rx="2" fill="#2b3442"/><path d="M46 22v-10h22v6" stroke="#2b3442" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="32" y="50" width="36" height="24" rx="3" fill="#fff" opacity=".92"/><rect x="37" y="56" width="20" height="4" rx="2" fill="${c}"/>`,
    disc: (c) => `<ellipse cx="50" cy="90" rx="34" ry="5" fill="#000" opacity=".08"/><circle cx="50" cy="50" r="38" fill="${c}"/><circle cx="50" cy="50" r="38" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/><circle cx="50" cy="50" r="24" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="3 4"/>`,
    roll: (c) => `<ellipse cx="50" cy="88" rx="38" ry="5" fill="#000" opacity=".08"/><rect x="18" y="30" width="64" height="50" rx="4" fill="${c}" opacity=".55"/><ellipse cx="18" cy="55" rx="9" ry="25" fill="${c}"/><ellipse cx="18" cy="55" rx="3" ry="8" fill="#fff"/><ellipse cx="82" cy="55" rx="9" ry="25" fill="${c}" opacity=".75"/><path d="M30 38h44M30 48h44M30 58h44M30 68h44" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`,
    jug: (c) => `<ellipse cx="50" cy="91" rx="28" ry="4" fill="#000" opacity=".08"/><path d="M24 30h52v56a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4z" fill="${c}"/><path d="M24 30l10-12h20v12" fill="${c}"/><rect x="54" y="12" width="14" height="10" rx="2" fill="#2b3442"/><rect x="30" y="50" width="34" height="26" rx="3" fill="#fff" opacity=".92"/><rect x="35" y="56" width="20" height="4" rx="2" fill="${c}"/>`,
    quart: (c) => `<ellipse cx="50" cy="88" rx="26" ry="5" fill="#000" opacity=".08"/><rect x="24" y="30" width="52" height="56" rx="5" fill="${c}"/><ellipse cx="50" cy="30" rx="26" ry="6" fill="#d9dde3"/><rect x="24" y="46" width="52" height="24" fill="#fff" opacity=".92"/><rect x="31" y="52" width="26" height="5" rx="2" fill="${c}"/>`,
  };
  // Real photo when the Sheet has one, otherwise a simple drawing.
  function pic(p, size) {
    const u = photoUrl(p);
    if (u) return `<img src="${esc(u)}" alt="${esc(p.brand + " " + p.name)}" style="max-width:${size}px;max-height:${size}px;object-fit:contain">`;
    const kind = DRAW[(p && p.drawing) || "can"] ? p.drawing : "can";
    const color = (p && /^#[0-9a-f]{3,8}$/i.test(p.color || "")) ? p.color : "#8a94a3";
    return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 100 100">${DRAW[kind](color)}</svg>`;
  }
  const blankProduct = (pn) => ({ part_number: pn || "", brand: "", name: pn || "", description: "", drawing: "can", color: "#8a94a3" });

  // ---------- frame ----------
  function frame(s, body) {
    const stripe = STRIPE.map((c) => `<div style="flex:1;background:${c}"></div>`).join("");
    return `<div class="slide">
<div style="height:150px;flex:none;display:flex">
<div style="flex:1;padding:0 72px;display:flex;align-items:center"><div style="${D};font-size:84px;letter-spacing:.03em;line-height:1;color:${NAVY};white-space:nowrap">PAINT MASTERS</div></div>
<div style="width:900px;flex:none;padding:0 72px 0 56px;background:${LB};display:flex;align-items:center;justify-content:flex-end"><div style="font-weight:900;font-size:50px;line-height:1.05;color:${NAVY};text-align:right">${esc(s.tagline)}</div></div>
</div>
<div style="height:10px;flex:none;display:flex">${stripe}</div>
<div class="body">${body}</div>
<div style="height:88px;flex:none;padding:0 72px;background:${NAVY};display:flex;align-items:center;justify-content:space-between">
<div style="display:flex;align-items:center;gap:22px;font-size:30px;font-weight:600;color:#b9cce4">
<div class="clock" style="font-weight:800;font-size:38px;color:#fff"></div>
<div style="width:2px;height:36px;background:#35557f"></div>
<div>${esc(STORE.store_name)}${hoursLine()}</div>
</div>
<div style="${D};font-size:44px;letter-spacing:.06em;color:#fff">${esc(s.footer)}</div>
</div></div>`;
  }
  function hoursLine() {
    const day = new Date().getDay();
    const h = day === 0 ? STORE.sunday_hours : day === 6 ? STORE.saturday_hours : STORE.mon_fri_hours;
    if (!h) return "";
    if (/closed/i.test(h)) return " &middot; Closed today";
    const parts = h.split(/\s*[-–—]\s*|\s+to\s+/i);
    return parts.length > 1 ? ` &middot; Open today until ${esc(parts[parts.length - 1])}` : ` &middot; Today ${esc(h)}`;
  }
  const chipTag = () => `<div style="position:absolute;top:10px;left:10px;background:#fff;color:${MUTE};font-size:16px;font-weight:800;letter-spacing:.12em;border-radius:6px;padding:3px 8px">PHOTO</div>`;
  const photoBox = (p, size) => (photoUrl(p) ? "" : chipTag()) + pic(p, size);

  // ---------- slide: Painting today ----------
  function weatherHeadline(h) {
    const now = h[0], later = h[Math.min(5, h.length - 1)];
    const feel = now.temp < 60 ? "Cool" : now.temp < 80 ? "Mild" : "Hot";
    const air = now.rh >= 65 ? " and damp" : now.rh <= 35 ? " and dry" : "";
    let trend = "";
    if (later.temp - now.temp >= 5 && now.rh - later.rh >= 10) trend = "Warmer and drier later today.";
    else if (later.temp - now.temp >= 5) trend = "Warming up later today.";
    else if (now.temp - later.temp >= 5) trend = "Cooling off later today.";
    else if (now.rh - later.rh >= 10) trend = "Drier later today.";
    else if (later.rh - now.rh >= 10) trend = "More humid later today.";
    else trend = "Steady through the day.";
    return `${feel}${air} now.<br>${trend}`;
  }
  function slideToday(s) {
    const t = text("today"), h = WX.hours, now = h[0];
    const hourLabel = (iso) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric" });
    const strip = [0, 2, 4, 6, 8].filter((i) => h[i]).map((i, n) => `<div style="flex:1;background:${n === 0 ? NAVY : "rgba(255,255,255,.55)"};border-radius:14px;padding:14px 0;display:flex;flex-direction:column;align-items:center;gap:2px">
<div style="font-size:22px;font-weight:700;color:${n === 0 ? "#fff" : "#35557f"}">${n === 0 ? "Now" : hourLabel(h[i].time)}</div>
<div style="${D};font-size:44px;line-height:1;color:${n === 0 ? "#fff" : NAVY}">${h[i].temp}&deg;</div></div>`).join("");
    const picks = tab("Weather Picks");
    const cards = [...new Set(picks.map((r) => r.card))].slice(0, 2).map((cid) => {
      const rows = picks.filter((r) => r.card === cid);
      const p = product(rows[0].part_number) || blankProduct(rows[0].part_number);
      const acts = rows.map((r) => {
        const lo = r.min_f === "" ? -999 : Number(r.min_f), hi = r.max_f === "" ? 999 : Number(r.max_f);
        const on = now.temp >= lo && now.temp < hi;
        const [bg, fc, sub] = on ? [CORAL, "#fff", "#ffe0d8"] : ["#f2f6fa", INK, MUTE];
        return `<div style="flex:1;background:${bg};border-radius:14px;padding:18px 22px;display:flex;flex-direction:column;gap:6px">
${on ? `<div style="font-size:20px;font-weight:900;letter-spacing:.1em;color:${CORAL};background:#fff;border-radius:6px;padding:2px 10px;align-self:flex-start">NOW</div>` : ""}
<div style="${D};font-size:40px;line-height:1;white-space:nowrap;color:${fc}">${esc(r.code)}</div>
<div style="font-size:26px;font-weight:800;color:${fc}">${esc(r.label)}</div>
<div style="font-size:22px;font-weight:600;color:${sub}">${esc(r.note)}</div></div>`;
      }).join("");
      return `<div style="flex:1;min-height:0;background:#fff;border:2px solid #e3e8ef;border-radius:14px;padding:26px 30px;display:flex;gap:26px;align-items:center">
<div style="width:200px;height:200px;flex:none;border-radius:14px;background:#f2f6fa;display:flex;align-items:center;justify-content:center;position:relative">${photoBox(p, 160)}</div>
<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px">
<div><div style="${K};font-size:24px;letter-spacing:.06em;color:${BLUE}">${esc(rows[0].card_title)}</div>
<div style="font-weight:900;font-size:38px;line-height:1.05;color:${INK}">${esc([p.brand, p.name, p.part_number].filter(Boolean).join(" "))}</div></div>
<div style="display:flex;gap:14px">${acts}</div></div></div>`;
    }).join("");
    return frame(s, `<div style="width:720px;flex:none;background:${LB};border-radius:26px;padding:40px 44px;display:flex;flex-direction:column;gap:18px;color:${NAVY}">
<div style="${K};font-size:32px;letter-spacing:.14em;color:${BLUE}">RIGHT NOW IN ${esc(String(STORE.store_name).toUpperCase())}</div>
<div style="display:flex;align-items:flex-end;gap:28px">
<div style="${D};font-size:240px;line-height:.82">${now.temp}&deg;</div>
<div style="padding-bottom:14px"><div style="${D};font-size:64px;line-height:1;color:${BLUE}">${now.rh == null ? "–" : now.rh + "%"}</div><div style="font-size:28px;font-weight:700">humidity</div></div></div>
<div style="font-weight:900;font-size:48px;line-height:1.1">${weatherHeadline(h)}</div>
<div style="flex:1"></div>
${WX.sample ? `<div style="font-size:20px;font-weight:700;color:#35557f">SAMPLE WEATHER</div>` : ""}
<div style="display:flex;gap:10px">${strip}</div></div>
<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:24px">
<div><div style="${K};font-size:32px;letter-spacing:.12em;color:${BLUE}">${esc(t.activator_heading)}</div>
<div style="font-size:30px;color:${MUTE}">${esc(t.activator_note)}</div></div>
${cards}</div>`);
  }

  // ---------- slide: Bare metal to clear ----------
  function slideBare(s) {
    const t = text("bare");
    const steps = tab("Repair Steps").slice(0, 6).map((r, i) => {
      const col = STEP_COLORS[i % STEP_COLORS.length], p = product(r.part_number) || blankProduct(r.part_number);
      return `<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
<div style="position:relative;width:96px;height:96px;border-radius:48px;background:${col};color:#fff;display:flex;align-items:center;justify-content:center;${D};font-size:58px;box-shadow:0 0 0 10px #fff">${esc(r.step)}</div>
<div style="${D};font-size:52px;letter-spacing:.05em;color:${col}">${esc(r.word)}</div>
<div style="width:100%;height:230px;background:#fff;border:2px solid #e3e8ef;border-radius:14px;display:flex;align-items:center;justify-content:center;position:relative">
<div style="position:absolute;inset:14px;border-radius:8px;background:#f2f6fa"></div>${photoUrl(p) ? "" : chipTag()}<div style="position:relative">${pic(p, 160)}</div></div>
<div style="font-weight:800;font-size:30px;line-height:1.1;color:${INK}">${esc(p.name)}</div>
<div style="font-size:24px;font-weight:700;color:${BLUE}">${esc([p.brand, p.part_number].filter(Boolean).join(" "))}</div></div>`;
    }).join("");
    return frame(s, `<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:34px">
<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:40px">
<div><div style="${K};font-size:32px;letter-spacing:.14em;color:${BLUE}">${esc(t.kicker)}</div>
<div style="${D};font-size:100px;line-height:1;color:${NAVY};white-space:nowrap">${esc(t.headline)}</div></div>
<div style="font-size:32px;line-height:1.3;color:${MUTE};max-width:620px;text-align:right">${esc(t.subline)}</div></div>
<div style="flex:1;min-height:0;display:flex;gap:26px;position:relative">
<div style="position:absolute;left:6%;right:6%;top:45px;height:6px;background:#e3e8ef"></div>${steps}</div></div>`);
  }

  // ---------- slide: On the shelf ----------
  function slideShelf(s) {
    const t = text("shelf");
    const items = products().filter((p) => yes(p.on_shelf)).sort((a, b) => (Number(a.shelf_order) || 99) - (Number(b.shelf_order) || 99)).slice(0, 8);
    const cards = items.map((p, i) => {
      const col = CHIPS[i % CHIPS.length];
      return `<div style="background:#fff;border:2px solid #e3e8ef;border-radius:14px;overflow:hidden;display:flex;flex-direction:column">
<div style="height:14px;flex:none;background:${col}"></div>
<div style="height:136px;flex:none;background:${TINT[col]};display:flex;align-items:center;justify-content:center;position:relative">${photoBox(p, 118)}</div>
<div style="flex:1;padding:12px 18px 16px;display:flex;flex-direction:column;gap:2px">
<div style="font-size:21px;font-weight:900;letter-spacing:.05em;color:${tc(col)}">${esc(String(p.brand).toUpperCase())} &middot; ${esc(p.part_number)}</div>
<div style="font-weight:800;font-size:28px;line-height:1.08;color:${INK}">${esc(p.name)}</div>
<div style="font-size:21px;line-height:1.2;color:${MUTE}">${esc(p.description)}</div>
<div style="margin-top:auto;align-self:flex-start;background:${CORAL};color:#fff;font-weight:900;font-size:26px;border-radius:8px;padding:4px 14px">${price(p.price)}</div></div></div>`;
    }).join("");
    const f = product(t.feature_part) || blankProduct(t.feature_part);
    return frame(s, `<div style="width:520px;flex:none;background:${LB};border-radius:26px;padding:36px 40px;display:flex;flex-direction:column;gap:14px;position:relative;overflow:hidden">
<div style="position:absolute;right:-90px;bottom:-90px;width:380px;height:380px;border-radius:190px;background:#fff;opacity:.5"></div>
<div style="${K};font-size:30px;letter-spacing:.1em;white-space:nowrap;color:${NAVY}">${esc(t.feature_kicker)}</div>
<div style="${D};font-size:74px;line-height:.95;color:${NAVY}">${esc(t.feature_title)}</div>
<div style="font-size:30px;font-weight:700;line-height:1.3;color:${NAVY}">${esc(t.feature_line)}</div>
<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;position:relative">${pic(f, 200)}</div>
<div style="display:flex;align-items:baseline;gap:14px;position:relative;white-space:nowrap">
<div style="${D};font-size:64px;line-height:.9;color:${CORAL}">${price(t.feature_price)}</div>
<div style="font-size:26px;font-weight:800;color:${NAVY}">${esc(t.feature_price_note)}</div></div></div>
<div style="flex:1;min-width:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:20px">${cards}</div>`);
  }

  // ---------- slide: Product spotlight ----------
  function slideSpotlight(s) {
    const t = text("spotlight"), p = product(t.part) || blankProduct(t.part);
    const fact = (n, col) => t["fact" + n + "_title"] ? `<div style="display:flex;align-items:flex-start;gap:24px">
<div style="width:70px;height:70px;flex:none;border-radius:14px;background:${col};color:#fff;display:flex;align-items:center;justify-content:center;${D};font-size:38px">${n}</div>
<div><div style="font-weight:900;font-size:40px;line-height:1.1;color:${INK}">${esc(t["fact" + n + "_title"])}</div>
<div style="font-size:28px;line-height:1.3;color:${MUTE}">${esc(t["fact" + n + "_text"])}</div></div></div>` : "";
    return frame(s, `<div style="width:760px;flex:none;position:relative;display:flex;align-items:center;justify-content:center">
<div style="position:absolute;width:700px;height:700px;border-radius:350px;background:${LB}"></div>
<div style="position:absolute;width:520px;height:520px;border-radius:260px;background:#fff;opacity:.65"></div>
<div style="position:relative">${pic(p, 440)}</div>
${photoUrl(p) ? "" : `<div style="position:absolute;top:40px;left:40px;background:#fff;border:2px solid #e3e8ef;color:${MUTE};font-size:20px;font-weight:800;letter-spacing:.12em;border-radius:8px;padding:6px 12px">PHOTO</div>`}
<div style="position:absolute;right:30px;bottom:60px;width:220px;height:220px;border-radius:110px;background:${CORAL};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-8deg)">
<div style="font-size:26px;font-weight:800">${esc(t.price_note)}</div><div style="${D};font-size:48px;line-height:1">${price(t.price)}</div></div></div>
<div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:24px">
<div style="${K};font-size:32px;letter-spacing:.14em;color:${BLUE}">${esc(t.kicker)}</div>
<div style="${D};font-size:96px;line-height:.95;color:${NAVY}">${esc(t.headline)}</div>
<div style="font-size:32px;font-weight:800;color:${BLUE}">${esc(t.subline)}</div>
<div style="display:flex;flex-direction:column;gap:22px;margin-top:6px">${fact(1, CORAL)}${fact(2, GREEN)}${fact(3, BLUE)}</div>
<div style="font-size:26px;color:${MUTE}">${esc(t.footnote)}</div></div>`);
  }

  // ---------- slide: Ask us anything ----------
  const SWATCH = '<rect x="9" y="18" width="18" height="34" rx="3" transform="rotate(-18 18 35)"/><rect x="23" y="13" width="18" height="36" rx="3"/><rect x="37" y="18" width="18" height="34" rx="3" transform="rotate(18 46 35)"/>';
  function slideAsk(s) {
    const t = text("ask");
    const cols = [BLUE, CORAL, GREEN, PINK, PURPLE, LB];
    const cards = products().filter((p) => yes(p.on_ask_us)).slice(0, 6).map((p, i) => {
      const col = cols[i % cols.length];
      return `<div style="background:#fff;border:2px solid #e3e8ef;border-radius:14px;padding:18px 22px;display:flex;align-items:center;gap:22px;min-width:0">
<div style="width:150px;height:150px;flex:none;border-radius:12px;background:${TINT[col]};display:flex;align-items:center;justify-content:center;position:relative">${photoBox(p, 112)}</div>
<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">
<div style="height:8px;width:56px;border-radius:4px;background:${col}"></div>
<div style="${K};font-size:22px;letter-spacing:.05em;color:${tc(col)}">${esc(String(p.brand).toUpperCase())} &middot; ${esc(p.part_number)}</div>
<div style="font-weight:900;font-size:30px;line-height:1.08;color:${INK}">${esc(p.name)}</div></div></div>`;
    }).join("");
    const bars = [BLUE, CORAL, GREEN, PINK, PURPLE].map((c) => `<div style="flex:1;background:${c}"></div>`).join("");
    return frame(s, `<div style="width:880px;flex:none;background:#fff;border:2px solid #e3e8ef;border-radius:26px;overflow:hidden;display:flex">
<div style="width:300px;flex:none;display:flex;flex-direction:column">${bars}</div>
<div style="flex:1;min-width:0;padding:44px 48px;display:flex;flex-direction:column;justify-content:center;gap:24px">
<div style="width:160px;height:160px;border-radius:80px;background:${LB};display:flex;align-items:center;justify-content:center"><svg aria-hidden="true" width="140" height="140" viewBox="0 0 64 64" fill="none" stroke="${NAVY}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${SWATCH}</svg></div>
<div style="${D};font-size:66px;line-height:1;color:${NAVY}">${esc(t.headline)}</div>
<div style="font-size:32px;line-height:1.35;color:${MUTE}">${esc(t.body)}</div>
${t.button ? `<div style="align-self:flex-start;background:${CORAL};color:#fff;font-weight:900;font-size:36px;border-radius:44px;padding:16px 42px">${esc(t.button)}</div>` : ""}</div></div>
<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:22px;justify-content:center">
<div style="${K};font-size:34px;letter-spacing:.14em;color:${BLUE};text-align:center">${esc(t.kicker)}</div>
<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px">${cards}</div></div>`);
  }

  // ---------- slide: Panel mix deal ----------
  function slidePanel(s) {
    const t = text("panel");
    const CHECK = '<svg aria-hidden="true" width="50" height="50" viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 33l12 12 24-26"/></svg>';
    const item = (v, col) => v ? `<div style="display:flex;align-items:center;gap:20px;align-self:stretch;padding-left:20px">
<div style="width:64px;height:64px;flex:none;border-radius:14px;background:${col};display:flex;align-items:center;justify-content:center">${CHECK}</div>
<div style="font-weight:900;font-size:32px;line-height:1.1;color:${INK};text-align:left">${esc(v)}</div></div>` : "";
    return frame(s, `<div style="width:860px;flex:none;background:${LB};border-radius:34px;padding:40px 56px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden">
<div style="${K};font-size:32px;letter-spacing:.14em;color:${NAVY}">${esc(t.kicker)}</div>
<div style="display:flex;align-items:flex-end;gap:30px">
<div style="${D};font-size:430px;line-height:.82;color:${NAVY}">${esc(t.big_number)}</div>
<div style="padding-bottom:30px"><div style="${D};font-size:96px;line-height:.95;color:${NAVY}">${esc(t.big_word)}</div>
<div style="font-weight:800;font-size:34px;line-height:1.25;color:${NAVY};margin-top:12px;max-width:340px">${esc(t.big_line)}</div></div></div>
<div style="position:absolute;right:44px;top:44px;width:230px;height:230px;border-radius:115px;background:${CORAL};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(10deg);box-shadow:0 0 0 10px #fff">
${String(t.price || "").trim() ? `<div style="font-size:26px;font-weight:800">${esc(t.price_note)}</div>` : ""}<div style="${D};font-size:50px;line-height:1">${price(t.price)}</div></div></div>
<div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:center;position:relative">
<div style="position:absolute;width:760px;height:760px;border-radius:380px;background:#e2f6ec;border:8px solid ${GREEN}"></div>
<div style="position:relative;display:flex;flex-direction:column;gap:24px;width:500px;align-items:center;text-align:center">
<div style="${D};font-size:46px;line-height:1.05;color:${NAVY}">${esc(t.circle_title)}</div>
${item(t.check1, GREEN)}${item(t.check2, BLUE)}${item(t.check3, PINK)}
${t.pill ? `<div style="background:${CORAL};color:#fff;font-weight:900;font-size:28px;line-height:1.2;border-radius:30px;padding:14px 30px;max-width:420px">${esc(t.pill)}</div>` : ""}</div></div>`);
  }

  const BUILDERS = { today: slideToday, bare: slideBare, shelf: slideShelf, spotlight: slideSpotlight, ask: slideAsk, panel: slidePanel };

  // ---------- run ----------
  const stage = document.getElementById("stage");
  let slides = [], current = 0, timer = null;

  function fit() {
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
  }
  function tickClock() {
    const t = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    stage.querySelectorAll(".clock").forEach((el) => { el.textContent = t; });
  }
  function render() {
    const stores = tab("Stores");
    const want = (params.get("store") || "").toLowerCase();
    STORE = stores.find((r) => String(r.store_id).toLowerCase() === want) || stores[0] || { store_id: "store", store_name: "Paint Masters" };
    slides = tab("Slides").filter((r) => yes(r.show) && BUILDERS[r.slide]).sort((a, b) => Number(a.order) - Number(b.order));
    stage.innerHTML = slides.map((s, i) => {
      try { return BUILDERS[s.slide](s).replace('class="slide"', `class="slide" data-i="${i}"`); }
      catch (e) { console.error("slide failed", s.slide, e); return ""; }
    }).join("");
    tickClock();
    show(PIN != null ? Math.min(Math.max(PIN - 1, 0), slides.length - 1) : Math.min(current, slides.length - 1));
  }
  function show(i) {
    current = i;
    stage.querySelectorAll(".slide").forEach((el) => el.classList.toggle("on", Number(el.dataset.i) === i));
    clearTimeout(timer);
    if (PIN == null && slides.length > 1) {
      const secs = Math.max(4, Number(slides[i].seconds) || 10);
      timer = setTimeout(() => show((i + 1) % slides.length), secs * 1000);
    }
  }

  async function refresh() {
    try {
      DATA = await loadData();
      const stores = tab("Stores"), want = (params.get("store") || "").toLowerCase();
      const st = stores.find((r) => String(r.store_id).toLowerCase() === want) || stores[0];
      WX = st ? await loadWeather(st) : sampleWeather();
      render();
    } catch (e) { console.error(e); }
  }

  addEventListener("resize", fit);
  fit();
  refresh();
  setInterval(tickClock, 10000);
  setInterval(refresh, 5 * 60 * 1000);                       // new Sheet content and weather every 5 minutes
  setTimeout(() => location.reload(), 6 * 3600 * 1000);      // pick up board updates a few times a day
})();
