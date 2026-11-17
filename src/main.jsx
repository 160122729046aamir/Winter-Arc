import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Pointer-tracked specular highlight for glass cards.
// One passive listener for the whole app; writes --mx/--my on the hovered card only.
if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches) {
  let frame = 0;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const card = e.target?.closest?.('.glass-card, .arc-card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    },
    { passive: true }
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
