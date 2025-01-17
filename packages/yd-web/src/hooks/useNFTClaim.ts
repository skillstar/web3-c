// hooks/useNFTClaim.ts  
import { useState, useEffect, useCallback } from 'react';  
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';  
import { Hash, parseAbiItem, encodeEventTopics } from 'viem';  
import { useAlert } from '@/contexts/AlertContext';  
import { NFT_CONTRACT } from '@/app/abi/contractConfig';  

// NFT 铸造事件定义  
const NFTMintedEvent = parseAbiItem('event NFTMinted(address indexed user, uint256 indexed courseId, uint256 tokenId, string tokenURI)');  

export function useNFTClaim(courseId: string, videoProgress: number) {  
  const [isMinting, setIsMinting] = useState(false);  
  const [hasClaimed, setHasClaimed] = useState(false);  
  const [isPaused, setIsPaused] = useState(false);  
  const [txHash, setTxHash] = useState<Hash | undefined>();  

  const { address } = useAccount();  
  const publicClient = usePublicClient();  
  const { showAlert } = useAlert();  
  const { writeContractAsync } = useWriteContract();  

  // 检查 NFT 状态的内部方法  
  const checkNFTStatus = useCallback(async () => {  
    if (!address) return;  

    try {  
      // 直接使用合约读取方法  
      const claimed = await publicClient.readContract({  
        ...NFT_CONTRACT,  
        functionName: 'hasClaimedNFT',  
        args: [address, BigInt(courseId)]  
      }) as boolean;  

      const paused = await publicClient.readContract({  
        ...NFT_CONTRACT,  
        functionName: 'paused',  
        args: []  
      }) as boolean;  

      setHasClaimed(claimed);  
      setIsPaused(paused);  
    } catch (error) {  
      console.error('Error checking NFT status:', error);  
      showAlert('Failed to check NFT status', 'error');  
    }  
  }, [address, courseId, publicClient, showAlert]);  

  // NFT 铸造处理  
  const handleClaimNFT = useCallback(async () => {  
    if (!address) {  
      showAlert('Please connect your wallet first', 'warning');  
      return;  
    }  

    if (hasClaimed) {  
      showAlert('You have already claimed this NFT', 'warning');  
      return;  
    }  

    if (isPaused) {  
      showAlert('NFT minting is currently paused', 'warning');  
      return;  
    }  

    if (videoProgress < 100) {  
      showAlert('Please complete the video first', 'warning');  
      return;  
    }  

    setIsMinting(true);  
    try {  
      showAlert('Please confirm the transaction in your wallet...', 'info');  
      
      const hash = await writeContractAsync({  
        ...NFT_CONTRACT,  
        functionName: 'mintNFT',  
        args: [BigInt(courseId), BigInt(videoProgress + 1)],  
      });  

      if (hash) {  
        setTxHash(hash);  
        
        // 添加超时处理  
        const timeoutId = setTimeout(() => {  
          setIsMinting(false);  
          showAlert('Transaction taking longer than expected. Please check your wallet.', 'warning');  
        }, 60000); // 1分钟超时  

        // 清理超时  
        return () => clearTimeout(timeoutId);  
      }  
    } catch (error) {  
      setIsMinting(false);  
      console.error('Mint error:', error);  
      
      if (error instanceof Error) {  
        if (error.message.includes('Value must be greater than 100')) {  
          showAlert('Video progress must be 100% to claim NFT', 'error');  
        } else if (error.message.includes('user rejected')) {  
          showAlert('Transaction was rejected', 'error');  
        } else {  
          showAlert(error.message, 'error');  
        }  
      } else {  
        showAlert('Failed to mint NFT', 'error');  
      }  
    }  
  }, [  
    address,   
    hasClaimed,   
    isPaused,   
    videoProgress,   
    writeContractAsync,   
    showAlert,  
    courseId  
  ]);  

  // 监听交易确认  
  useEffect(() => {  
    const checkMintedEvent = async () => {  
      if (!txHash) return;  

      try {  
        const [eventTopic] = encodeEventTopics({  
          abi: [NFTMintedEvent],  
          eventName: 'NFTMinted'  
        });  

        const receipt = await publicClient.getTransactionReceipt({  
          hash: txHash  
        });  

        const events = receipt.logs.filter(log =>  
          log.topics[0] === eventTopic &&  
          log.topics[1] === address &&   
          log.topics[2] === `0x${BigInt(courseId).toString(16).padStart(64, '0')}`  
        );  
        
        if (events.length > 0) {  
          setIsMinting(false);  
          setHasClaimed(true);  
          showAlert('Successfully claimed your NFT!', 'success');  
        }  
      } catch (error) {  
        console.error('Error checking minted event:', error);  
        showAlert('Error verifying NFT minting', 'error');  
      }  
    };  

    if (txHash) {  
      checkMintedEvent();  
    }  
  }, [txHash, publicClient, showAlert, address, courseId]);  

  // 初始化和定期检查 NFT 状态  
  useEffect(() => {  
    checkNFTStatus();  
  }, [checkNFTStatus]);  

  return {  
    isMinting,  
    hasClaimed,  
    isPaused,  
    handleClaimNFT,  
    checkNFTStatus  
  };  
}