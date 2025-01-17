import { atom } from 'jotai'  
import { atomWithStorage } from 'jotai/utils'  

// 自定义 BigInt 序列化和反序列化  
const bigIntReplacer = (key: string, value: any) => {  
  if (typeof value === 'bigint') {  
    return value.toString();  
  }  
  return value;  
};  

const bigIntReviver = (key: string, value: any) => {  
  if (typeof value === 'string') {  
    // 检查是否为 BigInt 字符串  
    if (/^\d+n?$/.test(value)) {  
      return BigInt(value);  
    }  
  }  
  return value;  
};  

// NFT 计数的 atom  
export const userNFTCountAtom = atomWithStorage('userNFTCount', 0, {  
  // 自定义存储方法  
  setItem: (key, value) => {  
    try {  
      localStorage.setItem(key, value.toString());  
    } catch (error) {  
      console.error('Error saving NFT count:', error);  
    }  
  },  
  getItem: (key) => {  
    try {  
      const value = localStorage.getItem(key);  
      return value ? parseInt(value, 10) : 0;  
    } catch (error) {  
      console.error('Error loading NFT count:', error);  
      return 0;  
    }  
  },  
  removeItem: (key) => {  
    try {  
      localStorage.removeItem(key);  
    } catch (error) {  
      console.error('Error removing NFT count:', error);  
    }  
  }  
});  

// NFT 列表的 atom  
export const userNFTsAtom = atomWithStorage<Array<{  
  tokenId: bigint;  
  courseId: bigint;  
  tokenURI: string;  
}>>('userNFTs', [], {  
  // 自定义存储方法处理 BigInt  
  setItem: (key, value) => {  
    try {  
      localStorage.setItem(key, JSON.stringify(value, bigIntReplacer));  
    } catch (error) {  
      console.error('Error saving NFTs:', error);  
    }  
  },  
  getItem: (key) => {  
    try {  
      const value = localStorage.getItem(key);  
      if (!value) return [];  
      
      return JSON.parse(value, bigIntReviver);  
    } catch (error) {  
      console.error('Error loading NFTs:', error);  
      return [];  
    }  
  },  
  removeItem: (key) => {  
    try {  
      localStorage.removeItem(key);  
    } catch (error) {  
      console.error('Error removing NFTs:', error);  
    }  
  }  
});  

// 加载状态的 atom  
export const isLoadingNFTsAtom = atom(false)  

// 创建一个派生的 atom 用于格式化显示  
export const formattedNFTCountAtom = atom(  
  (get) => {  
    const count = get(userNFTCountAtom)  
    return `${count} NFT${count !== 1 ? 's' : ''}`  
  }  
)