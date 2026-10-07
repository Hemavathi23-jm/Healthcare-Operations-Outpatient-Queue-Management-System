import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Browser runtime polyfill for browser-safe SockJS & STOMP compatibility
if (typeof window !== 'undefined') {
  window.global = window;
  if (!window.process) {
    window.process = { env: {} };
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
