/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile ESM-only packages for Next.js compatibility
  // react-dnd v16+ is ESM-only and requires transpilation
  transpilePackages: [
    'react-dnd',
    'react-dnd-html5-backend',
    'dnd-core',
    '@react-dnd/invariant',
    '@react-dnd/asap',
    '@react-dnd/shallowequal',
    // Transpile local ReactPage packages
    '@react-page/editor',
    '@react-page/plugins-slate',
    '@react-page/plugins-image',
  ],
  // Enable experimental ESM externals support
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
