// Paint Masters Store Board — Cloudflare Pages Functions helpers
// The board page is served from /public. These three endpoints back it:
//   /api/data     → every tab of the Google Sheet as JSON
//   /api/weather  → National Weather Service hourly forecast for a store
//   /api/img      → a Google Drive photo, cached
// The page falls back to built-in sample data whenever these are unavailable.

const TABS = ["Stores", "Products", "Slides", "Slide Text", "Repair Steps", "Weather Picks"];
const UA = "PaintMastersStoreBoard/1.0 (paintmastersga.com)";

// Called by functions/api/[[route]].js for every /api/* request.
export async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  try {
    if (url.pathname === "/api/data") return await sheetData(env, ctx);
    if (url.pathname === "/api/weather") return await weather(url, ctx);
    if (url.pathname === "/api/img") return await drivePhoto(url, ctx);
  } catch (err) {
    return json({ error: String(err && err.message || err) }, 502);
  }
  return json({ error: "not found" }, 404);
}

function json(body, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": `public, max-age=${maxAge}` },
  });
}

async function cached(ctx, key, ttlSeconds, produce) {
  const cache = caches.default;
  const req = new Request(`https://cache.store-board/${key}`);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await produce();
  if (res.ok) {
    const copy = new Response(res.clone().body, res);
    copy.headers.set("cache-control", `public, max-age=${ttlSeconds}`);
    ctx.waitUntil(cache.put(req, copy));
  }
  return res;
}

// ---------- Google Sheet ----------
async function sheetData(env, ctx) {
  const id = (env.SHEET_ID || "").trim();
  if (!id) return json({ configured: false }, 200);
  return cached(ctx, `sheet/${id}`, 60, async () => {
    const out = { configured: true, tabs: {} };
    for (const tab of TABS) {
      const u = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
      const r = await fetch(u, { headers: { "user-agent": UA } });
      if (!r.ok) throw new Error(`Sheet tab "${tab}" returned ${r.status}. Is the Sheet shared as "Anyone with the link can view"?`);
      out.tabs[tab] = parseCsv(await r.text());
    }
    return json(out, 200, 60);
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  const header = (rows.shift() || []).map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
  return rows
    .filter((r) => r.some((v) => v.trim() !== ""))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || "").trim()])));
}

// ---------- Weather (National Weather Service, free, no key) ----------
async function weather(url, ctx) {
  const rawLat = url.searchParams.get("lat"), rawLon = url.searchParams.get("lon");
  const lat = Number(rawLat), lon = Number(rawLon);
  if (!rawLat || !rawLon || !Number.isFinite(lat) || !Number.isFinite(lon)) return json({ error: "lat and lon required" }, 400);
  const la = lat.toFixed(4), lo = lon.toFixed(4);
  return cached(ctx, `wx/${la},${lo}`, 900, async () => {
    const h = { "user-agent": UA, accept: "application/geo+json" };
    const pts = await fetch(`https://api.weather.gov/points/${la},${lo}`, { headers: h });
    if (!pts.ok) throw new Error(`weather.gov points ${pts.status}`);
    const hourlyUrl = (await pts.json()).properties.forecastHourly;
    const fr = await fetch(hourlyUrl, { headers: h });
    if (!fr.ok) throw new Error(`weather.gov hourly ${fr.status}`);
    const periods = (await fr.json()).properties.periods || [];
    const hours = periods.slice(0, 12).map((p) => ({
      time: p.startTime,
      temp: p.temperature,
      rh: p.relativeHumidity ? Math.round(p.relativeHumidity.value) : null,
      short: p.shortForecast,
    }));
    return json({ hours, updated: new Date().toISOString() }, 200, 900);
  });
}

// ---------- Google Drive photos ----------
async function drivePhoto(url, ctx) {
  const id = url.searchParams.get("id") || "";
  if (!/^[A-Za-z0-9_-]{10,}$/.test(id)) return new Response("bad id", { status: 400 });
  return cached(ctx, `img/${id}`, 86400, async () => {
    const r = await fetch(`https://drive.google.com/thumbnail?id=${id}&sz=w1600`, { headers: { "user-agent": UA } });
    if (!r.ok || !(r.headers.get("content-type") || "").startsWith("image/")) {
      return new Response("photo not available — is it shared as Anyone with the link?", { status: 404 });
    }
    return new Response(r.body, { headers: { "content-type": r.headers.get("content-type") } });
  });
}
