import { useState, useEffect } from 'react'
import { NFT, NFTMetadata } from '@/types'
import { truncateText } from '@/utils/shortenAddress'

// IPFS 网关转换函数
const convertIPFSUri = (uri: string): string => {
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '')
    return `https://ipfs.io/ipfs/${cid}`
  }
  return uri
}

export function NFTCard({ 
  nftId, 
  title, 
  imageUrl, 
  nftMintedTimestamp,
  courseId,
  tokenURI
}: NFT & { tokenURI: string }) {
  const [metadata, setMetadata] = useState<NFTMetadata>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 转换 IPFS URI
        const processedTokenURI = convertIPFSUri(tokenURI)

        // 尝试获取元数据
        const response = await fetch(processedTokenURI)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // 如果图片是 IPFS URI，也转换
        if (data.image && data.image.startsWith('ipfs://')) {
          data.image = convertIPFSUri(data.image)
        }

        setMetadata(data)
      } catch (error) {
        console.error('Failed to fetch NFT metadata:', error)
        setError('Failed to load certificate metadata')
      } finally {
        setIsLoading(false)
      }
    }

    if (tokenURI) {
      fetchMetadata()
    }
  }, [tokenURI])

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-md animate-pulse">
        <div className="h-48 bg-gray-300"></div>
        <div className="card-body">
          <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body text-center">
          <div className="text-error">{error}</div>
          <div className="text-sm text-gray-400">
            <p>Certificate ID: {nftId}</p>
            <p>Course: {courseId}</p>
            <p>Issued: {new Date(nftMintedTimestamp).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-md group">
      <figure className="overflow-hidden">
        <img
          src={metadata.image || imageUrl}
          alt={metadata.name || title}
          className="w-full h-48 object-cover transition-transform duration-300 ease-in-out 
                     group-hover:scale-105 group-hover:brightness-90"
        />
      </figure>
      <div className="card-body text-center">
        <h3 className="text-primary font-bold">
          {metadata.name || title}
        </h3>
        <div className="text-sm text-gray-400">
          <p>Certificate ID: {nftId}</p>
          <p>Course: {courseId}</p>
          <p>Issued: {new Date(nftMintedTimestamp).toLocaleDateString()}</p>
        </div>
        {metadata.description && (
          <div className="text-xs text-gray-500 mt-2">
            {truncateText(metadata.description, 120)}
          </div>
        )}
      </div>
    </div>
  )
}