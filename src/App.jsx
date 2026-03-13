import React, { useEffect, useMemo, useState, useCallback } from "react";

/* -------------------------------------------------------------
   GLOBAL CSS  (injected once into <head>)
------------------------------------------------------------- */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #0d1117;
    --s1:      #161b27;
    --s2:      #1c2337;
    --s3:      #222d42;
    --s4:      #2a3650;
    --bd:      rgba(255,255,255,.08);
    --bd2:     rgba(255,255,255,.04);
    --gold:    #f0c040;
    --goldf:   rgba(240,192,64,.14);
    --goldb:   rgba(240,192,64,.07);
    --up:      #00c853;
    --upf:     rgba(0,200,83,.13);
    --upg:     rgba(0,200,83,.06);
    --dn:      #ff3b30;
    --dnf:     rgba(255,59,48,.12);
    --t1:      #ffffff;
    --t2:      #a0aec0;
    --t3:      #4a5568;
    --accent:  #3b82f6;
    --mono:    'IBM Plex Mono', monospace;
    --sans:    'IBM Plex Sans', sans-serif;
    --serif:   'Playfair Display', serif;
    --radius:  12px;
    --hdr-h:   258px;   /* zellige70 + ticker28 + header58 + worldclock54 + nav48 */
  }

  html, body { background: var(--bg); color: var(--t1); }
  body { font-family: var(--sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  button { cursor: pointer; font-family: inherit; border: none; outline: none; }
  a { color: var(--gold); text-decoration: none; }

  /* -- SCROLLBAR -- */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }
  .hide-scroll { scrollbar-width: none; }
  .hide-scroll::-webkit-scrollbar { display: none; }

  /* -- KEYFRAMES -- */
  @keyframes ticker-scroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-dot {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,200,83,.5); }
    50%     { box-shadow: 0 0 0 5px rgba(0,200,83,0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes glow-pulse {
    0%,100% { text-shadow: 0 0 8px rgba(0,200,83,.4); }
    50%     { text-shadow: 0 0 20px rgba(0,200,83,.8), 0 0 40px rgba(0,200,83,.3); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fade-up { animation: fadeSlideUp .35s ease both; }
  .fade-up:nth-child(1){animation-delay:.03s}
  .fade-up:nth-child(2){animation-delay:.07s}
  .fade-up:nth-child(3){animation-delay:.11s}
  .fade-up:nth-child(4){animation-delay:.15s}
  .fade-up:nth-child(5){animation-delay:.19s}
  .fade-up:nth-child(6){animation-delay:.23s}

  /* -- TABLE ROWS -- */
  .row-hover:hover { background: rgba(255,255,255,.04) !important; }
  .row-hover:hover td { color: #fff; }

  /* -- TABS -- */
  .tab-btn { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  .tab-btn:hover  { color: #fff !important; background: rgba(255,255,255,.06) !important; border-color: rgba(255,255,255,.15) !important; }
  .tab-btn.active { color: var(--bg) !important; background: var(--gold) !important; border-color: var(--gold) !important; box-shadow: 0 0 16px rgba(240,192,64,.4); }

  /* -- CARDS -- */
  .feat-card { transition: transform .18s, box-shadow .18s !important; }
  .feat-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 40px rgba(0,0,0,.5) !important; border-color: rgba(255,255,255,.18) !important; }

  .card-shine {
    background: linear-gradient(145deg, var(--s2) 0%, var(--s1) 100%);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
  }
  .card-shine::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.14) 50%, transparent 100%);
  }

  /* -- TICKER -- */
  .ticker-wrap { overflow: hidden; }
  .ticker-inner {
    display: flex; white-space: nowrap;
    animation: ticker-scroll 80s linear infinite;
  }
  .ticker-inner:hover { animation-play-state: paused; }

  /* -- ZELLIGE BAND -- */
  #zellige-band {
    height: 100px;
    position: relative; overflow: hidden;
    background: #f2ede0;
    border-bottom: 3px solid #1b3d9e;
  }
  @media (max-width: 768px) {
    #zellige-band { height: 56px; }
  }

  /* -- BRAND SHIMMER -- */
  .brand-shimmer {
    background: linear-gradient(90deg, #e0b030 0%, #f8e080 25%, #f0c040 50%, #c8901c 75%, #f0c040 100%);
    background-size: 600px 100%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 5s ease infinite;
  }

  .masi-glow { animation: glow-pulse 3s ease infinite; }

  /* -- SESSION BADGE -- */
  .session-open {
    background: linear-gradient(135deg, #00c853, #00a040);
    border-radius: 8px; padding: 5px 12px;
    font-family: var(--mono); font-size: .74rem; font-weight: 600;
    color: #fff; letter-spacing: .04em;
    box-shadow: 0 0 14px rgba(0,200,83,.35), inset 0 1px 0 rgba(255,255,255,.2);
    white-space: nowrap;
  }
  .session-closed {
    background: rgba(255,59,48,.12);
    border: 1px solid rgba(255,59,48,.25);
    border-radius: 8px; padding: 5px 12px;
    font-family: var(--mono); font-size: .74rem; font-weight: 600;
    color: var(--dn); letter-spacing: .04em; white-space: nowrap;
  }

  /* -- SECTOR BADGES -- */
  .badge-banques    { background: rgba(59,130,246,.18); color: #60a5fa; border: 1px solid rgba(59,130,246,.3); }
  .badge-telecom    { background: rgba(236,72,153,.18); color: #f472b6; border: 1px solid rgba(236,72,153,.3); }
  .badge-industrie  { background: rgba(107,114,128,.18);color: #9ca3af; border: 1px solid rgba(107,114,128,.3); }
  .badge-immobilier { background: rgba(245,158,11,.18); color: #fbbf24; border: 1px solid rgba(245,158,11,.3); }
  .badge-assurance  { background: rgba(139,92,246,.18); color: #a78bfa; border: 1px solid rgba(139,92,246,.3); }
  .badge-accent     { background: rgba(59,130,246,.18); color: #60a5fa; border: 1px solid rgba(59,130,246,.3); }
  .badge-default    { background: rgba(255,255,255,.07); color: var(--t2); border: 1px solid rgba(255,255,255,.1); }

  /* -- SKELETON -- */
  .skeleton {
    background: linear-gradient(90deg, var(--s1) 25%, var(--s2) 50%, var(--s1) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s ease infinite; border-radius: 4px;
  }

  /* -- MOBILE NAV DRAWER -- */
  .mob-nav-drawer {
    animation: slideDown .2s ease both;
    border-top: 1px solid var(--bd);
    background: var(--s1);
  }
  .mob-tab-btn {
    display: flex; align-items: center;
    width: 100%; padding: 13px 20px;
    font-family: var(--sans); font-size: .95rem; font-weight: 500;
    color: var(--t2); background: none; border: none;
    border-bottom: 1px solid var(--bd2);
    text-align: left; gap: 10px;
    -webkit-tap-highlight-color: transparent;
    transition: background .1s, color .1s;
  }
  .mob-tab-btn.active { color: var(--gold); background: var(--goldb); }
  .mob-tab-btn:active { background: rgba(255,255,255,.06); }

  /* -- MOBILE SUMMARY CARDS -- */
  .mob-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  /* -- RESPONSIVE BREAKPOINTS -- */

  /* Tablet — hide world clock, compress header */
  @media (max-width: 900px) {
    .world-clock-bar { display: none !important; }
    .header-subtitle { display: none !important; }
  }

  /* Mobile — single column layout */
  @media (max-width: 768px) {
    .desktop-only { display: none !important; }
    .mob-only { display: flex !important; }
    .zellige-desktop { display: none !important; }
    .body-grid { grid-template-columns: 1fr !important; }
    .left-sidebar-col { display: none !important; }
    .right-sidebar-col { display: none !important; }
    .stats-2col { grid-template-columns: 1fr !important; }
    .stats-4col { grid-template-columns: repeat(2, 1fr) !important; }
    .feat-4col  { grid-template-columns: repeat(2, 1fr) !important; }
    .fear-2col  { grid-template-columns: 1fr !important; }
    .gauge-panel-inner { flex-direction: column !important; gap: 12px !important; }
    .hero-chart-price  { font-size: 1.6rem !important; }
    .summary-bar-grid  { grid-template-columns: repeat(3,1fr) !important; }
    .summary-bar-masi  { display: none !important; }
    .summary-bar-vol   { display: none !important; }
  }

  /* Very small phones */
  @media (max-width: 420px) {
    .stats-4col { grid-template-columns: 1fr 1fr !important; }
    .feat-4col  { grid-template-columns: 1fr !important; }
  }
`;

/* -------------------------------------------------------------
   STATIC CONFIG
------------------------------------------------------------- */
const TABS = [
  { key: "overview",    label: "Overview"     },
  { key: "morocco",     label: "Casablanca"   },
  { key: "indices",     label: "Indices"      },
  { key: "usa",         label: "🇺🇸 USA"       },
  { key: "europe",      label: "🇪🇺 Europe"    },
  { key: "gcc",         label: "🌙 GCC"        },
  { key: "asia",        label: "🌏 Asia"       },
  { key: "currencies",  label: "Forex"        },
  { key: "crypto",      label: "Crypto"       },
  { key: "commodities", label: "Commodities"  },
  { key: "bonds",       label: "Bonds"        },
];

/* -------------------------------------------------------------
   FORMATTERS
------------------------------------------------------------- */
// FIX #12: Fixed dead branch (both arms were identical toFixed(4)).
// Added proper sub-0.001 formatting for micro-cap tokens (SHIB, PEPE, BONK).
function fv(v) {
  v = Number(v);
  if (!Number.isFinite(v)) return "—";
  if (v >= 100000) return v.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
  if (v >= 1000)   return v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 100)    return v.toFixed(2);
  if (v >= 10)     return v.toFixed(3);
  if (v >= 1)      return v.toFixed(4);
  if (v >= 0.01)   return v.toFixed(5);
  if (v >= 0.0001) return v.toFixed(7);
  // Micro-cap: show up to 8 significant figures
  return v.toLocaleString("en-US", { maximumSignificantDigits: 4, minimumSignificantDigits: 2 });
}
function fc(c) {
  const n = Number(c ?? 0);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
const isUp = (c) => Number(c ?? 0) >= 0;

/* -------------------------------------------------------------
   RESPONSIVE HOOK
------------------------------------------------------------- */
function useIsMobile() {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mob;
}

/* -------------------------------------------------------------
   ZELLIGE CANVAS
------------------------------------------------------------- */
/* -------------------------------------------------------------
   ZELLIGE BAND — Hassan II mosque style canvas pattern
------------------------------------------------------------- */
function ZelligeBand() {
  const SRC = "/zellige.webp"
  return (
    <div id="zellige-band" style={{
      position: "relative", zIndex: 1,
      backgroundImage: `url(${SRC})`,
      backgroundRepeat: "repeat-x",
      backgroundSize: "auto 100%",
      backgroundPosition: "center",
    }}>
    </div>
  );
}

/* -------------------------------------------------------------
   BADGE
------------------------------------------------------------- */
function Badge({ change, size = "md" }) {
  const u = isUp(change);
  const sizes = { sm: { fontSize: ".62rem", padding: "2px 7px" }, md: { fontSize: ".75rem", padding: "3px 9px" }, lg: { fontSize: ".8rem", padding: "4px 12px" } };
  const s = sizes[size] || sizes.md;
  return (
    <span style={{
      ...s, fontFamily: "var(--mono)", fontWeight: 700, borderRadius: 6,
      color: u ? "#00e676" : "#ff5252",
      background: u ? "rgba(0,230,118,.12)" : "rgba(255,82,82,.12)",
      border: `1px solid ${u ? "rgba(0,230,118,.25)" : "rgba(255,82,82,.22)"}`,
      whiteSpace: "nowrap",
    }}>
      {u ? "▲" : "▼"} {fc(change)}
    </span>
  );
}

/* -------------------------------------------------------------
   SPARK
------------------------------------------------------------- */
let _sid = 0;
function Spark({ series, up, w = 80, h = 32, thick = false }) {
  const id = useMemo(() => `sp${_sid++}`, []);
  if (!Array.isArray(series) || series.length < 2) return <div style={{ width: w, height: h }} />;
  const mn = Math.min(...series), mx = Math.max(...series), rng = mx - mn || 1, p = 2;
  const pts = series.map((v, i) => [
    p + (i / (series.length - 1)) * (w - p * 2),
    h - p - ((v - mn) / rng) * (h - p * 2),
  ]);
  let line = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) line += ` H${pts[i][0].toFixed(1)} V${pts[i][1].toFixed(1)}`;
  let area = `M${pts[0][0].toFixed(1)},${h} V${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) area += ` H${pts[i][0].toFixed(1)} V${pts[i][1].toFixed(1)}`;
  area += ` V${h} Z`;
  const clr = up ? "#00c853" : "#ff3b30";
  const [lx, ly] = pts[pts.length - 1];
  const sw = thick ? 2.0 : 1.5;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ display: "block", width: "100%", height: h, flexShrink: 0 }}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={clr} stopOpacity="0.28" />
          <stop offset="100%" stopColor={clr} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g${id})`} />
      <path d={line} fill="none" stroke={clr} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={thick ? 2.5 : 2} fill={clr} />
    </svg>
  );
}

/* -------------------------------------------------------------
   LIVE CLOCK
------------------------------------------------------------- */
function LiveClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("fr-FR", { timeZone: "Africa/Casablanca", hour12: false })
  );
  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString("fr-FR", { timeZone: "Africa/Casablanca", hour12: false }))
    , 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--t2)", letterSpacing: ".04em" }}>
      {time} <span style={{ color: "var(--t3)", fontSize: ".74rem" }}>CAS</span>
    </span>
  );
}

/* -------------------------------------------------------------
   TICKER
------------------------------------------------------------- */
function Ticker({ items }) {
  if (!items.length) return null;
  const all = [...items, ...items];
  return (
    <div style={{
      height: 34, overflow: "hidden",
      background: "#070b12",
      borderBottom: "1px solid rgba(255,255,255,.07)",
      display: "flex", alignItems: "center",
    }}>
      <div className="ticker-wrap" style={{ flex: 1, height: "100%", display: "flex", alignItems: "center" }}>
        <div className="ticker-inner">
          {all.map((item, i) => {
            const u = isUp(item.change);
            return (
              <div key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "0 22px", height: 34,
                borderRight: "1px solid rgba(255,255,255,.06)",
              }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".80rem", fontWeight: 700, color: "#ffffff", letterSpacing: ".07em" }}>{item.id}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".80rem", fontWeight: 500, color: "#f0c040" }}>{fv(Number(item.value))}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".77rem", fontWeight: 600, color: u ? "#00e676" : "#ff5252", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  {u ? "▲" : "▼"}{fc(item.change)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   WORLD CLOCK BAR
------------------------------------------------------------- */
const CLOCKS = [
  { city: "Casablanca", tz: "Africa/Casablanca",  flag: "🇲🇦", region: "Morocco",  mktOpen: [9,  17] },
  { city: "Dubai",      tz: "Asia/Dubai",          flag: "🇦🇪", region: "GCC",      mktOpen: [10, 14] },
  { city: "Riyadh",     tz: "Asia/Riyadh",         flag: "🇸🇦", region: "GCC",      mktOpen: [10, 15] },
  { city: "London",     tz: "Europe/London",        flag: "🇬🇧", region: "Europe",   mktOpen: [8,  16.5] },
  { city: "Paris",      tz: "Europe/Paris",         flag: "🇫🇷", region: "Europe",   mktOpen: [9,  17.5] },
  { city: "New York",   tz: "America/New_York",     flag: "🇺🇸", region: "USA",      mktOpen: [9.5, 16] },
  { city: "Tokyo",      tz: "Asia/Tokyo",           flag: "🇯🇵", region: "Asia",     mktOpen: [9,  15.5] },
  { city: "Shanghai",   tz: "Asia/Shanghai",        flag: "🇨🇳", region: "Asia",     mktOpen: [9.5, 15] },
  { city: "Hong Kong",  tz: "Asia/Hong_Kong",       flag: "🇭🇰", region: "Asia",     mktOpen: [9.5, 16] },
];
function WorldClockBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="world-clock-bar" style={{
      display: "flex", alignItems: "stretch",
      background: "var(--s1)", borderBottom: "1px solid var(--bd)",
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      {CLOCKS.map((c) => {
        const timeStr = now.toLocaleTimeString("en-GB", { timeZone: c.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
        const [hStr, mStr] = timeStr.split(":");
        const h = parseInt(hStr, 10) + parseInt(mStr, 10) / 60;
        const isOpen = h >= c.mktOpen[0] && h < c.mktOpen[1];
        const dayStr   = now.toLocaleDateString("en-GB", { timeZone: c.tz, weekday: "short" });
        const localDay = now.toLocaleDateString("en-GB", { timeZone: "Africa/Casablanca", weekday: "short" });
        const diffDay  = dayStr !== localDay;
        return (
          <div key={c.city} style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "7px 16px", gap: 3,
            borderRight: "1px solid var(--bd2)",
            flexShrink: 0, minWidth: 100,
            background: isOpen ? "rgba(0,200,83,.03)" : "transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 13 }}>{c.flag}</span>
              <span style={{ fontFamily: "var(--sans)", fontSize: ".72rem", fontWeight: 600, color: isOpen ? "#fff" : "var(--t2)", letterSpacing: ".01em" }}>{c.city}</span>
              {diffDay && <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--t3)" }}>{dayStr}</span>}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".95rem", fontWeight: 700, color: isOpen ? "#fff" : "var(--t2)", letterSpacing: ".05em", lineHeight: 1 }}>{timeStr}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: isOpen ? "var(--up)" : "var(--t3)", animation: isOpen ? "pulse-dot 2s ease infinite" : "none", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", fontWeight: 600, color: isOpen ? "var(--up)" : "var(--t3)", letterSpacing: ".06em" }}>{isOpen ? "OPEN" : "CLOSED"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
------------------------------------------------------------- */
function useSessionStatus() {
  const [status, setStatus] = useState({ open: false, label: "" });
  useEffect(() => {
    function check() {
      const now = new Date();
      const h = now.toLocaleString("en-GB", { timeZone: "Africa/Casablanca", hour: "numeric", hour12: false });
      const d = now.toLocaleString("en-GB", { timeZone: "Africa/Casablanca", weekday: "short" });
      const hNum = parseInt(h, 10);
      const isWeekday = !["Sat", "Sun"].includes(d);
      const open = isWeekday && hNum >= 9 && hNum < 15;
      const nextOpen = open ? "" : "Opens 09:00";
      setStatus({ open, label: open ? "Session Open" : "Session Closed", nextOpen });
    }
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/* -------------------------------------------------------------
   HEADER
------------------------------------------------------------- */
function Header({ updatedAt }) {
  const session = useSessionStatus();
  const isMob   = useIsMobile();
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, padding: isMob ? "10px 14px" : "10px 20px",
      background: "linear-gradient(180deg, #1a2035 0%, var(--s1) 100%)",
      borderBottom: "1px solid var(--bd)",
      position: "relative", zIndex: 1,
      boxShadow: "0 4px 24px rgba(0,0,0,.4)",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: "linear-gradient(135deg, #f5d800, #c8901c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(245,216,0,.35)",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <polygon points="10,1 11.8,7.2 18.5,7.2 13.1,10.9 14.9,17.1 10,13.5 5.1,17.1 6.9,10.9 1.5,7.2 8.2,7.2" fill="#0d1117"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--sans)", fontSize: isMob ? ".95rem" : "1.05rem", fontWeight: 700, color: "var(--t1)", letterSpacing: ".04em", lineHeight: 1 }}>
            مرصد الأسواق المغربية والعالمية
          </div>
          <div className="header-subtitle" style={{ fontFamily: "var(--sans)", fontSize: ".78rem", fontWeight: 500, color: "var(--t2)", letterSpacing: ".06em", lineHeight: 1, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Bourse de Casablanca &amp; World Markets
          </div>
        </div>
      </div>

      {/* Right cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: isMob ? 8 : 14, flexShrink: 0 }}>
        {/* LIVE pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--upg)", border: "1px solid rgba(0,200,83,.2)", borderRadius: 20, padding: "4px 10px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--up)", animation: "pulse-dot 2s ease infinite", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: ".70rem", color: "var(--up)", fontWeight: 600, letterSpacing: ".06em" }}>LIVE</span>
        </div>
        {/* Clock — desktop only */}
        {!isMob && (
          <div style={{ textAlign: "right" }}>
            <LiveClock />
            <div style={{ fontFamily: "var(--mono)", fontSize: ".66rem", color: "var(--t3)", marginTop: 2 }}>Casablanca</div>
          </div>
        )}
        {/* Session badge */}
        <div className={session.open ? "session-open" : "session-closed"}>
          {session.open ? "⬤ " : "○ "}{isMob ? (session.open ? "Open" : "Closed") : session.label}
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------
   NAV TABS  (desktop scrollable strip + mobile drawer)
------------------------------------------------------------- */
function NavTabs({ activeTab, setActiveTab }) {
  const isMob = useIsMobile();
  const [open, setOpen] = useState(false);
  const activeLabel = TABS.find(t => t.key === activeTab)?.label || activeTab;

  if (isMob) {
    return (
      <>
        {/* Mobile nav bar — shows active tab + hamburger */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 14px", height: 46,
          background: "var(--s1)", borderBottom: "1px solid var(--bd)",
          position: "relative", zIndex: 1,
        }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: ".92rem", fontWeight: 600, color: "var(--gold)" }}>
            {activeLabel}
          </span>
          <button onClick={() => setOpen(o => !o)} style={{
            display: "flex", flexDirection: "column", gap: 5, padding: "8px 4px",
            background: "none", border: "none",
          }}>
            {open
              ? <span style={{ fontSize: "1.1rem", color: "var(--t2)", lineHeight: 1 }}>✕</span>
              : [0,1,2].map(i => <div key={i} style={{ width: 22, height: 2, background: "var(--t2)", borderRadius: 2 }} />)
            }
          </button>
        </div>
        {/* Drawer */}
        {open && (
          <div className="mob-nav-drawer" style={{ position: "relative", zIndex: 1 }}>
            {TABS.map(t => (
              <button key={t.key} className={`mob-tab-btn${activeTab === t.key ? " active" : ""}`}
                onClick={() => { setActiveTab(t.key); setOpen(false); }}>
                {t.label}
                {activeTab === t.key && <span style={{ marginLeft: "auto", fontSize: ".8rem", color: "var(--gold)" }}>●</span>}
              </button>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <nav style={{
      background: "var(--s1)", borderBottom: "1px solid var(--bd)",
      position: "relative", zIndex: 1,
      display: "flex", alignItems: "center",
      padding: "0 16px",
    }}>
      <div style={{ display: "flex", overflowX: "auto", gap: 0, flex: 1 }} className="hide-scroll">
        {TABS.map(t => (
          <button key={t.key}
            className={`tab-btn${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
            style={{
              flexShrink: 0,
              fontFamily: "var(--sans)", fontSize: ".82rem", fontWeight: 500,
              color: "var(--t2)", background: "none",
              border: "1px solid transparent", borderRadius: 7,
              padding: "0 14px", height: 36, margin: "6px 3px",
              whiteSpace: "nowrap", letterSpacing: ".01em",
              transition: "color .15s, background .15s, border-color .15s",
            }}>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------
   MARKET SUMMARY BAR  (Drahmi-style top summary)
------------------------------------------------------------- */
function MarketSummaryBar({ data }) {
  const allItems = useMemo(() => {
    const arr = [];
    Object.values(data).forEach(v => Array.isArray(v) && v.forEach(i => i?.change != null && arr.push(i)));
    return arr;
  }, [data]);

  const gainers   = allItems.filter(i => Number(i.change) > 0).length;
  const losers    = allItems.filter(i => Number(i.change) < 0).length;
  const unchanged = allItems.filter(i => Number(i.change) === 0).length;
  const masi      = data["GLOBAL INDICES"]?.find(x => x.id === "MASI") ||
                    data["FEATURED MARKET BOXES"]?.[0] || null;

  if (!allItems.length) return null;

  return (
    <div className="summary-bar-grid fade-up" style={{
      display: "grid",
      gridTemplateColumns: masi ? "180px 1fr 1fr auto auto auto" : "1fr 1fr auto auto auto",
      gap: 0,
      background: "var(--s1)",
      border: "1px solid var(--bd)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* MASI mini */}
      {masi && (
        <div className="summary-bar-masi" style={{
          padding: "12px 16px",
          borderRight: "1px solid var(--bd)",
          display: "flex", flexDirection: "column", gap: 6,
          background: "linear-gradient(135deg, rgba(0,200,83,.06) 0%, transparent 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--up)", animation: "pulse-dot 2s ease infinite" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--t2)", letterSpacing: ".08em" }}>MASI</span>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "1.1rem", fontWeight: 700, color: "#fff", letterSpacing: ".01em" }}
            className="masi-glow">
            {fv(Number(masi.value))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge change={masi.change} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Spark series={masi.series} up={isUp(masi.change)} w={80} h={22} />
            </div>
          </div>
        </div>
      )}

      {/* Volume */}
      <div className="summary-bar-vol" style={{ padding: "12px 18px", borderRight: "1px solid var(--bd)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)", letterSpacing: ".1em", textTransform: "uppercase" }}>Volume</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".95rem", fontWeight: 600, color: "#fff" }}>536M</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)" }}>MAD · Today</div>
      </div>

      {/* Market Cap */}
      <div style={{ padding: "12px 18px", borderRight: "1px solid var(--bd)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)", letterSpacing: ".1em", textTransform: "uppercase" }}>Market Cap</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".95rem", fontWeight: 600, color: "#fff" }}>947B</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)" }}>MAD · CSE</div>
      </div>

      {/* Gainers */}
      <div style={{ padding: "12px 18px", borderRight: "1px solid var(--bd)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)", letterSpacing: ".1em" }}>GAINERS</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "1.4rem", fontWeight: 700, color: "var(--up)", lineHeight: 1 }}>{gainers}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "#5a7a5a" }}>▲ rising</div>
      </div>

      {/* Losers */}
      <div style={{ padding: "12px 18px", borderRight: "1px solid var(--bd)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)", letterSpacing: ".1em" }}>LOSERS</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "1.4rem", fontWeight: 700, color: "var(--dn)", lineHeight: 1 }}>{losers}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "#7a5a5a" }}>▼ falling</div>
      </div>

      {/* Unchanged */}
      <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)", letterSpacing: ".1em" }}>UNCHANGED</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "1.4rem", fontWeight: 700, color: "var(--t2)", lineHeight: 1 }}>{unchanged}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t3)" }}>— flat</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   STAT STRIP  (4 hero numbers)
