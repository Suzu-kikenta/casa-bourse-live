import React, { useEffect, useMemo, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES (injected once)
═══════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f1117; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

  @keyframes ticker-slide {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-33.333%); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseGreen {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52,199,89,0.4); }
    50%       { opacity: 0.8; box-shadow: 0 0 0 4px rgba(52,199,89,0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-up { animation: fadeSlideUp 0.35s ease both; }
  .fade-up:nth-child(1) { animation-delay: 0.02s; }
  .fade-up:nth-child(2) { animation-delay: 0.06s; }
  .fade-up:nth-child(3) { animation-delay: 0.10s; }
  .fade-up:nth-child(4) { animation-delay: 0.14s; }
  .fade-up:nth-child(5) { animation-delay: 0.18s; }
  .fade-up:nth-child(6) { animation-delay: 0.22s; }
  .fade-up:nth-child(7) { animation-delay: 0.26s; }

  .stock-row:hover { background: rgba(255,255,255,0.04) !important; }
  .stock-row.active-row { background: rgba(255,255,255,0.06) !important; }
  .tab-pill:hover { background: rgba(255,255,255,0.07) !important; color: #fff !important; }
  .tab-pill.active { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
  .nav-btn:hover { color: #fff !important; }
  .nav-btn.active { color: #0d1117 !important; background: #f0c040 !important; border-radius: 6px !important; border-bottom: none !important; }
  .card-hover:hover { border-color: rgba(255,255,255,0.15) !important; background: rgba(255,255,255,0.03) !important; }
  .btn-ghost:hover { background: rgba(255,255,255,0.08) !important; }
`;

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════ */
const C = {
  bg:       "#0f1117",
  surface:  "#161b27",
  surface2: "#1c2333",
  surface3: "#232d42",
  border:   "rgba(255,255,255,0.08)",
  border2:  "rgba(255,255,255,0.05)",
  text:     "#e8eaf0",
  text2:    "#8b95a8",
  text3:    "#5a6478",
  gold:     "#c9a84c",
  gold2:    "#e8c97a",
  goldfade: "rgba(201,168,76,0.12)",
  up:       "#34c759",
  upfade:   "rgba(52,199,89,0.12)",
  dn:       "#ff3b30",
  dnfade:   "rgba(255,59,48,0.12)",
  blue:     "#0a84ff",
  bluefade: "rgba(10,132,255,0.12)",
};

const F = {
  sans: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'IBM Plex Mono', monospace",
};

/* ═══════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════ */
const TABS = [
  { key:"overview",    label:"Overview"     },
  { key:"morocco",     label:"Casablanca"   },
  { key:"indices",     label:"Indices"      },
  { key:"usa",         label:"🇺🇸 USA"       },
  { key:"europe",      label:"🇪🇺 Europe"    },
  { key:"gcc",         label:"🌙 GCC"        },
  { key:"asia",        label:"🌏 Asia"       },
  { key:"currencies",  label:"Forex"        },
  { key:"crypto",      label:"Crypto"       },
  { key:"commodities", label:"Commodities"  },
  { key:"bonds",       label:"Bonds"        },
];

const SECTORS = [
  { label:"Banques",     key:"BANKS",                color:"#0a84ff" },
  { label:"Télécom",     key:"TELECOM / UTILITIES",  color:"#34c759" },
  { label:"Industrie",   key:"INDUSTRY / MATERIALS", color:"#ff9f0a" },
  { label:"Energie",     key:"COMMODITIES",           color:"#ff6b35" },
  { label:"Tech",        key:"CRYPTO",               color:"#bf5af2" },
  { label:"Forex",       key:"FX / MAD",             color:"#c9a84c" },
];

const NEWS = [
  { time:"14:42", title:"Bank Al-Maghrib maintient son taux directeur à 2,75%", tag:"BAM", hot:true },
  { time:"14:18", title:"ATW annonce +12% de bénéfice net au T1 2026", tag:"ATW" },
  { time:"13:55", title:"Maroc Telecom lance sa nouvelle offre 5G à Casablanca", tag:"IAM" },
  { time:"13:30", title:"Le MASI franchit les 13 800 pts — plus haut en 4 mois", tag:"MASI", hot:true },
  { time:"12:48", title:"HPS remporte un contrat de paiement numérique en Afrique", tag:"HPS" },
  { time:"12:10", title:"OCP : exportations phosphate +18% au Q1 2026", tag:"OCP" },
];

const CALENDAR = [
  { time:"15:30", event:"🇺🇸 PPI (Mars)", imp:3 },
  { time:"16:00", event:"🇲🇦 Réserves BAM", imp:2 },
  { time:"18:00", event:"🇺🇸 Stocks EIA", imp:2 },
  { time:"Jeu",   event:"🇪🇺 Décision BCE", imp:3 },
  { time:"Ven",   event:"🇺🇸 NFP Emploi",  imp:3 },
];

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function fv(v) {
  if (!Number.isFinite(v)) return "—";
  if (v >= 100000) return v.toLocaleString("fr-FR", { maximumFractionDigits:0 });
  if (v >= 1000)   return v.toLocaleString("fr-FR", { minimumFractionDigits:2, maximumFractionDigits:2 });
  if (v >= 100)    return v.toFixed(2);
  if (v >= 10)     return v.toFixed(3);
  return v.toFixed(4);
}
function fc(c) {
  const n = Number(c ?? 0);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
const up = (c) => Number(c ?? 0) >= 0;

/* ═══════════════════════════════════════════════════
   SPARKLINE SVG
═══════════════════════════════════════════════════ */
let _sparkId = 0;
function Spark({ series, isUp: u, w=80, h=32, thick=false, grid=false, color }) {
  const id = useMemo(() => `sp${_sparkId++}`, []);
  if (!Array.isArray(series) || series.length < 2) return <div style={{width:w,height:h}}/>;
  const mn=Math.min(...series), mx=Math.max(...series), rng=mx-mn||1, pad=2;
  const pts = series.map((v,i) => [
    pad + (i/(series.length-1))*(w-pad*2),
    h-pad-((v-mn)/rng)*(h-pad*2)
  ]);
  const line = pts.map(([x,y],i)=>`${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = [`M${pts[0][0].toFixed(1)},${h}`, ...pts.map(([x,y])=>`L${x.toFixed(1)},${y.toFixed(1)}`), `L${pts[pts.length-1][0].toFixed(1)},${h}`, "Z"].join(" ");
  const clr  = color || (u ? C.up : C.dn);
  const [lx,ly] = pts[pts.length-1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{display:"block",width:"100%",height:h,flexShrink:0}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={clr} stopOpacity={u?0.28:0.2}/>
          <stop offset="100%" stopColor={clr} stopOpacity={0}/>
        </linearGradient>
      </defs>
      {grid && [0.25,0.5,0.75].map(r=>(
        <line key={r} x1={0} y1={h*r} x2={w} y2={h*r} stroke={C.border} strokeWidth={0.5}/>
      ))}
      <path d={area} fill={`url(#${id})`}/>
      <path d={line} fill="none" stroke={clr} strokeWidth={thick?2:1.5} strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lx} cy={ly} r={thick?3:2} fill={clr}/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   CHANGE PILL
═══════════════════════════════════════════════════ */
function Pill({ change, size="sm" }) {
  const u = up(change);
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:3,
      padding: size==="lg" ? "5px 10px" : size==="md" ? "3px 8px" : "2px 6px",
      borderRadius:6,
      fontSize: size==="lg" ? "0.82rem" : size==="md" ? "0.72rem" : "0.65rem",
      fontFamily: F.mono, fontWeight:500,
      color: u ? C.up : C.dn,
      background: u ? C.upfade : C.dnfade,
    }}>
      {u ? "▲" : "▼"} {fc(change)}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   TICKER TAPE
═══════════════════════════════════════════════════ */
function Ticker({ items }) {
  if (!items.length) return null;
  const all = [...items, ...items, ...items];
  return (
    <div style={{
      height:32, overflow:"hidden", display:"flex", alignItems:"center",
      background: C.surface,
      borderBottom:`1px solid ${C.border}`,
      position:"sticky", top:6, zIndex:600,
    }}>
      <div style={{ display:"flex", animation:"ticker-slide 100s linear infinite", whiteSpace:"nowrap" }}>
        {all.map((item, i) => {
          const u = up(item.change);
          return (
            <div key={i} style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"0 20px", height:32,
              fontFamily:F.mono, fontSize:11,
              borderRight:`1px solid ${C.border}`,
            }}>
              <span style={{color:C.text2, fontWeight:500, fontSize:10.5, letterSpacing:"0.04em"}}>{item.id}</span>
              <span style={{color:C.text, fontWeight:500}}>{fv(Number(item.value))}</span>
              <span style={{color: u?C.up:C.dn, fontSize:10}}>{u?"▲":"▼"} {fc(item.change)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   WORLD CLOCK BAR
═══════════════════════════════════════════════════ */
const CLOCKS = [
  { city:"Casablanca", tz:"Africa/Casablanca",  flag:"🇲🇦", open:[9,15]  },
  { city:"Dubai",      tz:"Asia/Dubai",          flag:"🇦🇪", open:[10,14] },
  { city:"Riyadh",     tz:"Asia/Riyadh",         flag:"🇸🇦", open:[10,15] },
  { city:"London",     tz:"Europe/London",        flag:"🇬🇧", open:[8,16]  },
  { city:"Paris",      tz:"Europe/Paris",         flag:"🇫🇷", open:[9,17]  },
  { city:"New York",   tz:"America/New_York",     flag:"🇺🇸", open:[9,16]  },
  { city:"Tokyo",      tz:"Asia/Tokyo",           flag:"🇯🇵", open:[9,15]  },
  { city:"Shanghai",   tz:"Asia/Shanghai",        flag:"🇨🇳", open:[9,15]  },
  { city:"Hong Kong",  tz:"Asia/Hong_Kong",       flag:"🇭🇰", open:[9,16]  },
];

function WorldClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      display:"flex", alignItems:"stretch", overflowX:"auto", scrollbarWidth:"none",
      background:C.surface, borderBottom:`1px solid ${C.border}`,
      position:"sticky", top:38, zIndex:490,
    }}>
      {CLOCKS.map(c => {
        const timeStr = now.toLocaleTimeString("en-GB",{timeZone:c.tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
        const h = parseInt(timeStr.split(":")[0],10) + parseInt(timeStr.split(":")[1],10)/60;
        const day = now.toLocaleDateString("en-GB",{timeZone:c.tz,weekday:"short"});
        const isOpen = !["Sat","Sun"].includes(day) && h >= c.open[0] && h < c.open[1];
        return (
          <div key={c.city} style={{
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            padding:"6px 14px", gap:2, borderRight:`1px solid ${C.border}`,
            flexShrink:0, minWidth:90,
            background: isOpen ? "rgba(0,200,83,.04)" : "transparent",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:11}}>{c.flag}</span>
              <span style={{fontFamily:F.sans,fontSize:"0.65rem",fontWeight:500,color:C.text2}}>{c.city}</span>
            </div>
            <div style={{fontFamily:F.mono,fontSize:"0.82rem",fontWeight:600,color:C.text,letterSpacing:"0.04em"}}>
              {timeStr.slice(0,5)}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:isOpen?"var(--up)":C.text3,flexShrink:0}}/>
              <span style={{fontFamily:F.mono,fontSize:"0.55rem",color:isOpen?"var(--up)":C.text3}}>
                {isOpen?"OPEN":"CLOSED"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HEADER / NAVBAR
═══════════════════════════════════════════════════ */
function Navbar({ activeTab, onTab, updatedAt }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("fr-FR",{timeZone:"Africa/Casablanca",hour12:false}));
    tick(); const id = setInterval(tick,1000); return ()=>clearInterval(id);
  }, []);

  return (
    <nav style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 20px",
      background:C.surface,
      borderBottom:`1px solid ${C.border}`,
      height:52,
      position:"sticky", top:98, zIndex:500,
    }}>
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon points="14,1.5 16.6,10.4 25.8,10.4 18.6,15.8 21.2,24.7 14,19.3 6.8,24.7 9.4,15.8 2.2,10.4 11.4,10.4"
            fill={C.gold} opacity="0.9"/>
        </svg>
        <div>
          <div style={{fontFamily:F.sans,fontSize:"0.85rem",fontWeight:600,color:C.text,letterSpacing:"0.01em",lineHeight:1}}>
            مرصد الأسواق المغربية والعالمية
          </div>
          <div style={{fontFamily:F.mono,fontSize:"0.48rem",color:C.text3,letterSpacing:"0.14em",marginTop:1}}>
            BOURSE DE CASABLANCA
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:2,alignItems:"center",padding:"0 16px",overflowX:"auto",scrollbarWidth:"none"}}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={()=>onTab(tab.key)}
            className={`nav-btn${activeTab===tab.key?" active":""}`}
            style={{
              fontFamily:F.sans, fontSize:"0.8rem", fontWeight:activeTab===tab.key?600:400,
              color: activeTab===tab.key ? "#0d1117" : C.text2,
              background: activeTab===tab.key ? C.gold : "none",
              border:"none",
              borderBottom: activeTab===tab.key ? "none" : "2px solid transparent",
              borderRadius: activeTab===tab.key ? 6 : 0,
              padding:"0 12px", height:52, cursor:"pointer",
              transition:"all 0.15s", whiteSpace:"nowrap",
              display:"flex", alignItems:"center", gap:5,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right cluster */}
      <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        {updatedAt && (
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{
              width:6,height:6,borderRadius:"50%",background:C.up,
              animation:"pulseGreen 2s infinite",
            }}/>
            <span style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.text3}}>{t}</span>
          </div>
        )}
        <button className="btn-ghost" style={{
          fontFamily:F.sans,fontSize:"0.75rem",fontWeight:500,
          color:C.text2, background:"transparent",
          border:`1px solid ${C.border}`,
          borderRadius:8, padding:"6px 14px", cursor:"pointer",
          transition:"background 0.15s",
        }}>Se connecter</button>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════
   INDEX SUMMARY STRIP
═══════════════════════════════════════════════════ */
function IndexStrip({ featured, fx }) {
  const items = useMemo(()=>[...(featured||[]).slice(0,3), ...(fx||[]).slice(0,2)],[featured,fx]);
  if (!items.length) return null;
  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:`repeat(${items.length},1fr)`,
      borderBottom:`1px solid ${C.border}`,
      background:C.surface,
    }}>
      {items.map((item,i)=>{
        const u = up(item.change);
        return (
          <div key={i} style={{
            padding:"12px 18px",
            borderRight: i<items.length-1 ? `1px solid ${C.border}` : "none",
            cursor:"pointer",
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontFamily:F.mono,fontSize:"0.62rem",color:C.text3,letterSpacing:"0.06em",marginBottom:2}}>
                  {item.id}
                </div>
                <div style={{fontFamily:F.mono,fontSize:"1.1rem",fontWeight:500,color:C.text,letterSpacing:"0.02em"}}>
                  {fv(Number(item.value))}
                </div>
              </div>
              <Pill change={item.change} size="sm"/>
            </div>
            <div style={{height:32}}>
              <Spark series={item.series} isUp={u} w={120} h={32}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN CHART HERO
═══════════════════════════════════════════════════ */
function ChartHero({ item, label }) {
  const [range, setRange] = useState("1S");
  if (!item) return null;
  const u = up(item.change);
  const ranges = ["1J","1S","1M","3M","1A","Max"];
  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:12, overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        padding:"18px 22px 14px",
        borderBottom:`1px solid ${C.border}`,
      }}>
        <div>
          <div style={{
            fontFamily:F.mono, fontSize:"0.6rem", fontWeight:500,
            color:C.text3, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6,
          }}>
            {label} · {item.id}
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:12}}>
            <div style={{
              fontFamily:F.mono, fontSize:"2.1rem", fontWeight:600,
              color:C.text, letterSpacing:"-0.01em", lineHeight:1,
            }}>
              {fv(Number(item.value))}
            </div>
            <Pill change={item.change} size="lg"/>
          </div>
          <div style={{
            fontFamily:F.sans, fontSize:"0.72rem", color:C.text3, marginTop:6,
          }}>
            {item.name} · Données indicatives
          </div>
        </div>

        {/* Range picker */}
        <div style={{display:"flex",gap:2,background:C.surface2,borderRadius:8,padding:3}}>
          {ranges.map(r => (
            <button key={r} onClick={()=>setRange(r)}
              style={{
                fontFamily:F.mono, fontSize:"0.62rem", fontWeight:500,
                color: range===r ? C.text : C.text3,
                background: range===r ? C.surface3 : "transparent",
                border:"none", borderRadius:6, padding:"4px 10px",
                cursor:"pointer", transition:"all 0.15s",
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{padding:"16px 4px 8px"}}>
        <Spark series={item.series} isUp={u} w={800} h={140} thick grid/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTOR PILLS ROW
═══════════════════════════════════════════════════ */
function SectorPills({ data, activeSector, onSector }) {
  return (
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <button onClick={()=>onSector(null)}
        className={`tab-pill${!activeSector?" active":""}`}
        style={{
          fontFamily:F.sans, fontSize:"0.75rem", fontWeight:500,
          color: !activeSector ? C.text : C.text2,
          background: !activeSector ? "rgba(255,255,255,0.1)" : "transparent",
          border:`1px solid ${!activeSector ? "rgba(255,255,255,0.15)" : C.border}`,
          borderRadius:20, padding:"5px 14px", cursor:"pointer", transition:"all 0.15s",
        }}>
        Tous
      </button>
      {SECTORS.map(s => {
        const items = data[s.key] || [];
        if (!items.length) return null;
        const avg = items.reduce((a,i)=>a+Number(i.change||0),0)/items.length;
        const u = avg >= 0;
        return (
          <button key={s.key} onClick={()=>onSector(activeSector===s.key?null:s.key)}
            className={`tab-pill${activeSector===s.key?" active":""}`}
            style={{
              fontFamily:F.sans, fontSize:"0.75rem", fontWeight:500,
              color: activeSector===s.key ? C.text : C.text2,
              background: activeSector===s.key ? "rgba(255,255,255,0.1)" : "transparent",
              border:`1px solid ${activeSector===s.key ? "rgba(255,255,255,0.15)" : C.border}`,
              borderRadius:20, padding:"5px 14px", cursor:"pointer", transition:"all 0.15s",
              display:"flex", alignItems:"center", gap:6,
            }}>
            <span style={{
              display:"inline-block", width:6, height:6, borderRadius:"50%",
              background: s.color,
            }}/>
            {s.label}
            <span style={{color: u?C.up:C.dn, fontSize:"0.65rem", fontFamily:F.mono}}>{fc(avg)}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STOCK TABLE
═══════════════════════════════════════════════════ */
function StockTable({ items, activeId, onSelect }) {
  const [sort, setSort] = useState({ col:"change", dir:-1 });

  const sorted = useMemo(()=>{
    return [...items].sort((a,b)=>{
      const av = Number(a[sort.col]||0), bv = Number(b[sort.col]||0);
      return (bv-av)*sort.dir;
    });
  },[items,sort]);

  const maxAbs = useMemo(()=>Math.max(...items.map(i=>Math.abs(Number(i.change||0))),0.01),[items]);

  const handleSort = (col) => {
    setSort(s => s.col===col ? {...s,dir:s.dir*-1} : {col,dir:-1});
  };

  const TH = ({col,children,align="left"}) => (
    <th onClick={()=>handleSort(col)} style={{
      fontFamily:F.sans, fontSize:"0.65rem", fontWeight:500, color:C.text3,
      padding:"8px 12px", textAlign:align, cursor:"pointer",
      borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap",
      userSelect:"none",
    }}>
      {children}
      {sort.col===col && <span style={{marginLeft:4,opacity:0.7}}>{sort.dir<0?"↓":"↑"}</span>}
    </th>
  );

  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <TH col="id">Valeur</TH>
            <TH col="value" align="right">Cours</TH>
            <TH col="change" align="right">Variation</TH>
            <th style={{fontFamily:F.sans,fontSize:"0.65rem",fontWeight:500,color:C.text3,
              padding:"8px 12px",textAlign:"right",borderBottom:`1px solid ${C.border}`}}>
              Amplitude
            </th>
            <th style={{fontFamily:F.sans,fontSize:"0.65rem",fontWeight:500,color:C.text3,
              padding:"8px 12px",textAlign:"right",borderBottom:`1px solid ${C.border}`}}>
              7J
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item,idx)=>{
            const u = up(item.change);
            const barW = (Math.abs(Number(item.change||0))/maxAbs*100).toFixed(1);
            const isActive = activeId===item.id;
            return (
              <tr key={`${item.id}-${idx}`}
                className={`stock-row${isActive?" active-row":""}`}
                onClick={()=>onSelect(item)}
                style={{
                  borderBottom:`1px solid ${C.border2}`,
                  cursor:"pointer", transition:"background 0.1s",
                  background: isActive?"rgba(255,255,255,0.05)":"transparent",
                }}>
                {/* Name */}
                <td style={{padding:"6px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{
                      width:26, height:26, borderRadius:6, flexShrink:0,
                      background:`linear-gradient(135deg,${u?"rgba(52,199,89,0.15)":"rgba(255,59,48,0.15)"},${u?"rgba(52,199,89,0.05)":"rgba(255,59,48,0.05)"})`,
                      border:`1px solid ${u?"rgba(52,199,89,0.2)":"rgba(255,59,48,0.2)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:F.mono, fontSize:"0.55rem", fontWeight:700,
                      color: u?C.up:C.dn,
                    }}>
                      {item.id.slice(0,3)}
                    </div>
                    <div>
                      <div style={{fontFamily:F.sans,fontSize:"0.8rem",fontWeight:500,color:C.text,lineHeight:1}}>
                        {item.id}
                      </div>
                      <div style={{fontFamily:F.sans,fontSize:"0.68rem",color:C.text3,marginTop:2,lineHeight:1,
                        maxWidth:160,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {item.name}
                      </div>
                    </div>
                  </div>
                </td>
                {/* Price */}
                <td style={{padding:"10px 12px",textAlign:"right",
                  fontFamily:F.mono,fontSize:"0.82rem",fontWeight:500,color:C.text}}>
                  {fv(Number(item.value))}
                </td>
                {/* Change */}
                <td style={{padding:"10px 12px",textAlign:"right"}}>
                  <Pill change={item.change}/>
                </td>
                {/* Bar */}
                <td style={{padding:"10px 12px",width:100}}>
                  <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{
                      height:"100%",width:`${barW}%`,borderRadius:4,
                      background: u
                        ? `linear-gradient(90deg,${C.up},rgba(52,199,89,0.5))`
                        : `linear-gradient(90deg,${C.dn},rgba(255,59,48,0.5))`,
                      transition:"width 0.8s ease",
                    }}/>
                  </div>
                </td>
                {/* Spark */}
                <td style={{padding:"6px 12px 6px 4px",width:88}}>
                  <Spark series={item.series} isUp={u} w={80} h={28}/>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DETAIL CARD (right panel, shown on row click)
═══════════════════════════════════════════════════ */
function DetailCard({ item, onClose }) {
  if (!item) return null;
  const u = up(item.change);
  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:12, overflow:"hidden", position:"sticky", top:108,
    }}>
      <div style={{
        display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"14px 16px",
        borderBottom:`1px solid ${C.border}`,
      }}>
        <div style={{fontFamily:F.sans,fontSize:"0.85rem",fontWeight:600,color:C.text}}>
          {item.id}
        </div>
        <button onClick={onClose} style={{
          background:"none",border:"none",color:C.text3,cursor:"pointer",fontSize:"1rem",lineHeight:1,
        }}>✕</button>
      </div>
      <div style={{padding:"16px"}}>
        <div style={{fontFamily:F.sans,fontSize:"0.7rem",color:C.text3,marginBottom:12}}>{item.name}</div>
        <div style={{
          fontFamily:F.mono,fontSize:"1.7rem",fontWeight:600,color:C.text,
          letterSpacing:"-0.01em",lineHeight:1,marginBottom:8,
        }}>{fv(Number(item.value))}</div>
        <Pill change={item.change} size="md"/>

        <div style={{marginTop:16,borderRadius:8,overflow:"hidden",background:C.surface2,padding:"12px 8px"}}>
          <Spark series={item.series} isUp={u} w={240} h={80} thick grid/>
        </div>

        {/* Stats grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
          {[
            {l:"Ouverture",v: item.series?.[0] ? fv(item.series[0]) : "—"},
            {l:"Clôture", v: fv(Number(item.value))},
            {l:"7J Min", v: item.series?.length ? fv(Math.min(...item.series)) : "—"},
            {l:"7J Max", v: item.series?.length ? fv(Math.max(...item.series)) : "—"},
          ].map(s=>(
            <div key={s.l} style={{
              background:C.surface2,borderRadius:8,padding:"10px 12px",
            }}>
              <div style={{fontFamily:F.sans,fontSize:"0.6rem",color:C.text3,marginBottom:4}}>{s.l}</div>
              <div style={{fontFamily:F.mono,fontSize:"0.82rem",fontWeight:500,color:C.text}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MARKET SUMMARY CARDS
═══════════════════════════════════════════════════ */
function SummaryCards({ data }) {
  const items = useMemo(()=>{
    const arr=[];
    Object.values(data).forEach(v=>Array.isArray(v)&&v.forEach(i=>i?.change!=null&&arr.push(i)));
    return arr;
  },[data]);
  if (!items.length) return null;
  const ups   = items.filter(i=>up(i.change)).length;
  const dns   = items.length - ups;
  const best  = items.reduce((a,b)=>Number(b.change)>Number(a.change)?b:a);
  const worst = items.reduce((a,b)=>Number(b.change)<Number(a.change)?b:a);
  const avg   = items.reduce((s,i)=>s+Number(i.change),0)/items.length;

  const cards = [
    { label:"Hausse / Baisse", main:`${ups} / ${dns}`, sub:`sur ${items.length} valeurs`, color:C.up },
    { label:"Meilleure perf.", main:best.id, sub:fc(best.change), color:C.up },
    { label:"Pire perf.",      main:worst.id, sub:fc(worst.change), color:C.dn },
    { label:"Var. moyenne",    main:`${avg>=0?"+":""}${avg.toFixed(2)}%`, color:avg>=0?C.up:C.dn },
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
      {cards.map((c,i)=>(
        <div key={i} className="card-hover fade-up" style={{
          background:C.surface,border:`1px solid ${C.border}`,
          borderRadius:12,padding:"14px 16px",
          transition:"all 0.2s",
        }}>
          <div style={{fontFamily:F.sans,fontSize:"0.68rem",color:C.text3,marginBottom:8}}>{c.label}</div>
          <div style={{fontFamily:F.mono,fontSize:"1.1rem",fontWeight:600,color:c.color,lineHeight:1}}>
            {c.main}
          </div>
          {c.sub && <div style={{fontFamily:F.mono,fontSize:"0.65rem",color:C.text3,marginTop:4}}>{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LEFT SIDEBAR: WATCHLIST-STYLE
═══════════════════════════════════════════════════ */
function Watchlist({ items, activeId, onSelect, title }) {
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{
        padding:"12px 14px",
        borderBottom:`1px solid ${C.border}`,
        fontFamily:F.sans,fontSize:"0.75rem",fontWeight:600,color:C.text,
      }}>{title}</div>
      {items.map((item,i)=>{
        const u=up(item.change), isAct=activeId===item.id;
        return (
          <div key={i} className={`stock-row${isAct?" active-row":""}`}
            onClick={()=>onSelect(item)}
            style={{
              display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"10px 14px",
              borderBottom:`1px solid ${C.border2}`,
              cursor:"pointer",transition:"background 0.1s",
              background:isAct?"rgba(255,255,255,0.05)":"transparent",
            }}>
            <div>
              <div style={{fontFamily:F.sans,fontSize:"0.75rem",fontWeight:500,color:C.text,lineHeight:1}}>
                {item.id}
              </div>
              <div style={{fontFamily:F.sans,fontSize:"0.62rem",color:C.text3,marginTop:2,
                maxWidth:100,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {item.name}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:F.mono,fontSize:"0.72rem",fontWeight:500,color:C.text,lineHeight:1}}>
                {fv(Number(item.value))}
              </div>
              <div style={{fontFamily:F.mono,fontSize:"0.62rem",marginTop:2,color:u?C.up:C.dn}}>
                {u?"▲":"▼"} {fc(item.change)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NEWS PANEL
═══════════════════════════════════════════════════ */
function NewsPanel() {
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{
        padding:"12px 14px",
        borderBottom:`1px solid ${C.border}`,
        fontFamily:F.sans,fontSize:"0.75rem",fontWeight:600,color:C.text,
        display:"flex",justifyContent:"space-between",alignItems:"center",
      }}>
        Actualités
        <span style={{fontFamily:F.mono,fontSize:"0.55rem",color:C.text3}}>LIVE</span>
      </div>
      {NEWS.map((n,i)=>(
        <div key={i} style={{
          padding:"10px 14px",
          borderBottom:`1px solid ${C.border2}`,
          cursor:"pointer",transition:"background 0.1s",
        }}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
        onMouseLeave={e=>e.currentTarget.style.background=""}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
            <span style={{
              fontFamily:F.mono,fontSize:"0.55rem",color:C.text3,
            }}>{n.time}</span>
            <span style={{
              fontFamily:F.mono,fontSize:"0.52rem",
              background:C.goldfade,color:C.gold,
              borderRadius:4,padding:"1px 5px",
            }}>{n.tag}</span>
            {n.hot && <span style={{
              fontFamily:F.mono,fontSize:"0.5rem",
              background:C.upfade,color:C.up,
              borderRadius:4,padding:"1px 5px",
            }}>↑</span>}
          </div>
          <div style={{fontFamily:F.sans,fontSize:"0.72rem",color:C.text,lineHeight:1.45}}>
            {n.title}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CALENDAR PANEL
═══════════════════════════════════════════════════ */
function CalPanel() {
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{
        padding:"12px 14px",
        borderBottom:`1px solid ${C.border}`,
        fontFamily:F.sans,fontSize:"0.75rem",fontWeight:600,color:C.text,
      }}>Calendrier Éco</div>
      {CALENDAR.map((r,i)=>(
        <div key={i} style={{
          display:"flex",alignItems:"center",gap:10,
          padding:"9px 14px",
          borderBottom:`1px solid ${C.border2}`,
        }}>
          <span style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.text3,minWidth:36}}>{r.time}</span>
          <span style={{fontFamily:F.sans,fontSize:"0.7rem",color:C.text,flex:1}}>{r.event}</span>
          <span style={{
            color: r.imp===3?C.dn : r.imp===2?"#ff9f0a":C.text3,
            fontSize:"0.6rem",letterSpacing:2,
          }}>{"●".repeat(r.imp)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HEATMAP
═══════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════
   FEAR & GREED GAUGE
═══════════════════════════════════════════════════ */
function fgZone(score) {
  if (score <= 24) return { label:"Extreme Fear", color:"#e74c3c" };
  if (score <= 44) return { label:"Fear",          color:"#e67e22" };
  if (score <= 54) return { label:"Neutral",       color:"#f0c040" };
  if (score <= 74) return { label:"Greed",         color:"#2ecc71" };
  return              { label:"Extreme Greed",  color:"#00c853" };
}

function Gauge({ score, size=180 }) {
  const cx = size/2, cy = size*0.62, R = size*0.38, Ri = size*0.24;
  const zone = fgZone(score);
  function pt(pct, r) {
    const deg = 180 - (pct/100)*180;
    const rad = deg*Math.PI/180;
    return [cx + Math.cos(rad)*r, cy - Math.sin(rad)*r];
  }
  function arc(from, to, rO, rI) {
    const [x1,y1]=pt(from,rO),[x2,y2]=pt(to,rO);
    const [x3,y3]=pt(to,rI),[x4,y4]=pt(from,rI);
    const lg=(to-from)>50?1:0;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${rO},${rO} 0 ${lg} 0 ${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} A${rI},${rI} 0 ${lg} 1 ${x4.toFixed(1)},${y4.toFixed(1)} Z`;
  }
  const zones = [
    {from:0,  to:25, color:"#e74c3c"},
    {from:25, to:45, color:"#e67e22"},
    {from:45, to:55, color:"#f0c040"},
    {from:55, to:75, color:"#2ecc71"},
    {from:75, to:100,color:"#00c853"},
  ];
  const needleDeg = 180 - (score/100)*180;
  const needleRad = needleDeg*Math.PI/180;
  const nLen = R*0.82;
  const nx = cx + Math.cos(needleRad)*nLen;
  const ny = cy - Math.sin(needleRad)*nLen;
  return (
    <svg width={size} height={size*0.72} viewBox={`0 0 ${size} ${size*0.72}`} style={{display:"block",margin:"0 auto"}}>
      {zones.map((z,i) => (
        <path key={i} d={arc(z.from, z.to, R, Ri)} fill={z.color} opacity={0.85}/>
      ))}
      <line x1={cx+1} y1={cy+1} x2={nx+1} y2={ny+1} stroke="rgba(0,0,0,.5)" strokeWidth={3} strokeLinecap="round"/>
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#e0e0e0" strokeWidth={2.5} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={size*0.05} fill="#333" stroke="rgba(255,255,255,.2)" strokeWidth={1}/>
      <circle cx={cx} cy={cy} r={size*0.025} fill={zone.color}/>
      <text x={cx} y={cy+size*0.12} textAnchor="middle" style={{fontFamily:"var(--mono)",fontSize:size*0.18,fontWeight:700,fill:zone.color}}>{score}</text>
    </svg>
  );
}

function FearGreedCard({ data }) {
  // Compute Casablanca score from market breadth
  const banks   = data["BANKS"]                || [];
  const telecom = data["TELECOM / UTILITIES"]  || [];
  const industry= data["INDUSTRY / MATERIALS"] || [];
  const all = [...banks,...telecom,...industry];
  const casaScore = useMemo(() => {
    if (!all.length) return 50;
    const ups = all.filter(i => Number(i.change||0) >= 0).length;
    const avg = all.reduce((s,i)=>s+Number(i.change||0),0)/all.length;
    const breadth = (ups/all.length)*100;
    return Math.min(100, Math.max(0, Math.round(breadth*0.5 + (avg+3)*8)));
  }, [all.length]);

  // Crypto score from alt.me proxy (static fallback)
  const cryptoScore = useMemo(() => {
    const crypto = data["CRYPTO"] || data["LARGE CAP"] || [];
    if (!crypto.length) return 16;
    const ups = crypto.filter(i => Number(i.change||0) >= 0).length;
    const avg = crypto.reduce((s,i)=>s+Number(i.change||0),0)/crypto.length;
    return Math.min(100, Math.max(0, Math.round((ups/crypto.length)*50 + (avg+5)*5)));
  }, []);

  const casaZone   = fgZone(casaScore);
  const cryptoZone = fgZone(cryptoScore);

  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:12, overflow:"hidden",
    }}>
      <div style={{
        padding:"10px 16px", borderBottom:`1px solid ${C.border}`,
        fontFamily:F.mono, fontSize:"0.65rem", letterSpacing:"0.14em",
        color:C.gold, background:"rgba(240,192,64,.06)",
        display:"flex", justifyContent:"space-between",
      }}>
        <span>FEAR &amp; GREED INDEX</span>
        <span style={{color:C.text3}}>Live · Updated daily</span>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:1}}>
        {[
          {label:"🇲🇦 Casablanca Market", score:casaScore, zone:casaZone, sub:"CSE · Breadth + Momentum"},
          {label:"₿ Crypto Market",       score:cryptoScore, zone:cryptoZone, sub:"BTC/ETH sentiment"},
        ].map((g,i) => (
          <div key={i} style={{
            padding:"16px", borderRight:i===0?`1px solid ${C.border}`:"none",
          }}>
            <div style={{fontFamily:F.sans, fontSize:"0.8rem", fontWeight:600, color:C.text, marginBottom:4}}>{g.label}</div>
            <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text3, marginBottom:12}}>What emotion is driving the market now?</div>
            <div style={{fontFamily:F.sans, fontSize:"0.7rem", color:C.text3, marginBottom:4}}>Now:</div>
            <div style={{fontFamily:F.sans, fontSize:"1.1rem", fontWeight:700, color:g.zone.color, marginBottom:12}}>{g.zone.label}</div>
            <Gauge score={g.score} size={160}/>
            <div style={{
              display:"grid", gridTemplateColumns:"auto 1fr", gap:"3px 10px",
              marginTop:10, fontFamily:F.mono, fontSize:"0.6rem",
            }}>
              {[[0,"Extreme Fear"],[25,"Fear"],[50,"Neutral"],[75,"Greed"],[100,"Extreme Greed"]].map(([v,lbl])=>(
                <React.Fragment key={v}>
                  <span style={{color:C.text3}}>{v}</span>
                  <span style={{color: g.score >= v ? g.zone.color : C.text3}}>{lbl}</span>
                </React.Fragment>
              ))}
            </div>
            <div style={{fontFamily:F.mono, fontSize:"0.58rem", color:C.text3, marginTop:8}}>{g.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CRYPTO GRID  (Bloomberg-style price cards)
═══════════════════════════════════════════════════ */
function CryptoGrid({ data }) {
  const allCrypto = useMemo(() => {
    const keys = ["LARGE CAP","CRYPTO","DEFI / LAYER2","MEME / TRENDING","LAYER1 / INFRA","STABLECOINS"];
    const arr = [];
    keys.forEach(k => { if(data[k]) arr.push(...data[k]); });
    return arr.filter(i => i?.id);
  }, [data]);

  if (!allCrypto.length) return null;

  // Relative performance bar chart data
  const sorted = [...allCrypto].sort((a,b) => Number(b.change)-Number(a.change));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Grid of cards */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))",
        gap:2,
        background:C.border,
        border:`1px solid ${C.border}`,
        borderRadius:10,
        overflow:"hidden",
      }}>
        {allCrypto.map((item, i) => {
          const u = Number(item.change||0) >= 0;
          const bg = u ? "rgba(0,200,83,.13)" : "rgba(255,59,48,.12)";
          const series = item.series || [];
          const hi = series.length ? Math.max(...series) : null;
          const lo = series.length ? Math.min(...series) : null;
          return (
            <div key={i} style={{
              background: u ? "rgba(0,200,83,.07)" : "rgba(255,59,48,.07)",
              padding:"10px 10px 8px",
              display:"flex", flexDirection:"column", gap:4,
              cursor:"pointer", transition:"filter .15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.3)"}
            onMouseLeave={e=>e.currentTarget.style.filter=""}>
              {/* Top row: symbol + change */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{
                    width:18,height:18,borderRadius:4,flexShrink:0,
                    background:u?"rgba(0,200,83,.3)":"rgba(255,59,48,.3)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:9,fontWeight:700,color:u?"#00c853":"#ff3b30",
                    fontFamily:F.mono,
                  }}>{(item.symbol||item.id||"").slice(0,2)}</div>
                  <span style={{fontFamily:F.mono,fontSize:"0.62rem",fontWeight:700,color:C.text2,letterSpacing:"0.04em"}}>{item.id}</span>
                </div>
                <span style={{fontFamily:F.mono,fontSize:"0.6rem",fontWeight:600,color:u?"#00c853":"#ff3b30"}}>
                  {u?"+":""}{Number(item.change||0).toFixed(2)}%
                </span>
              </div>

              {/* Price */}
              <div style={{fontFamily:F.mono,fontSize:"1.05rem",fontWeight:700,color:C.text,letterSpacing:"-0.01em",lineHeight:1}}>
                {Number(item.value).toLocaleString("fr-FR",{maximumFractionDigits:Number(item.value)>100?2:Number(item.value)>1?4:6})}
              </div>

              {/* Sparkline */}
              <div style={{height:36,margin:"2px 0"}}>
                <Spark series={series} up={u} w={160} h={36}/>
              </div>

              {/* Hi/Lo */}
              {hi !== null && (
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:F.mono,fontSize:"0.52rem",color:C.text3}}>
                  <span>H {Number(hi).toLocaleString("fr-FR",{maximumFractionDigits:hi>100?2:hi>1?3:6})}</span>
                  <span>L {Number(lo).toLocaleString("fr-FR",{maximumFractionDigits:lo>100?2:lo>1?3:6})}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Relative performance bar chart */}
      <div style={{
        background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:10, padding:"14px 16px",
      }}>
        <div style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.text3,letterSpacing:"0.12em",marginBottom:12,textAlign:"center"}}>
          1 DAY RELATIVE PERFORMANCE [USD]
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:2,height:80,overflowX:"auto"}}>
          {sorted.map((item,i) => {
            const pct = Number(item.change||0);
            const u = pct >= 0;
            const maxPct = Math.max(...sorted.map(x=>Math.abs(Number(x.change||0))),1);
            const barH = Math.abs(pct)/maxPct * 70;
            return (
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0,minWidth:28}}>
                {u && <div style={{fontFamily:F.mono,fontSize:"0.45rem",color:"#00c853",marginBottom:1}}>{pct.toFixed(2)}%</div>}
                <div style={{
                  width:20, height:barH||2, borderRadius:2,
                  background: u ? "rgba(0,200,83,.7)" : "rgba(255,59,48,.7)",
                  alignSelf: u ? "flex-end" : "flex-start",
                  marginTop: u ? "auto" : 0,
                }}/>
                {!u && <div style={{fontFamily:F.mono,fontSize:"0.45rem",color:"#ff3b30",marginTop:1}}>{pct.toFixed(2)}%</div>}
                <div style={{fontFamily:F.mono,fontSize:"0.48rem",color:C.text3,transform:"rotate(-45deg)",transformOrigin:"top left",marginTop:4,whiteSpace:"nowrap"}}>{item.id}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FX CARD GRID  (like the reference screenshot)
═══════════════════════════════════════════════════ */
function FXCardGrid({ items }) {
  if (!items?.length) return null;
  return (
    <div>
      {/* Price cards grid */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",
        gap:3, marginBottom:16,
      }}>
        {items.map((item, i) => {
          const u = Number(item.change||0) >= 0;
          const bg = u ? "rgba(0,120,60,.85)" : "rgba(140,20,20,.85)";
          const hi = item.series?.length ? Math.max(...item.series) : null;
          const lo = item.series?.length ? Math.min(...item.series) : null;
          return (
            <div key={i} style={{
              background: bg,
              borderRadius:8, padding:"10px 12px",
              position:"relative", overflow:"hidden",
              minHeight:100,
            }}>
              {/* Header row */}
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4}}>
                <span style={{fontFamily:F.mono, fontSize:"0.72rem", fontWeight:700, color:"rgba(255,255,255,.9)", letterSpacing:"0.06em"}}>
                  {item.id}
                </span>
                <div style={{textAlign:"right"}}>
                  <span style={{fontFamily:F.mono, fontSize:"0.65rem", color:"rgba(255,255,255,.8)"}}>
                    {Number(item.change||0) >= 0 ? "+" : ""}{Number(item.change||0).toFixed(2)}%
                  </span>
                </div>
              </div>
              {/* Price */}
              <div style={{fontFamily:F.mono, fontSize:"1.5rem", fontWeight:700, color:"#fff", letterSpacing:"-0.01em", lineHeight:1, marginBottom:6}}>
                {Number(item.value||0).toLocaleString("fr-FR", {minimumFractionDigits:3, maximumFractionDigits:4})}
              </div>
              {/* H/L */}
              {hi !== null && (
                <div style={{display:"flex", gap:8, marginBottom:6}}>
                  <span style={{fontFamily:F.mono, fontSize:"0.58rem", color:"rgba(255,255,255,.7)"}}>
                    H {Number(hi).toFixed(4)}
                  </span>
                  <span style={{fontFamily:F.mono, fontSize:"0.58rem", color:"rgba(255,255,255,.7)"}}>
                    L {Number(lo).toFixed(4)}
                  </span>
                </div>
              )}
              {/* Sparkline */}
              {item.series?.length > 1 && (
                <div style={{height:36, marginTop:4}}>
                  <Spark series={item.series} up={u} w={200} h={36}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Performance bar chart */}
      <div style={{
        background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:12, padding:"16px",
      }}>
        <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.gold, letterSpacing:"0.14em", textAlign:"center", marginBottom:16}}>
          1 DAY RELATIVE PERFORMANCE / MAD
        </div>
        <div style={{display:"flex", alignItems:"flex-end", justifyContent:"center", gap:6, height:120}}>
          {items.slice(0,10).map((item, i) => {
            const chg = Number(item.change||0);
            const maxAbs = Math.max(...items.slice(0,10).map(x => Math.abs(Number(x.change||0))), 0.01);
            const barH = Math.abs(chg) / maxAbs * 80;
            const u = chg >= 0;
            return (
              <div key={i} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:4, flex:1, minWidth:0}}>
                {u && <span style={{fontFamily:F.mono, fontSize:"0.55rem", color:"#2ecc71"}}>{chg > 0 ? "+" : ""}{chg.toFixed(2)}%</span>}
                <div style={{
                  width:"100%", height:barH,
                  background: u ? "rgba(46,204,113,.7)" : "rgba(231,76,60,.7)",
                  borderRadius:u ? "3px 3px 0 0" : "0 0 3px 3px",
                  marginTop: u ? 0 : "auto",
                  alignSelf: u ? "flex-end" : "flex-start",
                }}/>
                {!u && <span style={{fontFamily:F.mono, fontSize:"0.55rem", color:"#e74c3c"}}>{chg.toFixed(2)}%</span>}
                <span style={{fontFamily:F.mono, fontSize:"0.58rem", fontWeight:600, color:C.text2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", width:"100%", textAlign:"center"}}>
                  {item.id.replace("/MAD","")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CSE SESSION STATUS
═══════════════════════════════════════════════════ */
function useCSESession() {
  const [status, setStatus] = useState({ open:false, label:"", countdown:"", pct:0 });
  useEffect(() => {
    function calc() {
      const now = new Date();
      const h = parseFloat(now.toLocaleString("en-GB",{timeZone:"Africa/Casablanca",hour:"numeric",hour12:false}));
      const m = now.toLocaleString("en-GB",{timeZone:"Africa/Casablanca",minute:"numeric"});
      const hm = h + parseInt(m)/60;
      const day = now.toLocaleString("en-GB",{timeZone:"Africa/Casablanca",weekday:"short"});
      const isWeekday = !["Sat","Sun"].includes(day);
      const OPEN=9, CLOSE=15;
      const open = isWeekday && hm >= OPEN && hm < CLOSE;
      let label, countdown, pct;
      if (!isWeekday) {
        label = "Weekend — Opens Monday 09:00";
        countdown = "";
        pct = 0;
      } else if (hm < OPEN) {
        const mins = Math.round((OPEN - hm) * 60);
        countdown = `Opens in ${Math.floor(mins/60)}h ${mins%60}m`;
        label = "Pre-Market";
        pct = 0;
      } else if (open) {
        const elapsed = hm - OPEN;
        const total = CLOSE - OPEN;
        pct = Math.min(100, Math.round(elapsed/total*100));
        const minsLeft = Math.round((CLOSE - hm) * 60);
        countdown = `Closes in ${Math.floor(minsLeft/60)}h ${minsLeft%60}m`;
        label = "Session Open";
      } else {
        label = "Session Closed";
        countdown = "Opens tomorrow 09:00";
        pct = 100;
      }
      setStatus({ open, label, countdown, pct, isWeekday });
    }
    calc();
    const id = setInterval(calc, 30000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/* ═══════════════════════════════════════════════════
   OVERVIEW — MOROCCO-FIRST REDESIGN
═══════════════════════════════════════════════════ */
function MoroccoOverview({ data, indices, fx, crypto, banks, telecom, industry, onSelect }) {
  const session = useCSESession();
  const masi    = indices.find(x=>x.id==="MASI");
  const usdmad  = fx.find(x=>x.id==="USD/MAD");
  const eurmad  = fx.find(x=>x.id==="EUR/MAD");
  const allCasa = [...banks,...telecom,...industry];

  // Top movers
  const movers = useMemo(() => {
    return [...allCasa]
      .filter(x => x.change !== undefined)
      .sort((a,b) => Math.abs(Number(b.change)) - Math.abs(Number(a.change)))
      .slice(0, 8);
  }, [allCasa.length]);

  const gainers = movers.filter(x => up(x.change)).slice(0,4);
  const losers  = movers.filter(x => !up(x.change)).slice(0,4);

  // Volume leaders (use change as proxy if no volume)
  const volumeLeaders = [...allCasa].slice(0,5);

  // Breadth
  const advances = allCasa.filter(x=>up(x.change)).length;
  const declines = allCasa.length - advances;

  // Key watchlist items
  const WATCHLIST = ["ATW","BCP","IAM","OCP","CIH","BOA","MNG","HPS","LBV","ADH"];
  const watchItems = WATCHLIST.map(id => allCasa.find(x=>x.id===id)).filter(Boolean);

  return (
    <div style={{padding:"12px 18px", display:"flex", flexDirection:"column", gap:10}}>

      {/* ── ROW 1: MASI HERO + SESSION + USD EUR ── */}
      <div style={{display:"grid", gridTemplateColumns:"1fr auto auto", gap:10, alignItems:"stretch"}}>

        {/* MASI — the hero number */}
        <div style={{
          background: masi ? (up(masi.change)?"rgba(0,120,60,.15)":"rgba(140,20,20,.15)") : C.surface,
          border:`1px solid ${masi ? (up(masi.change)?"rgba(52,199,89,.3)":"rgba(255,59,48,.3)") : C.border}`,
          borderRadius:12, padding:"16px 20px",
          display:"flex", alignItems:"center", gap:20,
        }}>
          <div>
            <div style={{fontFamily:F.mono, fontSize:"0.62rem", color:C.text3, letterSpacing:"0.12em", marginBottom:6}}>
              🇲🇦 MASI · Bourse de Casablanca
            </div>
            <div style={{fontFamily:F.mono, fontSize:"2.8rem", fontWeight:700, color:C.text, lineHeight:1, letterSpacing:"-0.02em"}}>
              {masi ? fv(Number(masi.value)) : "—"}
            </div>
            <div style={{display:"flex", alignItems:"center", gap:12, marginTop:8}}>
              <span style={{fontFamily:F.mono, fontSize:"1rem", fontWeight:600, color: masi&&up(masi.change)?C.up:C.dn}}>
                {masi ? fc(masi.change) : "—"}
              </span>
              <span style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text3}}>Today</span>
              {masi?.series?.length > 1 && <div style={{flex:1, height:32}}><Spark series={masi.series} isUp={up(masi?.change)} w={160} h={32}/></div>}
            </div>
          </div>
        </div>

        {/* Session status */}
        <div style={{
          background: session.open ? "rgba(0,120,60,.12)" : C.surface,
          border:`1px solid ${session.open ? "rgba(52,199,89,.25)" : C.border}`,
          borderRadius:12, padding:"14px 18px", minWidth:180,
          display:"flex", flexDirection:"column", justifyContent:"space-between",
        }}>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:8}}>
            <div style={{width:8, height:8, borderRadius:"50%", background:session.open?C.up:C.text3, boxShadow:session.open?"0 0 8px rgba(52,199,89,.6)":"none"}}/>
            <span style={{fontFamily:F.mono, fontSize:"0.72rem", fontWeight:600, color:session.open?C.up:C.text2}}>
              {session.label}
            </span>
          </div>
          <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text2, marginBottom:10}}>{session.countdown}</div>
          <div style={{height:4, borderRadius:2, background:C.border2, overflow:"hidden"}}>
            <div style={{width:`${session.pct}%`, height:"100%", background:session.open?C.up:C.text3, borderRadius:2, transition:"width 1s"}}/>
          </div>
          <div style={{fontFamily:F.mono, fontSize:"0.58rem", color:C.text3, marginTop:6}}>
            CSE · 09:00–15:00 GMT+1
          </div>
        </div>

        {/* USD/MAD + EUR/MAD */}
        <div style={{display:"flex", flexDirection:"column", gap:8, minWidth:160}}>
          {[usdmad, eurmad].map((item,i) => item && (
            <div key={i} style={{
              background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:10, padding:"10px 14px", flex:1,
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div>
                <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3, marginBottom:3}}>{item.id}</div>
                <div style={{fontFamily:F.mono, fontSize:"1.1rem", fontWeight:700, color:C.text}}>{fv(Number(item.value))}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <Pill change={item.change} size="xs"/>
                <div style={{marginTop:4, height:22, width:60}}><Spark series={item.series||[]} isUp={up(item.change)} w={60} h={22}/></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 2: BREADTH + TOP MOVERS + WATCHLIST ── */}
      <div style={{display:"grid", gridTemplateColumns:"200px 1fr 200px", gap:10}}>

        {/* Market breadth */}
        <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden"}}>
          <div style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, fontFamily:F.mono, fontSize:"0.62rem", color:C.gold, letterSpacing:"0.1em"}}>
            MARKET BREADTH
          </div>
          <div style={{padding:"10px 12px"}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:5}}>
              <span style={{fontFamily:F.mono, fontSize:"0.68rem", color:C.up}}>▲ {advances}</span>
              <span style={{fontFamily:F.mono, fontSize:"0.62rem", color:C.text3}}>{allCasa.length} stocks</span>
              <span style={{fontFamily:F.mono, fontSize:"0.68rem", color:C.dn}}>▼ {declines}</span>
            </div>
            <div style={{height:8, borderRadius:4, background:`rgba(255,59,48,.3)`, overflow:"hidden", marginBottom:10}}>
              <div style={{width:`${allCasa.length?advances/allCasa.length*100:50}%`, height:"100%", background:C.up, borderRadius:4}}/>
            </div>
            {/* 52W proxy using series hi/lo */}
            <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3, marginBottom:6}}>VOLUME LEADERS</div>
            {volumeLeaders.map((item,i) => (
              <div key={i} onClick={()=>onSelect(item)} style={{display:"flex", justifyContent:"space-between", padding:"3px 0", cursor:"pointer", borderBottom:`1px solid ${C.border2}`}}>
                <span style={{fontFamily:F.mono, fontSize:"0.63rem", color:C.text2}}>{item.id}</span>
                <span style={{fontFamily:F.mono, fontSize:"0.63rem", color:up(item.change)?C.up:C.dn}}>{fc(item.change)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top movers — gains + losses */}
        <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden"}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", height:"100%"}}>
            {/* Gainers */}
            <div style={{borderRight:`1px solid ${C.border}`}}>
              <div style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, fontFamily:F.mono, fontSize:"0.62rem", color:C.up, letterSpacing:"0.1em"}}>
                TOP GAINERS
              </div>
              {gainers.length ? gainers.map((item,i) => (
                <div key={i} onClick={()=>onSelect(item)} style={{padding:"7px 12px", borderBottom:`1px solid ${C.border2}`, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:F.mono, fontSize:"0.72rem", fontWeight:600, color:C.text}}>{item.id}</div>
                    <div style={{fontFamily:F.sans, fontSize:"0.6rem", color:C.text3, marginTop:1}}>{item.name?.slice(0,16)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:F.mono, fontSize:"0.68rem", color:C.up, fontWeight:600}}>{fc(item.change)}</div>
                    <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3}}>{fv(Number(item.value))}</div>
                  </div>
                </div>
              )) : <div style={{padding:"20px 12px", fontFamily:F.mono, fontSize:"0.6rem", color:C.text3}}>No data</div>}
            </div>
            {/* Losers */}
            <div>
              <div style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, fontFamily:F.mono, fontSize:"0.62rem", color:C.dn, letterSpacing:"0.1em"}}>
                TOP LOSERS
              </div>
              {losers.length ? losers.map((item,i) => (
                <div key={i} onClick={()=>onSelect(item)} style={{padding:"7px 12px", borderBottom:`1px solid ${C.border2}`, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:F.mono, fontSize:"0.72rem", fontWeight:600, color:C.text}}>{item.id}</div>
                    <div style={{fontFamily:F.sans, fontSize:"0.6rem", color:C.text3, marginTop:1}}>{item.name?.slice(0,16)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:F.mono, fontSize:"0.68rem", color:C.dn, fontWeight:600}}>{fc(item.change)}</div>
                    <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3}}>{fv(Number(item.value))}</div>
                  </div>
                </div>
              )) : <div style={{padding:"20px 12px", fontFamily:F.mono, fontSize:"0.6rem", color:C.text3}}>No data</div>}
            </div>
          </div>
        </div>

        {/* Watchlist — ATW BCP IAM OCP etc */}
        <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden"}}>
          <div style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, fontFamily:F.mono, fontSize:"0.62rem", color:C.gold, letterSpacing:"0.1em"}}>
            WATCHLIST
          </div>
          {watchItems.length ? watchItems.map((item,i) => (
            <div key={i} onClick={()=>onSelect(item)} style={{padding:"6px 12px", borderBottom:`1px solid ${C.border2}`, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <div style={{fontFamily:F.mono, fontSize:"0.7rem", fontWeight:600, color:C.text}}>{item.id}</div>
                <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3}}>{fv(Number(item.value))}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <Pill change={item.change} size="xs"/>
                <div style={{height:18, width:50, marginTop:2}}><Spark series={item.series||[]} isUp={up(item.change)} w={50} h={18}/></div>
              </div>
            </div>
          )) : allCasa.slice(0,8).map((item,i) => (
            <div key={i} onClick={()=>onSelect(item)} style={{padding:"6px 12px", borderBottom:`1px solid ${C.border2}`, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <div style={{fontFamily:F.mono, fontSize:"0.7rem", fontWeight:600, color:C.text}}>{item.id}</div>
                <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3}}>{fv(Number(item.value))}</div>
              </div>
              <Pill change={item.change} size="xs"/>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 3: GLOBAL CONTEXT (compact) ── */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10}}>
        <CompactPanel title="GLOBAL INDICES" items={indices.slice(0,5)} onSelect={onSelect}/>
        <CompactPanel title="FOREX / MAD" items={fx.slice(0,5)} onSelect={onSelect}/>
        <CompactPanel title="CRYPTO" items={(data["LARGE CAP"]||crypto).slice(0,5)} onSelect={onSelect}/>
        <CompactPanel title="COMMODITIES" items={(data["COMMODITIES"]||[]).slice(0,5)} onSelect={onSelect}/>
      </div>

      {/* ── ROW 4: NEWS + CALENDAR ── */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        <NewsPanel/>
        <CalPanel/>
      </div>
    </div>
  );
}

function CompactPanel({ title, items, onSelect }) {
  return (
    <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden"}}>
      <div style={{padding:"7px 12px", borderBottom:`1px solid ${C.border}`, fontFamily:F.mono, fontSize:"0.6rem", color:C.gold, letterSpacing:"0.1em"}}>{title}</div>
      {items.map((item,i) => (
        <div key={i} onClick={()=>onSelect(item)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 12px", borderBottom:`1px solid ${C.border2}`, cursor:"pointer"}}>
          <div>
            <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text, fontWeight:500}}>{item.id}</div>
            <div style={{fontFamily:F.mono, fontSize:"0.58rem", color:C.text3}}>{fv(Number(item.value))}</div>
          </div>
          <span style={{fontFamily:F.mono, fontSize:"0.63rem", fontWeight:600, color:up(item.change)?C.up:C.dn}}>{fc(item.change)}</span>
        </div>
      ))}
    </div>
  );
}

function OverviewCards({ data, indices, fx, crypto }) { return null; }
function OverviewChart({ data, indices, fx, crypto }) { return null; }
function MoroccoBreadth({ banks, telecom, industry }) { return null; }
function GlobalIndicesPanel({ indices, onSelect }) { return null; }
function ForexMovers({ fx, onSelect }) { return null; }
function CryptoSnapshot({ crypto, data }) { return null; }
  const keys = [
    { id:"MASI",    src:indices,                        label:"Casablanca",  icon:"🇲🇦" },
    { id:"USD/MAD", src:fx,                             label:"USD/MAD",     icon:"💵" },
    { id:"BTC",     src:[...(data["LARGE CAP"]||[]),...crypto], label:"Bitcoin", icon:"₿" },
    { id:"GOLD",    src:data["COMMODITIES"]||[],        label:"Gold",        icon:"🥇" },
    { id:"BRENT",   src:data["COMMODITIES"]||[],        label:"Brent Oil",   icon:"🛢" },
    { id:"US 10Y",  src:data["RATES / BONDS"]||[],      label:"US 10Y",      icon:"📊" },
  ];
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8}}>
      {keys.map(({id,src,label,icon}) => {
        const item = src.find(x=>x.id===id) || src[0];
        if (!item) return (
          <div key={id} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", minHeight:80, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <span style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3}}>—</span>
          </div>
        );
        const u = up(item.change);
        return (
          <div key={id} className="card-hover" style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all .15s"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6}}>
              <span style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3, letterSpacing:"0.1em"}}>{icon} {label}</span>
              <Pill change={item.change} size="xs"/>
            </div>
            <div style={{fontFamily:F.mono, fontSize:"1.2rem", fontWeight:700, color:C.text, lineHeight:1}}>{fv(Number(item.value))}</div>
            <div style={{marginTop:6, height:28}}><Spark series={item.series||[]} isUp={u} w={120} h={28}/></div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   OVERVIEW — ROW 2: MULTI-ASSET CHART
═══════════════════════════════════════════════════ */
function OverviewChart({ data, indices, fx, crypto }) {
  const [asset, setAsset] = useState("equities");
  const switcher = [
    {key:"equities",   label:"Equities"},
    {key:"fx",         label:"FX"},
    {key:"crypto",     label:"Crypto"},
    {key:"commodities",label:"Commodities"},
    {key:"rates",      label:"Rates"},
  ];
  const items = {
    equities:    indices.slice(0,6),
    fx:          fx.slice(0,6),
    crypto:      (data["LARGE CAP"]||crypto).slice(0,6),
    commodities: (data["COMMODITIES"]||[]).slice(0,6),
    rates:       (data["RATES / BONDS"]||[]).slice(0,6),
  }[asset] || [];

  return (
    <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.gold, letterSpacing:"0.12em"}}>MARKET OVERVIEW</span>
        <div style={{display:"flex", gap:4}}>
          {switcher.map(s => (
            <button key={s.key} onClick={()=>setAsset(s.key)} style={{
              fontFamily:F.mono, fontSize:"0.62rem", padding:"3px 10px", borderRadius:5, border:"none", cursor:"pointer",
              background: asset===s.key ? C.gold : "transparent",
              color: asset===s.key ? "#0f1117" : C.text3,
              fontWeight: asset===s.key ? 600 : 400,
            }}>{s.label}</button>
          ))}
        </div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:0}}>
        {items.map((item, i) => {
          const u = up(item.change);
          return (
            <div key={i} style={{padding:"12px 14px", borderRight: i<5 ? `1px solid ${C.border}` : "none"}}>
              <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{item.id}</div>
              <div style={{fontFamily:F.mono, fontSize:"0.95rem", fontWeight:700, color:C.text, marginBottom:2}}>{fv(Number(item.value))}</div>
              <div style={{fontFamily:F.mono, fontSize:"0.62rem", color: u ? C.up : C.dn}}>{fc(item.change)}</div>
              <div style={{marginTop:8, height:40}}><Spark series={item.series||[]} isUp={u} w={100} h={40}/></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   OVERVIEW — ROW 3: 4 COMPACT PANELS
═══════════════════════════════════════════════════ */
function PanelHeader({ title, sub }) {
  return (
    <div style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
      <span style={{fontFamily:F.mono, fontSize:"0.62rem", color:C.gold, letterSpacing:"0.1em"}}>{title}</span>
      {sub && <span style={{fontFamily:F.mono, fontSize:"0.58rem", color:C.text3}}>{sub}</span>}
    </div>
  );
}

function MoroccoBreadth({ banks, telecom, industry }) {
  const all = [...banks, ...telecom, ...industry];
  const advances = all.filter(x => up(x.change)).length;
  const declines = all.length - advances;
  const pct = all.length ? Math.round(advances/all.length*100) : 50;
  const topMovers = [...all].sort((a,b)=>Math.abs(Number(b.change))-Math.abs(Number(a.change))).slice(0,4);
  return (
    <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden"}}>
      <PanelHeader title="MOROCCO BREADTH" sub={`${all.length} stocks`}/>
      <div style={{padding:"10px 12px"}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
          <span style={{fontFamily:F.mono, fontSize:"0.62rem", color:C.up}}>▲ {advances} advancing</span>
          <span style={{fontFamily:F.mono, fontSize:"0.62rem", color:C.dn}}>▼ {declines} declining</span>
        </div>
        <div style={{height:6, borderRadius:3, background:C.dn, overflow:"hidden", marginBottom:10}}>
          <div style={{width:`${pct}%`, height:"100%", background:C.up, borderRadius:3}}/>
        </div>
        {topMovers.map((item,i) => (
          <div key={i} style={{display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
            <span style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text2}}>{item.id}</span>
            <span style={{fontFamily:F.mono, fontSize:"0.65rem", color:up(item.change)?C.up:C.dn}}>{fc(item.change)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalIndicesPanel({ indices, onSelect }) {
  return (
    <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden"}}>
      <PanelHeader title="GLOBAL INDICES"/>
      <div style={{padding:"4px 0"}}>
        {indices.slice(0,6).map((item,i) => (
          <div key={i} onClick={()=>onSelect(item)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 12px", cursor:"pointer", borderBottom:`1px solid ${C.border}`}}>
            <div>
              <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text}}>{item.id}</div>
              <div style={{fontFamily:F.mono, fontSize:"0.58rem", color:C.text3}}>{item.name?.slice(0,18)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text}}>{fv(Number(item.value))}</div>
              <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:up(item.change)?C.up:C.dn}}>{fc(item.change)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForexMovers({ fx, onSelect }) {
  const sorted = [...fx].sort((a,b)=>Math.abs(Number(b.change))-Math.abs(Number(a.change))).slice(0,6);
  return (
    <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden"}}>
      <PanelHeader title="FOREX MOVERS" sub="vs MAD"/>
      <div style={{padding:"4px 0"}}>
        {sorted.map((item,i) => {
          const u = up(item.change);
          return (
            <div key={i} onClick={()=>onSelect(item)} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 12px", cursor:"pointer", borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text}}>{item.id}</div>
                <div style={{height:20, width:60}}><Spark series={item.series||[]} isUp={u} w={60} h={20}/></div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text}}>{fv(Number(item.value))}</div>
                <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:u?C.up:C.dn}}>{fc(item.change)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CryptoSnapshot({ crypto, data }) {
  const items = (data["LARGE CAP"]||crypto).slice(0,6);
  return (
    <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden"}}>
      <PanelHeader title="CRYPTO SNAPSHOT"/>
      <div style={{padding:"4px 0"}}>
        {items.map((item,i) => {
          const u = up(item.change);
          return (
            <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 12px", borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <div style={{width:6, height:6, borderRadius:"50%", background:u?C.up:C.dn, flexShrink:0}}/>
                <span style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text}}>{item.id}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:C.text}}>{fv(Number(item.value))}</div>
                <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:u?C.up:C.dn}}>{fc(item.change)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CATEGORY PAGES — KPI STRIP (compact, replaces SummaryCards)
═══════════════════════════════════════════════════ */
function KpiStrip({ data, tab }) {
  const fx          = data["FX / MAD"]             || [];
  const indices     = data["GLOBAL INDICES"]        || [];
  const crypto      = data["LARGE CAP"] || data["CRYPTO"] || [];
  const commodities = data["COMMODITIES"]           || [];
  const bonds       = data["RATES / BONDS"]         || [];
  const banks       = data["BANKS"]                 || [];

  const sets = {
    morocco:    [...banks.slice(0,3), indices.find(x=>x.id==="MASI")].filter(Boolean),
    indices:    indices.slice(0,4),
    usa:        (data["USA STOCKS"]||[]).slice(0,4),
    europe:     (data["EUROPE STOCKS"]||[]).slice(0,4),
    gcc:        (data["GCC STOCKS"]||[]).slice(0,4),
    asia:       (data["ASIA STOCKS"]||[]).slice(0,4),
    currencies: fx.slice(0,4),
    crypto:     crypto.slice(0,4),
    commodities:commodities.slice(0,4),
    bonds:      bonds.slice(0,4),
  };
  const items = sets[tab] || [];
  if (!items.length) return null;
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8}}>
      {items.map((item,i) => {
        const u = up(item.change);
        return (
          <div key={i} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div style={{fontFamily:F.mono, fontSize:"0.58rem", color:C.text3, marginBottom:2}}>{item.id}</div>
              <div style={{fontFamily:F.mono, fontSize:"0.9rem", fontWeight:700, color:C.text}}>{fv(Number(item.value))}</div>
            </div>
            <Pill change={item.change} size="xs"/>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BONDS PAGE
═══════════════════════════════════════════════════ */
function BondsPanel({ data }) {
  const bonds = data["RATES / BONDS"] || data["US / AMERICAS"] || [];
  const KEY_BONDS = ["US 2Y","US 10Y","US 30Y","Germany 10Y","Japan 10Y","UK 10Y","France 10Y","Morocco 10Y"];
  const items = KEY_BONDS.map(id => bonds.find(x=>x.id===id)).filter(Boolean);
  const rest  = bonds.filter(x => !KEY_BONDS.includes(x.id));
  const spread = (() => {
    const y10 = bonds.find(x=>x.id==="US 10Y");
    const y2  = bonds.find(x=>x.id==="US 2Y");
    if (!y10 || !y2) return null;
    return (Number(y10.value) - Number(y2.value)).toFixed(2);
  })();

  return (
    <div style={{display:"flex", flexDirection:"column", gap:10}}>
      {spread !== null && (
        <div style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:20}}>
          <div>
            <div style={{fontFamily:F.mono, fontSize:"0.6rem", color:C.text3, marginBottom:2}}>10Y–2Y SPREAD</div>
            <div style={{fontFamily:F.mono, fontSize:"1.4rem", fontWeight:700, color: Number(spread)>=0?C.up:C.dn}}>{spread > 0 ? "+" : ""}{spread}%</div>
          </div>
          <div style={{fontFamily:F.sans, fontSize:"0.72rem", color:C.text2}}>
            {Number(spread) >= 0 ? "Normal yield curve — growth expected" : "Inverted yield curve — recession signal"}
          </div>
        </div>
      )}
      <StockTable items={[...items, ...rest]} activeId={null} onSelect={()=>{}}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMMODITIES PAGE
═══════════════════════════════════════════════════ */
function CommoditiesPanel({ data }) {
  const items = data["COMMODITIES"] || [];
  const ORDER = ["GOLD","SILVER","BRENT","WTI","NGAS","COPPER","PLATINUM","PALLADIUM","WHEAT","CORN"];
  const sorted = [
    ...ORDER.map(id => items.find(x=>x.id===id)).filter(Boolean),
    ...items.filter(x=>!ORDER.includes(x.id)),
  ];
  return (
    <div style={{display:"flex", flexDirection:"column", gap:10}}>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8}}>
        {sorted.slice(0,6).map((item,i) => {
          const u = up(item.change);
          return (
            <div key={i} style={{background: u?"rgba(0,120,60,.12)":"rgba(140,20,20,.12)", border:`1px solid ${u?"rgba(52,199,89,.2)":"rgba(255,59,48,.2)"}`, borderRadius:10, padding:"12px 14px"}}>
              <div style={{fontFamily:F.mono, fontSize:"0.62rem", color:C.text3, marginBottom:4}}>{item.id}</div>
              <div style={{fontFamily:F.mono, fontSize:"1.1rem", fontWeight:700, color:C.text, marginBottom:2}}>{fv(Number(item.value))}</div>
              <div style={{fontFamily:F.mono, fontSize:"0.65rem", color:u?C.up:C.dn}}>{fc(item.change)}</div>
              <div style={{marginTop:8, height:32}}><Spark series={item.series||[]} isUp={u} w={120} h={32}/></div>
            </div>
          );
        })}
      </div>
      {sorted.length > 6 && <StockTable items={sorted.slice(6)} activeId={null} onSelect={()=>{}}/>}
    </div>
  );
}

function Heatmap({ data }) {
  const items = useMemo(()=>{
    const arr=[];
    Object.values(data).forEach(v=>Array.isArray(v)&&v.forEach(i=>i?.id&&i?.change!=null&&arr.push(i)));
    return arr;
  },[data]);
  if (!items.length) return null;
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{
        padding:"12px 16px",
        borderBottom:`1px solid ${C.border}`,
        fontFamily:F.sans,fontSize:"0.75rem",fontWeight:600,color:C.text,
        display:"flex",justifyContent:"space-between",alignItems:"center",
      }}>
        Heatmap
        <span style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.text3}}>Performance 1J</span>
      </div>
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(72px,1fr))",
        gap:3,padding:10,
      }}>
        {items.map((item,i)=>{
          const u=up(item.change);
          const abs=Math.abs(Number(item.change));
          const alpha=Math.min(0.15+abs*0.2,0.7);
          const bg=u?`rgba(52,199,89,${alpha})`:`rgba(255,59,48,${alpha})`;
          return (
            <div key={i} style={{
              padding:"9px 6px",borderRadius:8,background:bg,
              textAlign:"center",cursor:"pointer",
              transition:"transform 0.15s,filter 0.15s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.06)";e.currentTarget.style.filter="brightness(1.25)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.filter="";}}>
              <div style={{fontFamily:F.mono,fontSize:"0.5rem",color:"rgba(255,255,255,0.75)",marginBottom:3,letterSpacing:"0.03em"}}>
                {item.id}
              </div>
              <div style={{fontFamily:F.mono,fontSize:"0.72rem",fontWeight:600,color:"#fff"}}>
                {u?"+":""}{Number(item.change).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   LOADING
═══════════════════════════════════════════════════ */
function Loader() {
  return (
    <div style={{
      display:"flex",alignItems:"center",justifyContent:"center",
      minHeight:400,flexDirection:"column",gap:16,
    }}>
      <svg style={{width:40,height:40,animation:"spin 1.5s linear infinite"}} viewBox="0 0 40 40" fill="none">
        <circle cx={20} cy={20} r={17} stroke={C.border} strokeWidth={3}/>
        <circle cx={20} cy={20} r={17} stroke={C.gold} strokeWidth={3}
          strokeDasharray="30 80" strokeLinecap="round"/>
      </svg>
      <div style={{fontFamily:F.sans,fontSize:"0.78rem",color:C.text3}}>
        Chargement des marchés…
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab]         = useState("overview");
  const [data, setData]       = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeSector, setActiveSector] = useState(null);

  /* fetch */
  useEffect(()=>{
    let cancelled=false;
    setLoading(true); setError(""); setData({}); setSelectedItem(null);
    const apiTab = ["usa","europe","gcc","asia"].includes(tab) ? "indices" : tab;
    fetch(`/api/market?tab=${apiTab}`)
      .then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();})
      .then(json=>{if(!cancelled){setData(json||{});setUpdatedAt(new Date().toLocaleTimeString("fr-FR"));}})
      .catch(e=>{if(!cancelled)setError(e.message);})
      .finally(()=>{if(!cancelled)setLoading(false);});
    return ()=>{cancelled=true;};
  },[tab]);

  /* auto-refresh */
  useEffect(()=>{
    const id=setInterval(()=>{setTab(t=>t);},60_000);
    return()=>clearInterval(id);
  },[]);

  /* data slices */
  const fx          = data["FX / MAD"]              || [];
  const crypto      = data["CRYPTO"]                || [];
  const banks       = data["BANKS"]                 || [];
  const industry    = data["INDUSTRY / MATERIALS"]  || [];
  const telecom     = data["TELECOM / UTILITIES"]   || [];
  const bonds       = data["RATES / BONDS"]         || [];
  const commodities = data["COMMODITIES"]           || [];
  const indices     = data["GLOBAL INDICES"]        || [];
  const featured    = data["FEATURED MARKET BOXES"] || [];

  const TICKER_IDS = ["MASI","DOW","SPX","NASDAQ","USD/MAD","EUR/MAD","BTC","GOLD","BRENT","US 10Y"];
  const tickerItems = useMemo(() => {
    const all = [...indices, ...fx, ...crypto, ...(data["COMMODITIES"]||[]), ...(data["RATES / BONDS"]||[])];
    return TICKER_IDS.map(id => all.find(x => x.id === id)).filter(Boolean);
  }, [indices, fx, crypto, data]);

  const heroItem = useMemo(()=>{
    if(tab==="overview"||tab==="morocco") return indices.find(x=>x.id==="MASI")||banks[0]||null;
    if(tab==="currencies") return fx[0]||null;
    if(tab==="crypto")     return (data["CRYPTO"]||data["LARGE CAP"]||[])[0]||null;
    if(tab==="commodities")return (data["COMMODITIES"]||[])[0]||null;
    if(tab==="bonds")      return (data["RATES / BONDS"]||[])[0]||null;
    if(tab==="indices")    return indices[0]||null;
    if(tab==="usa")        return (data["USA STOCKS"]||[])[0]||null;
    if(tab==="europe")     return (data["EUROPE STOCKS"]||[])[0]||null;
    if(tab==="gcc")        return (data["GCC STOCKS"]||[])[0]||null;
    if(tab==="asia")       return (data["ASIA STOCKS"]||[])[0]||null;
    return null;
  },[tab,indices,banks,fx,data]);

  /* All main items for the table, optionally filtered by sector */
  const allItems = useMemo(()=>{
    const skip=new Set(["FEATURED MARKET BOXES"]);
    if(activeSector) return data[activeSector]||[];
    if(tab==="usa")        return data["USA STOCKS"]    || [];
    if(tab==="europe")     return data["EUROPE STOCKS"] || [];
    if(tab==="gcc")        return data["GCC STOCKS"]    || [];
    if(tab==="asia")       return data["ASIA STOCKS"]   || [];
    if(tab==="morocco")    return [...(data["BANKS"]||[]), ...(data["TELECOM / UTILITIES"]||[]), ...(data["INDUSTRY / MATERIALS"]||[])];
    if(tab==="currencies") return data["FX / MAD"]      || [];
    if(tab==="crypto")     return data["CRYPTO"]        || data["LARGE CAP"] || [];
    if(tab==="commodities")return data["COMMODITIES"]   || [];
    if(tab==="bonds")      return data["RATES / BONDS"] || [];
    if(tab==="indices")    return data["GLOBAL INDICES"]|| [];
    // overview: show Morocco stocks only
    return [...(data["BANKS"]||[]), ...(data["TELECOM / UTILITIES"]||[]), ...(data["INDUSTRY / MATERIALS"]||[])];
  },[data,activeSector,tab]);

  const tabLabel = TABS.find(t=>t.key===tab)?.label||tab;

  /* sidebar items */
  const sideItems = useMemo(()=>[...banks,...telecom,...industry].filter(i=>i?.id),[banks,telecom,industry]);
  const rightItems = useMemo(()=>[...fx,...crypto.slice(0,3)].filter(i=>i?.id),[fx,crypto]);

  /* ── per-tab sidebar content ── */
  const LeftSidebar = () => {
    if (tab === "morocco")    return <><Watchlist title="Actions Maroc" items={[...banks,...telecom,...industry]} activeId={selectedItem?.id} onSelect={setSelectedItem}/><SectorPills data={data} activeSector={activeSector} onSector={setActiveSector}/></>;
    if (tab === "indices")    return <Watchlist title="Major Indices" items={indices.slice(0,15)} activeId={selectedItem?.id} onSelect={setSelectedItem}/>;
    if (tab === "usa")        return <Watchlist title="🇺🇸 US Mega Cap" items={(data["USA STOCKS"]||[]).slice(0,15)} activeId={selectedItem?.id} onSelect={setSelectedItem}/>;
    if (tab === "europe")     return <Watchlist title="🇪🇺 Europe Top" items={(data["EUROPE STOCKS"]||[]).slice(0,15)} activeId={selectedItem?.id} onSelect={setSelectedItem}/>;
    if (tab === "gcc")        return <Watchlist title="🌙 GCC Markets" items={(data["GCC STOCKS"]||[]).slice(0,15)} activeId={selectedItem?.id} onSelect={setSelectedItem}/>;
    if (tab === "asia")       return <Watchlist title="🌏 Asia Top" items={(data["ASIA STOCKS"]||[]).slice(0,15)} activeId={selectedItem?.id} onSelect={setSelectedItem}/>;
    if (tab === "currencies") return <Watchlist title="MAD Pairs" items={fx.filter(x=>x.id?.includes("/MAD")).slice(0,12)} activeId={selectedItem?.id} onSelect={setSelectedItem}/>;
    if (tab === "crypto")     return <Watchlist title="Top Crypto" items={(data["LARGE CAP"]||crypto).slice(0,12)} activeId={selectedItem?.id} onSelect={setSelectedItem}/>;
    if (tab === "commodities")return <Watchlist title="Commodities" items={(data["COMMODITIES"]||[]).slice(0,12)} activeId={selectedItem?.id} onSelect={setSelectedItem}/>;
    if (tab === "bonds")      return <Watchlist title="Bond Yields" items={(data["RATES / BONDS"]||bonds).slice(0,12)} activeId={selectedItem?.id} onSelect={setSelectedItem}/>;
    return <><Watchlist title="Casablanca" items={[...banks,...telecom,...industry].slice(0,10)} activeId={selectedItem?.id} onSelect={setSelectedItem}/><Watchlist title="Indices" items={indices.slice(0,8)} activeId={null} onSelect={setSelectedItem}/></>;
  };

  const RightSidebar = () => (
    <>
      {selectedItem && <DetailCard item={selectedItem} onClose={()=>setSelectedItem(null)}/>}
      {!selectedItem && tab === "currencies" && <Watchlist title="Majors" items={fx.filter(x=>!x.id?.includes("MAD")).slice(0,8)} activeId={null} onSelect={setSelectedItem}/>}
      {!selectedItem && tab === "crypto"     && <Watchlist title="DeFi / L2" items={(data["DEFI / LAYER2"]||[]).slice(0,8)} activeId={null} onSelect={setSelectedItem}/>}
      {!selectedItem && tab === "bonds"      && <Watchlist title="Spreads" items={(data["RATES / BONDS"]||[]).slice(0,8)} activeId={null} onSelect={setSelectedItem}/>}
      {!selectedItem && !["currencies","crypto","bonds"].includes(tab) && <Watchlist title="Forex" items={fx.slice(0,6)} activeId={null} onSelect={setSelectedItem}/>}
      <NewsPanel/>
      <CalPanel/>
    </>
  );

  return (
    <div style={{background:C.bg, color:C.text, minHeight:"100vh", fontFamily:F.sans}}>
      <style>{GLOBAL_CSS}</style>

      {/* Zellige band */}
      <div style={{height:5, background:"linear-gradient(90deg,#1a3a8c,#4ab8a0,#f0c040,#d4900a,#2a7a3a,#4ab8a0,#1a3a8c)", position:"sticky", top:0, zIndex:700}}/>

      {/* Ticker */}
      <Ticker items={tickerItems}/>

      {/* World Clock */}
      <WorldClock/>

      {/* Navbar */}
      <Navbar activeTab={tab} onTab={t=>{setTab(t);setSelectedItem(null);setActiveSector(null);}} updatedAt={updatedAt}/>

      {/* Error */}
      {error && <div style={{padding:"8px 20px", background:"rgba(255,59,48,.08)", borderBottom:`1px solid rgba(255,59,48,.2)`, fontFamily:F.mono, fontSize:"0.65rem", color:C.dn}}>⚠ {error}</div>}

      {/* Body */}
      {loading ? <Loader/> : tab === "overview" ? (
        <MoroccoOverview
          data={data} indices={indices} fx={fx} crypto={crypto}
          banks={banks} telecom={telecom} industry={industry}
          onSelect={setSelectedItem}
        />

      ) : (

        /* ══════════════════════════════════════════
           CATEGORY PAGES — 3-column layout
        ══════════════════════════════════════════ */
        <div style={{display:"grid", gridTemplateColumns:"200px 1fr 210px", minHeight:"calc(100vh - 150px)"}}>

          {/* Left sidebar — tab-specific */}
          <aside style={{padding:"12px 10px", borderRight:`1px solid ${C.border}`, overflowY:"auto", maxHeight:"calc(100vh - 150px)", display:"flex", flexDirection:"column", gap:10, position:"sticky", top:150, alignSelf:"start"}}>
            <LeftSidebar/>
          </aside>

          {/* Main content */}
          <main style={{padding:"12px 14px", display:"flex", flexDirection:"column", gap:10, minWidth:0}}>

            {/* KPI strip — compact */}
            <KpiStrip data={data} tab={tab}/>

            {/* Hero chart — reduced height */}
            {heroItem && <div className="fade-up"><ChartHero item={heroItem} label={tabLabel}/></div>}

            {/* Main content per tab */}
            {tab === "crypto"     && <CryptoGrid data={data}/>}
            {tab === "currencies" && <FXCardGrid items={fx}/>}
            {tab === "bonds"      && <BondsPanel data={data}/>}
            {tab === "commodities"&& <CommoditiesPanel data={data}/>}
            {!["crypto","currencies","bonds","commodities"].includes(tab) && allItems.length > 0 && (
              <div className="fade-up"><StockTable items={allItems} activeId={selectedItem?.id} onSelect={setSelectedItem}/></div>
            )}

            {/* Morocco extras */}
            {tab === "morocco" && <><FearGreedCard data={data}/><Heatmap data={data}/></>}
          </main>

          {/* Right sidebar */}
          <aside style={{padding:"12px 10px", borderLeft:`1px solid ${C.border}`, overflowY:"auto", maxHeight:"calc(100vh - 150px)", display:"flex", flexDirection:"column", gap:10, position:"sticky", top:150, alignSelf:"start"}}>
            <RightSidebar/>
          </aside>
        </div>
      )}

      {/* Footer */}
      <footer style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 20px", background:C.surface, borderTop:`1px solid ${C.border}`, fontFamily:F.mono, fontSize:"0.55rem", color:C.text3}}>
        <span><span style={{color:C.up}}>●</span> Morocco-first market dashboard · Données indicatives</span>
        <span>{updatedAt ? "Updated: "+updatedAt : "—"}</span>
        <span>EODHD · Drahmi API · © 2026</span>
      </footer>
    </div>
  );
}
