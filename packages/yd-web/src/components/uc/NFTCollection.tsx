"use client";

import { useState, useEffect, useCallback, useMemo } from 'react'
import { NFT } from '@/types'
import { useAtom } from 'jotai'
import { userNFTCountAtom } from '@/atoms/nftAtoms'
import { useMiniNFT } from '@/hooks/useMiniNFT'
import { NFTCard } from './NFTCard'
import { useAccount } from 'wagmi'
import { RefreshCw } from 'lucide-react'
import NFTCollectionSkeleton from './NFTCollectionSkeleton'

export default function NFTCollection() {
  const { address, isConnected } = useAccount()
  const { getUserNFTs } = useMiniNFT()
  const [, setNFTCount] = useAtom(userNFTCountAtom)
  const [processedNFTs, setProcessedNFTs] = useState<(NFT & { tokenURI: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 使用 useCallback 并移除不必要的依赖
  const fetchNFTs = useCallback(async () => {
    // 直接在函数内部检查连接状态和地址
    if (!isConnected || !address) {
      setProcessedNFTs([])
      setNFTCount(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching NFTs for address:', address)
      
      // 使用局部变量存储 getUserNFTs
      const rawNFTs = await getUserNFTs()
      
      console.log('Raw NFTs:', rawNFTs)

      // 安全地处理 rawNFTs，确保每个 NFT 都有必要的字段
      const convertedNFTs: (NFT & { tokenURI: string })[] = (rawNFTs || []).map((rawNFT, index) => ({
        nftId: rawNFT.tokenId ? Number(rawNFT.tokenId) : index, 
        title: rawNFT.tokenId 
          ? `Certificate #${rawNFT.tokenId}` 
          : `Unnamed Certificate #${index}`, 
        imageUrl: `/default-certificate-${(index % 5) + 1}.png`,
        nftMintedTimestamp: rawNFT.tokenId 
          ? new Date().toISOString() 
          : new Date(Date.now() - index * 86400000).toISOString(),
        courseId: rawNFT.courseId 
          ? Number(rawNFT.courseId) 
          : 0,
        tokenURI: rawNFT.tokenURI || '' 
      })).filter(nft => nft.tokenURI)

      console.log('Converted NFTs:', convertedNFTs)

      if (convertedNFTs.length === 0) {
        setError('No NFT certificates found')
      }

      setProcessedNFTs(convertedNFTs)
      setNFTCount(convertedNFTs.length)
    } catch (err) {
      console.error('Detailed NFT Fetch Error:', err)
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred while fetching NFTs'
      
      setError(`Failed to load certificates: ${errorMessage}`)
      setProcessedNFTs([])
      setNFTCount(0)
    } finally {
      setIsLoading(false)
    }
  }, []) // 移除所有依赖

  // 使用单独的 useEffect 处理初始和地址变化的获取
  useEffect(() => {
    // 只在地址和连接状态变化时触发
    if (isConnected && address) {
      fetchNFTs()
    } else {
      // 重置状态
      setProcessedNFTs([])
      setNFTCount(0)
      setIsLoading(false)
    }
  }, [isConnected, address, fetchNFTs])

  // 使用 useMemo 稳定 NFT 渲染列表
  const nftCardList = useMemo(() => 
    processedNFTs.map((nft) => (
      <NFTCard
        key={nft.nftId}
        {...nft}
      />
    )), 
    [processedNFTs]
  )

 if (isLoading) {  
  return <NFTCollectionSkeleton />  
}  

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 p-4 rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">My Certificates ({processedNFTs.length})</h2>
        <button 
          onClick={fetchNFTs}
          className="btn btn-sm btn-ghost"
          disabled={!isConnected || isLoading}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedNFTs.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            {isConnected 
              ? "No Certificates owned" 
              : "Please connect your wallet to view certificates"}
          </p>
        ) : (
          nftCardList
        )}
      </div>
    </div>
  )
}