// app/TokenInfo.tsx  
'use client'  

import { useReadContracts } from 'wagmi'  
import { YDTOKEN_CONTRACT } from "@/app/abi/contractConfig"  
import { formatEther } from 'viem'  
import type { YdToken } from '@/app/abi/typechain-types'  

function TokenInfo() {  
  const { data, error, isLoading } = useReadContracts({  
    contracts: [  
      {  
        ...YDTOKEN_CONTRACT,  
        functionName: 'name',  
      } as const,  
      {  
        ...YDTOKEN_CONTRACT,  
        functionName: 'symbol',  
      } as const,  
      {  
        ...YDTOKEN_CONTRACT,  
        functionName: 'totalSupply',  
      } as const,  
      {  
        ...YDTOKEN_CONTRACT,  
        functionName: 'MAX_SUPPLY',  
      } as const,  
      {  
        ...YDTOKEN_CONTRACT,  
        functionName: 'getCurrentPrice',  
      } as const,  
      {  
        ...YDTOKEN_CONTRACT,  
        functionName: 'TOKENS_PER_ETH',  
      } as const,  
    ],  
  })  

  if (isLoading) {  
    return (  
      <div className="flex items-center justify-center p-4">  
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />  
        <p className="ml-2">Loading token information...</p>  
      </div>  
    )  
  }  

  if (error) {  
    return (  
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">  
        <p className="font-semibold">Error loading token information</p>  
        <p className="text-sm">{error.message}</p>  
      </div>  
    )  
  }  

  // 使用可选链和空值合并操作符来安全地访问数据  
  const tokenName = data?.[0]?.result  
  const tokenSymbol = data?.[1]?.result  
  const totalSupply = data?.[2]?.result  
  const maxSupply = data?.[3]?.result  
  const currentPrice = data?.[4]?.result  
  const tokensPerEth = data?.[5]?.result  

  return (  
    <div className="p-4 max-w-4xl mx-auto">  
      <h2 className="text-2xl font-bold mb-6">Token Information</h2>  
      
      <div className="space-y-6">  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
          <div className="bg-white shadow rounded-lg p-6">  
            <h3 className="font-semibold text-lg mb-3">Basic Info</h3>  
            <div className="space-y-2">  
              <p className="flex justify-between">  
                <span className="text-gray-600">Name:</span>  
                <span className="font-medium">{tokenName}</span>  
              </p>  
              <p className="flex justify-between">  
                <span className="text-gray-600">Symbol:</span>  
                <span className="font-medium">{tokenSymbol}</span>  
              </p>  
            </div>  
          </div>  

          <div className="bg-white shadow rounded-lg p-6">  
            <h3 className="font-semibold text-lg mb-3">Supply</h3>  
            <div className="space-y-2">  
              <p className="flex justify-between">  
                <span className="text-gray-600">Total Supply:</span>  
                <span className="font-medium">  
                  {totalSupply ? formatEther(totalSupply) : 'N/A'}  
                </span>  
              </p>  
              <p className="flex justify-between">  
                <span className="text-gray-600">Max Supply:</span>  
                <span className="font-medium">  
                  {maxSupply ? formatEther(maxSupply) : 'N/A'}  
                </span>  
              </p>  
            </div>  
          </div>  

          <div className="bg-white shadow rounded-lg p-6">  
            <h3 className="font-semibold text-lg mb-3">Price Info</h3>  
            <div className="space-y-2">  
              <p className="flex justify-between">  
                <span className="text-gray-600">Current Price:</span>  
                <span className="font-medium">  
                  {currentPrice ? `${formatEther(currentPrice)} ETH` : 'N/A'}  
                </span>  
              </p>  
              <p className="flex justify-between">  
                <span className="text-gray-600">Tokens per ETH:</span>  
                <span className="font-medium">  
                  {tokensPerEth?.toString() ?? 'N/A'}  
                </span>  
              </p>  
            </div>  
          </div>  

          <div className="bg-white shadow rounded-lg p-6">  
            <h3 className="font-semibold text-lg mb-3">Contract Address</h3>  
            <div className="break-all bg-gray-50 p-3 rounded text-sm font-mono">  
              {YDTOKEN_CONTRACT.address}  
            </div>  
          </div>  
        </div>  

        <div className="mt-6 text-sm text-gray-500 text-center">  
          Last updated: {new Date().toLocaleString()}  
        </div>  
      </div>  
    </div>  
  )  
}  

export default TokenInfo