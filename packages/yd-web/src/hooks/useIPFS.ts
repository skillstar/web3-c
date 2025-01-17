export function useIPFS() {  
  // Filebase 网关  
  const FILEBASE_GATEWAY = 'https://ipfs.filebase.io/ipfs/'  
  
  // 将 IPFS URI 转换为 Filebase HTTP URL  
  const ipfsToHttp = (ipfsUrl: string): string => {  
    if (!ipfsUrl) return ''  
    const cid = ipfsUrl.replace('ipfs://', '')  
    return `${FILEBASE_GATEWAY}${cid}`  
  }  

  // 获取 metadata  
  const getMetadata = async (tokenURI: string) => {  
    try {  
      const httpUrl = ipfsToHttp(tokenURI)  
      const response = await fetch(httpUrl)  
      if (!response.ok) throw new Error('Failed to fetch metadata')  
      const metadata = await response.json()  
      return metadata  
    } catch (error) {  
      console.error('Error fetching metadata:', error)  
      throw error  
    }  
  }  

  return {  
    ipfsToHttp,  
    getMetadata  
  }  
}