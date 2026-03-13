import React, { useState, useEffect } from "react";

const DATA_2026 = {
  "為替レート": [
    { id: "USD/MAD", name: "US Dollar", price: 9.332, change: -0.06 },
    { id: "EUR/MAD", name: "Euro", price: 10.154, change: 0.04 },
    { id: "GBP/MAD", name: "GB Pound", price: 11.951, change: 0.12 },
    { id: "JPY/MAD", name: "100 Yen", price: 6.224, change: -0.02 }
  ],
  "仮想通貨": [
    { id: "BTC/MAD", name: "Bitcoin (MAD)", price: 652045, change: 1.51 },
    { id: "BTC/USD", name: "Bitcoin (USD)", price: 69645, change: 1.51 },
    { id: "ETH/USD", name: "Ethereum", price: 2032.4, change: 1.48 },
    { id: "SOL/USD", name: "Solana", price: 185.15, change: 2.22 }
  ],
  "日本,アジア": [
    { id: "NIKKEI", name: "Nikkei 225", price: 54926, change: 1.30 },
    { id: "TOPIX", name: "TOPIX", price: 3850.12, change: 0.85 },
    { id: "H SENG", name: "Hang Seng", price: 25921, change: -0.20 },
    { id: "SHANG", name: "Shanghai Comp", price: 4131.3, change: 0.20 }
  ],
  "米国,欧州": [
    { id: "S&P 500", name: "USA S&P", price: 5120.4, change: 0.85 },
    { id: "DOW J", name: "Dow Jones", price: 38950, change: -0.25 },
    { id: "NASDAQ", name: "Nasdaq 100", price: 16120, change: 1.15 },
    { id: "EURO50", name: "Euro Stoxx 50", price: 5061.8, change: 1.79 }
  ],
  "商品": [
    { id: "GOLD", name: "Gold (oz)", price: 5153.1, change: 0.50 },
    { id: "SILVER", name: "Silver", price: 93.29, change: 6.52 },
    { id: "BRENT", name: "Brent Oil", price: 87.78, change: -1.20 }
  ],
  "ニュース": [
    { id: "HEADLINE 1", name: "Moody's upgrades Morocco outlook", price: "Rating: Ba1", change: 1 },
    { id: "HEADLINE 2", name: "CTM revenue up 40% in 2025", price: "Growth", change: 1 }
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState("為替レート");
  const [marketData, setMarketData] = useState(DATA_2026);

  // Simulation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const randomize = (list) => list.map(item => ({
        ...item,
        price: typeof item.price === "number" ? +(item.price + (Math.random() * (item.price * 0.0006) - (item.price * 0.0003))).toFixed(3) : item.price,
        change: typeof item.change === "number" ? +(Math.random() * 4 - 2).toFixed(2) : item.change
      }));
      setMarketData(prev => ({ ...prev, [activeTab]: randomize(prev[activeTab]) }));
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div style={{ backgroundColor: "#333", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Sekai-Kabuka Tabs Wrapper */}
      <div style={{ 
        display: "flex", 
        background: "#000", 
        paddingTop: "10px", 
        paddingLeft: "5px",
        borderBottom: "3px solid #ccc" 
      }}>
        {Object.keys(DATA_2026).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 15px",
              marginRight: "2px",
              cursor: "pointer",
              border: "1px solid #555",
              borderBottom: "none",
              borderRadius: "10px 10px 0 0",
              fontWeight: "bold",
              fontSize: "13px",
              transition: "0.2s",
              /* Active Tab Logic */
              background: activeTab === tab 
                ? "#fff" 
                : "linear-gradient(to bottom, #444 0%, #111 100%)",
              color: activeTab === tab ? "#000" : "#fff",
              boxShadow: activeTab === tab ? "none" : "inset 0 1px 1px rgba(255,255,255,0.2)"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ padding: "20px", background: "#000" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
          {marketData[activeTab].map(item => (
            <div key={item.id} style={{ backgroundColor: "#111", padding: "12px", border: "1px solid #333", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: "#aaa", fontSize: "10px" }}>{item.id}</div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{item.name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>{item.price}</div>
                <div style={{ color: item.change > 0 ? "#0f0" : "#f00", fontSize: "12px" }}>
                  {item.change > 0 ? "+" : ""}{item.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;