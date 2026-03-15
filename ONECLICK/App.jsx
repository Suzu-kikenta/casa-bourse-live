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
  .nav-btn.active { color: #f0c040 !important; border-bottom: 2px solid #f0c040 !important; }
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
      position:"sticky", top:32, zIndex:490,
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
      position:"sticky", top:38, zIndex:500,
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
              color: activeTab===tab.key ? C.gold : C.text2,
              background:"none", border:"none",
              borderBottom: activeTab===tab.key ? `2px solid ${C.gold}` : "2px solid transparent",
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
                <td style={{padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{
                      width:32, height:32, borderRadius:8, flexShrink:0,
                      background:`linear-gradient(135deg,${u?"rgba(52,199,89,0.15)":"rgba(255,59,48,0.15)"},${u?"rgba(52,199,89,0.05)":"rgba(255,59,48,0.05)"})`,
                      border:`1px solid ${u?"rgba(52,199,89,0.2)":"rgba(255,59,48,0.2)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:F.mono, fontSize:"0.58rem", fontWeight:700,
                      color: u?C.up:C.dn,
                      letterSpacing:"-0.02em",
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

  const tickerItems = useMemo(()=>[...fx.slice(0,3),...crypto.slice(0,2),...indices.slice(0,2),...banks.slice(0,2)].filter(i=>i?.id),[fx,crypto,indices,banks]);

  const heroItem = useMemo(()=>
    indices.find(x=>x.id==="MASI")||featured[0]||fx[0]||crypto[0]||banks[0]
  ,[indices,featured,fx,crypto,banks]);

  /* All main items for the table, optionally filtered by sector */
  const allItems = useMemo(()=>{
    const skip=new Set(["FEATURED MARKET BOXES"]);
    if(activeSector) return data[activeSector]||[];
    if(tab==="usa")    return data["USA STOCKS"]    || [];
    if(tab==="europe") return data["EUROPE STOCKS"] || [];
    if(tab==="gcc")    return data["GCC STOCKS"]    || [];
    if(tab==="asia")   return data["ASIA STOCKS"]   || [];
    const arr=[];
    Object.entries(data).forEach(([k,v])=>{
      if(!skip.has(k)&&Array.isArray(v))arr.push(...v);
    });
    return arr;
  },[data,activeSector,tab]);

  const tabLabel = TABS.find(t=>t.key===tab)?.label||tab;

  /* sidebar items */
  const sideItems = useMemo(()=>[...banks,...telecom,...industry].filter(i=>i?.id),[banks,telecom,industry]);
  const rightItems = useMemo(()=>[...fx,...crypto.slice(0,3)].filter(i=>i?.id),[fx,crypto]);

  return (
    <div style={{background:C.bg,color:C.text,minHeight:"100vh",fontFamily:F.sans}}>
      <style>{GLOBAL_CSS}</style>

      {/* Gold zellige-style header band */}
      <div style={{
        height:6,
        background:"linear-gradient(90deg,#1a3a8c,#4ab8a0,#f0c040,#d4900a,#2a7a3a,#4ab8a0,#1a3a8c)",
        position:"sticky",top:0,zIndex:700,
      }}/>

      {/* Ticker */}
      <Ticker items={tickerItems}/>

      {/* Navbar */}
      <Navbar activeTab={tab} onTab={setTab} updatedAt={updatedAt}/>

      {/* World Clock */}
      <WorldClock/>

      {/* Index strip */}
      {!loading && !error && (featured.length||fx.length) && (
        <IndexStrip featured={featured} fx={fx}/>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          padding:"12px 20px",
          background:"rgba(255,59,48,0.08)",borderBottom:"1px solid rgba(255,59,48,0.2)",
          fontFamily:F.mono,fontSize:"0.68rem",color:C.dn,
        }}>
          ⚠ {error} — vérifiez <code style={{color:C.gold}}>/api/market?tab={tab}</code>
        </div>
      )}

      {/* Body */}
      {loading ? <Loader/> : (
        <div style={{
          display:"grid",
          gridTemplateColumns:"220px 1fr 230px",
          gap:0,
          minHeight:"calc(100vh - 120px)",
        }}>

          {/* ── LEFT SIDEBAR ── */}
          <aside style={{
            padding:"14px 12px",
            borderRight:`1px solid ${C.border}`,
            overflowY:"auto",
            maxHeight:"calc(100vh - 120px)",
            display:"flex",flexDirection:"column",gap:12,
          }}>
            <Watchlist title="Actions Maroc" items={sideItems} activeId={selectedItem?.id} onSelect={setSelectedItem}/>
            {indices.length>0 && <Watchlist title="Indices Mondiaux" items={indices} activeId={selectedItem?.id} onSelect={setSelectedItem}/>}
          </aside>

          {/* ── MAIN ── */}
          <main style={{
            padding:"14px 16px",
            overflowY:"auto",
            maxHeight:"calc(100vh - 120px)",
            display:"flex",flexDirection:"column",gap:14,
          }}>
            {/* Summary cards */}
            <SummaryCards data={data}/>

            {/* Hero chart */}
            {heroItem && <div className="fade-up"><ChartHero item={heroItem} label={tabLabel}/></div>}

            {/* Sector filter */}
            {allItems.length>0 && (
              <div className="fade-up">
                <SectorPills data={data} activeSector={activeSector} onSector={setActiveSector}/>
              </div>
            )}

            {/* Main table */}
            {allItems.length>0 && (
              <div className="fade-up">
                <StockTable items={allItems} activeId={selectedItem?.id} onSelect={setSelectedItem}/>
              </div>
            )}

            {/* Heatmap */}
            {["overview","morocco"].includes(tab) && (
              <div className="fade-up"><Heatmap data={data}/></div>
            )}
          </main>

          {/* ── RIGHT SIDEBAR ── */}
          <aside style={{
            padding:"14px 12px",
            borderLeft:`1px solid ${C.border}`,
            overflowY:"auto",
            maxHeight:"calc(100vh - 120px)",
            display:"flex",flexDirection:"column",gap:12,
          }}>
            {/* Detail card (shown when row is clicked) */}
            {selectedItem && (
              <DetailCard item={selectedItem} onClose={()=>setSelectedItem(null)}/>
            )}

            {/* Forex quick */}
            {!selectedItem && rightItems.length>0 && (
              <Watchlist title="Forex & Crypto" items={rightItems} activeId={null} onSelect={setSelectedItem}/>
            )}

            <NewsPanel/>
            <CalPanel/>
          </aside>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"10px 20px",
        background:C.surface,
        borderTop:`1px solid ${C.border}`,
        fontFamily:F.mono,fontSize:"0.55rem",color:C.text3,
      }}>
        <span style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.up}}>●</span>
          Drahmi · Bourse de Casablanca · Données indicatives
        </span>
        <span>{updatedAt?"Actualisé: "+updatedAt:"—"}</span>
        <span>Sources: EODHD · Drahmi API · © 2026</span>
      </footer>
    </div>
  );
}
