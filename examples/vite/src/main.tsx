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
import '@react-page/plugins-divider/lib/index.css';
import '@react-page/plugins-background/lib/index.css';

// Note: StrictMode disabled due to react-draggable findDOMNode deprecation warnings
// ReactPage uses react-draggable internally which doesn't yet support StrictMode
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
