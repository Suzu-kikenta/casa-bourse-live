import React, { useEffect, useMemo, useState } from "react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f1117; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes zellige { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }
  @keyframes ticker-slide { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  .fade-up { animation: fadeUp 0.3s ease both; }
  .row-hover:hover { background: rgba(255,255,255,0.03) !important; }
  .nav-btn:hover { color: #fff !important; }
  .nav-btn.active { color: #0f1117 !important; background: #c9a84c !important; border-radius: 6px !important; border-bottom: none !important; }
`;

const C = {
  bg:"#0f1117", s1:"#161b27", s2:"#1c2333", s3:"#222d42",
  bd:"rgba(255,255,255,0.08)", bd2:"rgba(255,255,255,0.04)",
  t1:"#e8eaf0", t2:"#8b95a8", t3:"#5a6478",
  gold:"#c9a84c", up:"#34c759", dn:"#ff3b30",
};
const F = {
  sans:"Inter,-apple-system,sans-serif",
  mono:"'JetBrains Mono','IBM Plex Mono',monospace",
};

const TABS = [
  {key:"overview",    label:"Overview"},
  {key:"morocco",     label:"Casablanca"},
  {key:"indices",     label:"Indices"},
  {key:"usa",         label:"🇺🇸 USA"},
  {key:"europe",      label:"🇪🇺 Europe"},
  {key:"gcc",         label:"🌙 GCC"},
  {key:"asia",        label:"🌏 Asia"},
  {key:"currencies",  label:"Forex"},
  {key:"crypto",      label:"Crypto"},
  {key:"commodities", label:"Commodities"},
  {key:"bonds",       label:"Bonds"},
];

const CLOCKS = [
  {city:"Casablanca", tz:"Africa/Casablanca",  flag:"🇲🇦", open:[9,15]},
  {city:"Dubai",      tz:"Asia/Dubai",          flag:"🇦🇪", open:[10,14]},
  {city:"Riyadh",     tz:"Asia/Riyadh",         flag:"🇸🇦", open:[10,15]},
  {city:"London",     tz:"Europe/London",        flag:"🇬🇧", open:[8,16]},
  {city:"Paris",      tz:"Europe/Paris",         flag:"🇫🇷", open:[9,17]},
  {city:"New York",   tz:"America/New_York",     flag:"🇺🇸", open:[9.5,16]},
  {city:"Tokyo",      tz:"Asia/Tokyo",           flag:"🇯🇵", open:[9,15.5]},
  {city:"Shanghai",   tz:"Asia/Shanghai",        flag:"🇨🇳", open:[9,15]},
  {city:"Hong Kong",  tz:"Asia/Hong_Kong",       flag:"🇭🇰", open:[9,16]},
];

const NEWS_CATEGORIES = ["All","Morocco","Macro","Forex","Crypto","Energy","Commodities"];

const NEWS_SEED = [
  {time:"14:42", title:"Bank Al-Maghrib holds key rate at 2.75%", tag:"BAM", cat:"Macro", hot:true, summary:"The central bank confirms the rate hold, signaling monetary stability amid controlled inflation at 2.3%."},
  {time:"14:18", title:"ATW reports +12% net profit in Q1 2026", tag:"ATW", cat:"Morocco", summary:"Attijariwafa Bank beats expectations driven by mortgage credit growth and rising fee income."},
  {time:"13:55", title:"Maroc Telecom launches 5G offer in 5 cities", tag:"IAM", cat:"Morocco", summary:"IAM accelerates 5G rollout in Casablanca, Rabat, Marrakech, Fes and Tangier, targeting 30% national coverage by end of 2026."},
  {time:"13:30", title:"MASI breaks through 13,800 pts for first time", tag:"MASI", cat:"Morocco", hot:true, summary:"Casablanca's benchmark index hits a historic high, driven by banking stocks and OCP."},
  {time:"12:48", title:"HPS wins payment contract in Sub-Saharan Africa", tag:"HPS", cat:"Morocco", summary:"HPS Payment Solutions signs a strategic deal with a pan-African banking consortium to deploy its PowerCARD platform."},
  {time:"12:10", title:"OCP: phosphate exports +18% in Q1 2026", tag:"OCP", cat:"Morocco", summary:"OCP Group records a record rise in exports driven by strong Asian demand and recovering fertilizer prices."},
  {time:"11:45", title:"EUR/MAD under pressure after euro zone inflation data", tag:"EUR/MAD", cat:"Forex", summary:"European inflation at 2.8% strengthens ECB rate cut expectations, weighing on the euro against the dirham."},
  {time:"11:20", title:"Bitcoin consolidates above $87,000", tag:"BTC", cat:"Crypto", summary:"BTC holds its key support despite institutional selling pressure, with spot ETFs showing net positive inflows."},
  {time:"10:55", title:"Brent: OPEC+ maintains production cuts", tag:"BRENT", cat:"Energy", summary:"The OPEC+ coalition confirms the 2.2 mb/d reduction through end of June, supporting prices above $83/b."},
  {time:"10:30", title:"Gold: new record above $3,100/oz", tag:"GOLD", cat:"Commodities", hot:true, summary:"Gold hits a historic peak driven by geopolitical tensions, trade uncertainty, and central bank demand."},
];

const CALENDAR = [
  {time:"15:30", event:"🇺🇸 PPI (March)", imp:3},
  {time:"16:00", event:"🇲🇦 BAM Reserves", imp:2},
  {time:"18:00", event:"🇺🇸 EIA Oil Stocks", imp:2},
  {time:"Thu",   event:"🇪🇺 ECB Decision", imp:3},
  {time:"Fri",   event:"🇺🇸 NFP Jobs", imp:3},
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function fv(v) {
  v = Number(v);
  if (!isFinite(v)) return "—";
  if (v >= 100000) return v.toLocaleString("en-US", {maximumFractionDigits:0});
  if (v >= 1000)   return v.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
  if (v >= 100)    return v.toFixed(2);
  if (v >= 10)     return v.toFixed(3);
  if (v >= 1)      return v.toFixed(4);
  if (v >= 0.01)   return v.toFixed(5);
  return v.toFixed(7);
}
function fc(c) {
  const n = Number(c ?? 0);
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}
const isUp = c => Number(c ?? 0) >= 0;

// ─── SPARK ─────────────────────────────────────────────────────────────────────
let _sid = 0;
function Spark({ series, up: u, w=80, h=32 }) {
  const id = useMemo(() => `sp${_sid++}`, []);
  if (!Array.isArray(series) || series.length < 2) return <div style={{width:w,height:h}}/>;
  const mn = Math.min(...series), mx = Math.max(...series), rng = mx-mn||1;
  const p = 2;
  const pts = series.map((v,i) => [p+(i/(series.length-1))*(w-p*2), h-p-((v-mn)/rng)*(h-p*2)]);
  let line = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i=1;i<pts.length;i++) line += ` H${pts[i][0].toFixed(1)} V${pts[i][1].toFixed(1)}`;
  let area = `M${pts[0][0].toFixed(1)},${h} V${pts[0][1].toFixed(1)}`;
  for (let i=1;i<pts.length;i++) area += ` H${pts[i][0].toFixed(1)} V${pts[i][1].toFixed(1)}`;
  area += ` V${h} Z`;
  const clr = u ? "#34c759" : "#ff3b30";
  const [lx,ly] = pts[pts.length-1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{display:"block",width:"100%",height:h,flexShrink:0}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={clr} stopOpacity={u?0.25:0.18}/>
          <stop offset="100%" stopColor={clr} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`}/>
      <path d={line} fill="none" stroke={clr} strokeWidth={1.5}/>
      <circle cx={lx} cy={ly} r={2} fill={clr}/>
    </svg>
  );
}

// ─── PILL ──────────────────────────────────────────────────────────────────────
function Pill({ change }) {
  const u = isUp(change);
  const n = Number(change ?? 0);
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:3,
      padding:"2px 6px", borderRadius:4,
      background: u ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.12)",
      color: u ? C.up : C.dn,
      fontFamily:F.mono, fontSize:"0.65rem", fontWeight:600,
      whiteSpace:"nowrap",
    }}>
      {u ? "▲" : "▼"} {Math.abs(n).toFixed(2)}%
    </span>
  );
}

