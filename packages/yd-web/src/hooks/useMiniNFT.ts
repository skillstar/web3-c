import { useAccount, useWriteContract, usePublicClient } from 'wagmi'  
import { NFT_CONTRACT } from '@/app/abi/contractConfig'  
import { type Hash } from 'viem'  

// 缓存管理器  
class CacheManager {  
  private static instance: CacheManager  
  private cache: Map<string, { data: any, timestamp: number }> = new Map()  
  private CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存  

  private constructor() {}  

  static getInstance(): CacheManager {  
    if (!CacheManager.instance) {  
      CacheManager.instance = new CacheManager()  
    }  
    return CacheManager.instance  
  }  

  set(key: string, data: any) {  
    this.cache.set(key, {  
      data,  
      timestamp: Date.now()  
    })  
  }  

  get(key: string) {  
    const cached = this.cache.get(key)  
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {  
      return cached.data  
    }  
    return null  
  }  

  clear(key: string) {  
    this.cache.delete(key)  
  }  
}  

export function useMiniNFT() {  
  const { address } = useAccount()  
  const publicClient = usePublicClient()  
  const { writeContractAsync, isPending: isWritePending, isError } = useWriteContract()  
  const cacheManager = CacheManager.getInstance()  

  // 通用请求重试装饰器  
  const withRetry = async <T>(  
    fn: () => Promise<T>,   
    maxRetries = 3  
  ): Promise<T> => {  
    let retries = 0  
    while (retries < maxRetries) {  
      try {  
        return await fn()  
      } catch (error) {  
        retries++  
        if (retries >= maxRetries) throw error  
        
        // 指数退避策略  
        await new Promise(resolve =>   
          setTimeout(resolve, 1000 * Math.pow(2, retries))  
        )  
      }  
    }  
    throw new Error('Max retries exceeded')  
  }  

  // 缓存读取合约数据的通用方法  
  const cachedContractRead = async <T>(  
    key: string,   
    fetchFn: () => Promise<T>  
  ): Promise<T> => {  
    // 优先读取缓存  
    const cachedData = cacheManager.get(key)  
    if (cachedData) return cachedData  

    // 调用合约方法并缓存  
    const result = await withRetry(fetchFn)  
    cacheManager.set(key, result)  
    return result  
  }  

  // 检查用户是否已经铸造过特定课程的 NFT  
  const hasClaimedNFT = async (courseId: bigint): Promise<boolean> => {  
    if (!address) throw new Error('Wallet not connected')  

    return cachedContractRead(`hasClaimedNFT-${address}-${courseId}`, async () => {  
      const claimed = await publicClient.readContract({  
        ...NFT_CONTRACT,  
        functionName: 'hasClaimedNFT',  
        args: [address, courseId]  
      }) as boolean  

      return claimed  
    })  
  }  

  // 获取合约暂停状态  
  const isPaused = async (): Promise<boolean> => {  
    return cachedContractRead('isPaused', async () => {  
      const paused = await publicClient.readContract({  
        ...NFT_CONTRACT,  
        functionName: 'paused',  
        args: []  
      }) as boolean  

      return paused  
    })  
  }  

  // 获取用户拥有的所有 NFT  
  const getUserNFTs = async (): Promise<{ tokenId: bigint; courseId: bigint; tokenURI: string }[]> => {  
    if (!address) throw new Error('Wallet not connected')  

    return cachedContractRead(`getUserNFTs-${address}`, async () => {  
      const tokens = await publicClient.readContract({  
        ...NFT_CONTRACT,  
        functionName: 'getTokensByOwner',  
        args: [address]  
      }) as bigint[]  

      const nftsInfo = await Promise.all(tokens.map(async (tokenId) => {  
        const tokenURI = await publicClient.readContract({  
          ...NFT_CONTRACT,  
          functionName: 'tokenURI',  
          args: [tokenId]  
        }) as string  

        const courseId = await publicClient.readContract({  
          ...NFT_CONTRACT,  
          functionName: 'tokenCourses',  
          args: [tokenId]  
        }) as bigint  

        return {  
          tokenId,  
          courseId,  
          tokenURI  
        }  
      }))  

      return nftsInfo  
    })  
  }  

  // 获取总供应量  
  const getTotalSupply = async (): Promise<bigint> => {  
    return cachedContractRead('getTotalSupply', async () => {  
      const total = await publicClient.readContract({  
        ...NFT_CONTRACT,  
        functionName: 'totalSupply',  
        args: []  
      }) as bigint  
      return total  
    })  
  }  

  // 获取课程 CID  
  const getCourseCID = async (courseId: bigint): Promise<string> => {  
    return cachedContractRead(`getCourseCID-${courseId}`, async () => {  
      const cid = await publicClient.readContract({  
        ...NFT_CONTRACT,  
        functionName: 'courseCIDs',  
        args: [courseId]  
      }) as string  
      return cid  
    })  
  }  

  // 获取课程 NFT 信息  
  const getCourseNFTInfo = async (courseId: bigint) => {  
    return cachedContractRead(`getCourseNFTInfo-${courseId}`, async () => {  
      const info = await publicClient.readContract({  
        ...NFT_CONTRACT,  
        functionName: 'getCourseNFTInfo',  
        args: [courseId]  
      }) as [string, bigint, boolean]  

      return {  
        cid: info[0],  
        totalMinted: info[1],  
        exists: info[2]  
      }  
    })  
  }  

  // 获取课程已铸造数量  
  const getCourseNFTCount = async (courseId: bigint): Promise<bigint> => {  
    return cachedContractRead(`getCourseNFTCount-${courseId}`, async () => {  
      const count = await publicClient.readContract({  
        ...NFT_CONTRACT,  
        functionName: 'courseNFTCount',  
        args: [courseId]  
      }) as bigint  
      return count  
    })  
  }  

  // 铸造 NFT 的方法  
  const mintNFT = async (courseId: bigint): Promise<Hash> => {  
    if (!address) throw new Error('Wallet not connected')  

    return writeContractAsync({  
      ...NFT_CONTRACT,  
      functionName: 'mintNFT',  
      args: [courseId]  
    })  
  }  

  return {  
    hasClaimedNFT,  
    isPaused,  
    getUserNFTs,  
    writeContractAsync,  
    mintNFT,  
    isPending: isWritePending,  
    isError,  
    getTotalSupply,  
    getCourseCID,  
    getCourseNFTInfo,  
    getCourseNFTCount  
  }  
}