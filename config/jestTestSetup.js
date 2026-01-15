// TextEncoder/TextDecoder polyfill for jsdom (required by Jest 29)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// React 18 compatible test setup
// Note: Enzyme has been removed as it's incompatible with React 18
// Use @testing-library/react instead for component testing

import React from 'react';

// This workaround is no longer needed in React 18, but kept for compatibility
// with any code that might still rely on it
React.useLayoutEffect = React.useEffect;
