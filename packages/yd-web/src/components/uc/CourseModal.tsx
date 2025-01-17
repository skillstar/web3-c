"use client";  
import { useState, useRef, useEffect } from 'react';  
import { Play, Award, X } from 'lucide-react';   
import { useAccount, usePublicClient, useWriteContract, useTransaction } from 'wagmi';  
import { useMiniNFT } from '@/hooks/useMiniNFT';  
import { NFT_CONTRACT } from '@/app/abi/contractConfig';  
import {   
  parseAbiItem,   
  type Hash,   
   type TransactionReceipt,  
  type WaitForTransactionReceiptParameters,
  encodeEventTopics,
  decodeEventLog
} from 'viem';  
import VideoStats from './VideoStats';  
import { useAlert } from '@/contexts/AlertContext';  
import { Loader2 } from 'lucide-react';  

const NFTMintedEvent = parseAbiItem('event NFTMinted(address indexed user, uint256 indexed courseId, uint256 tokenId, string tokenURI)');  


interface CourseModalProps {  
  isOpen: boolean;  
  onClose: () => void;  
  courseId: string;  
  courseName: string;  
  videoUrl: string;  
}  

// 存储键管理  
const getStorageKeys = (courseId: string) => ({  
  progress: `course-${courseId}-progress`,  
  position: `course-${courseId}-position`,  
  watchTime: `course-${courseId}-watch-time`  
});  

// 视频进度接口  
interface VideoProgress {  
  currentTime: number;  
  duration: number;  
  percentage: number;  
}  

