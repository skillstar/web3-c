// components/NFTCard.tsx  
import { useState, useEffect } from 'react'  
import { useIPFS } from '@/hooks/useIPFS'  
import { useMiniNFT } from '@/hooks/useMiniNFT'  

interface NFTMetadata {  
  name: string;  
  description: string;  
  image: string;  
  attributes?: Array<{  
    trait_type: string;  
    value: string | number;  
  }>;  
}  

interface NFTCardProps {  
  tokenId: bigint;  
  courseId: bigint;  
  tokenURI: string;  
}  

export function NFTCard({ tokenId, courseId, tokenURI }: NFTCardProps) {  
  const { ipfsToHttp, getMetadata } = useIPFS()  
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)  
  const [isLoading, setIsLoading] = useState(true)  
  const [error, setError] = useState<string | null>(null)  

  useEffect(() => {  
    const loadMetadata = async () => {  
      try {  
        setIsLoading(true)  
        setError(null)  
        const data = await getMetadata(tokenURI)  
        setMetadata(data)  
      } catch (err) {  
        setError('Failed to load NFT metadata')  
        console.error(err)  
      } finally {  
        setIsLoading(false)  
      }  
    }  

    if (tokenURI) {  
      loadMetadata()  
    }  
  }, [tokenURI])  

  if (isLoading) {  
    return (  
      <div className="p-4 border rounded-lg shadow-sm animate-pulse">  
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>  
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>  
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>  
      </div>  
    )  
  }  

  if (error) {  
    return (  
      <div className="p-4 border rounded-lg shadow-sm bg-red-50">  
        <p className="text-red-500">{error}</p>  
      </div>  
    )  
  }  

  return (  
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">  
      {metadata && (  
        <>  
          <div className="aspect-square relative mb-4">  
            <img  
              src={metadata.image}  
              alt={metadata.name}  
              className="rounded-lg object-cover w-full h-full"  
            />  
          </div>  
          <h3 className="font-bold mb-2">{metadata.name}</h3>  
          <p className="text-sm text-gray-600 mb-2">{metadata.description}</p>  
          <div className="text-sm text-gray-500">  
            <p>Token ID: {tokenId.toString()}</p>  
            <p>Course ID: {courseId.toString()}</p>  
          </div>  
          {metadata.attributes && (  
            <div className="mt-4">  
              <h4 className="font-semibold mb-2">Attributes</h4>  
              <div className="grid grid-cols-2 gap-2">  
                {metadata.attributes.map((attr, index) => (  
                  <div key={index} className="bg-gray-50 p-2 rounded">  
                    <p className="text-xs text-gray-500">{attr.trait_type}</p>  
                    <p className="font-medium">{attr.value}</p>  
                  </div>  
                ))}  
              </div>  
            </div>  
          )}  
        </>  
      )}  
    </div>  
  )  
}