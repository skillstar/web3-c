 /** @type {import('next').NextConfig} */
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const nextConfig = (phase) => {
  return {
    // 添加 transpilePackages 配置
    transpilePackages: ["three"],
      images: {
      domains: ["i.seadn.io", "another-domain.com"],
    },
    webpack: (config, { isServer }) => {
      // 仅在生产构建时启用分析器
      if (phase === PHASE_PRODUCTION_BUILD && process.env.ANALYZE === "true") {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: "static", // 生成静态HTML报告文件
            reportFilename: isServer
              ? "../analyze/server.html"
              : "./analyze/client.html",
            openAnalyzer: false, // 不自动打开浏览器
            generateStatsFile: true, // 生成stats.json文件
            statsFilename: isServer
              ? "../analyze/server-stats.json"
              : "./analyze/client-stats.json",
          })
        );
      }

      // 添加 three.js 相关的 webpack 配置（如果需要）
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        three: require.resolve("three"),
      };

      return config;
    },
  };
};

module.exports = nextConfig;
