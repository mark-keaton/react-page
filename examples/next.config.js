const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const path = require('path');
module.exports = withBundleAnalyzer({
  basePath: process.env.RELEASE_CHANNEL
    ? !process.env.RELEASE_CHANNEL || process.env.RELEASE_CHANNEL === 'latest'
      ? '/'
      : '/' + process.env.RELEASE_CHANNEL
    : undefined,
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: '/docs/index.html',
      },
    ];
  },
  productionBrowserSourceMaps: true,
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
  },
  // Transpile ESM-only packages for Next.js compatibility
  // react-dnd v16+ is ESM-only and requires transpilation
  transpilePackages: [
    'react-dnd',
    'react-dnd-html5-backend',
    'dnd-core',
    '@react-dnd/invariant',
    '@react-dnd/asap',
    '@react-dnd/shallowequal',
    // Also transpile local packages to handle ESM imports
    '@react-page/editor',
    '@react-page/plugins-background',
    '@react-page/plugins-divider',
    '@react-page/plugins-html5-video',
    '@react-page/plugins-image',
    '@react-page/plugins-slate',
    '@react-page/plugins-spacer',
    '@react-page/plugins-video',
    '@react-page/react-admin',
  ],
  // Enable experimental ESM externals support
  experimental: {
    esmExternals: 'loose',
  },
});
