import React, { useEffect, useMemo, useRef, useState } from "react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f1117; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
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

const NEWS = [
  {time:"14:42", title:"Bank Al-Maghrib maintient son taux directeur à 2,75%", tag:"BAM", hot:true},
  {time:"14:18", title:"ATW annonce +12% de bénéfice net au T1 2026", tag:"ATW"},
  {time:"13:55", title:"Maroc Telecom lance sa nouvelle offre 5G", tag:"IAM"},
  {time:"13:30", title:"Le MASI franchit les 13 800 pts", tag:"MASI", hot:true},
  {time:"12:48", title:"HPS remporte un contrat en Afrique", tag:"HPS"},
  {time:"12:10", title:"OCP : exportations phosphate +18% au Q1 2026", tag:"OCP"},
];

const CALENDAR = [
  {time:"15:30", event:"🇺🇸 PPI (Mars)", imp:3},
  {time:"16:00", event:"🇲🇦 Réserves BAM", imp:2},
  {time:"18:00", event:"🇺🇸 Stocks EIA", imp:2},
  {time:"Jeu",   event:"🇪🇺 Décision BCE", imp:3},
  {time:"Ven",   event:"🇺🇸 NFP Emploi", imp:3},
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function fv(v) {
  v = Number(v);
  if (!isFinite(v)) return "—";
  if (v >= 100000) return v.toLocaleString("fr-FR", {maximumFractionDigits:0});
  if (v >= 1000)   return v.toLocaleString("fr-FR", {minimumFractionDigits:2, maximumFractionDigits:2});
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
      position:"sticky", top:5, zIndex:600,
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
      position:"sticky", top:37, zIndex:490,
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
    const tick = () => setT(new Date().toLocaleTimeString("fr-FR",{timeZone:"Africa/Casablanca",hour12:false}));
    tick(); const id = setInterval(tick,1000); return () => clearInterval(id);
  }, []);
  return (
    <nav style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 16px", background:C.s1, borderBottom:`1px solid ${C.bd}`,
      height:50, position:"sticky", top:97, zIndex:500,
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
            مرصد الأسواق
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
      {items.slice(0,12).map((item,i) => {
        const u = isUp(item.change);
        return (
          <div key={i} onClick={()=>onSelect(item)}
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
            {th("id","Valeur")}{th("value","Prix","right")}{th("change","Var %","right")}
            <th style={{fontFamily:F.sans,fontSize:"0.62rem",color:C.t3,padding:"6px 12px",textAlign:"right",borderBottom:`1px solid ${C.bd}`}}>Bar</th>
            <th style={{fontFamily:F.sans,fontSize:"0.62rem",color:C.t3,padding:"6px 12px",textAlign:"right",borderBottom:`1px solid ${C.bd}`}}>7J</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item,i) => {
            const u = isUp(item.change);
            const barW = (Math.abs(Number(item.change||0))/maxAbs*80).toFixed(1);
            return (
              <tr key={i} className="row-hover" onClick={()=>onSelect(item)}
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

// ─── NEWS ──────────────────────────────────────────────────────────────────────
function NewsPanel() {
  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>ACTUALITÉS</span>
        <span style={{fontFamily:F.mono,fontSize:"0.55rem",color:C.up}}>● LIVE</span>
      </div>
      {NEWS.map((n,i)=>(
        <div key={i} style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd2}`,display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3,flexShrink:0,marginTop:1}}>{n.time}</span>
          <div>
            <span style={{fontFamily:F.sans,fontSize:"0.65rem",color:n.hot?C.t1:C.t2,lineHeight:1.4}}>{n.title}</span>
            <span style={{marginLeft:6,fontFamily:F.mono,fontSize:"0.55rem",padding:"1px 5px",borderRadius:3,background:C.s3,color:C.gold}}>{n.tag}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CALENDAR ──────────────────────────────────────────────────────────────────
function CalPanel() {
  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden"}}>
      <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>CALENDRIER ÉCONOMIQUE</div>
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
      <div style={{padding:"7px 12px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>HEATMAP · Performance 1J</div>
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
function Gauge({ score, size=160 }) {
  const cx=size/2, cy=size*0.62, R=size*0.38, Ri=size*0.24;
  const zone=fgZone(score);
  function pt(pct,r){ const deg=180-(pct/100)*180,rad=deg*Math.PI/180; return [cx+Math.cos(rad)*r,cy-Math.sin(rad)*r]; }
  function arc(f,t,rO,rI){
    const [x1,y1]=pt(f,rO),[x2,y2]=pt(t,rO),[x3,y3]=pt(t,rI),[x4,y4]=pt(f,rI);
    const lg=(t-f)>50?1:0;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${rO},${rO} 0 ${lg} 0 ${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} A${rI},${rI} 0 ${lg} 1 ${x4.toFixed(1)},${y4.toFixed(1)} Z`;
  }
  const zones=[{f:0,t:25,c:"#e74c3c"},{f:25,t:45,c:"#e67e22"},{f:45,t:55,c:"#c9a84c"},{f:55,t:75,c:"#2ecc71"},{f:75,t:100,c:"#00c853"}];
  const nd=(180-(score/100)*180)*Math.PI/180;
  const nx=cx+Math.cos(nd)*R*0.82, ny=cy-Math.sin(nd)*R*0.82;
  return (
    <svg width={size} height={size*0.72} viewBox={`0 0 ${size} ${size*0.72}`} style={{display:"block",margin:"0 auto"}}>
      {zones.map((z,i)=><path key={i} d={arc(z.f,z.t,R,Ri)} fill={z.c} opacity={0.85}/>)}
      <line x1={cx+1} y1={cy+1} x2={nx+1} y2={ny+1} stroke="rgba(0,0,0,.5)" strokeWidth={3} strokeLinecap="round"/>
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#e0e0e0" strokeWidth={2.5} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={size*0.05} fill="#333"/>
      <circle cx={cx} cy={cy} r={size*0.025} fill={zone.color}/>
      <text x={cx} y={cy+size*0.12} textAnchor="middle" style={{fontFamily:"monospace",fontSize:size*0.18,fontWeight:700,fill:zone.color}}>{score}</text>
    </svg>
  );
}
function FearGreedCard({ data }) {
  const banks=data["BANKS"]||[], telecom=data["TELECOM / UTILITIES"]||[], industry=data["INDUSTRY / MATERIALS"]||[];
  const all=[...banks,...telecom,...industry];
  const crypto=data["LARGE CAP"]||data["CRYPTO"]||[];
  const casaScore=useMemo(()=>{
    if(!all.length)return 50;
    const ups=all.filter(i=>isUp(i.change)).length;
    const avg=all.reduce((s,i)=>s+Number(i.change||0),0)/all.length;
    return Math.min(100,Math.max(0,Math.round((ups/all.length)*50+(avg+3)*8)));
  },[all.length]);
  const cryptoScore=useMemo(()=>{
    if(!crypto.length)return 16;
    const ups=crypto.filter(i=>isUp(i.change)).length;
    const avg=crypto.reduce((s,i)=>s+Number(i.change||0),0)/crypto.length;
    return Math.min(100,Math.max(0,Math.round((ups/crypto.length)*50+(avg+5)*5)));
  },[crypto.length]);
  return (
    <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.6rem",color:C.gold,letterSpacing:"0.1em"}}>FEAR & GREED INDEX</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
        {[{label:"🇲🇦 Casablanca",score:casaScore},{label:"₿ Crypto",score:cryptoScore}].map((g,i)=>{
          const z=fgZone(g.score);
          return (
            <div key={i} style={{padding:"14px",borderRight:i===0?`1px solid ${C.bd}`:"none",textAlign:"center"}}>
              <div style={{fontFamily:F.sans,fontSize:"0.72rem",fontWeight:600,color:C.t1,marginBottom:2}}>{g.label}</div>
              <div style={{fontFamily:F.sans,fontSize:"0.8rem",fontWeight:700,color:z.color,marginBottom:10}}>{z.label}</div>
              <Gauge score={g.score} size={140}/>
            </div>
          );
        })}
      </div>
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
function FXCardGrid({ items }) {
  if (!items?.length) return null;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:3}}>
        {items.map((item,i)=>{
          const u=isUp(item.change);
          return (
            <div key={i} style={{background:u?"rgba(0,100,50,.8)":"rgba(120,20,20,.8)",borderRadius:8,padding:"10px 12px",minHeight:90}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:F.mono,fontSize:"0.68rem",fontWeight:700,color:"rgba(255,255,255,.9)"}}>{item.id}</span>
                <span style={{fontFamily:F.mono,fontSize:"0.62rem",color:"rgba(255,255,255,.8)"}}>{fc(item.change)}</span>
              </div>
              <div style={{fontFamily:F.mono,fontSize:"1.4rem",fontWeight:700,color:"#fff",lineHeight:1,marginBottom:6}}>
                {Number(item.value||0).toLocaleString("fr-FR",{minimumFractionDigits:3,maximumFractionDigits:4})}
              </div>
              <Spark series={item.series||[]} up={u} w={180} h={32}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BONDS PANEL ───────────────────────────────────────────────────────────────
function BondsPanel({ data }) {
  const bonds=[...(data["RATES / BONDS"]||[]),(data["US / AMERICAS"]||[])].flat();
  const y10=bonds.find(x=>x.id==="US 10Y"), y2=bonds.find(x=>x.id==="US 2Y");
  const spread=y10&&y2?(Number(y10.value)-Number(y2.value)).toFixed(2):null;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {spread&&<div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:16}}>
        <div>
          <div style={{fontFamily:F.mono,fontSize:"0.58rem",color:C.t3,marginBottom:2}}>10Y–2Y SPREAD</div>
          <div style={{fontFamily:F.mono,fontSize:"1.4rem",fontWeight:700,color:Number(spread)>=0?C.up:C.dn}}>{Number(spread)>=0?"+":""}{spread}%</div>
        </div>
        <div style={{fontFamily:F.sans,fontSize:"0.7rem",color:C.t2}}>{Number(spread)>=0?"Normal yield curve":"Inverted — recession signal"}</div>
      </div>}
      {bonds.length>0&&<StockTable items={bonds} activeId={null} onSelect={()=>{}}/>}
    </div>
  );
}

// ─── COMMODITIES PANEL ─────────────────────────────────────────────────────────
function CommoditiesPanel({ data }) {
  const ORDER=["GOLD","SILVER","BRENT","WTI","NGAS","COPPER","PLATINUM","PALLADIUM","WHEAT","CORN"];
  const items=data["COMMODITIES"]||[];
  const sorted=[...ORDER.map(id=>items.find(x=>x.id===id)).filter(Boolean),...items.filter(x=>!ORDER.includes(x.id))];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {sorted.slice(0,6).map((item,i)=>{
          const u=isUp(item.change);
          return (
            <div key={i} style={{background:u?"rgba(0,100,50,.12)":"rgba(120,20,20,.12)",border:`1px solid ${u?"rgba(52,199,89,.2)":"rgba(255,59,48,.2)"}`,borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.t3,marginBottom:4}}>{item.id}</div>
              <div style={{fontFamily:F.mono,fontSize:"1rem",fontWeight:700,color:C.t1,marginBottom:2}}>{fv(Number(item.value))}</div>
              <Pill change={item.change}/>
              <div style={{marginTop:8,height:30}}><Spark series={item.series||[]} up={u} w={120} h={30}/></div>
            </div>
          );
        })}
      </div>
      {sorted.length>6&&<StockTable items={sorted.slice(6)} activeId={null} onSelect={()=>{}}/>}
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
    currencies: (data["FX / MAD"]||[]).slice(0,4),
    crypto:     (data["LARGE CAP"]||data["CRYPTO"]||[]).slice(0,4),
    commodities:(data["COMMODITIES"]||[]).slice(0,4),
    bonds:      (data["RATES / BONDS"]||[]).slice(0,4),
  }[tab]||[];
  if (!items.length) return null;
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
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
          <div style={{fontFamily:F.mono,fontSize:"0.6rem",color:C.t3,letterSpacing:"0.1em",marginBottom:6}}>🇲🇦 MASI · Bourse de Casablanca</div>
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
        <CompactPanel title="FOREX / MAD" items={fx.slice(0,5)} onSelect={onSelect}/>
        <CompactPanel title="CRYPTO" items={(data["LARGE CAP"]||crypto).slice(0,5)} onSelect={onSelect}/>
        <CompactPanel title="COMMODITIES" items={(data["COMMODITIES"]||[]).slice(0,5)} onSelect={onSelect}/>
      </div>

      {/* ROW 4: News + Calendar */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <NewsPanel/>
        <CalPanel/>
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
  const [sector, setSector] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(""); setData({}); setSel(null);
    const apiTab = ["usa","europe","gcc","asia"].includes(tab) ? "indices" : tab;
    fetch(`/api/market?tab=${apiTab}`)
      .then(r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => { if(!cancelled){ setData(json||{}); setUpdatedAt(new Date().toLocaleTimeString("fr-FR")); }})
      .catch(e => { if(!cancelled) setError(e.message); })
      .finally(() => { if(!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab]);

  useEffect(() => {
    const id = setInterval(() => setTab(t => t), 60000);
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

  const heroItem = useMemo(() => {
    if (tab==="morocco")    return indices.find(x=>x.id==="MASI")||banks[0]||null;
    if (tab==="currencies") return fx[0]||null;
    if (tab==="crypto")     return (data["LARGE CAP"]||crypto)[0]||null;
    if (tab==="commodities")return (data["COMMODITIES"]||[])[0]||null;
    if (tab==="bonds")      return (data["RATES / BONDS"]||[])[0]||null;
    if (tab==="indices")    return indices[0]||null;
    if (tab==="usa")        return (data["USA STOCKS"]||[])[0]||null;
    if (tab==="europe")     return (data["EUROPE STOCKS"]||[])[0]||null;
    if (tab==="gcc")        return (data["GCC STOCKS"]||[])[0]||null;
    if (tab==="asia")       return (data["ASIA STOCKS"]||[])[0]||null;
    return null;
  }, [tab,data]);

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

  const tabLabel = TABS.find(t=>t.key===tab)?.label||tab;

  const LeftSidebar = () => {
    if (tab==="morocco")    return <Watchlist title="Actions Maroc" items={[...banks,...telecom,...industry]} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="indices")    return <Watchlist title="Indices" items={indices.slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="usa")        return <Watchlist title="🇺🇸 US Stocks" items={(data["USA STOCKS"]||[]).slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="europe")     return <Watchlist title="🇪🇺 Europe" items={(data["EUROPE STOCKS"]||[]).slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="gcc")        return <Watchlist title="🌙 GCC" items={(data["GCC STOCKS"]||[]).slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="asia")       return <Watchlist title="🌏 Asia" items={(data["ASIA STOCKS"]||[]).slice(0,15)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="currencies") return <Watchlist title="MAD Pairs" items={fx.slice(0,12)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="crypto")     return <Watchlist title="Top Crypto" items={(data["LARGE CAP"]||crypto).slice(0,12)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="commodities")return <Watchlist title="Commodities" items={(data["COMMODITIES"]||[]).slice(0,12)} activeId={sel?.id} onSelect={setSel}/>;
    if (tab==="bonds")      return <Watchlist title="Bond Yields" items={(data["RATES / BONDS"]||[]).slice(0,12)} activeId={sel?.id} onSelect={setSel}/>;
    return null;
  };

  return (
    <div style={{background:C.bg,color:C.t1,minHeight:"100vh",fontFamily:F.sans}}>
      <style>{GLOBAL_CSS}</style>

      {/* Zellige band */}
      <div style={{height:5,background:"linear-gradient(90deg,#1a3a8c,#4ab8a0,#c9a84c,#d4900a,#2a7a3a,#4ab8a0,#1a3a8c)",position:"sticky",top:0,zIndex:700}}/>

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
        <div style={{display:"grid",gridTemplateColumns:"200px 1fr 210px",minHeight:"calc(100vh - 152px)"}}>
          <aside style={{padding:"12px 10px",borderRight:`1px solid ${C.bd}`,overflowY:"auto",maxHeight:"calc(100vh - 152px)",display:"flex",flexDirection:"column",gap:10,position:"sticky",top:152,alignSelf:"start"}}>
            <LeftSidebar/>
          </aside>
          <main style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:10,minWidth:0}}>
            <KpiStrip data={data} tab={tab}/>
            {heroItem && !["crypto","currencies","bonds","commodities"].includes(tab) && (
              <div style={{background:C.s1,border:`1px solid ${C.bd}`,borderRadius:12,padding:"14px",overflow:"hidden"}}>
                <div style={{fontFamily:F.mono,fontSize:"0.62rem",color:C.t3,marginBottom:4}}>{tabLabel} · {heroItem.id}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:8}}>
                  <span style={{fontFamily:F.mono,fontSize:"1.8rem",fontWeight:700,color:C.t1}}>{fv(Number(heroItem.value))}</span>
                  <Pill change={heroItem.change}/>
                </div>
                <div style={{height:80}}><Spark series={heroItem.series||[]} up={isUp(heroItem.change)} w={600} h={80}/></div>
              </div>
            )}
            {tab==="crypto"      && <CryptoGrid data={data}/>}
            {tab==="currencies"  && <FXCardGrid items={fx}/>}
            {tab==="bonds"       && <BondsPanel data={data}/>}
            {tab==="commodities" && <CommoditiesPanel data={data}/>}
            {!["crypto","currencies","bonds","commodities"].includes(tab) && allItems.length>0 && (
              <div className="fade-up"><StockTable items={allItems} activeId={sel?.id} onSelect={setSel}/></div>
            )}
            {tab==="morocco" && <><FearGreedCard data={data}/><Heatmap data={data}/></>}
          </main>
          <aside style={{padding:"12px 10px",borderLeft:`1px solid ${C.bd}`,overflowY:"auto",maxHeight:"calc(100vh - 152px)",display:"flex",flexDirection:"column",gap:10,position:"sticky",top:152,alignSelf:"start"}}>
            {sel && <DetailCard item={sel} onClose={()=>setSel(null)}/>}
            {!sel && <Watchlist title="Forex" items={fx.slice(0,6)} activeId={null} onSelect={setSel}/>}
            <NewsPanel/>
            <CalPanel/>
          </aside>
        </div>
      )}

      <footer style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 20px",background:C.s1,borderTop:`1px solid ${C.bd}`,fontFamily:F.mono,fontSize:"0.52rem",color:C.t3}}>
        <span><span style={{color:C.up}}>●</span> Morocco-first market dashboard · Données indicatives</span>
        <span>{updatedAt?"Updated: "+updatedAt:"—"}</span>
        <span>EODHD · Drahmi API · © 2026</span>
      </footer>
    </div>
  );
}
