import React, { useState, useEffect } from "react";

const INITIAL_DATA = {
  forex: [
    { id: "USD/JPY", name: "USD/JPY", price: 150.24, change: 0.12 },
    { id: "EUR/USD", name: "EUR/USD", price: 1.0850, change: -0.05 },
    { id: "EUR/JPY", name: "EUR/JPY", price: 163.15, change: 0.08 },
    { id: "GBP/JPY", name: "GBP/JPY", price: 190.42, change: 0.15 },
    { id: "USD/MAD", name: "USD/MAD", price: 10.05, change: -0.10 },
    { id: "EUR/MAD", name: "EUR/MAD", price: 10.89, change: 0.04 },
  ],
  indices: [
    { id: "MASI", name: "Morocco All Share", price: 12950.40, change: 0.45 },
    { id: "DOW", name: "NY Dow", price: 38950.20, change: -0.25 },
    { id: "NASDAQ", name: "Nasdaq", price: 16120.50, change: 0.80 },
    { id: "NIKKEI", name: "Nikkei 225", price: 39500.00, change: 1.10 },
  ],
  crypto: [
    { id: "BTC", name: "Bitcoin", price: 67420.00, change: 2.45 },
    { id: "ETH", name: "Ethereum", price: 3850.20, change: 1.90 },
  ],
  bonds: [
    { id: "US10Y", name: "US 10Y Yield", price: 4.152, change: 0.02 },
    { id: "MA10Y", name: "Morocco 10Y", price: 3.450, change: -0.01 },
  ]
};

function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const interval = setInterval(() => {
      const randomize = (arr) => arr.map(item => ({
        ...item,
        price: +(item.price + (Math.random() * (item.price * 0.002) - (item.price * 0.001))).toFixed(item.id.includes("/") ? 4 : 2),
        change: +(Math.random() * 2 - 1).toFixed(2)
      }));
      setData({
        forex: randomize(INITIAL_DATA.forex),
        indices: randomize(INITIAL_DATA.indices),
        crypto: randomize(INITIAL_DATA.crypto),
        bonds: randomize(INITIAL_DATA.bonds),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const MarketSection = ({ title, items }) => (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ backgroundColor: "#1e293b", padding: "5px 15px", fontSize: "12px", fontWeight: "bold", color: "#38bdf8", borderLeft: "4px solid #38bdf8" }}>
        {title}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", border: "1px solid #334155" }}>
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", border: "0.5px solid #1e293b", backgroundColor: "#020617" }}>
            <div style={{ fontSize: "13px" }}>
              <div style={{ color: "#94a3b8", fontSize: "10px" }}>{item.id}</div>
              <div style={{ fontWeight: "bold" }}>{item.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "15px", fontWeight: "bold" }}>{item.price}</div>
              <div style={{ color: item.change >= 0 ? "#22c55e" : "#ef4444", fontSize: "12px" }}>
                {item.change >= 0 ? "+" : ""}{item.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh", fontFamily: "monospace", padding: "10px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "2px solid #334155" }}>
        <h2 style={{ margin: 0, fontSize: "20px" }}>GLOBAL MARKET MONITOR v1.0</h2>
        <button onClick={() => setLang(lang === "en" ? "fr" : "en")} style={{ background: "#334155", color: "#fff", border: "none", padding: "5px 10px", cursor: "pointer" }}>
          {lang === "en" ? "FR" : "EN"}
        </button>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ flex: "2", minWidth: "300px" }}>
          <MarketSection title="FOREX / KAWASE" items={data.forex} />
          <MarketSection title="WORLD INDICES" items={data.indices} />
        </div>
        <div style={{ flex: "1", minWidth: "250px" }}>
          <MarketSection title="CRYPTO" items={data.crypto} />
          <MarketSection title="BONDS / INTEREST" items={data.bonds} />
        </div>
      </div>
    </div>
  );
}

export default App;
