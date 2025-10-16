// LoadingScreen.js
import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#fff',
    }}>
      <img
        src={process.env.PUBLIC_URL + '/Reach4LogoMock-transparent.png'}
        alt="Loading..."
        style={{ width: 120, height: 120, marginBottom: 32 }}
      />
      <div style={{ fontSize: 22, color: '#888', fontWeight: 500 }}>Loading your habits...</div>
    </div>
  );
}
