import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white font-sans">
        <h1 className="text-xl font-bold tracking-tight">LEGO Wargame Terrain Studio</h1>
      </div>
    </React.StrictMode>
  );
}
