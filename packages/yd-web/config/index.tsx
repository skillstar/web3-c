// config/index.tsx  
import { getDefaultConfig } from '@rainbow-me/rainbowkit'  
import { mainnet, sepolia } from 'wagmi/chains'  
import { http } from 'viem'  // 从 viem 导入 http  

// Get projectId from WalletConnect Cloud  
export const projectId = 'c531f757ff479651d0d8137d8a13321d'  

if (!projectId) throw new Error('Project ID is not defined')  

export const config = getDefaultConfig({  
  appName: 'Your App Name',  
  projectId: projectId,  
  chains: [mainnet, sepolia],  
  transports: {  
    [mainnet.id]: http(),  
    [sepolia.id]: http(),  
  },  
  ssr: true  
})