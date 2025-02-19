const nextConfig = {
    reactStrictMode: false, // ✅ Prevents unnecessary double renders in development
    experimental: {
      turbo: {
        rules: {}, // ✅ Forces Turbopack to be used
      },
    },
    env: {
      NEXT_DISABLE_FAST_REFRESH: "true", // ✅ Explicitly disables Fast Refresh
    },
    webpack: (config, { dev }) => {
      if (dev) {
        config.optimization = config.optimization || {};
        config.optimization.splitChunks = false; // ✅ Stops Webpack from triggering unnecessary updates
        config.optimization.runtimeChunk = false;
      }
      return config;
    },
  };
  
  export default nextConfig; // ✅ Fix: Assign object to a variable before exporting
  