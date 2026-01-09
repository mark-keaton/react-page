import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// Import ReactPage editor styles
import '@react-page/editor/lib/index.css';

// Import plugin styles
import '@react-page/plugins-slate/lib/index.css';
import '@react-page/plugins-image/lib/index.css';
import '@react-page/plugins-video/lib/index.css';
import '@react-page/plugins-html5-video/lib/index.css';
import '@react-page/plugins-spacer/lib/index.css';
import '@react-page/plugins-background/lib/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
