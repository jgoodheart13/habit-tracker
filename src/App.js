
import React, { useState } from 'react';
import DailyViewPage from './pages/DailyViewPage';
import HabitBuilderPage from './pages/HabitBuilderPage';

export default function App() {
  const [page, setPage] = useState('daily');

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'Inter, Arial, sans-serif', background: '#f7f7f7', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 24, background: '#fff', borderBottom: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <h1 style={{ color: '#fc5200', fontWeight: 800, fontSize: 28 }}>Habit Tracker</h1>
        <nav>
          <button onClick={() => setPage('daily')} style={{ marginRight: 8, padding: 10, borderRadius: 6, background: page === 'daily' ? '#fc5200' : '#fff', color: page === 'daily' ? '#fff' : '#fc5200', border: '1px solid #fc5200', fontWeight: 600 }}>Daily View</button>
          <button onClick={() => setPage('builder')} style={{ padding: 10, borderRadius: 6, background: page === 'builder' ? '#fc5200' : '#fff', color: page === 'builder' ? '#fff' : '#fc5200', border: '1px solid #fc5200', fontWeight: 600 }}>Add Habit</button>
        </nav>
      </header>
      <main>
        {page === 'daily' ? <DailyViewPage /> : <HabitBuilderPage onHabitAdded={() => setPage('daily')} />}
      </main>
    </div>
  );
}