------------------------------------------------------------- */
/* -------------------------------------------------------------
   FEATURED CARDS
------------------------------------------------------------- */
function FeaturedCards({ items }) {
  if (!items?.length) return null;
  return (
    <div className="feat-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
      {items.slice(0, 4).map((item, i) => {
        const u = isUp(item.change);
        const accentColor = u ? "var(--up)" : "var(--dn)";
        return (
          <div key={i} className="feat-card fade-up" style={{
            background: "linear-gradient(160deg, var(--s2) 0%, var(--s1) 100%)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 12, overflow: "hidden",
            position: "relative",
          }}>
            {/* top glow line */}
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
            {/* glow orb behind chart */}
            <div style={{
              position: "absolute", bottom: 0, right: 0, width: 80, height: 60,
              background: u ? "radial-gradient(circle, rgba(0,200,83,.08) 0%, transparent 70%)"
                           : "radial-gradient(circle, rgba(255,59,48,.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{ padding: "14px 14px 10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".74rem", color: "var(--t3)", letterSpacing: ".1em" }}>{item.id}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: ".77rem", color: "#8899b0", marginTop: 3, minHeight: 26 }}>{item.name}</div>
                </div>
                <Badge change={item.change} />
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: ".01em" }}>
                {fv(Number(item.value))}
              </div>
              <Spark series={item.series} up={u} w={160} h={40} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------
   HERO CHART CARD
------------------------------------------------------------- */
function HeroChart({ item, label }) {
  const [range, setRange] = useState("1W");
  if (!item) return null;
  const u = isUp(item.change);
  const ranges = ["1D", "1W", "1M", "3M", "1Y", "All"];
  return (
    <div className="fade-up" style={{
      background: "linear-gradient(160deg, var(--s2) 0%, var(--s1) 100%)",
      border: "1px solid var(--bd)", borderRadius: 14, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,.3)",
      position: "relative",
    }}>
      {/* ambient glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 300, height: 120,
        background: u ? "radial-gradient(ellipse, rgba(0,200,83,.07) 0%, transparent 70%)"
                      : "radial-gradient(ellipse, rgba(255,59,48,.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,.05)",
        position: "relative",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--up)", animation: "pulse-dot 2s ease infinite" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--t3)", letterSpacing: ".16em", textTransform: "uppercase" }}>
              {label} · {item.id}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span className="hero-chart-price" style={{ fontFamily: "var(--mono)", fontSize: "2.2rem", fontWeight: 700, color: "#fff", letterSpacing: "-.02em", lineHeight: 1 }}>
              {fv(Number(item.value))}
            </span>
            <Badge change={item.change} size="lg" />
          </div>
          <div style={{ fontFamily: "var(--sans)", fontSize: ".78rem", color: "var(--t2)", marginTop: 5 }}>{item.name}</div>
        </div>
        {/* range picker */}
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.05)", borderRadius: 9, padding: 3, border: "1px solid var(--bd)" }}>
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              fontFamily: "var(--mono)", fontSize: ".74rem", fontWeight: 600,
              color: range === r ? "#fff" : "var(--t3)",
              background: range === r ? "rgba(255,255,255,.1)" : "transparent",
              borderRadius: 7, padding: "5px 10px", transition: "all .15s",
              border: range === r ? "1px solid rgba(255,255,255,.15)" : "1px solid transparent",
            }}>{r}</button>
          ))}
        </div>
      </div>
      {/* chart */}
      <div style={{ padding: "16px 8px 12px" }}>
        <Spark series={item.series} up={u} w={900} h={140} thick grid />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   SECTOR BADGE HELPER
