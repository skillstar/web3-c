import { http, cookieStorage, createConfig, createStorage } from 'wagmi'  
import { mainnet, sepolia } from 'wagmi/chains'  
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'  

// 确保这些环境变量存在  
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!  
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!  

export function getConfig() {  
  return createConfig({  
    chains: [mainnet, sepolia],  
    connectors: [  
      injected(),  
      coinbaseWallet({ appName: 'YiDeng Token App' }),  
      walletConnect({ projectId: walletConnectProjectId }),  
    ],  
    storage: createStorage({  
      storage: cookieStorage,  
    }),  
    ssr: true,  
    transports: {  
      [mainnet.id]: http(),  
      [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),  
    },  
  })  
}  

declare module 'wagmi' {  
  interface Register {  
    config: ReturnType<typeof getConfig>  
  }  
}