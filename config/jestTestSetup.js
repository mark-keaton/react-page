// Polyfill TextEncoder/TextDecoder for jsdom environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const enzyme = require('enzyme');
const EnzymeAdapter = require('enzyme-adapter-react-16');
const enableHooks = require('jest-react-hooks-shallow').default;

import React from 'react';
React.useLayoutEffect = React.useEffect;

enzyme.configure({ adapter: new EnzymeAdapter() });
enableHooks(jest);
