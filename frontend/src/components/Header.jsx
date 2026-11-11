import React from 'react';

function Header({ title, subtitle }) {
  return (
    <header style={{ padding: '20px', backgroundColor: '#1890ff', color: 'white', borderRadius: '8px', marginBottom: '20px' }}>
      <h1>{title}</h1>
      {subtitle && <p style={{ margin: '5px 0 0', fontSize: '14px' }}>{subtitle}</p>}
    </header>
  );
}

export default Header;