import React from 'react';
import StockCard from './StockCard';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Casablanca Market 🇲🇦</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <StockCard name="MAROC TELECOM" price="92.50" change="+1.2%" />
        <StockCard name="ATTIJARIWAFA" price="455.00" change="-0.5%" />
        <StockCard name="ADDOHA" price="16.40" change="+5.2%" />
      </div>
    </div>
  );
}
export default App;