// ─── TICKER ────────────────────────────────────────────────────────────────────
function Ticker({ items }) {
  if (!items.length) return null;
  const repeated = [...items,...items,...items];
  return (
    <div style={{
      height:32, overflow:"hidden", background:"#0a0e17",
      borderBottom:`1px solid ${C.bd}`,
      position:"sticky", top:6, zIndex:600,
    }}>
      <div style={{
        display:"flex", alignItems:"center", height:"100%",
        animation:"ticker-slide 40s linear infinite",
        width:"300%",
      }}>
        {repeated.map((item,i) => {
          const u = isUp(item.change);
          return (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"0 20px", whiteSpace:"nowrap", flexShrink:0,
              borderRight:`1px solid ${C.bd}`,
            }}>
              <span style={{fontFamily:F.mono,fontSize:"0.65rem",color:C.t2}}>{item.id}</span>
              <span style={{fontFamily:F.mono,fontSize:"0.65rem",fontWeight:600,color:C.t1}}>{fv(Number(item.value))}</span>
              <span style={{fontFamily:F.mono,fontSize:"0.6rem",color:u?C.up:C.dn}}>{fc(item.change)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── WORLD CLOCK ───────────────────────────────────────────────────────────────
function WorldClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      display:"flex", alignItems:"stretch", overflowX:"auto", scrollbarWidth:"none",
      background:C.s1, borderBottom:`1px solid ${C.bd}`,
      position:"sticky", top:38, zIndex:490,
    }}>
      {CLOCKS.map(c => {
        const ts = now.toLocaleTimeString("en-GB",{timeZone:c.tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
        const h = parseInt(ts.split(":")[0],10) + parseInt(ts.split(":")[1],10)/60;
        const day = now.toLocaleDateString("en-GB",{timeZone:c.tz,weekday:"short"});
        const open = !["Sat","Sun"].includes(day) && h >= c.open[0] && h < c.open[1];
        return (
          <div key={c.city} style={{
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            padding:"5px 14px", gap:2, borderRight:`1px solid ${C.bd2}`,
            flexShrink:0, minWidth:88,
            background: open ? "rgba(52,199,89,0.04)" : "transparent",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:11}}>{c.flag}</span>
              <span style={{fontFamily:F.sans,fontSize:"0.62rem",fontWeight:500,color:C.t2}}>{c.city}</span>
            </div>
            <div style={{fontFamily:F.mono,fontSize:"0.82rem",fontWeight:600,color:C.t1}}>{ts.slice(0,5)}</div>
            <div style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:open?C.up:C.t3}}/>
              <span style={{fontFamily:F.mono,fontSize:"0.52rem",color:open?C.up:C.t3}}>{open?"OPEN":"CLOSED"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── NAVBAR ────────────────────────────────────────────────────────────────────
function Navbar({ tab, onTab, updatedAt }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-GB",{timeZone:"Africa/Casablanca",hour12:false}));
    tick(); const id = setInterval(tick,1000); return () => clearInterval(id);
  }, []);
  return (
    <nav style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 16px", background:C.s1, borderBottom:`1px solid ${C.bd}`,
      height:50, position:"sticky", top:88, zIndex:500,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{
          width:32,height:32,borderRadius:8,flexShrink:0,
          background:"linear-gradient(135deg,#f5d800,#c8901c)",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 0 14px rgba(245,216,0,0.35)",
        }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <polygon points="10,1 11.8,7.2 18.5,7.2 13.1,10.9 14.9,17.1 10,13.5 5.1,17.1 6.9,10.9 1.5,7.2 8.2,7.2" fill="#0d1117"/>
          </svg>
        </div>
        <div>
          <div style={{fontFamily:F.sans,fontSize:"0.95rem",fontWeight:700,color:C.t1,lineHeight:1,letterSpacing:"0.02em"}}>
            Market Observatory
          </div>
          <div style={{fontFamily:F.mono,fontSize:"0.48rem",color:C.t3,letterSpacing:"0.14em",marginTop:1}}>
            BOURSE DE CASABLANCA
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:2,alignItems:"center",overflowX:"auto",scrollbarWidth:"none",padding:"0 12px"}}>
        {TABS.map(t2 => (
          <button key={t2.key} onClick={() => onTab(t2.key)}
            className={`nav-btn${tab===t2.key?" active":""}`}
            style={{
              fontFamily:F.sans, fontSize:"0.78rem",
              fontWeight: tab===t2.key ? 600 : 400,
              color: tab===t2.key ? "#0f1117" : C.t2,
              background: tab===t2.key ? C.gold : "none",
              border:"none", borderRadius: tab===t2.key ? 6 : 0,
              borderBottom: tab===t2.key ? "none" : `2px solid transparent`,
              padding:"0 10px", height:50, cursor:"pointer",
              transition:"all 0.15s", whiteSpace:"nowrap",
            }}>
            {t2.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        {updatedAt && <div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.up,animation:"pulse 2s infinite"}}/>
          <span style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3}}>{t}</span>
        </div>}
      </div>
    </nav>
  );
}

// ─── CSE SESSION HOOK ──────────────────────────────────────────────────────────
function useCSESession() {
  const [s, setS] = useState({open:false,label:"",countdown:"",pct:0});
  useEffect(() => {
    function calc() {
      const now = new Date();
      const loc = now.toLocaleString("en-GB",{timeZone:"Africa/Casablanca",hour:"numeric",minute:"numeric",hour12:false});
      const [hh,mm] = loc.split(":").map(Number);
      const hm = hh + mm/60;
      const day = now.toLocaleString("en-GB",{timeZone:"Africa/Casablanca",weekday:"short"});
      const wd = !["Sat","Sun"].includes(day);
      const open = wd && hm>=9 && hm<15;
      let label,countdown,pct;
      if (!wd) { label="Weekend"; countdown="Opens Monday 09:00"; pct=0; }
      else if (hm<9) { const m=Math.round((9-hm)*60); countdown=`Opens in ${Math.floor(m/60)}h ${m%60}m`; label="Pre-Market"; pct=0; }
      else if (open) { pct=Math.min(100,Math.round((hm-9)/6*100)); const m=Math.round((15-hm)*60); countdown=`Closes in ${Math.floor(m/60)}h ${m%60}m`; label="Session Open"; }
      else { label="Session Closed"; countdown="Opens tomorrow 09:00"; pct=100; }
      setS({open,label,countdown,pct});
    }
    calc(); const id=setInterval(calc,30000); return ()=>clearInterval(id);
  },[]);
  return s;
}

// ─── WATCHLIST ─────────────────────────────────────────────────────────────────
function Watchlist({ title, items, activeId, onSelect }) {
  if (!items?.length) return null;
  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>{title}</div>
      {items.slice(0,15).map((item,i) => {
        const u = isUp(item.change);
        return (
          <div key={i} onClick={()=>onSelect&&onSelect(item)}
            className="row-hover"
            style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 12px",borderBottom:`1px solid ${C.bd2}`,cursor:"pointer",background:activeId===item.id?"rgba(255,255,255,0.04)":"transparent"}}>
            <div>
              <div style={{fontFamily:F.mono,fontSize:"0.68rem",fontWeight:600,color:C.t1}}>{item.id}</div>
              <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3}}>{fv(Number(item.value))}</div>
            </div>
            <Pill change={item.change}/>
          </div>
        );
      })}
    </div>
  );
}

// ─── STOCK TABLE ───────────────────────────────────────────────────────────────
function StockTable({ items, activeId, onSelect }) {
  const [sortCol, setSortCol] = useState("change");
  const [sortDir, setSortDir] = useState(-1);
  const sorted = useMemo(() => {
    return [...items].sort((a,b) => {
      const av = Number(a[sortCol]??0), bv = Number(b[sortCol]??0);
      return (bv-av)*sortDir;
    });
  },[items,sortCol,sortDir]);
  const maxAbs = useMemo(()=>Math.max(...items.map(x=>Math.abs(Number(x.change||0))),0.01),[items]);
  function th(col,label,align="left") {
    return (
      <th onClick={()=>{if(sortCol===col)setSortDir(d=>d*-1);else{setSortCol(col);setSortDir(-1);}}}
        style={{fontFamily:F.sans,fontSize:"0.62rem",fontWeight:500,color:C.t3,padding:"6px 12px",textAlign:align,borderBottom:`1px solid ${C.bd}`,cursor:"pointer",whiteSpace:"nowrap",userSelect:"none"}}>
        {label}{sortCol===col&&<span style={{marginLeft:4,opacity:0.7}}>{sortDir<0?"↓":"↑"}</span>}
      </th>
    );
  }
  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr>
            {th("id","Stock")}{th("value","Price","right")}{th("change","Chg %","right")}
            <th style={{fontFamily:F.sans,fontSize:"0.62rem",color:C.t3,padding:"6px 12px",textAlign:"right",borderBottom:`1px solid ${C.bd}`}}>Bar</th>
            <th style={{fontFamily:F.sans,fontSize:"0.62rem",color:C.t3,padding:"6px 12px",textAlign:"right",borderBottom:`1px solid ${C.bd}`}}>7D</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item,i) => {
            const u = isUp(item.change);
            const barW = (Math.abs(Number(item.change||0))/maxAbs*80).toFixed(1);
            return (
              <tr key={i} className="row-hover" onClick={()=>onSelect&&onSelect(item)}
                style={{borderBottom:`1px solid ${C.bd2}`,cursor:"pointer",background:activeId===item.id?"rgba(255,255,255,0.04)":"transparent"}}>
                <td style={{padding:"5px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:26,height:26,borderRadius:6,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.mono,fontSize:"0.55rem",fontWeight:700,color:u?C.up:C.dn,background:u?"rgba(52,199,89,0.12)":"rgba(255,59,48,0.12)"}}>
                      {item.id.slice(0,3)}
                    </div>
                    <div>
                      <div style={{fontFamily:F.sans,fontSize:"0.75rem",fontWeight:500,color:C.t1}}>{item.id}</div>
                      <div style={{fontFamily:F.sans,fontSize:"0.62rem",color:C.t3,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:"5px 12px",textAlign:"right",fontFamily:F.mono,fontSize:"0.72rem",color:C.t1}}>{fv(Number(item.value))}</td>
                <td style={{padding:"5px 12px",textAlign:"right"}}><Pill change={item.change}/></td>
                <td style={{padding:"5px 12px",textAlign:"right"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4}}>
                    <div style={{width:`${barW}px`,height:4,borderRadius:2,background:u?C.up:C.dn,minWidth:2}}/>
                  </div>
                </td>
                <td style={{padding:"5px 12px",width:80}}>
                  <Spark series={item.series||[]} up={u} w={80} h={24}/>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── DETAIL CARD ───────────────────────────────────────────────────────────────
function DetailCard({ item, onClose }) {
  if (!item) return null;
  const u = isUp(item.change);
  const stats = [
    {l:"Price",   v:fv(Number(item.value))},
    {l:"Change",  v:fc(item.change)},
    {l:"High",    v:item.series?.length ? fv(Math.max(...item.series)) : "—"},
    {l:"Low",     v:item.series?.length ? fv(Math.min(...item.series)) : "—"},
  ];
  return (
    <div style={{background:C.s1,border:`1px solid ${u?"rgba(52,199,89,.25)":"rgba(255,59,48,.25)"}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:`1px solid ${C.bd}`}}>
        <div>
          <div style={{fontFamily:F.mono,fontSize:"0.72rem",fontWeight:700,color:C.t1}}>{item.id}</div>
          <div style={{fontFamily:F.sans,fontSize:"0.62rem",color:C.t3}}>{item.name}</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.t3,cursor:"pointer",fontSize:"1rem"}}>×</button>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontFamily:F.mono,fontSize:"2rem",fontWeight:700,color:C.t1,marginBottom:4}}>{fv(Number(item.value))}</div>
        <Pill change={item.change}/>
        <div style={{marginTop:12,height:60}}><Spark series={item.series||[]} up={u} w={200} h={60}/></div>
        <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {stats.map((s,i)=>(
            <div key={i} style={{background:C.s2,borderRadius:6,padding:"6px 10px"}}>
              <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3,marginBottom:2}}>{s.l}</div>
              <div style={{fontFamily:F.mono,fontSize:"0.72rem",fontWeight:600,color:C.t1}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI NEWS FEED ──────────────────────────────────────────────────────────────
function NewsPanel({ compact = false }) {
  const [cat, setCat]         = useState("All");
  const [items, setItems]     = useState(NEWS_SEED);
  const [aiStatus, setAiStatus] = useState("idle"); // idle | loading | done | error
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery]     = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [asking, setAsking]   = useState(false);

  // Fetch AI-generated news summary on mount
  useEffect(() => {
    let cancelled = false;
    setAiStatus("loading");
    const prompt = `You are a financial assistant specializing in Moroccan and global markets.
Generate 6 realistic and recent financial news headlines (March 2026) in strict JSON format.
Topics: Casablanca Stock Exchange, Moroccan dirham, OCP, ATW, IAM, Morocco macro, MAD Forex, commodities.
Respond ONLY with a JSON array, no markdown, using this exact format:
[{"time":"HH:MM","title":"...","tag":"...","cat":"...","hot":false,"summary":"..."}]
- time: between 08:00 and 17:00
- title: headline in English, max 80 chars
- tag: asset code (e.g. MASI, ATW, USD/MAD, BTC, GOLD, OCP, IAM)
- cat: one of ["Morocco","Macro","Forex","Crypto","Energy","Commodities"]
- hot: true for max 2 items
- summary: 1-2 sentences of analysis, max 150 chars`;

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const text = data.content?.map(b => b.text || "").join("") || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length) {
          setItems([...parsed, ...NEWS_SEED].slice(0, 12));
          setAiStatus("done");
        } else { setAiStatus("error"); }
      })
      .catch(() => { if (!cancelled) setAiStatus("error"); });
    return () => { cancelled = true; };
  }, []);

  // Ask AI a question about markets
  async function handleAsk() {
    if (!query.trim() || asking) return;
    setAsking(true); setAiAnswer("");
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `You are a financial analyst expert in Moroccan and global markets (March 2026). Answer in English, concisely (3-4 sentences max). Question: ${query}` }],
        }),
      });
      const d = await r.json();
      setAiAnswer(d.content?.map(b => b.text || "").join("") || "No response received.");
    } catch { setAiAnswer("Error contacting the AI. Please try again."); }
    setAsking(false);
  }

  const filtered = items.filter(n => cat === "All" || n.cat === cat);

  const catColor = {
    Morocco: C.gold, Macro: "#7ab0ff", Forex: "#a78bfa",
    Crypto: "#f59e0b", Energy: "#ef4444", Commodities: "#10b981",
  };

  if (compact) {
    // Compact sidebar mode
    return (
      <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
        <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>LATEST NEWS</span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {aiStatus==="loading"&&<span style={{fontFamily:F.mono,fontSize:"0.5rem",color:C.t3}}>AI…</span>}
            {aiStatus==="done"&&<span style={{fontFamily:F.mono,fontSize:"0.5rem",color:C.up}}>✦ AI</span>}
            <span style={{fontFamily:F.mono,fontSize:"0.55rem",color:C.up}}>● LIVE</span>
          </div>
        </div>
        {filtered.slice(0,6).map((n,i)=>(
          <div key={i} onClick={()=>setExpanded(expanded===i?null:i)}
            style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd2}`,cursor:"pointer",background:expanded===i?"rgba(255,255,255,0.03)":"transparent"}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3,flexShrink:0,marginTop:1}}>{n.time}</span>
              <div style={{flex:1}}>
                <span style={{fontFamily:F.sans,fontSize:"0.65rem",color:n.hot?C.t1:C.t2,lineHeight:1.4}}>{n.title}</span>
                <span style={{marginLeft:6,fontFamily:F.mono,fontSize:"0.5rem",padding:"1px 5px",borderRadius:3,background:"rgba(255,255,255,0.06)",color:catColor[n.cat]||C.gold}}>{n.tag}</span>
              </div>
            </div>
            {expanded===i&&n.summary&&(
              <div style={{marginTop:6,marginLeft:38,fontFamily:F.sans,fontSize:"0.62rem",color:C.t3,lineHeight:1.5,borderLeft:`2px solid ${catColor[n.cat]||C.gold}`,paddingLeft:8}}>
                {n.summary}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full expanded mode (overview row)
  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:F.mono,fontSize:"0.62rem",color:C.gold,letterSpacing:"0.1em"}}>MARKET NEWS</span>
          {aiStatus==="loading"&&<span style={{fontFamily:F.mono,fontSize:"0.52rem",color:C.t3,display:"flex",alignItems:"center",gap:4}}><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",border:`1.5px solid ${C.t3}`,borderTopColor:C.gold,animation:"spin 0.8s linear infinite"}}/>AI loading…</span>}
          {aiStatus==="done"&&<span style={{fontFamily:F.mono,fontSize:"0.52rem",color:C.up,padding:"1px 6px",borderRadius:3,background:"rgba(52,199,89,0.1)"}}>✦ Enhanced by AI</span>}
          {aiStatus==="error"&&<span style={{fontFamily:F.mono,fontSize:"0.52rem",color:C.t3}}>local data</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          {NEWS_CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{
              fontFamily:F.mono, fontSize:"0.52rem", padding:"2px 8px",
              borderRadius:3, border:`1px solid ${cat===c?(catColor[c]||C.gold):C.bd}`,
              background: cat===c?`${catColor[c]||C.gold}18`:"transparent",
              color: cat===c?(catColor[c]||C.gold):C.t3,
              cursor:"pointer",
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* News grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
        {filtered.slice(0,6).map((n,i)=>(
          <div key={i} onClick={()=>setExpanded(expanded===i?null:i)}
            style={{
              padding:"10px 14px",
              borderBottom:`1px solid ${C.bd2}`,
              borderRight: i%2===0?`1px solid ${C.bd2}`:"none",
              cursor:"pointer",
              background: expanded===i?"rgba(255,255,255,0.025)":n.hot?"rgba(201,168,76,0.03)":"transparent",
              transition:"background 0.15s",
            }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4,gap:8}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                {n.hot&&<span style={{fontFamily:F.mono,fontSize:"0.48rem",padding:"1px 5px",borderRadius:2,background:"rgba(255,59,48,0.15)",color:C.dn,letterSpacing:"0.08em"}}>HOT</span>}
                <span style={{fontFamily:F.mono,fontSize:"0.52rem",padding:"1px 6px",borderRadius:2,background:"rgba(255,255,255,0.06)",color:catColor[n.cat]||C.gold}}>{n.tag}</span>
                <span style={{fontFamily:F.mono,fontSize:"0.48rem",padding:"1px 5px",borderRadius:2,background:"rgba(255,255,255,0.04)",color:C.t3}}>{n.cat}</span>
              </div>
              <span style={{fontFamily:F.mono,fontSize:"0.55rem",color:C.t3,flexShrink:0}}>{n.time}</span>
            </div>
            <div style={{fontFamily:F.sans,fontSize:"0.72rem",fontWeight:n.hot?600:400,color:n.hot?C.t1:C.t2,lineHeight:1.4,marginBottom:expanded===i?6:0}}>
              {n.title}
            </div>
            {expanded===i&&n.summary&&(
              <div style={{fontFamily:F.sans,fontSize:"0.62rem",color:C.t3,lineHeight:1.55,borderLeft:`2px solid ${catColor[n.cat]||C.gold}`,paddingLeft:8,marginTop:6}}>
                {n.summary}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Q&A bar */}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${C.bd}`,background:C.s2,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <span style={{fontFamily:F.mono,fontSize:"0.55rem",color:C.gold,flexShrink:0}}>✦ AI Analyst</span>
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleAsk()}
            placeholder="Ask a market question… (e.g. What is the impact of BAM policy on ATW?)"
            style={{
              flex:1, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.bd}`,
              borderRadius:4, padding:"5px 10px", fontFamily:F.sans, fontSize:"0.65rem",
              color:C.t1, outline:"none",
            }}
          />
          <button onClick={handleAsk} disabled={asking||!query.trim()} style={{
            padding:"5px 12px", background:asking?C.s3:C.gold, border:"none", borderRadius:4,
            fontFamily:F.mono, fontSize:"0.58rem", color:asking?C.t3:"#0f1117",
            cursor:asking?"not-allowed":"pointer", flexShrink:0, fontWeight:600,
          }}>
            {asking ? "…" : "Ask"}
          </button>
        </div>
        {aiAnswer&&(
          <div style={{fontFamily:F.sans,fontSize:"0.65rem",color:C.t2,lineHeight:1.55,padding:"8px 12px",background:"rgba(255,255,255,0.03)",borderRadius:6,borderLeft:`2px solid ${C.gold}`}}>
            {aiAnswer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CALENDAR ──────────────────────────────────────────────────────────────────
function CalPanel() {
  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>ECONOMIC CALENDAR</div>
      {CALENDAR.map((e,i)=>(
        <div key={i} style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd2}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3,flexShrink:0,width:32}}>{e.time}</span>
            <span style={{fontFamily:F.sans,fontSize:"0.65rem",color:C.t2}}>{e.event}</span>
          </div>
          <div style={{display:"flex",gap:2}}>
            {[1,2,3].map(d=><div key={d} style={{width:5,height:5,borderRadius:1,background:d<=e.imp?"#ff9f0a":"rgba(255,255,255,0.08)"}}/>)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HEATMAP ───────────────────────────────────────────────────────────────────
function Heatmap({ data }) {
  const items = useMemo(()=>{
    const all=[];
    Object.values(data).forEach(v=>Array.isArray(v)&&v.forEach(i=>i?.id&&all.push(i)));
    return all.filter(i=>i.change!==undefined);
  },[data]);
  if (!items.length) return null;
  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>HEATMAP · 1-Day Performance</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(64px,1fr))",gap:2,padding:6}}>
        {items.map((item,i)=>{
          const u=isUp(item.change);
          const abs=Math.abs(Number(item.change));
          const a=Math.min(0.12+abs*0.16,0.7);
          return (
            <div key={i} style={{background:u?`rgba(52,199,89,${a})`:`rgba(255,59,48,${a})`,padding:"7px 4px",borderRadius:5,textAlign:"center"}}>
              <div style={{fontFamily:F.mono,fontSize:"0.62rem",color:"rgba(255,255,255,.8)",marginBottom:2}}>{item.id}</div>
              <div style={{fontFamily:F.mono,fontSize:"0.6rem",fontWeight:700,color:"#fff"}}>{u?"+":""}{Number(item.change).toFixed(2)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FEAR & GREED ──────────────────────────────────────────────────────────────
function fgZone(s) {
  if (s<=24) return {label:"Extreme Fear",color:"#e74c3c"};
  if (s<=44) return {label:"Fear",color:"#e67e22"};
  if (s<=54) return {label:"Neutral",color:"#c9a84c"};
  if (s<=74) return {label:"Greed",color:"#2ecc71"};
  return {label:"Extreme Greed",color:"#00c853"};
}
function Gauge({ score, size=200 }) {
  const uid = useMemo(() => `g${Math.random().toString(36).slice(2,7)}`, []);
  const W = size, H = size * 0.62;
  const cx = W / 2, cy = H * 0.92;
  const Ro = W * 0.42, Ri = W * 0.28;
  const GAP_DEG = 2.5; // gap between segments in degrees

  const zone = fgZone(score);

  // Convert percentage (0-100) → angle in radians (π → 0, left to right)
  function pctToRad(pct) {
    return Math.PI - (pct / 100) * Math.PI;
  }
  function polarToXY(rad, r) {
    return [cx + Math.cos(rad) * r, cy - Math.sin(rad) * r];
  }

  // Build a donut arc path with small gaps
  function arcPath(pctStart, pctEnd, rOuter, rInner) {
    const gapPct = GAP_DEG / 1.8; // convert deg gap → pct gap
    const s = pctStart + gapPct / 2;
    const e = pctEnd   - gapPct / 2;
    const r1 = pctToRad(s), r2 = pctToRad(e);
    const [x1,y1] = polarToXY(r1, rOuter);
    const [x2,y2] = polarToXY(r2, rOuter);
    const [x3,y3] = polarToXY(r2, rInner);
    const [x4,y4] = polarToXY(r1, rInner);
    const large = (e - s) > 50 ? 1 : 0;
    return [
      `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${rOuter} ${rOuter} 0 ${large} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
      `A ${rInner} ${rInner} 0 ${large} 1 ${x4.toFixed(2)} ${y4.toFixed(2)}`,
      `Z`
    ].join(" ");
  }

  const ZONES = [
    { from: 0,  to: 25,  color: "#e74c3c", label: "Extreme Fear" },
    { from: 25, to: 45,  color: "#e67e22", label: "Fear"         },
    { from: 45, to: 55,  color: "#c9a84c", label: "Neutral"      },
    { from: 55, to: 75,  color: "#2ecc71", label: "Greed"        },
    { from: 75, to: 100, color: "#00c853", label: "Extreme Greed"},
  ];

  // Active zone for score
  const activeZone = ZONES.find(z => score >= z.from && score < z.to) || ZONES[ZONES.length-1];

  // Needle
  const needleRad  = pctToRad(score);
  const needleLen  = Ro * 0.88;
  const needleTail = Ri * 0.35;
  const [nx, ny]   = polarToXY(needleRad, needleLen);
  const [tx, ty]   = polarToXY(needleRad + Math.PI, needleTail);

  // Needle side points for a tapered triangle
  const perpRad = needleRad + Math.PI / 2;
  const hw = W * 0.013; // half-width at base
  const [lx,ly] = [cx + Math.cos(perpRad)*hw, cy - Math.sin(perpRad)*hw];
  const [rx2,ry2] = [cx - Math.cos(perpRad)*hw, cy + Math.sin(perpRad)*hw];

  return (
    <svg
      width="100%" viewBox={`0 0 ${W} ${H}`}
      style={{ display:"block", overflow:"visible" }}
    >
      <defs>
        {ZONES.map((z,i) => (
          <radialGradient key={i} id={`${uid}_gz${i}`} cx="50%" cy="100%" r="80%">
            <stop offset="0%" stopColor={z.color} stopOpacity="1"/>
            <stop offset="100%" stopColor={z.color} stopOpacity="0.7"/>
          </radialGradient>
        ))}
        {/* Glow filter for active segment */}
        <filter id={`${uid}_glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Inner shadow ring */}
        <radialGradient id={`${uid}_track`} cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.04)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.0)"/>
        </radialGradient>
      </defs>

      {/* Background track arc */}
      <path d={arcPath(0, 100, Ro+2, Ri-2)} fill="rgba(255,255,255,0.04)" />

      {/* Zone segments */}
      {ZONES.map((z,i) => {
        const isActive = z.label === activeZone.label;
        return (
          <path
            key={i}
            d={arcPath(z.from, z.to, isActive ? Ro+3 : Ro, isActive ? Ri-3 : Ri)}
            fill={`url(#${uid}_gz${i})`}
            opacity={isActive ? 1 : 0.28}
            filter={isActive ? `url(#${uid}_glow)` : undefined}
            style={{ transition: "all 0.4s ease" }}
          />
        );
      })}

      {/* Tick marks at zone boundaries */}
      {[0, 25, 45, 55, 75, 100].map((pct,i) => {
        const r = pctToRad(pct);
        const [ox,oy] = polarToXY(r, Ro+8);
        const [ix2,iy2] = polarToXY(r, Ri-8);
        return <line key={i} x1={ox} y1={oy} x2={ix2} y2={iy2} stroke="rgba(255,255,255,0.15)" strokeWidth={1}/>;
      })}

      {/* Needle shadow */}
      <polygon
        points={`${nx+1},${ny+1} ${lx+1},${ly+1} ${tx+1},${ty+1} ${rx2+1},${ry2+1}`}
        fill="rgba(0,0,0,0.5)"
      />

      {/* Needle body — tapered triangle */}
      <polygon
        points={`${nx.toFixed(2)},${ny.toFixed(2)} ${lx.toFixed(2)},${ly.toFixed(2)} ${tx.toFixed(2)},${ty.toFixed(2)} ${rx2.toFixed(2)},${ry2.toFixed(2)}`}
        fill={activeZone.color}
        opacity={0.95}
      />

      {/* Pivot outer ring */}
      <circle cx={cx} cy={cy} r={W*0.055} fill={C.s2} stroke="rgba(255,255,255,0.1)" strokeWidth={1}/>
      {/* Pivot inner dot */}
      <circle cx={cx} cy={cy} r={W*0.028} fill={activeZone.color}/>

      {/* Score text below pivot */}
      <text
        x={cx} y={cy + W*0.09}
        textAnchor="middle"
        style={{ fontFamily:"monospace", fontSize: W*0.16, fontWeight:700, fill: activeZone.color }}
      >
        {score}
      </text>
      <text
        x={cx} y={cy + W*0.155}
        textAnchor="middle"
        style={{ fontFamily:"sans-serif", fontSize: W*0.065, fill: "rgba(255,255,255,0.4)", letterSpacing:"0.05em" }}
      >
        / 100
      </text>

      {/* Zone labels at arc edges */}
      {[
        { pct:  4, label:"Fear",   anchor:"start"  },
        { pct: 96, label:"Greed",  anchor:"end"    },
      ].map((lb,i) => {
        const r = pctToRad(lb.pct);
        const [lbx,lby] = polarToXY(r, Ro+18);
        return (
          <text key={i} x={lbx} y={lby} textAnchor={lb.anchor}
            style={{ fontFamily:"monospace", fontSize: W*0.052, fill:"rgba(255,255,255,0.3)" }}
          >
            {lb.label}
          </text>
        );
      })}
    </svg>
  );
}
function FearGreedCard({ data, mode="morocco" }) {
  const banks=data["BANKS"]||[], telecom=data["TELECOM / UTILITIES"]||[], industry=data["INDUSTRY / MATERIALS"]||[];
  const all=[...banks,...telecom,...industry];
  const crypto=data["LARGE CAP"]||data["CRYPTO"]||[];

  const casaScore=useMemo(()=>{
    if(!all.length) return 50;
    const ups=all.filter(i=>isUp(i.change)).length;
    const avg=all.reduce((s,i)=>s+Number(i.change||0),0)/all.length;
    return Math.min(100,Math.max(0,Math.round((ups/all.length)*50+(avg+3)*8)));
  },[banks, telecom, industry]);

  const cryptoScore=useMemo(()=>{
    if(!crypto.length) return 16;
    const ups=crypto.filter(i=>isUp(i.change)).length;
    const avg=crypto.reduce((s,i)=>s+Number(i.change||0),0)/crypto.length;
    return Math.min(100,Math.max(0,Math.round((ups/crypto.length)*50+(avg+5)*5)));
  },[crypto]);

  const gauges = mode==="crypto"
    ? [{label:"₿ Crypto Market", sublabel:"Based on top crypto", score:cryptoScore}]
    : [{label:"🇲🇦 Casablanca", sublabel:"Based on CSE stocks", score:casaScore}];

  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>FEAR & GREED INDEX</span>
        <span style={{fontFamily:F.mono,fontSize:"0.52rem",color:C.t3}}>{mode==="crypto"?"Crypto":"Casablanca"}</span>
      </div>
      {gauges.map((g,i)=>{
        const z=fgZone(g.score);
        return (
          <div key={i} style={{padding:"16px 20px"}}>
            {/* Title + zone badge */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontFamily:F.sans,fontSize:"0.8rem",fontWeight:600,color:C.t1}}>{g.label}</div>
                <div style={{fontFamily:F.mono,fontSize:"0.55rem",color:C.t3,marginTop:2}}>{g.sublabel}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:F.mono,fontSize:"1.6rem",fontWeight:700,color:z.color,lineHeight:1}}>{g.score}</div>
                <div style={{fontFamily:F.sans,fontSize:"0.65rem",fontWeight:600,color:z.color,marginTop:2}}>{z.label}</div>
              </div>
            </div>

            {/* Gauge */}
            <Gauge score={g.score} size={240}/>

            {/* Stats row */}
            <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              {[
                {l:"Advances", v: mode==="crypto" ? crypto.filter(i=>isUp(i.change)).length : all.filter(i=>isUp(i.change)).length},
                {l:"Declines", v: mode==="crypto" ? crypto.filter(i=>!isUp(i.change)).length : all.filter(i=>!isUp(i.change)).length},
                {l:"Total",    v: mode==="crypto" ? crypto.length : all.length},
              ].map((s,j)=>(
                <div key={j} style={{background:C.s2,borderRadius:6,padding:"6px 10px",textAlign:"center"}}>
                  <div style={{fontFamily:F.mono,fontSize:"0.48rem",color:C.t3,marginBottom:2,letterSpacing:"0.08em"}}>{s.l.toUpperCase()}</div>
                  <div style={{fontFamily:F.mono,fontSize:"0.85rem",fontWeight:700,color:j===0?C.up:j===1?C.dn:C.t1}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CRYPTO GRID ───────────────────────────────────────────────────────────────
function CryptoGrid({ data }) {
  const keys=["LARGE CAP","CRYPTO","DEFI / LAYER2","MEME / TRENDING","LAYER1 / INFRA","STABLECOINS"];
  const items=useMemo(()=>{const a=[];keys.forEach(k=>{if(data[k])a.push(...data[k]);});return a.filter(i=>i?.id);},[data]);
  if (!items.length) return null;
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:2,background:C.bd,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
      {items.map((item,i)=>{
        const u=isUp(item.change);
        return (
          <div key={i} style={{background:C.s1,padding:"10px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontFamily:F.mono,fontSize:"0.65rem",fontWeight:700,color:C.t1}}>{item.id}</span>
              <Pill change={item.change}/>
            </div>
            <div style={{fontFamily:F.mono,fontSize:"0.85rem",fontWeight:600,color:C.t1,marginBottom:6}}>{fv(Number(item.value))}</div>
            <Spark series={item.series||[]} up={u} w={130} h={28}/>
          </div>
        );
      })}
    </div>
  );
}

// ─── FX CARD GRID ──────────────────────────────────────────────────────────────
// MAD pairs we always want shown (will be supplemented by API data)
const MAD_PAIRS_FALLBACK = [
  { id:"USD/MAD", base:"USD", flag:"🇺🇸", name:"US Dollar",         value:10.02, change:0.12 },
  { id:"EUR/MAD", base:"EUR", flag:"🇪🇺", name:"Euro",               value:10.88, change:-0.08 },
  { id:"GBP/MAD", base:"GBP", flag:"🇬🇧", name:"British Pound",      value:12.71, change:0.31 },
  { id:"JPY/MAD", base:"JPY", flag:"🇯🇵", name:"Japanese Yen (100)", value: 6.65, change:-0.22 },
  { id:"CHF/MAD", base:"CHF", flag:"🇨🇭", name:"Swiss Franc",        value:11.34, change:0.05 },
  { id:"CAD/MAD", base:"CAD", flag:"🇨🇦", name:"Canadian Dollar",    value: 7.41, change:-0.14 },
  { id:"AED/MAD", base:"AED", flag:"🇦🇪", name:"UAE Dirham",         value: 2.73, change:0.03 },
  { id:"SAR/MAD", base:"SAR", flag:"🇸🇦", name:"Saudi Riyal",        value: 2.67, change:0.01 },
  { id:"QAR/MAD", base:"QAR", flag:"🇶🇦", name:"Qatari Riyal",       value: 2.75, change:0.02 },
  { id:"CNY/MAD", base:"CNY", flag:"🇨🇳", name:"Chinese Yuan",       value: 1.38, change:-0.06 },
  { id:"TRY/MAD", base:"TRY", flag:"🇹🇷", name:"Turkish Lira",       value: 0.29, change:-0.41 },
  { id:"XOF/MAD", base:"XOF", flag:"🇸🇳", name:"CFA Franc (×100)",   value: 1.66, change:0.00 },
];

const CROSS_PAIRS_FALLBACK = [
  { id:"EUR/USD", value:1.085, change:0.21 },
  { id:"GBP/USD", value:1.269, change:0.18 },
  { id:"USD/JPY", value:149.8, change:-0.34 },
  { id:"EUR/GBP", value:0.856, change:0.04 },
  { id:"AUD/USD", value:0.651, change:-0.12 },
  { id:"USD/CHF", value:0.891, change:-0.09 },
];

function FXCardGrid({ items }) {
  const [view, setView] = useState("mad"); // mad | cross | all

  // Merge API items with fallback — API wins if id matches
  function mergeWithFallback(fallback, apiItems) {
    return fallback.map(fb => {
      const live = apiItems.find(x => x.id === fb.id);
      return live ? { ...fb, ...live } : fb;
    });
  }

  const madPairs   = mergeWithFallback(MAD_PAIRS_FALLBACK,   items);
  const crossPairs = mergeWithFallback(CROSS_PAIRS_FALLBACK, items);

  // Extra API pairs that aren't in our lists
  const extraPairs = (items||[]).filter(x =>
    !MAD_PAIRS_FALLBACK.find(f=>f.id===x.id) &&
    !CROSS_PAIRS_FALLBACK.find(f=>f.id===x.id)
  );

  const FX_TABS = [
    { key:"mad",   label:"🇲🇦 MAD Pairs" },
    { key:"cross", label:"⚡ Major Crosses" },
    { key:"all",   label:"All" },
  ];

  // Featured MAD pairs (top 4)
  const featured = ["USD/MAD","EUR/MAD","GBP/MAD","SAR/MAD"];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>

      {/* Sub-tab bar */}
      <div style={{display:"flex",gap:4,alignItems:"center"}}>
        {FX_TABS.map(t=>(
          <button key={t.key} onClick={()=>setView(t.key)} style={{
            fontFamily:F.mono, fontSize:"0.6rem", padding:"4px 12px",
            border:`1px solid ${view===t.key?C.gold:C.bd}`,
            background: view===t.key?"rgba(201,168,76,0.12)":"transparent",
            color: view===t.key?C.gold:C.t2,
            borderRadius:4, cursor:"pointer",
          }}>{t.label}</button>
        ))}
        <span style={{marginLeft:"auto",fontFamily:F.mono,fontSize:"0.52rem",color:C.t3}}>
          MAD = Moroccan Dirham · Rates indicative
        </span>
      </div>

      {/* MAD VIEW */}
      {view==="mad" && (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>

          {/* Hero row — 4 featured MAD pairs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {madPairs.filter(p=>featured.includes(p.id)).map((item,i)=>{
              const u=isUp(item.change);
              return (
                <div key={i} style={{
                  background: u?"rgba(52,199,89,0.07)":"rgba(255,59,48,0.07)",
                  border:`1px solid ${u?"rgba(52,199,89,0.25)":"rgba(255,59,48,0.25)"}`,
                  borderRadius:10, padding:"14px",
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:16}}>{item.flag||"🏳"}</span>
                      <div>
                        <div style={{fontFamily:F.mono,fontSize:"0.72rem",fontWeight:700,color:C.t1}}>{item.id}</div>
                        <div style={{fontFamily:F.sans,fontSize:"0.55rem",color:C.t3}}>{item.name||item.id}</div>
                      </div>
                    </div>
                    <Pill change={item.change}/>
                  </div>
                  <div style={{fontFamily:F.mono,fontSize:"1.5rem",fontWeight:700,color:C.t1,lineHeight:1,marginBottom:6}}>
                    {fv(Number(item.value))}
                  </div>
                  <Spark series={item.series||[]} up={u} w={160} h={28}/>
                </div>
              );
            })}
          </div>

          {/* Full MAD table */}
          <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"7px 14px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>ALL MAD PAIRS</span>
              <span style={{fontFamily:F.mono,fontSize:"0.55rem",color:C.t3}}>{madPairs.length} pairs</span>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  {["Pair","Rate","Change","7D Chart","Bid","Ask"].map((h,i)=>(
                    <th key={i} style={{
                      fontFamily:F.sans,fontSize:"0.6rem",fontWeight:500,color:C.t3,
                      padding:"6px 14px",textAlign:i>=1?"right":"left",
                      borderBottom:`1px solid ${C.bd}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {madPairs.map((item,i)=>{
                  const u=isUp(item.change);
                  const bid = (Number(item.value)*0.9985).toFixed(4);
                  const ask = (Number(item.value)*1.0015).toFixed(4);
                  return (
                    <tr key={i} className="row-hover" style={{borderBottom:`1px solid ${C.bd2}`,cursor:"pointer"}}>
                      <td style={{padding:"8px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:14,flexShrink:0}}>{item.flag||"🏳"}</span>
                          <div>
                            <div style={{fontFamily:F.mono,fontSize:"0.72rem",fontWeight:600,color:C.t1}}>{item.id}</div>
                            <div style={{fontFamily:F.sans,fontSize:"0.58rem",color:C.t3}}>{item.name||""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"8px 14px",textAlign:"right",fontFamily:F.mono,fontSize:"0.75rem",fontWeight:600,color:C.t1}}>
                        {fv(Number(item.value))}
                      </td>
                      <td style={{padding:"8px 14px",textAlign:"right"}}><Pill change={item.change}/></td>
                      <td style={{padding:"8px 14px",textAlign:"right",width:80}}>
                        <Spark series={item.series||[]} up={u} w={80} h={22}/>
                      </td>
                      <td style={{padding:"8px 14px",textAlign:"right",fontFamily:F.mono,fontSize:"0.62rem",color:C.up}}>{bid}</td>
                      <td style={{padding:"8px 14px",textAlign:"right",fontFamily:F.mono,fontSize:"0.62rem",color:C.dn}}>{ask}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CROSS VIEW */}
      {view==="cross" && (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {crossPairs.map((item,i)=>{
              const u=isUp(item.change);
              const [base,quote]=item.id.split("/");
              return (
                <div key={i} style={{
                  background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,padding:"14px",
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div>
                      <div style={{fontFamily:F.mono,fontSize:"0.65rem",color:C.t3,marginBottom:2}}>
                        <span style={{color:C.t1,fontWeight:600}}>{base}</span>
                        <span style={{margin:"0 4px"}}>/</span>
                        <span>{quote}</span>
                      </div>
                      <div style={{fontFamily:F.mono,fontSize:"1.3rem",fontWeight:700,color:C.t1,lineHeight:1}}>
                        {fv(Number(item.value))}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <Pill change={item.change}/>
                      <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:u?C.up:C.dn,marginTop:4}}>
                        {u?"▲":"▼"} {Math.abs(Number(item.change)).toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <Spark series={item.series||[]} up={u} w={200} h={32}/>
                </div>
              );
            })}
          </div>

          {/* Cross-rate matrix: MAD vs majors */}
          <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"7px 14px",borderBottom:`1px solid ${C.bd}`}}>
              <span style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>MAD CROSS RATE MATRIX</span>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
                <thead>
                  <tr>
                    <th style={{padding:"6px 14px",fontFamily:F.mono,fontSize:"0.58rem",color:C.t3,borderBottom:`1px solid ${C.bd}`,textAlign:"left"}}>From \ To</th>
                    {["MAD","USD","EUR","GBP","AED","SAR"].map(h=>(
                      <th key={h} style={{padding:"6px 10px",fontFamily:F.mono,fontSize:"0.58rem",color:C.gold,borderBottom:`1px solid ${C.bd}`,textAlign:"right"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {ccy:"MAD", rates:[1, 0.0998, 0.0919, 0.0787, 0.366, 0.375]},
                    {ccy:"USD", rates:[10.02, 1, 0.921, 0.788, 3.673, 3.752]},
                    {ccy:"EUR", rates:[10.88, 1.085, 1, 0.856, 3.986, 4.073]},
                    {ccy:"GBP", rates:[12.71, 1.268, 1.168, 1, 4.656, 4.759]},
                    {ccy:"AED", rates:[2.730, 0.272, 0.251, 0.215, 1, 1.022]},
                    {ccy:"SAR", rates:[2.671, 0.266, 0.245, 0.210, 0.978, 1]},
                  ].map((row,i)=>(
                    <tr key={i} className="row-hover" style={{borderBottom:`1px solid ${C.bd2}`}}>
                      <td style={{padding:"7px 14px",fontFamily:F.mono,fontSize:"0.65rem",fontWeight:700,color:C.gold}}>{row.ccy}</td>
                      {row.rates.map((r,j)=>(
                        <td key={j} style={{
                          padding:"7px 10px",fontFamily:F.mono,fontSize:"0.65rem",textAlign:"right",
                          color: i===j?C.t3:C.t1,
                          background: i===j?"rgba(255,255,255,0.03)":"transparent",
                        }}>
                          {i===j?"—":r.toFixed(4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ALL VIEW */}
      {view==="all" && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:6}}>
            {[...madPairs,...crossPairs,...extraPairs].map((item,i)=>{
              const u=isUp(item.change);
              return (
                <div key={i} style={{
                  background:C.s1,border:`1px solid ${u?"rgba(52,199,89,0.18)":"rgba(255,59,48,0.18)"}`,
                  borderRadius:8,padding:"10px 12px",
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontFamily:F.mono,fontSize:"0.65rem",fontWeight:700,color:C.t1}}>{item.id}</span>
                    <Pill change={item.change}/>
                  </div>
                  <div style={{fontFamily:F.mono,fontSize:"1.1rem",fontWeight:700,color:C.t1,marginBottom:6}}>
                    {fv(Number(item.value))}
                  </div>
                  <Spark series={item.series||[]} up={u} w={160} h={26}/>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BONDS PANEL ───────────────────────────────────────────────────────────────
const BONDS_FALLBACK = [
  // US Treasuries
  { id:"US 3M",  name:"US Treasury 3M",  value:5.32, change:-0.02, cat:"US Treasuries",  flag:"🇺🇸" },
  { id:"US 6M",  name:"US Treasury 6M",  value:5.28, change:-0.03, cat:"US Treasuries",  flag:"🇺🇸" },
  { id:"US 1Y",  name:"US Treasury 1Y",  value:5.01, change:-0.05, cat:"US Treasuries",  flag:"🇺🇸" },
  { id:"US 2Y",  name:"US Treasury 2Y",  value:4.62, change:-0.08, cat:"US Treasuries",  flag:"🇺🇸" },
  { id:"US 5Y",  name:"US Treasury 5Y",  value:4.38, change: 0.04, cat:"US Treasuries",  flag:"🇺🇸" },
  { id:"US 10Y", name:"US Treasury 10Y", value:4.31, change: 0.06, cat:"US Treasuries",  flag:"🇺🇸" },
  { id:"US 30Y", name:"US Treasury 30Y", value:4.52, change: 0.09, cat:"US Treasuries",  flag:"🇺🇸" },
  // European
  { id:"DE 2Y",  name:"Germany Bund 2Y",  value:2.71, change:-0.04, cat:"Europe",  flag:"🇩🇪" },
  { id:"DE 10Y", name:"Germany Bund 10Y", value:2.48, change: 0.03, cat:"Europe",  flag:"🇩🇪" },
  { id:"FR 10Y", name:"France OAT 10Y",   value:3.12, change: 0.05, cat:"Europe",  flag:"🇫🇷" },
  { id:"IT 10Y", name:"Italy BTP 10Y",    value:3.74, change: 0.11, cat:"Europe",  flag:"🇮🇹" },
  { id:"ES 10Y", name:"Spain Bono 10Y",   value:3.41, change: 0.07, cat:"Europe",  flag:"🇪🇸" },
  { id:"UK 10Y", name:"UK Gilt 10Y",      value:4.18, change: 0.08, cat:"Europe",  flag:"🇬🇧" },
  // GCC / Morocco
  { id:"MA 10Y", name:"Morocco Govt 10Y", value:3.88, change:-0.02, cat:"GCC / MENA", flag:"🇲🇦" },
  { id:"SA 10Y", name:"Saudi Govt 10Y",   value:4.21, change: 0.03, cat:"GCC / MENA", flag:"🇸🇦" },
  { id:"AE 10Y", name:"UAE Govt 10Y",     value:4.08, change: 0.02, cat:"GCC / MENA", flag:"🇦🇪" },
  { id:"EG 10Y", name:"Egypt Govt 10Y",   value:27.4, change:-0.18, cat:"GCC / MENA", flag:"🇪🇬" },
  // Asia / EM
  { id:"JP 10Y", name:"Japan JGB 10Y",    value:0.78, change: 0.02, cat:"Asia / EM",  flag:"🇯🇵" },
  { id:"CN 10Y", name:"China Govt 10Y",   value:2.31, change:-0.01, cat:"Asia / EM",  flag:"🇨🇳" },
  { id:"IN 10Y", name:"India Govt 10Y",   value:7.08, change: 0.04, cat:"Asia / EM",  flag:"🇮🇳" },
  { id:"BR 10Y", name:"Brazil Govt 10Y",  value:13.2, change: 0.22, cat:"Asia / EM",  flag:"🇧🇷" },
];

const BOND_CATS = ["All","US Treasuries","Europe","GCC / MENA","Asia / EM"];

function BondsPanel({ data }) {
  const [cat, setCat] = useState("All");
  const [view, setView] = useState("cards"); // cards | table

  const apiItems = [...(data["RATES / BONDS"]||[]), ...(data["US / AMERICAS"]||[])].flat();
  const bonds = [
    ...BONDS_FALLBACK.map(fb => {
      const live = apiItems.find(x => x.id === fb.id);
      return live ? { ...fb, ...live } : fb;
    }),
    ...apiItems.filter(x => !BONDS_FALLBACK.find(b => b.id === x.id)),
  ];

  const filtered = cat === "All" ? bonds : bonds.filter(b => b.cat === cat);

  const y10 = bonds.find(x => x.id === "US 10Y");
  const y2  = bonds.find(x => x.id === "US 2Y");
  const y30 = bonds.find(x => x.id === "US 30Y");
  const ma10 = bonds.find(x => x.id === "MA 10Y");
  const spread = y10 && y2 ? (Number(y10.value) - Number(y2.value)).toFixed(2) : null;
  const spreadInverted = spread !== null && Number(spread) < 0;

  // Featured hero bonds
  const heroes = ["US 10Y","US 2Y","DE 10Y","MA 10Y","UK 10Y","JP 10Y"].map(id => bonds.find(b=>b.id===id)).filter(Boolean);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>

      {/* Yield curve summary strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {[
          { label:"US 10Y–2Y Spread", val: spread ? `${Number(spread)>=0?"+":""}${spread}%` : "—",
            sub: spreadInverted ? "⚠ Inverted curve" : "Normal yield curve",
            color: spreadInverted ? C.dn : C.up },
          { label:"US 10Y Yield", val: y10 ? `${fv(Number(y10.value))}%` : "—",
            sub: y10 ? fc(y10.change) : "—", color: y10 ? (isUp(y10.change)?C.up:C.dn) : C.t2 },
          { label:"Morocco 10Y", val: ma10 ? `${fv(Number(ma10.value))}%` : "—",
            sub: ma10 ? fc(ma10.change) : "—", color: ma10 ? (isUp(ma10.change)?C.up:C.dn) : C.t2 },
          { label:"US 30Y Yield", val: y30 ? `${fv(Number(y30.value))}%` : "—",
            sub: y30 ? fc(y30.change) : "—", color: y30 ? (isUp(y30.change)?C.up:C.dn) : C.t2 },
        ].map((kpi,i) => (
          <div key={i} style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontFamily:F.mono,fontSize:"0.55rem",color:C.t3,marginBottom:4,letterSpacing:"0.08em"}}>{kpi.label.toUpperCase()}</div>
            <div style={{fontFamily:F.mono,fontSize:"1.3rem",fontWeight:700,color:kpi.color,lineHeight:1}}>{kpi.val}</div>
            <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:kpi.color,marginTop:4}}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Hero bond cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {heroes.map((item,i) => {
          const u = isUp(item.change);
          return (
            <div key={i} style={{background:C.s1,border:`1px solid ${u?"rgba(52,199,89,0.2)":"rgba(255,59,48,0.2)"}`,borderRadius:10,padding:"14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{display:"flex",gap:7,alignItems:"center"}}>
                  <span style={{fontSize:16}}>{item.flag||"🏛"}</span>
                  <div>
                    <div style={{fontFamily:F.mono,fontSize:"0.7rem",fontWeight:700,color:C.t1}}>{item.id}</div>
                    <div style={{fontFamily:F.sans,fontSize:"0.55rem",color:C.t3}}>{item.name}</div>
                  </div>
                </div>
                <Pill change={item.change}/>
              </div>
              <div style={{fontFamily:F.mono,fontSize:"1.5rem",fontWeight:700,color:C.t1,lineHeight:1}}>
                {fv(Number(item.value))}<span style={{fontSize:"0.7rem",color:C.t3,marginLeft:2}}>%</span>
              </div>
              <div style={{marginTop:10,height:28}}>
                <Spark series={item.series||[]} up={u} w={200} h={28}/>
              </div>
              <div style={{marginTop:8,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:F.mono,fontSize:"0.52rem",color:C.t3}}>{item.cat}</span>
                <span style={{fontFamily:F.mono,fontSize:"0.55rem",color:u?C.up:C.dn}}>
                  {u?"▲":"▼"} {Math.abs(Number(item.change)).toFixed(2)} bps
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter + view toggle */}
      <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
        {BOND_CATS.map(c => (
          <button key={c} onClick={()=>setCat(c)} style={{
            fontFamily:F.mono,fontSize:"0.58rem",padding:"3px 10px",
            border:`1px solid ${cat===c?C.gold:C.bd}`,
            background:cat===c?"rgba(201,168,76,0.12)":"transparent",
            color:cat===c?C.gold:C.t2, borderRadius:4, cursor:"pointer",
          }}>{c}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:3}}>
          {["cards","table"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{
              fontFamily:F.mono,fontSize:"0.55rem",padding:"3px 8px",
              border:`1px solid ${view===v?C.t2:C.bd}`,
              background:view===v?"rgba(255,255,255,0.06)":"transparent",
              color:view===v?C.t1:C.t3, borderRadius:4, cursor:"pointer",
            }}>{v==="cards"?"⊞ Cards":"≡ Table"}</button>
          ))}
        </div>
      </div>

      {/* Cards view */}
      {view==="cards" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:6}}>
          {filtered.map((item,i) => {
            const u = isUp(item.change);
            return (
              <div key={i} style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    <span style={{fontSize:12}}>{item.flag||"🏛"}</span>
                    <span style={{fontFamily:F.mono,fontSize:"0.62rem",fontWeight:600,color:C.t1}}>{item.id}</span>
                  </div>
                  <Pill change={item.change}/>
                </div>
                <div style={{fontFamily:F.mono,fontSize:"1.05rem",fontWeight:700,color:u?C.up:C.dn}}>
                  {fv(Number(item.value))}<span style={{fontSize:"0.6rem",color:C.t3}}>%</span>
                </div>
                <div style={{fontFamily:F.sans,fontSize:"0.52rem",color:C.t3,marginTop:2,marginBottom:6}}>{item.name}</div>
                <Spark series={item.series||[]} up={u} w={140} h={22}/>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {view==="table" && (
        <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                {["Bond","Yield","Change","1W Chart","Category"].map((h,i)=>(
                  <th key={i} style={{fontFamily:F.sans,fontSize:"0.6rem",fontWeight:500,color:C.t3,padding:"7px 12px",textAlign:i>=1&&i<=2?"right":"left",borderBottom:`1px solid ${C.bd}`}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item,i)=>{
                const u=isUp(item.change);
                return (
                  <tr key={i} className="row-hover" style={{borderBottom:`1px solid ${C.bd2}`}}>
                    <td style={{padding:"8px 12px"}}>
                      <div style={{display:"flex",gap:7,alignItems:"center"}}>
                        <span style={{fontSize:13}}>{item.flag||"🏛"}</span>
                        <div>
                          <div style={{fontFamily:F.mono,fontSize:"0.7rem",fontWeight:600,color:C.t1}}>{item.id}</div>
                          <div style={{fontFamily:F.sans,fontSize:"0.56rem",color:C.t3}}>{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"8px 12px",textAlign:"right",fontFamily:F.mono,fontSize:"0.75rem",fontWeight:600,color:u?C.up:C.dn}}>
                      {fv(Number(item.value))}%
                    </td>
                    <td style={{padding:"8px 12px",textAlign:"right"}}><Pill change={item.change}/></td>
                    <td style={{padding:"8px 12px",width:80}}><Spark series={item.series||[]} up={u} w={80} h={22}/></td>
                    <td style={{padding:"8px 12px"}}>
                      <span style={{fontFamily:F.mono,fontSize:"0.52rem",color:C.t3,padding:"2px 6px",border:`1px solid ${C.bd}`,borderRadius:3}}>{item.cat||"—"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── COMMODITIES PANEL ─────────────────────────────────────────────────────────
const COMMOD_FALLBACK = [
  // Precious metals
  { id:"GOLD",     name:"Gold",           value:3102.4, change: 0.82, unit:"$/oz",    cat:"Precious Metals", icon:"🥇" },
  { id:"SILVER",   name:"Silver",         value:  34.2, change: 1.14, unit:"$/oz",    cat:"Precious Metals", icon:"🥈" },
  { id:"PLATINUM", name:"Platinum",       value: 982.0, change: 0.44, unit:"$/oz",    cat:"Precious Metals", icon:"⬜" },
  { id:"PALLADIUM",name:"Palladium",      value: 981.5, change:-0.31, unit:"$/oz",    cat:"Precious Metals", icon:"🔘" },
  // Energy
  { id:"BRENT",    name:"Brent Crude",    value:  83.4, change: 0.52, unit:"$/bbl",   cat:"Energy",          icon:"🛢" },
  { id:"WTI",      name:"WTI Crude",      value:  79.8, change: 0.48, unit:"$/bbl",   cat:"Energy",          icon:"🛢" },
  { id:"NGAS",     name:"Natural Gas",    value:   2.18,change:-1.21, unit:"$/MMBtu", cat:"Energy",          icon:"🔥" },
  { id:"HEATING",  name:"Heating Oil",    value:   2.68,change: 0.33, unit:"$/gal",   cat:"Energy",          icon:"🔥" },
  { id:"GASOLINE", name:"RBOB Gasoline",  value:   2.54,change: 0.61, unit:"$/gal",   cat:"Energy",          icon:"⛽" },
  { id:"COAL",     name:"Coal",           value: 121.5, change:-0.82, unit:"$/t",     cat:"Energy",          icon:"⬛" },
  // Base metals
  { id:"COPPER",   name:"Copper",         value:   4.41,change: 0.73, unit:"$/lb",    cat:"Base Metals",     icon:"🟠" },
  { id:"ALUMINUM", name:"Aluminum",       value:2312.0, change: 0.29, unit:"$/t",     cat:"Base Metals",     icon:"🔲" },
  { id:"ZINC",     name:"Zinc",           value:2841.0, change:-0.44, unit:"$/t",     cat:"Base Metals",     icon:"🔩" },
  { id:"NICKEL",   name:"Nickel",         value:16820., change:-0.68, unit:"$/t",     cat:"Base Metals",     icon:"🔩" },
  { id:"LEAD",     name:"Lead",           value:2041.0, change: 0.12, unit:"$/t",     cat:"Base Metals",     icon:"🔲" },
  { id:"TIN",      name:"Tin",            value:28500., change: 0.54, unit:"$/t",     cat:"Base Metals",     icon:"🔩" },
  // Agriculture
  { id:"WHEAT",    name:"Wheat",          value: 543.2, change:-0.38, unit:"c/bu",    cat:"Agriculture",     icon:"🌾" },
  { id:"CORN",     name:"Corn",           value: 448.6, change:-0.21, unit:"c/bu",    cat:"Agriculture",     icon:"🌽" },
  { id:"SOYBEAN",  name:"Soybean",        value:1048.4, change: 0.17, unit:"c/bu",    cat:"Agriculture",     icon:"🟤" },
  { id:"SUGAR",    name:"Sugar",          value:  19.8, change: 0.92, unit:"c/lb",    cat:"Agriculture",     icon:"🍬" },
  { id:"COFFEE",   name:"Coffee",         value: 242.4, change: 1.44, unit:"c/lb",    cat:"Agriculture",     icon:"☕" },
  { id:"COCOA",    name:"Cocoa",          value:9842.0, change: 2.11, unit:"$/t",     cat:"Agriculture",     icon:"🍫" },
  { id:"COTTON",   name:"Cotton",         value:  82.4, change:-0.54, unit:"c/lb",    cat:"Agriculture",     icon:"🌿" },
  // Fertilizers (key for Morocco/OCP)
  { id:"PHOS",     name:"Phosphate Rock", value: 312.0, change: 0.48, unit:"$/t",     cat:"Fertilizers",     icon:"🇲🇦" },
  { id:"UREA",     name:"Urea",           value: 298.5, change: 0.82, unit:"$/t",     cat:"Fertilizers",     icon:"🌱" },
  { id:"DAP",      name:"DAP Fertilizer", value: 541.0, change: 1.12, unit:"$/t",     cat:"Fertilizers",     icon:"🌱" },
  { id:"POTASH",   name:"Potash (MOP)",   value: 278.0, change:-0.22, unit:"$/t",     cat:"Fertilizers",     icon:"🌱" },
];

const COMMOD_CATS = ["All","Precious Metals","Energy","Base Metals","Agriculture","Fertilizers"];

function CommoditiesPanel({ data }) {
  const [cat, setCat]   = useState("All");
  const [view, setView] = useState("cards");

  const apiItems = data["COMMODITIES"] || [];
  const items = [
    ...COMMOD_FALLBACK.map(fb => {
      const live = apiItems.find(x => x.id === fb.id);
      return live ? { ...fb, ...live } : fb;
    }),
    ...apiItems.filter(x => !COMMOD_FALLBACK.find(b => b.id === x.id)).map(x => ({...x, cat:"Other", icon:"📦"})),
  ];

  const filtered = cat==="All" ? items : items.filter(i=>i.cat===cat);

  // Top movers
  const topGain = [...items].sort((a,b)=>Number(b.change)-Number(a.change)).slice(0,3);
  const topLose = [...items].sort((a,b)=>Number(a.change)-Number(b.change)).slice(0,3);

  // Featured 6
  const featuredIds = ["GOLD","BRENT","COPPER","SILVER","NGAS","PHOS"];
  const featured = featuredIds.map(id=>items.find(i=>i.id===id)).filter(Boolean);

  const catColors = {
    "Precious Metals":"#f59e0b", "Energy":"#ef4444",
    "Base Metals":"#6366f1", "Agriculture":"#22c55e",
    "Fertilizers":"#c9a84c", "Other": C.t2,
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>

      {/* Hero cards — featured 6 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {featured.map((item,i)=>{
          const u=isUp(item.change);
          const cc = catColors[item.cat]||C.t2;
          return (
            <div key={i} style={{
              background:u?"rgba(52,199,89,0.06)":"rgba(255,59,48,0.06)",
              border:`1px solid ${u?"rgba(52,199,89,0.22)":"rgba(255,59,48,0.22)"}`,
              borderRadius:10, padding:"14px", position:"relative", overflow:"hidden",
            }}>
              <div style={{position:"absolute",top:10,right:12,fontSize:22,opacity:0.18}}>{item.icon}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontFamily:F.mono,fontSize:"0.6rem",color:cc,letterSpacing:"0.08em",marginBottom:2}}>{item.cat.toUpperCase()}</div>
                  <div style={{fontFamily:F.mono,fontSize:"0.72rem",fontWeight:700,color:C.t1}}>{item.id}</div>
                  <div style={{fontFamily:F.sans,fontSize:"0.55rem",color:C.t3}}>{item.name}</div>
                </div>
                <Pill change={item.change}/>
              </div>
              <div style={{fontFamily:F.mono,fontSize:"1.55rem",fontWeight:700,color:C.t1,lineHeight:1,marginBottom:2}}>
                {fv(Number(item.value))}
              </div>
              <div style={{fontFamily:F.mono,fontSize:"0.52rem",color:C.t3,marginBottom:8}}>{item.unit}</div>
              <Spark series={item.series||[]} up={u} w={200} h={28}/>
            </div>
          );
        })}
      </div>

      {/* Top movers strip */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[{label:"TOP GAINERS",items:topGain,color:C.up},{label:"TOP LOSERS",items:topLose,color:C.dn}].map((grp,gi)=>(
          <div key={gi} style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"6px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.58rem",color:grp.color,letterSpacing:"0.08em"}}>{grp.label}</div>
            {grp.items.map((item,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",borderBottom:`1px solid ${C.bd2}`}}>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:14}}>{item.icon}</span>
                  <div>
                    <div style={{fontFamily:F.mono,fontSize:"0.65rem",fontWeight:600,color:C.t1}}>{item.id}</div>
                    <div style={{fontFamily:F.sans,fontSize:"0.54rem",color:C.t3}}>{item.unit}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:F.mono,fontSize:"0.68rem",fontWeight:600,color:C.t1}}>{fv(Number(item.value))}</div>
                  <Pill change={item.change}/>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Filter + view toggle */}
      <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
        {COMMOD_CATS.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{
            fontFamily:F.mono,fontSize:"0.58rem",padding:"3px 10px",
            border:`1px solid ${cat===c?(catColors[c]||C.gold):C.bd}`,
            background:cat===c?`${catColors[c]||C.gold}18`:"transparent",
            color:cat===c?(catColors[c]||C.gold):C.t2, borderRadius:4, cursor:"pointer",
          }}>{c}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:3}}>
          {["cards","table"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{
              fontFamily:F.mono,fontSize:"0.55rem",padding:"3px 8px",
              border:`1px solid ${view===v?C.t2:C.bd}`,
              background:view===v?"rgba(255,255,255,0.06)":"transparent",
              color:view===v?C.t1:C.t3, borderRadius:4, cursor:"pointer",
            }}>{v==="cards"?"⊞ Cards":"≡ Table"}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {view==="cards" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:6}}>
          {filtered.map((item,i)=>{
            const u=isUp(item.change);
            const cc=catColors[item.cat]||C.t2;
            return (
              <div key={i} style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:8,padding:"10px 12px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:8,right:10,fontSize:18,opacity:0.15}}>{item.icon}</div>
                <div style={{fontFamily:F.mono,fontSize:"0.48rem",color:cc,letterSpacing:"0.1em",marginBottom:3}}>{item.cat.toUpperCase()}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontFamily:F.mono,fontSize:"0.65rem",fontWeight:700,color:C.t1}}>{item.id}</span>
                  <Pill change={item.change}/>
                </div>
                <div style={{fontFamily:F.mono,fontSize:"1.0rem",fontWeight:700,color:C.t1,lineHeight:1}}>{fv(Number(item.value))}</div>
                <div style={{fontFamily:F.mono,fontSize:"0.5rem",color:C.t3,marginBottom:6}}>{item.unit}</div>
                <Spark series={item.series||[]} up={u} w={140} h={22}/>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      {view==="table" && (
        <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                {["Commodity","Price","Unit","Change","7D Chart","Category"].map((h,i)=>(
                  <th key={i} style={{fontFamily:F.sans,fontSize:"0.6rem",fontWeight:500,color:C.t3,padding:"7px 12px",textAlign:i===1||i===3?"right":"left",borderBottom:`1px solid ${C.bd}`}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item,i)=>{
                const u=isUp(item.change);
                const cc=catColors[item.cat]||C.t2;
                return (
                  <tr key={i} className="row-hover" style={{borderBottom:`1px solid ${C.bd2}`}}>
                    <td style={{padding:"8px 12px"}}>
                      <div style={{display:"flex",gap:7,alignItems:"center"}}>
                        <span style={{fontSize:14}}>{item.icon}</span>
                        <div>
                          <div style={{fontFamily:F.mono,fontSize:"0.7rem",fontWeight:600,color:C.t1}}>{item.id}</div>
                          <div style={{fontFamily:F.sans,fontSize:"0.56rem",color:C.t3}}>{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"8px 12px",textAlign:"right",fontFamily:F.mono,fontSize:"0.75rem",fontWeight:600,color:C.t1}}>{fv(Number(item.value))}</td>
                    <td style={{padding:"8px 12px",fontFamily:F.mono,fontSize:"0.58rem",color:C.t3}}>{item.unit}</td>
                    <td style={{padding:"8px 12px",textAlign:"right"}}><Pill change={item.change}/></td>
                    <td style={{padding:"8px 12px",width:80}}><Spark series={item.series||[]} up={u} w={80} h={22}/></td>
                    <td style={{padding:"8px 12px"}}>
                      <span style={{fontFamily:F.mono,fontSize:"0.52rem",color:cc,padding:"2px 6px",border:`1px solid ${cc}30`,borderRadius:3}}>{item.cat}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── KPI STRIP ─────────────────────────────────────────────────────────────────
function KpiStrip({ data, tab }) {
  const items={
    morocco:    [...(data["BANKS"]||[]).slice(0,2),...(data["GLOBAL INDICES"]||[]).filter(x=>x.id==="MASI").slice(0,1),...(data["FX / MAD"]||[]).slice(0,1)],
    indices:    (data["GLOBAL INDICES"]||[]).slice(0,4),
    usa:        (data["USA STOCKS"]||[]).slice(0,4),
    europe:     (data["EUROPE STOCKS"]||[]).slice(0,4),
    gcc:        (data["GCC STOCKS"]||[]).slice(0,4),
    asia:       (data["ASIA STOCKS"]||[]).slice(0,4),
    currencies: (data["FX / MAD"]||MAD_PAIRS_FALLBACK).slice(0,6),
    crypto:     (data["LARGE CAP"]||data["CRYPTO"]||[]).slice(0,4),
    commodities:(data["COMMODITIES"]||COMMOD_FALLBACK).slice(0,6),
    bonds:      (data["RATES / BONDS"]||BONDS_FALLBACK).slice(0,6),
  }[tab]||[];
  if (!items.length) return null;
  const cols = ["currencies","bonds","commodities"].includes(tab) ? 6 : 4;
  return (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8}}>
      {items.map((item,i)=>(
        <div key={i} style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3,marginBottom:2}}>{item.id}</div>
            <div style={{fontFamily:F.mono,fontSize:"0.9rem",fontWeight:700,color:C.t1}}>{fv(Number(item.value))}</div>
          </div>
          <Pill change={item.change}/>
        </div>
      ))}
    </div>
  );
}

// ─── COMPACT PANEL ─────────────────────────────────────────────────────────────
function CompactPanel({ title, items, onSelect }) {
  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>{title}</div>
      {items.slice(0,5).map((item,i)=>(
        <div key={i} onClick={()=>onSelect&&onSelect(item)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 12px",borderBottom:`1px solid ${C.bd2}`,cursor:"pointer"}}>
          <div>
            <div style={{fontFamily:F.mono,fontSize:"0.65rem",color:C.t1,fontWeight:500}}>{item.id}</div>
            <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3}}>{fv(Number(item.value))}</div>
          </div>
          <span style={{fontFamily:F.mono,fontSize:"0.62rem",fontWeight:600,color:isUp(item.change)?C.up:C.dn}}>{fc(item.change)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── LOADER ────────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"40vh",flexDirection:"column",gap:12}}>
      <div style={{width:28,height:28,borderRadius:"50%",border:`3px solid ${C.bd}`,borderTopColor:C.gold,animation:"spin 0.8s linear infinite"}}/>
      <span style={{fontFamily:F.mono,fontSize:"0.65rem",color:C.t3}}>Loading market data...</span>
    </div>
  );
}

// ─── OVERVIEW — MOROCCO FIRST ──────────────────────────────────────────────────
function MoroccoOverview({ data, indices, fx, banks, telecom, industry, crypto, onSelect }) {
  const session = useCSESession();
  const masi   = indices.find(x=>x.id==="MASI");
  const usdmad = fx.find(x=>x.id==="USD/MAD");
  const eurmad = fx.find(x=>x.id==="EUR/MAD");
  const allCasa = [...banks,...telecom,...industry];
  const advances = allCasa.filter(x=>isUp(x.change)).length;
  const declines = allCasa.length - advances;
  const gainers = [...allCasa].sort((a,b)=>Number(b.change)-Number(a.change)).slice(0,5);
  const losers  = [...allCasa].sort((a,b)=>Number(a.change)-Number(b.change)).slice(0,5);
  const WATCHIDS = ["ATW","BCP","IAM","OCP","CIH","BOA","MNG","HPS"];
  const watchItems = WATCHIDS.map(id=>allCasa.find(x=>x.id===id)).filter(Boolean);

  return (
    <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>

      {/* ROW 1: MASI hero + session + USD EUR */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 200px 170px",gap:10}}>
        <div style={{background:masi?(isUp(masi.change)?"rgba(0,100,50,.15)":"rgba(120,20,20,.15)"):C.s1,border:`1px solid ${masi?(isUp(masi.change)?"rgba(52,199,89,.3)":"rgba(255,59,48,.3)"):C.bd}`,borderRadius:12,padding:"16px 20px"}}>
          <div style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.t3,letterSpacing:"0.1em",marginBottom:6}}>🇲🇦 MASI · Casablanca Stock Exchange</div>
          <div style={{fontFamily:F.mono,fontSize:"3rem",fontWeight:700,color:C.t1,lineHeight:1,letterSpacing:"-0.02em"}}>{masi?fv(Number(masi.value)):"—"}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
            <span style={{fontFamily:F.mono,fontSize:"1rem",fontWeight:600,color:masi&&isUp(masi.change)?C.up:C.dn}}>{masi?fc(masi.change):"—"}</span>
            {masi?.series?.length>1&&<div style={{flex:1,height:32}}><Spark series={masi.series} up={isUp(masi?.change)} w={200} h={32}/></div>}
          </div>
        </div>
        <div style={{background:session.open?"rgba(0,100,50,.12)":C.s1,border:`1px solid ${session.open?"rgba(52,199,89,.25)":C.bd}`,borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:session.open?C.up:C.t3,boxShadow:session.open?"0 0 8px rgba(52,199,89,.6)":"none"}}/>
            <span style={{fontFamily:F.mono,fontSize:"0.7rem",fontWeight:600,color:session.open?C.up:C.t2}}>{session.label}</span>
          </div>
          <div style={{fontFamily:F.mono,fontSize:"0.62rem",color:C.t2,marginBottom:8}}>{session.countdown}</div>
          <div style={{height:4,borderRadius:2,background:C.bd,overflow:"hidden",marginBottom:6}}>
            <div style={{width:`${session.pct}%`,height:"100%",background:session.open?C.up:C.t3,borderRadius:2}}/>
          </div>
          <div style={{fontFamily:F.mono,fontSize:"0.55rem",color:C.t3}}>CSE · 09:00–15:00 GMT+1</div>
          <div style={{marginTop:8}}>
            <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3,marginBottom:4}}>Breadth</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontFamily:F.mono,fontSize:"0.65rem",color:C.up}}>▲ {advances}</span>
              <span style={{fontFamily:F.mono,fontSize:"0.65rem",color:C.dn}}>▼ {declines}</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[usdmad,eurmad].map((item,i)=>item&&(
            <div key={i} style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,padding:"10px 12px",flex:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3,marginBottom:2}}>{item.id}</div>
                <div style={{fontFamily:F.mono,fontSize:"1.1rem",fontWeight:700,color:C.t1}}>{fv(Number(item.value))}</div>
              </div>
              <div>
                <Pill change={item.change}/>
                <div style={{marginTop:4,height:20,width:56}}><Spark series={item.series||[]} up={isUp(item.change)} w={56} h={20}/></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 2: Gainers + Losers + Watchlist */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 220px",gap:10}}>
        <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.up,letterSpacing:"0.1em"}}>TOP GAINERS</div>
          {gainers.map((item,i)=>(
            <div key={i} onClick={()=>onSelect(item)} className="row-hover" style={{padding:"6px 12px",borderBottom:`1px solid ${C.bd2}`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:F.mono,fontSize:"0.7rem",fontWeight:600,color:C.t1}}>{item.id}</div>
                <div style={{fontFamily:F.sans,fontSize:"0.6rem",color:C.t3}}>{item.name?.slice(0,20)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:F.mono,fontSize:"0.68rem",fontWeight:600,color:C.up}}>{fc(item.change)}</div>
                <div style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.t3}}>{fv(Number(item.value))}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.dn,letterSpacing:"0.1em"}}>TOP LOSERS</div>
          {losers.map((item,i)=>(
            <div key={i} onClick={()=>onSelect(item)} className="row-hover" style={{padding:"6px 12px",borderBottom:`1px solid ${C.bd2}`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:F.mono,fontSize:"0.7rem",fontWeight:600,color:C.t1}}>{item.id}</div>
                <div style={{fontFamily:F.sans,fontSize:"0.6rem",color:C.t3}}>{item.name?.slice(0,20)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:F.mono,fontSize:"0.68rem",fontWeight:600,color:C.dn}}>{fc(item.change)}</div>
                <div style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.t3}}>{fv(Number(item.value))}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>WATCHLIST</div>
          {(watchItems.length?watchItems:allCasa.slice(0,8)).map((item,i)=>(
            <div key={i} onClick={()=>onSelect(item)} className="row-hover" style={{padding:"5px 12px",borderBottom:`1px solid ${C.bd2}`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:F.mono,fontSize:"0.68rem",fontWeight:600,color:C.t1}}>{item.id}</div>
                <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3}}>{fv(Number(item.value))}</div>
              </div>
              <Pill change={item.change}/>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 3: Global context */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        <CompactPanel title="GLOBAL INDICES" items={indices.slice(0,5)} onSelect={onSelect}/>
        <CompactPanel title="FOREX / MAD" items={(fx.length?fx:MAD_PAIRS_FALLBACK).slice(0,5)} onSelect={onSelect}/>
        <CompactPanel title="CRYPTO" items={(data["LARGE CAP"]||crypto).slice(0,5)} onSelect={onSelect}/>
        <CompactPanel title="COMMODITIES" items={(data["COMMODITIES"]||COMMOD_FALLBACK).slice(0,5)} onSelect={onSelect}/>
      </div>

      {/* ROW 4: News + Sidebar (Calendar + Fear & Greed) */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:10}}>
        <NewsPanel compact={false}/>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <FearGreedCard data={data} mode="morocco"/>
          <CalPanel/>
        </div>
      </div>
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]       = useState("overview");
  const [data, setData]     = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [sel, setSel]       = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sector, setSector] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(""); setData({}); setSel(null);
    const apiTab = ["usa","europe","gcc","asia"].includes(tab) ? "indices" : tab;
    fetch(`/api/market?tab=${apiTab}`)
      .then(r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => { if(!cancelled){ setData(json||{}); setUpdatedAt(new Date().toLocaleTimeString("en-GB")); }})
      .catch(e => { if(!cancelled) setError(e.message); })
      .finally(() => { if(!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, refreshKey]);

  useEffect(() => {
    const id = setInterval(() => setRefreshKey(k => k + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const fx          = data["FX / MAD"]             || [];
  const crypto      = data["CRYPTO"]               || [];
  const banks       = data["BANKS"]                || [];
  const industry    = data["INDUSTRY / MATERIALS"] || [];
  const telecom     = data["TELECOM / UTILITIES"]  || [];
  const indices     = data["GLOBAL INDICES"]       || [];

  const TICKER_IDS = ["MASI","DOW","SPX","NASDAQ","USD/MAD","EUR/MAD","BTC","GOLD","BRENT","US 10Y"];
  const tickerItems = useMemo(() => {
    const all = [...indices,...fx,...(data["LARGE CAP"]||crypto),...(data["COMMODITIES"]||[]),...(data["RATES / BONDS"]||[])];
    return TICKER_IDS.map(id => all.find(x => x.id===id)).filter(Boolean);
  }, [data]);


  const allItems = useMemo(() => {
    if (sector) return data[sector]||[];
    if (tab==="usa")        return data["USA STOCKS"]    || [];
    if (tab==="europe")     return data["EUROPE STOCKS"] || [];
    if (tab==="gcc")        return data["GCC STOCKS"]    || [];
    if (tab==="asia")       return data["ASIA STOCKS"]   || [];
    if (tab==="morocco")    return [...(data["BANKS"]||[]),...(data["TELECOM / UTILITIES"]||[]),...(data["INDUSTRY / MATERIALS"]||[])];
    if (tab==="currencies") return data["FX / MAD"]      || [];
    if (tab==="crypto")     return data["LARGE CAP"]||data["CRYPTO"]||[];
    if (tab==="commodities")return data["COMMODITIES"]   || [];
    if (tab==="bonds")      return data["RATES / BONDS"] || [];
    if (tab==="indices")    return data["GLOBAL INDICES"]|| [];
    return [...(data["BANKS"]||[]),...(data["TELECOM / UTILITIES"]||[]),...(data["INDUSTRY / MATERIALS"]||[])];
  }, [data,sector,tab]);

  const LeftSidebar = () => {
    if (tab==="morocco")    return <Watchlist title="Casablanca Stocks" items={[...banks,...telecom,...industry]} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="indices")    return <Watchlist title="Indices" items={indices.slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="usa")        return <Watchlist title="🇺🇸 US Stocks" items={(data["USA STOCKS"]||[]).slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="europe")     return <Watchlist title="🇪🇺 Europe" items={(data["EUROPE STOCKS"]||[]).slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="gcc")        return <Watchlist title="🌙 GCC" items={(data["GCC STOCKS"]||[]).slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="asia")       return <Watchlist title="🌏 Asia" items={(data["ASIA STOCKS"]||[]).slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="currencies") return <Watchlist title="MAD Pairs" items={(fx.length?fx:MAD_PAIRS_FALLBACK).slice(0,14)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="crypto")     return <Watchlist title="Top Crypto" items={(data["LARGE CAP"]||crypto).slice(0,12)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="commodities")return <Watchlist title="Commodities" items={(data["COMMODITIES"]||COMMOD_FALLBACK).slice(0,14)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="bonds")      return <Watchlist title="Bond Yields" items={(data["RATES / BONDS"]||BONDS_FALLBACK).slice(0,14)} activeId={sel?.id} onSelect={setSel}/>;
    return null;
  };

  return (
    <div style={{background:C.bg,color:C.t1,minHeight:"100vh",fontFamily:F.sans}}>
      <style>{GLOBAL_CSS}</style>

      {/* Zellige band — animated, sticky at very top */}
      <div style={{
        height:6,
        background:"linear-gradient(90deg,#1a3a8c,#4ab8a0,#c9a84c,#d4900a,#2a7a3a,#4ab8a0,#1a3a8c,#4ab8a0,#c9a84c,#1a3a8c)",
        backgroundSize:"200% 100%",
        animation:"zellige 8s linear infinite",
        position:"sticky",top:0,zIndex:800,
        flexShrink:0,
      }}/>
      <Ticker items={tickerItems}/>
      <WorldClock/>
      <Navbar tab={tab} onTab={t=>{setTab(t);setSel(null);setSector(null);}} updatedAt={updatedAt}/>

      {error && <div style={{padding:"7px 20px",background:"rgba(255,59,48,.08)",borderBottom:`1px solid rgba(255,59,48,.2)`,fontFamily:F.mono,fontSize:"0.62rem",color:C.dn}}>⚠ {error}</div>}

      {loading ? <Loader/> : tab==="overview" ? (
        <MoroccoOverview
          data={data} indices={indices} fx={fx} crypto={crypto}
          banks={banks} telecom={telecom} industry={industry}
          onSelect={setSel}
        />
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"200px 1fr 210px",minHeight:"calc(100vh - 146px)"}}>
          <aside style={{padding:"12px 10px",borderRight:`1px solid ${C.bd}`,overflowY:"auto",maxHeight:"calc(100vh - 146px)",display:"flex",flexDirection:"column",gap:10,position:"sticky",top:146,alignSelf:"start"}}>
            <LeftSidebar/>
          </aside>
          <main style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:10,minWidth:0}}>
            <KpiStrip data={data} tab={tab}/>
            {tab==="crypto"      && <><CryptoGrid data={data}/><FearGreedCard data={data} mode="crypto"/></>}
            {tab==="currencies"  && <FXCardGrid items={fx.length ? fx : MAD_PAIRS_FALLBACK}/>}
            {tab==="bonds"       && <BondsPanel data={data}/>}
            {tab==="commodities" && <CommoditiesPanel data={data}/>}
            {!["crypto","currencies","bonds","commodities"].includes(tab) && allItems.length>0 && (
              <div className="fade-up"><StockTable items={allItems} activeId={sel?.id} onSelect={setSel}/></div>
            )}
            {tab==="morocco" && <><FearGreedCard data={data} mode="morocco"/><Heatmap data={data}/></>}
          </main>
          <aside style={{padding:"12px 10px",borderLeft:`1px solid ${C.bd}`,overflowY:"auto",maxHeight:"calc(100vh - 146px)",display:"flex",flexDirection:"column",gap:10,position:"sticky",top:146,alignSelf:"start"}}>
            {sel && <DetailCard item={sel} onClose={()=>setSel(null)}/>}
            {!sel && <Watchlist title="Forex · MAD" items={(fx.length?fx:MAD_PAIRS_FALLBACK).slice(0,8)} activeId={null} onSelect={setSel}/>}
            <NewsPanel compact={true}/>
            <CalPanel/>
          </aside>
        </div>
      )}

      <footer style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 20px",background:C.s1,borderTop:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.52rem",color:C.t3}}>
        <span><span style={{color:C.up}}>●</span> Morocco-first market dashboard · Indicative data only</span>
        <span>{updatedAt?"Updated: "+updatedAt:"—"}</span>
        <span>EODHD · Drahmi API · © 2026</span>
      </footer>
    </div>
  );
}
