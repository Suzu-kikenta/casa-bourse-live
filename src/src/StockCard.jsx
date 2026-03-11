import React from 'react';

function StockCard({ name, price, change }) {
  const isUp = change.includes('+');
  return (
    <div style={{
      backgroundColor: isUp ? '#dcfce7' : '#fee2e2',
      border: `2px solid ${isUp ? '#22c55e' : '#ef4444'}`,
      padding: '10px', margin: '5px', borderRadius: '8px',
      width: '140px', fontFamily: 'sans-serif'
    }}>
      <div style={{ fontSize: '11px', color: '#666' }}>{name}</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{price} DH</div>
      <div style={{ color: isUp ? 'green' : 'red', fontWeight: 'bold' }}>{change}</div>
    </div>
  );
}
export default StockCard;