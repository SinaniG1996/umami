require('dotenv').config();
const pkg = require('./package.json');

module.exports = {
  env: {
    VERSION: pkg.version,
    FORCE_SSL: !!process.env.FORCE_SSL,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.js$/,
      },
      use: ['@svgr/webpack'],
    });

    return config;
  },
  async headers() {
    return [
      {
        source: '/track.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000', // 30 days
          },
        ],
      },
    ];
  },
};
