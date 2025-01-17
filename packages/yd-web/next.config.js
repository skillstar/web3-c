/** @type {import('next').NextConfig} */  
const {  
  PHASE_DEVELOPMENT_SERVER,  
  PHASE_PRODUCTION_BUILD,  
} = require("next/constants");  
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");  

const ContentSecurityPolicy = `  
  default-src 'self';  
  script-src 'self' 'unsafe-inline' 'unsafe-eval';  
  style-src 'self' 'unsafe-inline';  
  img-src * blob: data:;  
  media-src * blob: data:;
  connect-src *;  
  font-src 'self';  
  frame-src 'self' https://connect.walletconnect.org;  
  worker-src 'self' blob:;  
`; 

const securityHeaders = [  
  {  
    key: 'X-DNS-Prefetch-Control',  
    value: 'on'  
  },  
  {  
    key: 'Strict-Transport-Security',  
    value: 'max-age=63072000; includeSubDomains; preload'  
  },  
  {  
    key: 'X-XSS-Protection',  
    value: '1; mode=block'  
  },  
  {  
    key: 'X-Frame-Options',  
    value: 'SAMEORIGIN'  
  },  
  {  
    key: 'X-Content-Type-Options',  
    value: 'nosniff'  
  },  
  {  
    key: 'Referrer-Policy',  
    value: 'origin-when-cross-origin'  
  },  
  {  
    key: 'Content-Security-Policy',  
    value: ContentSecurityPolicy.replace(/\n/g, '')  
  }  
];  

const nextConfig = (phase) => {  
  return {  
    // 性能和兼容性配置  
    reactStrictMode: true,  
    swcMinify: true,  
    
    // 仅保留 transpilePackages，移除 serverComponentsExternalPackages  
    transpilePackages: [  
      "three"  // 只保留必要的包  
    ],  

    // 图片域名白名单  
    images: {  
      domains: [  
        "i.seadn.io",   
        "another-domain.com",  
        "ipfs.io",  
        "cloudflare-ipfs.com"  
      ],  
      remotePatterns: [  
        {   
          protocol: 'https',   
          hostname: '**'   
        }  
      ]  
    },  

    // 安全头配置  
    async headers() {  
      return [  
        {  
          source: '/(.*)',  
          headers: securityHeaders  
        }  
      ];  
    },  

    // Webpack 配置  
    webpack: (config, { isServer, dev, webpack }) => {  
      // 仅在生产构建时启用分析器  
      if (phase === PHASE_PRODUCTION_BUILD && process.env.ANALYZE === "true") {  
        config.plugins.push(  
          new BundleAnalyzerPlugin({  
            analyzerMode: "static",  
            reportFilename: isServer  
              ? "../analyze/server.html"  
              : "./analyze/client.html",  
            openAnalyzer: false,  
            generateStatsFile: true,  
            statsFilename: isServer  
              ? "../analyze/server-stats.json"  
              : "./analyze/client-stats.json",  
          })  
        );  
      }  

      // Web3 和 Three.js 配置  
      config.resolve.fallback = {   
        fs: false,   
        net: false,   
        tls: false   
      };  

      config.resolve.alias = {  
        ...config.resolve.alias,  
        three: require.resolve("three")  
      };  

      // 性能优化  
      config.optimization.minimize = !dev;  
      
      // 压缩配置  
      if (!dev) {  
        config.optimization.minimizer.push(  
          new webpack.optimize.ModuleConcatenationPlugin()  
        );  
      }  

      return config;  
    },  

    // 移除 experimental 中冲突的配置  
    experimental: {  
      // 可以保留其他必要的实验性配置  
      optimizePackageImports: ['three']  
    }  
  };  
};  

module.exports = nextConfig;