------------------------------------------------------------- */
const SECTOR_MAP = {
  ATW:"Banques", BCP:"Banques", BOA:"Banques", CIH:"Banques", CDM:"Banques",
  IAM:"Télécom", MNT:"Télécom",
  MNG:"Mines", OCP:"Industrie", HPS:"Tech",
  LHM:"Immobilier", ADH:"Immobilier", WAA:"Assurance",
  TQM:"Industrie",
};
function getSectorBadge(id) {
  const s = SECTOR_MAP[id] || "";
  const cls = {
    Banques:"badge-banques", Télécom:"badge-telecom", Mines:"badge-industrie",
    Industrie:"badge-industrie", Immobilier:"badge-immobilier", Assurance:"badge-assurance",
    Tech:"badge-accent",
  }[s] || "badge-default";
  return s ? <span className={cls} style={{ fontFamily:"var(--mono)", fontSize:".5rem", padding:"2px 8px", borderRadius:20, whiteSpace:"nowrap" }}>{s}</span> : null;
}

/* -------------------------------------------------------------
   DATA TABLE  (sortable, Drahmi-style)
------------------------------------------------------------- */
function DataTable({ title, items, onSelect, selectedId }) {
  const [sortCol, setSortCol] = useState("change");
  const [sortDir, setSortDir] = useState(-1);

  const sorted = useMemo(() => {
    if (!items?.length) return [];
    return [...items].sort((a, b) => {
      const av = Number(a[sortCol] ?? 0), bv = Number(b[sortCol] ?? 0);
      return (bv - av) * sortDir;
    });
  }, [items, sortCol, sortDir]);

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d * -1);
    else { setSortCol(col); setSortDir(-1); }
  }

  if (!items?.length) return null;

  const thStyle = (col, right) => ({
    fontFamily: "var(--sans)", fontSize: ".78rem", letterSpacing: ".04em",
    color: sortCol === col ? "var(--up)" : "var(--t2)",
    padding: "10px 14px", textAlign: right ? "right" : "left",
    background: "var(--s2)", borderBottom: "1px solid var(--bd)",
    cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
    textTransform: "uppercase", fontWeight: 600,
  });

  return (
    <div style={{
      background: "var(--s1)", border: "1px solid var(--bd)",
      borderRadius: 14, overflow: "hidden",
    }}>
      {/* header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "11px 16px", borderBottom: "1px solid var(--bd)",
        background: "linear-gradient(90deg, rgba(255,255,255,.03) 0%, transparent 100%)",
      }}>
        <span style={{ fontFamily: "var(--sans)", fontSize: ".95rem", fontWeight: 700, color: "#fff", letterSpacing: ".01em" }}>{title}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)", background: "rgba(255,255,255,.08)", borderRadius: 20, padding: "2px 10px" }}>{items.length} assets</span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle(null, false), width: 36, paddingRight: 0 }}>#</th>
            <th onClick={() => toggleSort("id")} style={thStyle("id", false)}>Name {sortCol==="id"?(sortDir<0?"↓":"↑"):""}</th>
            <th style={{ ...thStyle(null, false) }} className="desktop-only">Sector</th>
            <th onClick={() => toggleSort("value")} style={thStyle("value", true)}>Price {sortCol==="value"?(sortDir<0?"↓":"↑"):""}</th>
            <th style={{ ...thStyle(null, true) }}>Chart</th>
            <th onClick={() => toggleSort("change")} style={thStyle("change", true)}>24h {sortCol==="change"?(sortDir<0?"↓":"↑"):""}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, i) => {
            const u = isUp(item.change);
            const sel = selectedId === item.id;
            const initials = (item.id || "").slice(0, 3).toUpperCase();
            return (
              <tr key={i} className="row-hover"
                onClick={() => onSelect(sel ? null : item)}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,.04)",
                  cursor: "pointer",
                  background: sel ? "rgba(0,200,83,.05)" : "transparent",
                  transition: "background .1s",
                }}>
                {/* # */}
                <td style={{ padding: "12px 6px 12px 14px", fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--t2)", textAlign: "center" }}>{i + 1}</td>
                {/* Name */}
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: item.symbol ? "1.1rem" : ".62rem",
                      fontFamily: item.symbol ? "inherit" : "var(--mono)",
                      fontWeight: 700, color: "#fff",
                      background: `linear-gradient(135deg, ${u ? "rgba(0,200,83,.25)" : "rgba(255,59,48,.2)"}, ${u ? "rgba(0,200,83,.1)" : "rgba(255,59,48,.08)"})`,
                      border: `1px solid ${u ? "rgba(0,200,83,.25)" : "rgba(255,59,48,.2)"}`,
                      boxShadow: u ? "0 0 8px rgba(0,200,83,.15)" : "0 0 8px rgba(255,59,48,.12)",
                    }}>{item.symbol || initials}</div>
                    <div>
                      <div style={{ fontFamily: "var(--sans)", fontSize: ".92rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{item.id}</div>
                      <div style={{ fontFamily: "var(--sans)", fontSize: ".78rem", color: "var(--t2)", marginTop: 3, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    </div>
                  </div>
                </td>
                {/* Sector badge — desktop only */}
                <td className="desktop-only" style={{ padding: "12px 14px" }}>{getSectorBadge(item.id)}</td>
                {/* Price */}
                <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "var(--mono)", fontSize: ".88rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                  {fv(Number(item.value))}
                  <span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--t2)", marginLeft: 4 }}>MAD</span>
                </td>
                {/* Sparkline */}
                <td style={{ padding: "12px 14px", textAlign: "right", width: 96 }}>
                  <Spark series={item.series} up={u} w={84} h={30} />
                </td>
                {/* 24h change */}
                <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <span style={{
                    fontFamily: "var(--mono)", fontSize: ".84rem", fontWeight: 700,
                    color: u ? "#00e676" : "#ff5252",
                  }}>
                    {u ? "▲" : "▼"} {fc(item.change)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------
   DETAIL PANEL
------------------------------------------------------------- */
function DetailPanel({ item, onClose }) {
  if (!item) return null;
  const u = isUp(item.change);
  const s = item.series || [];
  const stats = [
    { l: "Open",    v: s[0] != null ? fv(s[0]) : "—" },
    { l: "Current", v: fv(Number(item.value)) },
    { l: "7D Low",  v: s.length ? fv(Math.min(...s)) : "—" },
    { l: "7D High", v: s.length ? fv(Math.max(...s)) : "—" },
  ];
  return (
    <div style={{ background: "var(--s1)", border: "1px solid var(--bd)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid var(--bd)", background: "var(--goldb)" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".1em", color: "var(--gold)" }}>{item.id}</span>
        <button onClick={onClose} style={{ background: "none", color: "var(--t3)", fontSize: "1rem", lineHeight: 1, padding: 2 }}>✕</button>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontFamily: "var(--sans)", fontSize: ".76rem", color: "var(--t3)", marginBottom: 8 }}>{item.name}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "1.7rem", fontWeight: 500, color: "var(--t1)", letterSpacing: "-.01em", lineHeight: 1, marginBottom: 8 }}>{fv(Number(item.value))}</div>
        <Badge change={item.change} size="md" />
        <div style={{ marginTop: 14, background: "var(--s2)", borderRadius: 8, padding: "10px 6px" }}>
          <Spark series={s} up={u} w={200} h={80} thick grid />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
          {stats.map(st => (
            <div key={st.l} style={{ background: "var(--s2)", borderRadius: 7, padding: "9px 11px" }}>
              <div style={{ fontFamily: "var(--sans)", fontSize: ".78rem", color: "var(--t3)", marginBottom: 4 }}>{st.l}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".82rem", fontWeight: 500, color: "var(--t1)" }}>{st.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   WATCHLIST WIDGET
------------------------------------------------------------- */
function Watchlist({ title, items, selectedId, onSelect }) {
  if (!items?.length) return null;
  return (
    <div style={{ background: "var(--s1)", border: "1px solid var(--bd)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px", borderBottom: "1px solid var(--bd)",
        background: "linear-gradient(90deg, rgba(255,255,255,.03) 0%, transparent 100%)",
      }}>
        <span style={{ fontFamily: "var(--sans)", fontSize: ".92rem", fontWeight: 700, color: "#fff" }}>{title}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)", background: "rgba(255,255,255,.08)", borderRadius: 20, padding: "2px 8px" }}>{items.length}</span>
      </div>
      {items.map((item, i) => {
        const u = isUp(item.change);
        const sel = selectedId === item.id;
        return (
          <div key={i} className="row-hover"
            onClick={() => onSelect(sel ? null : item)}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,.04)",
              background: sel ? "rgba(0,200,83,.06)" : "transparent",
              cursor: "pointer", transition: "background .1s",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: item.symbol ? "1rem" : ".58rem",
                fontFamily: item.symbol ? "inherit" : "var(--mono)",
                fontWeight: 700, color: "#fff",
                background: u ? "rgba(0,200,83,.18)" : "rgba(255,59,48,.15)",
                border: `1px solid ${u ? "rgba(0,200,83,.25)" : "rgba(255,59,48,.2)"}`,
              }}>{item.symbol || (item.id||"").slice(0,3)}</div>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".84rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{item.id}</div>
                <div style={{ fontFamily: "var(--sans)", fontSize: ".76rem", color: "#8899b0", marginTop: 2, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".86rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{fv(Number(item.value))}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: u ? "#00e676" : "#ff5252", marginTop: 2, fontWeight: 700 }}>{u ? "▲" : "▼"} {fc(item.change)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------
   HEATMAP
------------------------------------------------------------- */
function Heatmap({ data }) {
  const items = useMemo(() => {
    const all = [];
    Object.values(data).forEach(v => Array.isArray(v) && v.forEach(i => i?.id && all.push(i)));
    return all;
  }, [data]);
  if (!items.length) return null;
  return (
    <div style={{ background: "var(--s1)", border: "1px solid var(--bd)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid var(--bd)", background: "var(--goldb)" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".74rem", letterSpacing: ".18em", color: "var(--gold)", textTransform: "uppercase" }}>Heatmap</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--t3)" }}>1D Performance</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))", gap: 3, padding: 8 }}>
        {items.map((item, i) => {
          const u = isUp(item.change);
          const abs = Math.abs(Number(item.change));
          const a = Math.min(0.14 + abs * 0.18, 0.7);
          const bg = u ? `rgba(46,204,113,${a})` : `rgba(231,76,60,${a})`;
          return (
            <div key={i} style={{
              background: bg, padding: "9px 4px",
              borderRadius: 7, textAlign: "center",
              cursor: "pointer", transition: "transform .15s, filter .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; e.currentTarget.style.filter = "brightness(1.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.filter = ""; }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".70rem", color: "rgba(255,255,255,.75)", marginBottom: 3 }}>{item.id}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", fontWeight: 700, color: "#fff" }}>{u ? "+" : ""}{Number(item.change).toFixed(2)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   FEAR & GREED  — dual card (Crypto live + Stock computed)
------------------------------------------------------------- */
function fgLabel(score) {
  if (score <= 24) return { label: "Extreme Fear",  color: "#e74c3c" };
  if (score <= 44) return { label: "Fear",           color: "#e67e22" };
  if (score <= 54) return { label: "Neutral",        color: "#c9a84c" };
  if (score <= 74) return { label: "Greed",          color: "#2ecc71" };
  return                  { label: "Extreme Greed",  color: "#27ae60" };
}

// CNN-style half-circle gauge with filled donut arc, needle, tick marks, zone labels
function Gauge({ score, size = 200 }) {
  const cx = size / 2;
  const cy = size * 0.60;
  const R  = size * 0.40;   // outer radius
  const Ri = size * 0.26;   // inner radius

  // Convert percent (0-100) to SVG point on the semicircle
  // 0% = left (180°), 100% = right (0°), measured counterclockwise from right
  function pt(pct, r) {
    const deg = 180 - (pct / 100) * 180; // 0→180°left, 100→0°right
    const rad = (deg * Math.PI) / 180;
    return [cx + Math.cos(rad) * r, cy - Math.sin(rad) * r];
  }

  function arcPath(fromPct, toPct, rO, rI) {
    const [x1, y1] = pt(fromPct, rO);
    const [x2, y2] = pt(toPct,   rO);
    const [x3, y3] = pt(toPct,   rI);
    const [x4, y4] = pt(fromPct, rI);
    const large = (toPct - fromPct) > 50 ? 1 : 0;
    return [
      `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${rO} ${rO} 0 ${large} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
      `A ${rI} ${rI} 0 ${large} 1 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
      `Z`,
    ].join(" ");
  }

  const zones = [
    { from: 0,  to: 25,  color: "#c0392b" },
    { from: 25, to: 45,  color: "#e67e22" },
    { from: 45, to: 55,  color: "#b8960c" },
    { from: 55, to: 75,  color: "#27ae60" },
    { from: 75, to: 100, color: "#1a6e3a" },
  ];

  // Needle
  const needleDeg = 180 - (score / 100) * 180;
  const needleRad = (needleDeg * Math.PI) / 180;
  const needleLen = R * 0.85;
  const nx = cx + Math.cos(needleRad) * needleLen;
  const ny = cy - Math.sin(needleRad) * needleLen;

  const currentZone = zones.find(z => score >= z.from && score <= z.to) || zones[0];

  // Tick marks at 0, 25, 50, 75, 100
  const ticks = [0, 25, 50, 75, 100];
  const svgH = cy + size * 0.08;

  return (
    <svg width={size} height={svgH} viewBox={`0 0 ${size} ${svgH}`} style={{ overflow: "visible" }}>
      {/* Zone arcs */}
      {zones.map((z, i) => (
        <path key={i} d={arcPath(z.from, z.to, R, Ri)} fill={z.color} opacity={0.9} />
      ))}

      {/* Separator lines */}
      {[25, 45, 55, 75].map((pct, i) => {
        const [ox, oy] = pt(pct, R + 1);
        const [ix, iy] = pt(pct, Ri - 1);
        return <line key={i} x1={ox.toFixed(2)} y1={oy.toFixed(2)} x2={ix.toFixed(2)} y2={iy.toFixed(2)}
          stroke="rgba(0,0,0,.6)" strokeWidth={2} />;
      })}

      {/* Tick marks */}
      {ticks.map(pct => {
        const [ox, oy] = pt(pct, R + 7);
        const [ix, iy] = pt(pct, R + 1);
        const [lx, ly] = pt(pct, R + 16);
        const isEdge = pct === 0 || pct === 100;
        return (
          <g key={pct}>
            <line x1={ix.toFixed(2)} y1={iy.toFixed(2)} x2={ox.toFixed(2)} y2={oy.toFixed(2)}
              stroke="rgba(255,255,255,.6)" strokeWidth={isEdge ? 2 : 1.5} />
            <text x={lx.toFixed(2)} y={(ly + 4).toFixed(2)} textAnchor="middle"
              style={{ fontFamily: "var(--mono)", fontSize: size * 0.06, fill: "rgba(255,255,255,.55)" }}>
              {pct}
            </text>
          </g>
        );
      })}

      {/* "Neutral" at top */}
      <text x={cx} y={cy - R - 14} textAnchor="middle"
        style={{ fontFamily: "var(--sans)", fontSize: size * 0.065, fill: "rgba(255,255,255,.45)", fontStyle: "italic" }}>
        Neutral
      </text>

      {/* Extreme Fear / Extreme Greed labels at bottom corners */}
      <text x={pt(0, Ri - 4)[0] + 4} y={cy + size * 0.05} textAnchor="middle"
        style={{ fontFamily: "var(--sans)", fontSize: size * 0.058, fontWeight: 700, fill: "#c0392b" }}>
        Extreme
      </text>
      <text x={pt(0, Ri - 4)[0] + 4} y={cy + size * 0.05 + size * 0.065} textAnchor="middle"
        style={{ fontFamily: "var(--sans)", fontSize: size * 0.058, fontWeight: 700, fill: "#c0392b" }}>
        Fear
      </text>
      <text x={pt(100, Ri - 4)[0] - 4} y={cy + size * 0.05} textAnchor="middle"
        style={{ fontFamily: "var(--sans)", fontSize: size * 0.058, fontWeight: 700, fill: "#1a6e3a" }}>
        Extreme
      </text>
      <text x={pt(100, Ri - 4)[0] - 4} y={cy + size * 0.05 + size * 0.065} textAnchor="middle"
        style={{ fontFamily: "var(--sans)", fontSize: size * 0.058, fontWeight: 700, fill: "#1a6e3a" }}>
        Greed
      </text>

      {/* Needle shadow */}
      <line x1={cx + 1} y1={cy + 1} x2={(nx + 1).toFixed(2)} y2={(ny + 1).toFixed(2)}
        stroke="rgba(0,0,0,.5)" strokeWidth={3.5} strokeLinecap="round" />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx.toFixed(2)} y2={ny.toFixed(2)}
        stroke="#e0e0e0" strokeWidth={2.8} strokeLinecap="round" />
      {/* Pivot */}
      <circle cx={cx} cy={cy} r={size * 0.052} fill="#555" stroke="rgba(255,255,255,.25)" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={size * 0.028} fill={currentZone.color} />

      {/* Score number */}
      <text x={cx} y={cy - size * 0.07} textAnchor="middle"
        style={{ fontFamily: "var(--mono)", fontSize: size * 0.15, fontWeight: 700, fill: currentZone.color }}>
        {score}
      </text>
    </svg>
  );
}

function FearGreedCard({ marketData }) {
  const [cryptoFG, setCryptoFG] = useState(null);
  const [cryptoLoading, setCryptoLoading] = useState(true);

  useEffect(() => {
    setCryptoLoading(true);
    fetch("https://api.alternative.me/fng/?limit=1")
      .then(r => r.json())
      .then(json => {
        const val = Number(json?.data?.[0]?.value);
        if (Number.isFinite(val)) setCryptoFG(val);
      })
      .catch(() => setCryptoFG(62))
      .finally(() => setCryptoLoading(false));
  }, []);

  const stockFG = useMemo(() => {
    const items = [];
    Object.values(marketData).forEach(v =>
      Array.isArray(v) && v.forEach(i => i?.change != null && items.push(Number(i.change)))
    );
    if (!items.length) return 50;
    const avg     = items.reduce((s, v) => s + v, 0) / items.length;
    const ups     = items.filter(v => v > 0).length;
    const breadth = (ups / items.length) * 100;
    const momentum = Math.min(Math.max(50 + avg * 6, 0), 100);
    return Math.round((momentum + breadth) / 2);
  }, [marketData]);

  const cFG   = cryptoLoading ? 50 : (cryptoFG ?? 50);
  const sFG   = stockFG;
  const cInfo = fgLabel(cFG);
  const sInfo = fgLabel(sFG);

  const ZONES = [
    { range: "0",   label: "Extreme Fear", color: "#c0392b" },
    { range: "25",  label: "Fear",         color: "#e67e22" },
    { range: "50",  label: "Neutral",      color: "#c9a84c" },
    { range: "75",  label: "Greed",        color: "#27ae60" },
    { range: "100", label: "Extreme Greed",color: "#1a8a3a" },
  ];

  const GaugePanel = ({ title, flag, score, info, subtitle, loading }) => (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "flex-start",
      padding: "20px 24px 16px", flex: 1,
    }}>
      {/* Title */}
      <div style={{ fontFamily: "var(--sans)", fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 2 }}>
        {flag} {title}
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: ".76rem", color: "var(--t2)", marginBottom: 12, letterSpacing: ".08em" }}>
        What emotion is driving the market now?
      </div>

      <div className="gauge-panel-inner" style={{ display: "flex", alignItems: "flex-start", gap: 24, width: "100%" }}>
        {/* Left — gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Now label */}
          <div style={{ fontFamily: "var(--sans)", fontSize: ".62rem", color: "var(--t2)", marginBottom: 4, alignSelf: "flex-start" }}>
            Now:
          </div>
          <div style={{ fontFamily: "var(--sans)", fontSize: ".88rem", fontWeight: 700, color: info.color, marginBottom: 8, alignSelf: "flex-start" }}>
            {info.label}
          </div>
          {loading ? (
            <div style={{ width: 200, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: 28, height: 28, animation: "spin 1.2s linear infinite" }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--bd)" strokeWidth="2.5"/>
                <circle cx="12" cy="12" r="10" stroke="var(--gold)" strokeWidth="2.5" strokeDasharray="16 47" strokeLinecap="round"/>
              </svg>
            </div>
          ) : (
            <Gauge score={score} size={200} />
          )}
          <div style={{ fontFamily: "var(--mono)", fontSize: ".76rem", color: "var(--t2)", marginTop: 6 }}>{subtitle}</div>
        </div>

        {/* Right — zone legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 28, flex: 1 }}>
          {ZONES.map(z => (
            <div key={z.range} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "5px 10px",
              borderRadius: 6,
              background: info.label === z.label ? `${z.color}22` : "transparent",
              border: `1px solid ${info.label === z.label ? z.color + "55" : "transparent"}`,
            }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: ".6rem", color: "rgba(255,255,255,.35)", width: 24 }}>{z.range}</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
              <span style={{
                fontFamily: "var(--sans)", fontSize: ".78rem", fontWeight: info.label === z.label ? 700 : 400,
                color: info.label === z.label ? z.color : "rgba(255,255,255,.4)",
              }}>{z.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      background: "var(--s1)", border: "1px solid var(--bd)",
      borderRadius: 12, overflow: "hidden",
    }}>
      {/* header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "9px 16px", borderBottom: "1px solid var(--bd)",
        background: "var(--goldb)",
      }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".74rem", letterSpacing: ".18em", color: "var(--gold)", textTransform: "uppercase" }}>
          Fear &amp; Greed Index
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)" }}>Live · Updated daily</span>
      </div>

      {/* two panels side by side */}
      <div className="fear-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <GaugePanel
          title="Casablanca Market" flag="🇲🇦"
          score={sFG} info={sInfo}
          subtitle="CSE · Breadth + Momentum"
        />
        <div style={{ borderLeft: "1px solid var(--bd)" }}>
          <GaugePanel
            title="Crypto Market" flag="₿"
            score={cFG} info={cInfo}
            subtitle="alt.me · BTC/ETH sentiment"
            loading={cryptoLoading}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   STATIC NEWS  (sidebar)
------------------------------------------------------------- */
const NEWS = [
  { time: "14:42", title: "Bank Al-Maghrib holds benchmark rate steady at 2.75%",       tag: "BAM",  hot: true  },
  { time: "14:18", title: "Attijariwafa Bank reports +12% net profit growth in Q1 2026", tag: "ATW",  hot: false },
  { time: "13:55", title: "Maroc Telecom launches new 5G offering in Casablanca",        tag: "IAM",  hot: false },
  { time: "13:30", title: "MASI crosses 13,800 pts — 4-month high on CSE",              tag: "MASI", hot: true  },
  { time: "12:48", title: "HPS wins sub-Saharan Africa payment processing contract",     tag: "HPS",  hot: false },
];

function NewsWidget() {
  return (
    <div style={{ background: "var(--s1)", border: "1px solid var(--bd)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid var(--bd)", background: "var(--goldb)" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".74rem", letterSpacing: ".14em", color: "var(--gold)", textTransform: "uppercase" }}>News</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--up)", background: "var(--upf)", borderRadius: 3, padding: "1px 5px" }}>LIVE</span>
      </div>
      {NEWS.map((n, i) => (
        <div key={i} className="row-hover" style={{ padding: "9px 13px", borderBottom: "1px solid var(--bd2)", cursor: "pointer" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--t2)" }}>{n.time}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".66rem", color: "var(--gold)", background: "var(--goldf)", borderRadius: 3, padding: "1px 5px" }}>{n.tag}</span>
            {n.hot && <span style={{ fontFamily: "var(--mono)", fontSize: ".66rem", color: "var(--up)", background: "var(--upf)", borderRadius: 3, padding: "1px 5px" }}>↑ Hot</span>}
          </div>
          <div style={{ fontFamily: "var(--sans)", fontSize: ".76rem", color: "var(--t1)", lineHeight: 1.45 }}>{n.title}</div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------
   CALENDAR  (sidebar)
------------------------------------------------------------- */
const CALENDAR = [
  { time: "15:30", event: "🇺🇸 US PPI (March)",       imp: 3 },
  { time: "16:00", event: "🇲🇦 BAM Reserves",         imp: 2 },
  { time: "18:00", event: "🇺🇸 EIA Oil Stocks",       imp: 2 },
  { time: "Thu",   event: "🇪🇺 ECB Rate Decision",    imp: 3 },
  { time: "Fri",   event: "🇺🇸 NFP Jobs Report",      imp: 3 },
];

function CalWidget() {
  return (
    <div style={{ background: "var(--s1)", border: "1px solid var(--bd)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid var(--bd)", background: "var(--goldb)" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".74rem", letterSpacing: ".14em", color: "var(--gold)", textTransform: "uppercase" }}>Economic Calendar</span>
      </div>
      {CALENDAR.map((r, i) => {
        const col = r.imp === 3 ? "var(--dn)" : r.imp === 2 ? "#ff9f0a" : "var(--t3)";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 13px", borderBottom: "1px solid var(--bd2)" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--t3)", minWidth: 34, flexShrink: 0 }}>{r.time}</span>
            <span style={{ fontFamily: "var(--sans)", fontSize: ".76rem", color: "var(--t1)", flex: 1 }}>{r.event}</span>
            <span style={{ color: col, fontSize: ".62rem", letterSpacing: 1 }}>{"●".repeat(r.imp)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------
   LOADER
------------------------------------------------------------- */
function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, flexDirection: "column", gap: 14 }}>
      <svg style={{ width: 36, height: 36, animation: "spin 1.4s linear infinite" }} viewBox="0 0 38 38" fill="none">
        <circle cx="19" cy="19" r="16" stroke="rgba(201,168,76,.12)" strokeWidth="3" />
        <circle cx="19" cy="19" r="16" stroke="var(--gold)" strokeWidth="3" strokeDasharray="28 76" strokeLinecap="round" />
      </svg>
      <div style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--t3)", letterSpacing: ".1em" }}>Loading markets…</div>
    </div>
  );
}

/* -------------------------------------------------------------
   APP (root)
------------------------------------------------------------- */
export default function App() {
  const [tab,          setTab]          = useState("overview");
  const [data,         setData]         = useState({});
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [updatedAt,    setUpdatedAt]    = useState("");
  const [selItem,      setSelItem]      = useState(null);
  // FIX #9: Use a refresh counter — setTab(t=>t) bails out in React 18
  // because the value is identical; incrementing a counter always triggers
  const [refreshToken, setRefreshToken] = useState(0);

  // FIX #10: Guard against duplicate <style> tags (StrictMode double-invoke,
  // hot reload). Use a data attribute as a sentinel.
  useEffect(() => {
    if (document.querySelector("style[data-maroc-bourse]")) return;
    const tag = document.createElement("style");
    tag.setAttribute("data-maroc-bourse", "1");
    tag.textContent = GLOBAL_CSS;
    document.head.prepend(tag);
    // NOTE: intentionally NOT removing on unmount — the styles are global and
    // should persist. Removing them causes a flash on every re-render.
  }, []);

  // Fetch on tab change OR refresh tick
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(""); setData({}); setSelItem(null);
    const apiTab = ["usa","europe","gcc","asia"].includes(tab) ? "indices" : tab;
    fetch(`/api/market?tab=${apiTab}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => { if (!cancelled) { setData(json || {}); setUpdatedAt(new Date().toLocaleTimeString("fr-FR")); } })
      .catch(e  => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, refreshToken]); // FIX #9: refreshToken in deps — always triggers re-fetch

  // FIX #9: Auto-refresh every 60s using refreshToken counter
  useEffect(() => {
    const id = setInterval(() => setRefreshToken(n => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // Data slices — all wrapped in useMemo to satisfy react-hooks/exhaustive-deps
  const fx          = useMemo(() => data["FX / MAD"]               || [], [data]);
  const crypto      = useMemo(() => data["LARGE CAP"] || data["CRYPTO"] || [], [data]);
  const banks       = useMemo(() => data["BANKS"]                   || [], [data]);
  const industry    = useMemo(() => data["INDUSTRY / MATERIALS"]    || [], [data]);
  const telecom     = useMemo(() => data["TELECOM / UTILITIES"]     || [], [data]);
  const indices     = useMemo(() => data["GLOBAL INDICES"]          || [], [data]);
  const usaStocks   = useMemo(() => data["USA STOCKS"]              || [], [data]);
  const eurStocks   = useMemo(() => data["EUROPE STOCKS"]           || [], [data]);
  const gccStocks   = useMemo(() => data["GCC STOCKS"]              || [], [data]);
  const asiaStocks  = useMemo(() => data["ASIA STOCKS"]             || [], [data]);
  const featured    = useMemo(() => data["FEATURED MARKET BOXES"]   || [], [data]);

  const tickerItems = useMemo(() =>
    [...fx.slice(0,3), ...crypto.slice(0,2), ...indices.slice(0,2), ...banks.slice(0,2)].filter(i=>i?.id)
  , [fx, crypto, indices, banks]);

  // Tab-aware hero item — show something relevant to the current tab,
  // not always MASI. Overview and Morocco show MASI; other tabs use
  // their own first item so the hero chart reflects what you're looking at.
  const heroItem = useMemo(() => {
    if (tab === "overview" || tab === "morocco") {
      return indices.find(x => x.id === "MASI") || banks[0] || null;
    }
    if (tab === "currencies") return fx[0] || null;
    if (tab === "crypto")     return crypto[0] || null;
    if (tab === "commodities") return (data["COMMODITIES"] || [])[0] || null;
    if (tab === "bonds")      return (data["MOROCCO BONDS"] || [])[0] || null;
    if (tab === "indices")    return indices[0] || null;
    if (tab === "usa")        return usaStocks[0] || null;
    if (tab === "europe")     return eurStocks[0] || null;
    if (tab === "gcc")        return gccStocks[0] || null;
    if (tab === "asia")       return asiaStocks[0] || null;
    return null;
  }, [tab, indices, banks, fx, crypto, data, usaStocks, eurStocks, gccStocks, asiaStocks]);

  const tabLabel = TABS.find(t => t.key === tab)?.label || tab;

  // Left sidebar items
  const leftItems = useMemo(() => [...banks, ...telecom, ...industry].filter(i=>i?.id), [banks, telecom, industry]);

  // All sections for non-overview tabs — each tab shows its own sections
  const allSections = useMemo(() => {
    const skip = new Set(["FEATURED MARKET BOXES"]);
    if (tab === "usa")    return [["USA STOCKS",    usaStocks]].filter(([,v]) => v.length);
    if (tab === "europe") return [["EUROPE STOCKS", eurStocks]].filter(([,v]) => v.length);
    if (tab === "gcc")    return [["GCC STOCKS",    gccStocks]].filter(([,v]) => v.length);
    if (tab === "asia")   return [["ASIA STOCKS",   asiaStocks]].filter(([,v]) => v.length);
    return Object.entries(data).filter(([k, v]) => !skip.has(k) && Array.isArray(v) && v.length > 0);
  }, [data, tab, usaStocks, eurStocks, gccStocks, asiaStocks]);

  const handleSelect = useCallback(item => setSelItem(item), []);

  return (
    <div style={{ background: "var(--bg)", color: "var(--t1)", minHeight: "100vh", backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(0,200,83,.04) 0%, transparent 60%)" }}>

      {/* -- STICKY HEADER WRAPPER — single sticky unit, no top-math -- */}
      <div style={{ position: "sticky", top: 0, zIndex: 700 }}>
        <ZelligeBand />
        <Ticker items={tickerItems.length ? tickerItems : [{ id: "MASI", value: 0, change: 0 }]} />
        <Header updatedAt={updatedAt} />
        <WorldClockBar />
        <NavTabs activeTab={tab} setActiveTab={setTab} />
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: "10px 20px",
          background: "rgba(231,76,60,.07)", borderBottom: "1px solid rgba(231,76,60,.18)",
          fontFamily: "var(--mono)", fontSize: ".66rem", color: "var(--dn)",
        }}>
          ⚠ {error} — check <code style={{ color: "var(--gold)" }}>/api/market?tab={tab}</code>
        </div>
      )}

      {/* Body — layout adapts per tab to avoid empty columns */}
      {loading ? <Loader /> : (() => {
        // Decide which columns exist for this tab
        const hasLeftSidebar  = tab === "overview" || tab === "morocco" ||
          (["indices","usa","europe","gcc","asia"].includes(tab) && indices.length > 0) ||
          (["currencies","crypto","bonds","commodities"].includes(tab) && leftItems.length > 0);
        const hasRightSidebar = true; // always: news + calendar + detail/watchlist

        const cols = [
          hasLeftSidebar  ? "220px" : "",
          "1fr",
          hasRightSidebar ? "236px" : "",
        ].filter(Boolean).join(" ");

        // -- Sidebar content helpers -------------------------------
        const LeftSidebar = () => {
          if (tab === "overview") {
            // FeaturedCards already shows headline global items — sidebar shows Morocco stocks instead
            return <Watchlist title="Casablanca" items={leftItems.slice(0,10)} selectedId={selItem?.id} onSelect={handleSelect} />;
          }
          if (["indices","usa","europe","gcc","asia"].includes(tab)) {
            return (
              <>
                {leftItems.length > 0 && <Watchlist title="Casablanca" items={leftItems.slice(0,8)} selectedId={selItem?.id} onSelect={handleSelect} />}
                {indices.length > 0   && <Watchlist title="Global Indices" items={indices} selectedId={selItem?.id} onSelect={handleSelect} />}
              </>
            );
          }
          if (tab === "morocco") {
            // Morocco main already has all Morocco sector tables — sidebar shows global context
            return <Watchlist title="Global Context" items={indices.slice(0,8)} selectedId={selItem?.id} onSelect={handleSelect} />;
          }
          if (tab === "currencies") {
            return <Watchlist title="GCC Rates" items={fx.filter(x => ["SAR/MAD","AED/MAD","KWD/MAD","QAR/MAD","BHD/MAD","OMR/MAD"].includes(x.id))} selectedId={selItem?.id} onSelect={handleSelect} />;
          }
          if (tab === "crypto") {
            return <Watchlist title="Stablecoins" items={(data["STABLECOINS"] || [])} selectedId={selItem?.id} onSelect={handleSelect} />;
          }
          if (tab === "bonds") {
            return <Watchlist title="Morocco Bonds" items={(data["MOROCCO BONDS"] || []).slice(0,8)} selectedId={selItem?.id} onSelect={handleSelect} />;
          }
          if (tab === "commodities") {
            return <Watchlist title="Metals" items={(data["COMMODITIES"] || []).filter(x => ["GOLD","SILVER","PLATINUM","PALLADIUM"].includes(x.id))} selectedId={selItem?.id} onSelect={handleSelect} />;
          }
          return null;
        };

        const RightSidebar = () => (
          <>
            {selItem
              ? <DetailPanel item={selItem} onClose={() => setSelItem(null)} />
              : tab === "crypto"
                ? <Watchlist title="DeFi / L2" items={(data["DEFI / LAYER2"] || []).slice(0,6)} selectedId={null} onSelect={handleSelect} />
                : tab === "currencies"
                  ? <Watchlist title="Emerging FX" items={fx.filter(x => ["TRY/MAD","EGP/MAD","TND/MAD","DZD/MAD","BRL/MAD","INR/MAD","ZAR/MAD"].includes(x.id))} selectedId={null} onSelect={handleSelect} />
                  : tab === "bonds"
                    ? <Watchlist title="US Treasuries" items={(data["US / AMERICAS"] || []).slice(0,6)} selectedId={null} onSelect={handleSelect} />
                    : tab === "commodities"
                      ? <Watchlist title="Energy" items={(data["COMMODITIES"] || []).filter(x => ["BRENT","WTI","NGAS","COAL","HEATING","RBOB"].includes(x.id))} selectedId={null} onSelect={handleSelect} />
                      : <Watchlist title="Forex Rates" items={fx.slice(0, 8)} selectedId={null} onSelect={handleSelect} />
            }
            <NewsWidget />
            <CalWidget />
          </>
        );

        // -- Main content per tab ----------------------------------
        const MainContent = () => (
          <>
            {/* -- OVERVIEW -- */}
            {tab === "overview" && <>
              <MarketSummaryBar data={data} />
              {/* FeaturedCards = 4 headline cards (MASI, USD, BTC, top stock). No HeroChart here — would duplicate MASI. */}
              <FeaturedCards items={featured} />
              <FearGreedCard marketData={data} />
              <div className="stats-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {banks.length > 0    && <DataTable title="Banks"    items={banks}           onSelect={handleSelect} selectedId={selItem?.id} />}
                {telecom.length > 0  && <DataTable title="Telecom"  items={telecom}         onSelect={handleSelect} selectedId={selItem?.id} />}
                {industry.length > 0 && <DataTable title="Industry" items={industry}        onSelect={handleSelect} selectedId={selItem?.id} />}
                {fx.length > 0       && <DataTable title="Forex"    items={fx.slice(0, 8)}  onSelect={handleSelect} selectedId={selItem?.id} />}
              </div>
            </>}

            {/* -- MOROCCO -- */}
            {tab === "morocco" && <>
              <MarketSummaryBar data={data} />
              <HeroChart item={heroItem} label="Casablanca" />
              <div className="stats-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {banks.length > 0    && <DataTable title="Banks"               items={banks}    onSelect={handleSelect} selectedId={selItem?.id} />}
                {telecom.length > 0  && <DataTable title="Telecom / Utilities" items={telecom}  onSelect={handleSelect} selectedId={selItem?.id} />}
                {industry.length > 0 && <DataTable title="Industry / Materials"items={industry} onSelect={handleSelect} selectedId={selItem?.id} />}
                {(data["REAL ESTATE / INSURANCE"]||[]).length > 0 && <DataTable title="Real Estate / Insurance" items={data["REAL ESTATE / INSURANCE"]} onSelect={handleSelect} selectedId={selItem?.id} />}
              </div>
              <Heatmap data={data} />
            </>}

            {/* -- INDICES -- */}
            {tab === "indices" && <>
              <HeroChart item={heroItem} label="Indices" />
              {/* Left sidebar already shows Global Indices — main shows per-region breakdowns only */}
              <div className="stats-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <DataTable title="USA"    items={data["USA STOCKS"]    ||[]} onSelect={handleSelect} selectedId={selItem?.id} />
                <DataTable title="Europe" items={data["EUROPE STOCKS"] ||[]} onSelect={handleSelect} selectedId={selItem?.id} />
                <DataTable title="GCC"    items={data["GCC STOCKS"]    ||[]} onSelect={handleSelect} selectedId={selItem?.id} />
                <DataTable title="Asia"   items={data["ASIA STOCKS"]   ||[]} onSelect={handleSelect} selectedId={selItem?.id} />
              </div>
            </>}

            {/* -- USA / EUROPE / GCC / ASIA -- */}
            {["usa","europe","gcc","asia"].includes(tab) && <>
              <HeroChart item={heroItem} label={tabLabel} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                {allSections.map(([title, items]) => (
                  <DataTable key={title} title={title} items={items} onSelect={handleSelect} selectedId={selItem?.id} />
                ))}
              </div>
            </>}

            {/* -- CURRENCIES -- */}
            {tab === "currencies" && <>
              <HeroChart item={heroItem} label="Forex" />
              {/* StatStrip removed — table below already contains those same top pairs */}
              <DataTable title="All FX / MAD Pairs" items={fx} onSelect={handleSelect} selectedId={selItem?.id} />
            </>}

            {/* -- CRYPTO -- */}
            {tab === "crypto" && <>
              <HeroChart item={heroItem} label="Crypto" />
              {/* StatStrip removed — LARGE CAP table below already shows same items */}
              <div className="stats-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {["LARGE CAP","DEFI / LAYER2","MEME / TRENDING","LAYER1 / INFRA"].map(key =>
                  (data[key]||[]).length > 0 &&
                  <DataTable key={key} title={key} items={data[key]} onSelect={handleSelect} selectedId={selItem?.id} />
                )}
              </div>
            </>}

            {/* -- COMMODITIES -- */}
            {tab === "commodities" && <>
              <HeroChart item={heroItem} label="Commodities" />
              {/* StatStrip removed — left sidebar has Metals, right has Energy, table has everything */}
              <DataTable title="All Commodities" items={data["COMMODITIES"]||[]} onSelect={handleSelect} selectedId={selItem?.id} />
            </>}

            {/* -- BONDS -- */}
            {tab === "bonds" && <>
              <HeroChart item={heroItem} label="Bonds" />
              <div className="stats-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {["MOROCCO BONDS","US / AMERICAS","EUROPE","MENA / AFRICA","ASIA / PACIFIC"].map(key =>
                  (data[key]||[]).length > 0 &&
                  <DataTable key={key} title={key} items={data[key]} onSelect={handleSelect} selectedId={selItem?.id} />
                )}
              </div>
            </>}
          </>
        );

        return (
          <div className="body-grid" style={{
            display: "grid",
            gridTemplateColumns: cols,
            alignItems: "start",
            minHeight: "calc(100vh - 278px)",
          }}>
            {/* LEFT SIDEBAR — hidden on mobile via CSS */}
            {hasLeftSidebar && (
              <aside className="left-sidebar-col" style={{
                padding: "12px 10px",
                borderRight: "1px solid var(--bd)",
                display: "flex", flexDirection: "column", gap: 10,
                position: "sticky", top: 12, alignSelf: "start",
                maxHeight: "calc(100vh - 80px)", overflowY: "auto",
              }}>
                <LeftSidebar />
              </aside>
            )}

            {/* MAIN */}
            <main style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
              <MainContent />
            </main>

            {/* RIGHT SIDEBAR — hidden on mobile via CSS */}
            <aside className="right-sidebar-col" style={{
              padding: "12px 10px",
              borderLeft: "1px solid var(--bd)",
              display: "flex", flexDirection: "column", gap: 10,
              position: "sticky", top: 12, alignSelf: "start",
              maxHeight: "calc(100vh - 80px)", overflowY: "auto",
            }}>
              <RightSidebar />
            </aside>
          </div>
        );
      })()}

      {/* Footer */}
      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 20px",
        background: "var(--s1)", borderTop: "1px solid var(--bd)",
        fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--t3)",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--up)", display: "inline-block", animation: "pulse-dot 2s ease infinite" }} />
          Bourse de Casablanca &amp; World Markets · Indicative Data Only
        </span>
        <span>{updatedAt ? `Last Update: ${updatedAt}` : "—"}</span>
        <span>EODHD · Drahmi API · © 2026</span>
      </footer>
    </div>
  );
}
