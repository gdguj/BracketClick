/**
 * Application Entry Point
 *
 * This file initializes and renders the React application to the DOM.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Find the root DOM element and render the React application
// StrictMode enables additional development checks and warnings
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