export default function CourseModal({  
  isOpen,  
  onClose,  
  courseId,  
  courseName,  
  videoUrl   
}: CourseModalProps) {  
  const [isMinting, setIsMinting] = useState(false);  
  const videoRef = useRef<HTMLVideoElement>(null);  
  const [isPlaying, setIsPlaying] = useState(false);  
  const [txHash, setTxHash] = useState<Hash | undefined>();  
  const [isLoading, setIsLoading] = useState(true);  
  const [error, setError] = useState<string | null>(null);  
  const [videoProgress, setVideoProgress] = useState<VideoProgress>({  
    currentTime: 0,  
    duration: 0,  
    percentage: 0  
  });  

  const storageKeys = getStorageKeys(courseId);  
  const lastPlayTimeRef = useRef<number>(0);  
  const watchTimeRef = useRef<number>(0);  

  const { showAlert } = useAlert();  

  const { address } = useAccount();  
  const publicClient = usePublicClient();  
  const { writeContractAsync, hasClaimedNFT, isPaused: getIsPaused } = useMiniNFT();  

  const [hasClaimed, setHasClaimed] = useState(false);  
  const [isPaused, setIsPaused] = useState(false);  

  const { isLoading: isWaiting, isSuccess: isConfirmed, error: txError } = useTransaction({  
    hash: txHash, 
     query: {  
         enabled: !!txHash && txHash.startsWith('0x')   
    },  
  });   

  const checkNFTStatus = async () => {  
    if (!address) return;  
    try {  
      const claimed = await hasClaimedNFT(BigInt(courseId));  
      setHasClaimed(claimed);  
      const paused = await getIsPaused();  
      setIsPaused(paused);  
    } catch (error) {  
      console.error('Error checking NFT status:', error);  
    }  
  };  

 const handleClaimNFT = async () => {  
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

  if (videoProgress.percentage < 100) {  
    showAlert('Please complete the video first', 'warning');  
    return;  
  }  

  setIsMinting(true);  
  try {  
    showAlert('Please confirm the transaction in your wallet...', 'info');  
    
    const hash = await writeContractAsync({  
      ...NFT_CONTRACT,  
      functionName: 'mintNFT',  
      args: [BigInt(courseId), BigInt(videoProgress.percentage + 1)],  
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
      const errorMessage = error.message.toLowerCase();  
      
      if (errorMessage.includes('value must be greater than 100')) {  
        showAlert('Video progress must be 100% to claim NFT', 'error');  
      } else if (errorMessage.includes('user rejected')) {  
        showAlert('Transaction was rejected', 'error');  
      } else if (errorMessage.includes('insufficient funds')) {  
        showAlert('Insufficient funds for transaction', 'error');  
      } else {  
        showAlert(error.message, 'error');  
      }  
    } else {  
      showAlert('Failed to mint NFT', 'error');  
    }  
  }  
};

  const saveToStorage = (key: string, value: number) => {  
    try {  
      localStorage.setItem(key, value.toString());  
    } catch (error) {  
      console.error('Failed to save to storage:', error);  
    }  
  };  

  const getFromStorage = (key: string): number => {  
    try {  
      const value = localStorage.getItem(key);  
      return value ? parseFloat(value) : 0;  
    } catch (error) {  
      console.error('Failed to get from storage:', error);  
      return 0;  
    }  
  };  

  const updateProgress = () => {  
    if (videoRef.current) {  
      const duration = videoRef.current.duration;  
      const watchedTime = watchTimeRef.current;  
      const currentProgress = getFromStorage(storageKeys.progress);  
      if (currentProgress === 100) {  
        setVideoProgress(prev => ({ ...prev, percentage: 100 }));  
        return;  
      }  
      const newProgress = Math.min(Math.round((watchedTime / duration) * 100), 100);  
      if (newProgress > videoProgress.percentage) {  
        setVideoProgress(prev => ({ ...prev, percentage: newProgress }));  
        saveToStorage(storageKeys.progress, newProgress);  
      }  
    }  
  };  

  const handleTimeUpdate = () => {  
    if (videoRef.current && isPlaying) {  
      const currentTime = videoRef.current.currentTime;  
      const duration = videoRef.current.duration;  
      const percentage = Math.min((currentTime / duration) * 100, 100);  

      setVideoProgress({  
        currentTime,  
        duration,  
        percentage  
      });  

      if (videoProgress.percentage < 100) {  
        const timeDiff = currentTime - lastPlayTimeRef.current;  
        if (timeDiff > 0) {  
          watchTimeRef.current += timeDiff;  
        }  
      }  
      lastPlayTimeRef.current = currentTime;  
      updateProgress();  
      saveToStorage(storageKeys.position, currentTime);  
    }  
  };  

  const handlePlay = async () => {  
    try {  
      if (videoRef.current) {  
        await videoRef.current.play();  
        if (videoRef.current.currentTime === 0) {  
          lastPlayTimeRef.current = 0;  
          if (videoProgress.percentage < 100) {  
            watchTimeRef.current = 0;  
          }  
        } else {  
          lastPlayTimeRef.current = videoRef.current.currentTime;  
        }  
        setIsPlaying(true);  
      }  
    } catch (err) {  
      console.error('Failed to play:', err);  
      setError('Failed to play video');  
    }  
  };   

  const handlePause = () => {  
    setIsPlaying(false);  
    updateProgress();  
    if (videoRef.current) {  
      saveToStorage(storageKeys.position, videoRef.current.currentTime);  
    }  
  };  

  const handleVideoEnd = () => {  
    setIsPlaying(false);  
    if (videoRef.current) {  
      videoRef.current.currentTime = 0;  
      saveToStorage(storageKeys.position, 0);  
      lastPlayTimeRef.current = 0;  
    }  
    setVideoProgress(prev => ({ ...prev, percentage: 100 }));  
    saveToStorage(storageKeys.progress, 100);  
  };   

  const handleError = () => {  
    setError('Failed to load video');  
    setIsLoading(false);  
    setIsPlaying(false);  
  };  

  useEffect(() => {  
    if (isOpen && address) {  
      checkNFTStatus();  
    }   
    
    if (isOpen && courseId) {  
      const keys = getStorageKeys(courseId);  
      const savedProgress = localStorage.getItem(keys.progress);  
      if (savedProgress) {  
        const progress = parseInt(savedProgress, 10);  
        setVideoProgress(prev => ({  
          ...prev,  
          percentage: progress  
        }));  
      }  

      if (videoRef.current) {  
        const savedPosition = localStorage.getItem(keys.position);  
        if (savedPosition) {  
          const position = parseFloat(savedPosition);  
          videoRef.current.currentTime = position;  
          lastPlayTimeRef.current = position;  
        }  

        const savedWatchTime = localStorage.getItem(keys.watchTime);  
        if (savedWatchTime) {  
          watchTimeRef.current = parseFloat(savedWatchTime);  
        }  
      }  
    }  
  }, [isOpen, address, courseId]);  

  useEffect(() => {  
    if (isOpen && address) {  
      checkNFTStatus();  
    }  
    const saveInterval = setInterval(() => {  
      if (watchTimeRef.current > 0) {  
        saveToStorage(storageKeys.watchTime, watchTimeRef.current);  
      }  
    }, 5000);  

    return () => {  
      clearInterval(saveInterval);  
      if (watchTimeRef.current > 0) {  
        saveToStorage(storageKeys.watchTime, watchTimeRef.current);  
      }  
    };  
  }, [isOpen, address, courseId]);  

  useEffect(() => {  
    return () => {  
      if (videoRef.current) {  
        const keys = getStorageKeys(courseId);  
        saveToStorage(keys.position, videoRef.current.currentTime);  
        saveToStorage(keys.watchTime, watchTimeRef.current);  
        updateProgress();  
      }  
    };  
  }, [courseId]);  

  // 监听交易确认  
useEffect(() => {  
  let isMounted = true;  
  
  const checkMintedEvent = async () => {  
    if (!isMounted) return;  

    const safeHash = txHash && /^0x[0-9a-fA-F]{64}$/.test(txHash)   
      ? txHash as `0x${string}`   
      : null;  

    if (!safeHash) {  
      console.warn('Invalid or missing transaction hash');  
      setIsMinting(false);  
      return;  
    }  

    try {  
      const receipt = await publicClient.waitForTransactionReceipt({  
        hash: safeHash,  
        timeout: 2 * 60 * 1000, // 2分钟超时  
      });  

      console.log('Transaction Receipt:', {  
        status: receipt.status,  
        blockNumber: receipt.blockNumber,  
        transactionHash: receipt.transactionHash  
      });  

      // 检查交易状态  
      if (receipt.status === 'success') {  
        // 使用 encodeEventTopics 获取 topic  
        const [eventTopic] = encodeEventTopics({  
          abi: [NFTMintedEvent],  
          eventName: 'NFTMinted'  
        });  

        // 详细记录所有日志  
        console.log('All Logs:', receipt.logs.map(log => ({  
          address: log.address,  
          topics: log.topics,  
          data: log.data  
        })));  

        // 解码并过滤事件  
        const events = receipt.logs.filter(log => {  
          try {  
            // 尝试解码日志  
            const decodedLog = decodeEventLog({  
              abi: [NFTMintedEvent],  
              data: log.data,  
              topics: log.topics  
            });  

            console.log('Decoded Event Log:', {  
              eventName: decodedLog.eventName,  
              args: decodedLog.args  
            });  

            // 检查事件签名 topic  
            const matchesTopic = log.topics[0] === eventTopic;  

            console.log('Event Matching:', {  
              topicMatch: matchesTopic  
            });  

            return matchesTopic;  
          } catch (decodeError) {  
            console.error('Error decoding event log:', decodeError);  
            return false;  
          }  
        });  
        
        if (events.length > 0) {  
          console.log('Matching Events Found:', events);  
          
          if (isMounted) {  
            setIsMinting(false);   
            setHasClaimed(true);  
            showAlert('Successfully claimed your NFT!', 'success');  
          }  
          
          // 额外检查 NFT 状态  
          try {  
            const claimed = await hasClaimedNFT(BigInt(courseId));  
            if (isMounted) {  
              setHasClaimed(claimed);  
            }  
          } catch (checkError) {  
            console.error('Error checking NFT claim status:', checkError);  
            if (isMounted) {  
              showAlert('Unable to verify NFT claim status', 'warning');  
            }  
          }  
          
          return;  
        } else {  
          console.warn('No matching NFT minted event found');  
          if (isMounted) {  
            showAlert('No NFT minted event found', 'warning');  
          }  
        }  
      } else {  
        console.error('Transaction failed:', receipt);  
        if (isMounted) {  
          showAlert('Transaction failed', 'error');  
        }  
      }  
    } catch (error) {  
      console.error('Detailed Error:', error);  
      
      if (error instanceof Error) {  
        const errorMessage = error.message.toLowerCase();  
        
        if (isMounted) {  
          if (errorMessage.includes('timeout')) {  
            showAlert('Transaction confirmation timed out', 'warning');  
          } else if (errorMessage.includes('receipt not found')) {  
            showAlert('Transaction receipt could not be found', 'warning');  
          } else {  
            showAlert('Error verifying NFT minting', 'error');  
          }  
        }  
      } else {  
        if (isMounted) {  
          showAlert('Unexpected error occurred', 'error');  
        }  
      }  
    } finally {  
      if (isMounted) {  
        setIsMinting(false);  
        setTxHash(undefined);  
      }  
    }  
  };  

  // 仅在满足条件时执行  
  if (isConfirmed && txHash) {   
    checkMintedEvent();  
  }  

  // 清理函数  
  return () => {  
    isMounted = false;  
  };  
}, [isConfirmed, txHash, publicClient, showAlert, address, courseId, hasClaimedNFT]);  

useEffect(() => {  
  console.log('txHash changed:', txHash);  
  console.log('txError changed:', txError);  
}, [txHash, txError]);  

  // 监听交易错误  
  useEffect(() => {  
  if (txError) {  
    setIsMinting(false);  
    console.error('Transaction failed:', txError);  
    
    // 更详细的错误处理  
    const errorMessage = txError.message.toLowerCase();  
    
    if (errorMessage.includes('insufficient funds')) {  
      showAlert('Insufficient funds for transaction', 'error');  
    } else if (errorMessage.includes('user rejected')) {  
      showAlert('Transaction was rejected', 'error');  
    } else {  
      showAlert('Transaction failed. Please try again.', 'error');  
    }  
    
    setTxHash(undefined); // reset  
  }  
}, [txError]);   

  const handleClose = () => {  
    if (videoRef.current) {  
      saveToStorage(storageKeys.position, videoRef.current.currentTime);  
      updateProgress();  
      videoRef.current.pause();  
      setIsPlaying(false);  
    }  
    onClose();  
  };  

  if (!isOpen) return null;  

  return (  
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">  
      <button  
        onClick={handleClose}  
        className="absolute top-6 right-6 btn btn-circle bg-dark-lighter border-none hover:bg-dark"  
      >  
        <X size={24} className="text-white" />  
      </button>  

      <div className="bg-dark-light w-full max-w-3xl rounded-lg shadow-xl">  
        <div className="p-4 border-b border-dark-lighter flex items-center justify-between">  
          <div className="space-y-1 flex-1">  
            <h3 className="text-lg font-semibold text-white">  
              {courseName}  
            </h3>  
            <div className="flex items-center gap-2 text-sm">  
              <div className="w-24 h-1.5 bg-dark-lighter rounded-full overflow-hidden">  
                <div  
                  className="h-full bg-accent-purple transition-all duration-300"  
                  style={{ width: `${videoProgress.percentage}%` }}  
                />  
              </div>  
              <span className="text-white/70">  
                {Math.round(videoProgress.percentage)}% Complete  
              </span>  
            </div>  
          </div>  
          <button  
            className={`btn btn-sm ${  
              isMinting  
                ? 'bg-gray-400'  
                : hasClaimed  
                ? 'bg-green-500'  
                : videoProgress.percentage >= 100  
                ? 'bg-accent-purple hover:bg-accent-purple/90'  
                : 'bg-dark-lighter'  
            } gap-2 border-none ml-4`}  
            disabled={  
              isMinting ||  
              hasClaimed ||  
              isPaused ||  
              !address ||  
              videoProgress.percentage < 100  
            }  
            onClick={handleClaimNFT}  
          >  
            {isMinting ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}  
            {isMinting  
              ? 'Processing...'  
              : hasClaimed  
              ? 'NFT Claimed'  
              : videoProgress.percentage >= 100  
              ? 'Claim NFT'  
              : 'Complete 100%'}  
          </button>   
        </div>  
        <div className="relative aspect-video bg-dark">  
          <video  
            ref={videoRef}  
            className="w-full h-full"  
            controls={isPlaying}  
            src={videoUrl}  
            preload="metadata"  
            onTimeUpdate={handleTimeUpdate}  
            onEnded={handleVideoEnd}  
            onPlay={handlePlay}  
            onPause={handlePause}  
            onLoadedData={() => setIsLoading(false)}  
            onError={handleError}  
            style={{ display: isPlaying ? 'block' : 'none' }}  
          />  

          {!isPlaying && !error && (  
            <div className="absolute inset-0 flex items-center justify-center">  
              <button  
                onClick={handlePlay}  
                className="btn btn-circle btn-lg bg-accent-purple hover:bg-accent-purple/90 border-none"  
              >  
                <Play size={32} className="text-white" />  
              </button>  
            </div>  
          )}  

          {isLoading && isPlaying && (  
            <div className="absolute inset-0 flex items-center justify-center bg-dark/50">  
              <div className="loading loading-spinner loading-lg text-accent-purple"></div>  
            </div>  
          )}  

          {error && (  
            <div className="absolute inset-0 flex items-center justify-center bg-dark">  
              <div className="text-center">  
                <p className="text-error mb-2">{error}</p>  
                <button  
                  className="btn btn-sm bg-accent-purple hover:bg-accent-purple/90 border-none"  
                  onClick={() => {  
                    setError(null);  
                    setIsLoading(true);  
                    if (videoRef.current) {  
                      videoRef.current.load();  
                    }  
                  }}  
                >  
                  Retry  
                </button>  
              </div>  
            </div>  
          )}  
        </div>  

        <VideoStats videoProgress={videoProgress} />  
      </div>  
    </div>  
  );  
}