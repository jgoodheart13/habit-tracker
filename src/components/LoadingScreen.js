// LoadingScreen.js
import React from 'react';
import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <img
        src={process.env.PUBLIC_URL + '/Reach4LogoMock-NoLogo-transparent.png'}
        alt="Reach4"
        className="loading-logo"
      />
      <div className="loading-mantra">
        <span className="loading-mantra-line">Build Your Core</span>
        <span className="loading-mantra-line">Reach For More</span>
      </div>
      <div className="loading-text-row">
        <span className="loading-label">Loading your habits</span>
        <div className="loading-dots">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>
    </div>
  );
}
