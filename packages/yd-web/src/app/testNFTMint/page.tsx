// app/test/nft/page.tsx  
'use client'  

import { useState, useEffect } from 'react'  
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'  
import { useMiniNFT } from '@/hooks/useMiniNFT'  
import { NFT_CONTRACT } from '@/app/abi/contractConfig'  
import { parseAbiItem, decodeEventLog } from 'viem'  
import { NFTCard } from '@/components/NFTCard'  
import { useNFTData } from '@/hooks/useNFTData'  
const NFTMintedEvent = parseAbiItem('event NFTMinted(address indexed user, uint256 indexed courseId, uint256 tokenId, string tokenURI)')  
const CourseCIDSetEvent = parseAbiItem('event CourseCIDSet(uint256 indexed courseId, string cid)')  

interface NFTInfo {  
  tokenId: bigint  
  courseId: bigint  
  tokenURI: string  
}  

export default function TestNFT() {  
  const { address } = useAccount()  
  const publicClient = usePublicClient()  
  const { data: walletClient } = useWalletClient()  
   const {   
    writeContractAsync,   
    isPending,   
    getUserNFTs,   
    hasClaimedNFT,   
    isPaused: getIsPaused,  
    getTotalSupply,  
    getCourseCID,  
    getCourseNFTInfo,  
    getCourseNFTCount
  } = useMiniNFT()  

  const [isOwner, setIsOwner] = useState(false)  
  const [isPaused, setIsPaused] = useState(false)  
  const [logs, setLogs] = useState<string[]>([])  
  const [isConfirming, setIsConfirming] = useState(false)  
  const [userNFTs, setUserNFTs] = useState<NFTInfo[]>([])  
  const [newCID, setNewCID] = useState('')  
  const [selectedCourseId, setSelectedCourseId] = useState('1')  
  const [hasClaimed, setHasClaimed] = useState(false)  

  const testCourseId = BigInt(selectedCourseId)  

   // 添加新的状态  
  const [totalSupply, setTotalSupply] = useState<bigint>(BigInt(0))  
  const [courseInfo, setCourseInfo] = useState<{  
    cid: string;  
    totalMinted: bigint;  
    exists: boolean;  
  }>({  
    cid: '',  
    totalMinted: BigInt(0),  
    exists: false  
  })  
  // 加载用户的 NFT  
    const loadUserNFTs = async () => {  
    if (!address) return  

    try {  
      const nfts = await getUserNFTs()  
      setUserNFTs(nfts)  
      addLog(`Loaded ${nfts.length} NFTs`, 'success')  
    } catch (error: any) {  
      addLog(`Failed to load NFTs: ${error.message}`, 'error')  
    }  
  }  

  // 检查是否已经领取过NFT  
   const checkHasClaimed = async () => {  
    if (!address) return  

    try {  
      const claimed = await hasClaimedNFT(testCourseId)  
      setHasClaimed(claimed)  
    } catch (error: any) {  
      console.error('Error checking claim status:', error)  
    }  
  } 

  // 检查合约状态  
  const checkContractState = async () => {  
    try {  
      const paused = await getIsPaused()  
      setIsPaused(paused)  
    } catch (error) {  
      console.error('Error checking pause status:', error)  
    }  
  } 

  // 设置课程 CID  
  const handleSetCourseCID = async () => {  
    if (!address || !isOwner) {  
      addLog('Not authorized', 'error')  
      return  
    }  

    try {  
      addLog('Setting course CID...')  
      await writeContractAsync({  
        ...NFT_CONTRACT,  
        functionName: 'setCourseCID',  
        args: [testCourseId, newCID]  
      })  

      addLog('Transaction sent', 'success')  
      setIsConfirming(true)  

      const unwatch = publicClient.watchContractEvent({  
        address: NFT_CONTRACT.address,  
        abi: [CourseCIDSetEvent],  
        eventName: 'CourseCIDSet',  
        onLogs: (logs) => {  
          const event = logs[0]  
          if (event) {  
            addLog(`Course CID set successfully!`, 'success')  
          }  
          setIsConfirming(false)  
          unwatch()  
          setNewCID('')  
        }  
      })  
    } catch (error: any) {  
      handleError(error)  
      setIsConfirming(false)  
    }  
  }  

  // 铸造NFT  
  const handleMintNFT = async () => {  
    if (!address) {  
      addLog('Please connect wallet first', 'error')  
      return  
    }  

    if (hasClaimed) {  
      addLog('Already claimed NFT for this course', 'error')  
      return  
    }  

    if (isPaused) {  
      addLog('Contract is paused', 'error')  
      return  
    }  

    try {  
      addLog('Minting NFT...')  
      await writeContractAsync({  
        ...NFT_CONTRACT,  
        functionName: 'mintNFT',  
        args: [testCourseId, BigInt(101)] // value > 100  
      })  

      addLog('Transaction sent', 'success')  
      setIsConfirming(true)  

      const unwatch = publicClient.watchContractEvent({  
        address: NFT_CONTRACT.address,  
        abi: [NFTMintedEvent],  
        eventName: 'NFTMinted',  
        onLogs: (logs) => {  
          const event = logs[0]  
          if (event) {  
            const decodedEvent = decodeEventLog({  
              abi: [NFTMintedEvent],  
              data: event.data,  
              topics: event.topics,  
            })  
            addLog(`NFT minted successfully! Token ID: ${decodedEvent.args.tokenId}`, 'success')  
          }  
          setIsConfirming(false)  
          unwatch()  
          loadUserNFTs()  
          checkHasClaimed()  
        }  
      })  
    } catch (error: any) {  
      handleError(error)  
      setIsConfirming(false)  
    }  
  }  

  // 错误处理  
  const handleError = (error: any) => {  
    let message = error.message || 'Unknown error occurred'  
    
    if (message.includes('Already claimed NFT')) {  
      message = 'Already claimed NFT for this course'  
    } else if (error.code === 'ACTION_REJECTED') {  
      message = 'Transaction rejected by user'  
    } else if (message.includes('insufficient funds')) {  
      message = 'Insufficient funds for transaction'  
    }  

    addLog(`Error: ${message}`, 'error')  
  }  

  // 添加日志  
  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {  
    const timestamp = new Date().toLocaleTimeString()  
    setLogs(prev => [`[${timestamp}] [${type}] ${message}`, ...prev])  
  }  

  // 加载课程信息  
   const loadCourseInfo = async () => {  
    if (!address) return  

    try {  
      const info = await getCourseNFTInfo(testCourseId)  
      setCourseInfo(info)  
      addLog(`Loaded course info for ID ${testCourseId}`, 'success')  
    } catch (error: any) {  
      console.error('Error loading course info:', error)  
      addLog(`Failed to load course info: ${error.message}`, 'error')  
    }  
  }  

  // 加载总供应量  
  const loadTotalSupply = async () => {  
    try {  
      const total = await getTotalSupply()  
      setTotalSupply(total)  
    } catch (error: any) {  
      console.error('Error loading total supply:', error)  
    }  
  }  

  // 初始化  
   useEffect(() => {  
    if (address) {  
      loadUserNFTs()  
      checkHasClaimed()  
      checkContractState()  
      loadCourseInfo()  
      loadTotalSupply()  
    }  
  }, [address, selectedCourseId]) 

  // 检查是否是合约所有者  
  useEffect(() => {  
    const checkOwner = async () => {  
      if (!address) {  
        setIsOwner(false)  
        return  
      }  

      try {  
        const owner = await publicClient.readContract({  
          ...NFT_CONTRACT,  
          functionName: 'owner',  
          args: []  
        }) as string  

        setIsOwner(owner.toLowerCase() === address.toLowerCase())  
      } catch (error) {  
        console.error('Error checking owner:', error)  
        setIsOwner(false)  
      }  
    }  

    checkOwner()  
  }, [address, publicClient])  

  return (  
    <div className="p-4 max-w-4xl mx-auto">  
      <h1 className="text-2xl font-bold mb-4">NFT Test Page</h1>  

      {/* Contract Status */}  
      <div className="mb-4 p-4 bg-gray-100 rounded">  
        <h2 className="font-bold mb-2">Contract Status</h2>  
        <p className={`font-semibold ${isPaused ? 'text-red-500' : 'text-green-500'}`}>  
          {isPaused ? 'PAUSED' : 'ACTIVE'}  
        </p>  
      </div>  

      {/* Course Info */}  
          <div className="mb-4 p-4 bg-gray-100 rounded">  
        <h2 className="font-bold mb-2">Course Info</h2>  
        <div className="space-y-2">  
          <p>Course ID: {testCourseId.toString()}</p>  
          <p>Status: {courseInfo.exists ? 'Active' : 'Not Set'}</p>  
          <p>CID: {courseInfo.cid || 'Not set'}</p>  
          <p>Total Minted: {courseInfo.totalMinted.toString()} NFTs</p>  
          <p className="text-sm text-gray-500">  
            Note: Mint requires value &gt; 100  
          </p>  
        </div>  
      </div>  

      {/* Course Selection */}  
      <div className="mb-4 p-4 bg-gray-100 rounded">  
        <h2 className="font-bold mb-2">Course Selection</h2>  
        <select  
          className="w-full p-2 border rounded"  
          value={selectedCourseId}  
          onChange={(e) => setSelectedCourseId(e.target.value)}  
        >  
          {[1,2,3,4,5,6].map(id => (  
            <option key={id} value={id}>Course {id}</option>  
          ))}  
        </select>  
      </div>  

      {/* CID Setting Section */}  
      <div className="mb-4 p-4 bg-gray-100 rounded">  
        <h2 className="font-bold mb-2">Set Course CID {!isOwner && <span className="text-red-500 text-sm">(Owner Only)</span>}</h2>  
        <div className="flex gap-2">  
          <input  
            type="text"  
            className="flex-1 p-2 border rounded"  
            value={newCID}  
            onChange={(e) => setNewCID(e.target.value)}  
            placeholder="Enter IPFS CID"  
            disabled={!isOwner}  
          />  
          <button  
            className={`px-4 py-2 rounded ${  
              isPending || isConfirming || !address || !newCID || !isOwner  
                ? 'bg-gray-400'  
                : 'bg-purple-500 hover:bg-purple-600'  
            } text-white`}  
            onClick={handleSetCourseCID}  
            disabled={isPending || isConfirming || !address || !newCID || !isOwner}  
          >  
            {!isOwner ? 'Not Owner' : isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Set CID'}  
          </button>  
        </div>  
      </div>  

      {/* NFT Minting Section */}  
      <div className="mb-4 p-4 bg-gray-100 rounded">  
        <h2 className="font-bold mb-2">Mint NFT</h2>  
        <button  
          className={`px-4 py-2 rounded ${  
            isPending || isConfirming || !address || hasClaimed || isPaused  
              ? 'bg-gray-400'  
              : 'bg-green-500 hover:bg-green-600'  
          } text-white`}  
          onClick={handleMintNFT}  
          disabled={isPending || isConfirming || !address || hasClaimed || isPaused}  
        >  
          {isPending ? 'Sending...' :   
           isConfirming ? 'Confirming...' :   
           hasClaimed ? 'Already Claimed' :  
           isPaused ? 'Contract Paused' :  
           'Mint NFT'}  
        </button>  
      </div>  

      {/* User's NFTs */}  
      <div className="mb-4 p-4 bg-gray-100 rounded">  
        <h2 className="font-bold mb-2">Your NFTs</h2>  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  
          {userNFTs.length === 0 ? (  
            <p className="text-gray-500">No NFTs owned</p>  
          ) : (  
            userNFTs.map((nft) => (  
              <NFTCard  
                key={nft.tokenId.toString()}  
                tokenId={nft.tokenId}  
                courseId={nft.courseId}  
                tokenURI={nft.tokenURI}  
              />  
            ))  
          )}  
        </div>  
      </div> 

      {/* Transaction Logs */}  
      <div className="mt-4">  
        <h2 className="font-bold mb-2">Transaction Logs</h2>  
        <div className="bg-black text-white p-4 rounded h-96 overflow-y-auto font-mono text-sm">  
          {logs.map((log, index) => (  
            <div  
              key={index}  
              className={`mb-1 ${  
                log.includes('[success]') ? 'text-green-400' :  
                log.includes('[error]') ? 'text-red-400' :  
                'text-gray-300'  
              }`}  
            >  
              {log}  
            </div>  
          ))}  
        </div>  
      </div> 
      {/* Contract Info */}  
      <div className="mb-4 p-4 bg-gray-100 rounded">  
        <h2 className="font-bold mb-2">Contract Info</h2>  
        <div className="space-y-2">  
          <p>Total Supply: {totalSupply.toString()} NFTs</p>  
        </div>  
      </div>  

    </div>  
  )  
}