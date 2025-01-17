import { useAtom } from 'jotai'  
import { useEffect } from 'react'  
import { useAccount } from 'wagmi'  
import { useMiniNFT } from './useMiniNFT'  
import {   
  userNFTCountAtom,   
  userNFTsAtom,   
  isLoadingNFTsAtom   
} from '@/atoms/nftAtoms'  

export function useNFTData() {  
  const { address } = useAccount()  
  const { getUserNFTs } = useMiniNFT()  
  const [nftCount, setNFTCount] = useAtom(userNFTCountAtom)  
  const [userNFTs, setUserNFTs] = useAtom(userNFTsAtom)  
  const [isLoading, setIsLoading] = useAtom(isLoadingNFTsAtom)  

  const loadNFTData = async () => {  
    if (!address) {  
      setNFTCount(0)  
      setUserNFTs([])  
      return  
    }  

    try {  
      setIsLoading(true)  
      const nfts = await getUserNFTs()  
      setUserNFTs(nfts)  
      setNFTCount(nfts.length)  
    } catch (error) {  
      console.error('Error loading NFT data:', error)  
    } finally {  
      setIsLoading(false)  
    }  
  }  

  // 当地址改变时重新加载数据  
  useEffect(() => {  
    loadNFTData()  
  }, [address])  

  return {  
    nftCount,  
    userNFTs,  
    isLoading,  
    refreshNFTData: loadNFTData  
  }  
}