import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Explicitly import the JSX component to avoid resolution issues.
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log web vitals for performance measurements.
reportWebVitals();
