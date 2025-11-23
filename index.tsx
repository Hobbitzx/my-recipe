import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css'; 

// Vite PWA plugin handles SW registration automatically via 'vite-plugin-pwa/client' 
// or the 'autoUpdate' config, so manual registration is not strictly needed here 
// if using the plugin correctly. However, for the build to process CSS, we need index.css.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
    <App />
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);