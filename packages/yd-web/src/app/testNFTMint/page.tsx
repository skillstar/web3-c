'use client'  
// pages/TestNFTMint.tsx  
import { useState, useEffect } from 'react';  
import {  
  useAccount,  
  useReadContract,  
  useWriteContract,  
  useWaitForTransactionReceipt,  
  usePublicClient  
} from 'wagmi';  
import { type Hash } from 'viem';  
import {   
  NFT_CONTRACT,   
  CP_CONTRACT,  
  CPA_CONTRACT   
} from '@/app/abi/contractConfig';  
import { useAlert } from '@/contexts/AlertContext';  

interface CourseMetadata {  
  courseId: number;  
  cid: string | null;  
  tokenURI: string;  
}  
// 类型保护函数  
function isValidCID(cid: unknown): cid is string {  
  return typeof cid === 'string' && cid.length > 0;  
}  
// 预设的课程CID映射  
const COURSE_CIDS: Record<number, string> = {  
  1: "QmZAsozAu5qjbeS9G1MiGu7Bhs1Z3DwiMzKnoapRzVZwqY", // 替换为实际的CID  
  2: "QmX2UDSJhH9QCFTBN8o1yno3UytkJB536p6kxwf8fQ4yad",  
  3: "QmXnpiiB9KeT6oHKSdw2FGEmeNzYdADvfaf5UW7XmZL8fA",  
  4: "QmeBTG5xZgsS13Dr7Perk6zXaeZNxc5zJaayJLXF2LcMvT",  
  5: "QmfWGqBNvxY2iVBwJHPop3FdJTokeJEFyY9iBQ3DqnU5Y1",
  6: "QmekQVbRhacBnsnC3UbU7reejZrNwvK6VYK8GE167AiTmL"  
};  

export default function TestNFTMint() {  
  const { address } = useAccount();  
  const publicClient = usePublicClient();  
  const [logs, setLogs] = useState<string[]>([]);  
  const [progress, setProgress] = useState<number>(0);  
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);  
  const [customCID, setCustomCID] = useState<string>("");  
  const { showAlert } = useAlert();  

 
  // 获取 writeContract  
  const {  
    writeContract,  
    data: hash,  
    isPending,  
    status  
  } = useWriteContract();  

  // 等待交易确认  
   const {   
    isLoading: isConfirming,   
    isSuccess: isConfirmed,  
    isError: isError  
  } = useWaitForTransactionReceipt({  
    hash: hash as Hash | undefined,  
  }); 
 
  // 添加日志  
  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {  
    const timestamp = new Date().toLocaleTimeString();  
    setLogs(prev => [`[${timestamp}] [${type}] ${message}`, ...prev]);  
  };  

  // 读取课程CID  
 const { data: rawCourseCID, refetch: refetchCID } = useReadContract({  
    address: CP_CONTRACT.address,  
    abi: CP_CONTRACT.abi,  
    functionName: 'getCourseCID',  
    args: [BigInt(selectedCourseId)],  
    query: {  
      enabled: !!selectedCourseId, 
    },  
  }); 

  // 读取课程进度  
  const { data: currentProgress = 0, refetch: refetchProgress } = useReadContract({  
    address: CPA_CONTRACT.address,  
    abi: CPA_CONTRACT.abi,  
    functionName: 'latestRoundData',  
    query: {  
      enabled: !!address,  
    },  
  });  

    const handleSetCourseCID = async () => {  
    if (!address) {  
      addLog('Please connect wallet first', 'error');  
      return;  
    }  

    const cidToSet = COURSE_CIDS[selectedCourseId];  
    if (!cidToSet) {  
      addLog('No CID found for selected course', 'error');  
      return;  
    }  

    try {  
      addLog(`Setting CID for course ${selectedCourseId}...`);  
      
      await writeContract({  
        address: CP_CONTRACT.address,  
        abi: CP_CONTRACT.abi,  
        functionName: 'setCourseCID',  
        args: [BigInt(selectedCourseId), cidToSet],  
      });  

      addLog('CID setting transaction sent', 'success');  
    } catch (error: any) {  
      let errorMessage = error.message;  
      if (error.message.includes('Not owner')) {  
        errorMessage = 'Operation failed: You are not the contract owner';  
      }  
      addLog(`Failed to set CID: ${errorMessage}`, 'error');  
      showAlert(`Transaction Failed: ${errorMessage}`, 'error');  
    }  
  };  

  // 设置课程进度  
 const handleSetProgress = async (newProgress: number) => {  
  if (!address) {  
    addLog('Please connect wallet first', 'error');  
    return;  
  }  

  try {  
    addLog(`Setting progress to ${newProgress}%...`);  
    
    await writeContract({  
      address: CPA_CONTRACT.address,  
      abi: CPA_CONTRACT.abi,  
      functionName: 'setProgress',  
      args: [BigInt(newProgress)],  
    });  

    addLog('Progress update transaction sent', 'success');  
  } catch (error: any) {  
    let errorMessage = error.message;  
    
    if (error.message.toLowerCase().includes('user rejected')) {  
      errorMessage = 'Transaction was rejected by user';  
    } else if (error.data?.message) {  
      errorMessage = error.data.message;  
    } else if (typeof error === 'object' && error.shortMessage) {  
      errorMessage = error.shortMessage;  
    }  

    addLog(`Failed to set progress: ${errorMessage}`, 'error');  
    showAlert(`Transaction Failed: ${errorMessage}`, 'error');  
    console.error('Detailed error:', error);  
  }  
};  

  // 检查并铸造NFT  
  const handleCheckAndMint = async () => {  
  if (!address) {  
    addLog('Please connect wallet first', 'error');  
    return;  
  }  

  try {  
    addLog(`Checking progress and minting NFT for course ${selectedCourseId}...`);  
    
    await writeContract({  
      address: CP_CONTRACT.address,  
      abi: CP_CONTRACT.abi,  
      functionName: 'checkAndMint',  
      args: [address, BigInt(selectedCourseId)],  
    });  

    addLog('Mint transaction sent', 'success');  
  } catch (error: any) {  
    let errorMessage = error.message;  
    
    // 处理常见的铸造错误  
    if (error.message.includes('Progress not complete')) {  
      errorMessage = 'Course progress not complete. Please complete the course first.';  
    } else if (error.message.includes('Already minted')) {  
      errorMessage = 'NFT already minted for this course';  
    } else if (error.message.toLowerCase().includes('user rejected')) {  
      errorMessage = 'Transaction was rejected by user';  
    } else if (error.data?.message) {  
      errorMessage = error.data.message;  
    } else if (typeof error === 'object' && error.shortMessage) {  
      errorMessage = error.shortMessage;  
    }  

    addLog(`Mint failed: ${errorMessage}`, 'error');  
    showAlert(`Mint Failed: ${errorMessage}`, 'error');  
    console.error('Detailed error:', error);  
  }  
};  

  // 监听NFT铸造事件  
  const watchMintEvent = async (txHash: Hash) => {  
    try {  
      addLog('Watching for NFT minted event...', 'info');  
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });  
      
      const logs = await publicClient.getLogs({  
        address: NFT_CONTRACT.address,  
        event: {  
          type: 'event',  
          name: 'Transfer',  
          inputs: [  
            { type: 'address', name: 'from', indexed: true },  
            { type: 'address', name: 'to', indexed: true },  
            { type: 'uint256', name: 'tokenId', indexed: true }  
          ]  
        },  
        fromBlock: receipt.blockNumber,  
        toBlock: receipt.blockNumber  
      });  

      if (logs.length > 0) {  
        const event = logs[0];  
        const successMessage = `Successfully minted NFT with token ID: ${event.args.tokenId}`;  
        
        showAlert(successMessage, 'success');  
        addLog(successMessage, 'success');  
        
        refetchProgress();  
        refetchCID();  
      }  
    } catch (error: any) {  
      addLog(`Failed to get mint event: ${error.message}`, 'error');  
      console.error('Event watching error:', error);  
    }  
  };  

  // 监听交易状态  
 useEffect(() => {  
    if (hash) {  
      const watchTransaction = async () => {  
        try {  
          const receipt = await publicClient.waitForTransactionReceipt({   
            hash: hash as Hash   
          });  
          
          if (receipt.status === 'success') {  
            addLog(`Transaction confirmed: ${hash}`, 'success');  
            showAlert('Transaction successful!', 'success');  
            // 手动触发 CID 刷新  
            await refetchCID();  
          } else {  
            addLog(`Transaction failed: ${hash}`, 'error');  
            showAlert('Transaction failed!', 'error');  
          }  
        } catch (error: any) {  
          addLog(`Transaction monitoring error: ${error.message}`, 'error');  
        }  
      };  

      watchTransaction();  
    }  
  }, [hash, publicClient, refetchCID]);  

   // 处理 CID 显示  
  const displayCID = isValidCID(rawCourseCID) ? rawCourseCID : null;

    const { data: isOwner = false } = useReadContract({  
    address: CP_CONTRACT.address,  
    abi: CP_CONTRACT.abi,  
    functionName: 'owner',  
    query: {  
        enabled: !!address,  
        select: (data: unknown) => {  
        if (typeof data === 'string' && typeof address === 'string') {  
            return data.toLowerCase() === address.toLowerCase();  
        }  
        return false;  
        },  
    },  
    });  
  // 添加自动刷新逻辑  
  useEffect(() => {  
    if (isConfirmed) {  
      // 交易确认后刷新 CID  
      refetchCID();  
      addLog('Transaction confirmed, refreshing CID...', 'success');  
    }  
  }, [isConfirmed, refetchCID]); 

  return (  
    <div className="p-4 max-w-4xl mx-auto">  
      <h1 className="text-2xl font-bold mb-4">NFT Minting Test Page</h1>  
        {!isOwner && (  
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">  
            Warning: You are not the contract owner. Some operations may fail.  
        </div>  
        )}  
      {/* 状态显示 */}  
      <div className="mb-4 p-4 bg-gray-100 rounded">  
        <h2 className="font-bold mb-2">Current State</h2>  
        <div className="space-y-2">  
            <p>Your Address: {address || 'Not connected'}</p>  
          <p>Is Owner: {isOwner ? 'Yes' : 'No'}</p>  
          <p>Current Progress: {Number(currentProgress)}%</p>  
          <p>Selected Course ID: {selectedCourseId}</p>  
          <p>Current Course CID: {displayCID || 'Not set'}</p>  
          <p>Transaction Status: {  
            isPending ? 'Pending' :  
            isConfirming ? 'Confirming' :  
            isConfirmed ? 'Confirmed' :  
            isError ? 'Failed' :  
            'Ready'  
          }</p>  
        </div>  
      </div>  

      {/* 课程选择和CID设置 */}  
       <div className="mb-4 p-4 bg-yellow-100 rounded">  
        <h2 className="font-bold mb-2">Course CID Management</h2>  
        <div className="space-y-4">  
          <div>  
            <label className="block mb-2">Select Course:</label>  
            <select  
              className="w-full p-2 border rounded"  
              value={selectedCourseId}  
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}  
            >  
              {Object.keys(COURSE_CIDS).map((id) => (  
                <option key={id} value={id}>  
                  Course {id} - {COURSE_CIDS[Number(id)].slice(0, 10)}...  
                </option>  
              ))}  
            </select>  
          </div>  
          
          {/* 显示当前选中课程的完整CID */}  
          <div className="text-sm bg-white p-3 rounded border">  
            <p className="font-semibold">Selected Course CID:</p>  
            <p className="font-mono break-all">{COURSE_CIDS[selectedCourseId]}</p>  
          </div>  

        <button  
        className={`px-4 py-2 ${  
          !isOwner   
            ? 'bg-gray-400 cursor-not-allowed'   
            : 'bg-purple-500 hover:bg-purple-600'  
        } text-white rounded disabled:opacity-50`}  
        onClick={handleSetCourseCID}  
        disabled={isPending || isConfirming || !isOwner}  
      >  
        {isPending ? 'Sending...' :  
         isConfirming ? 'Confirming...' :  
         !isOwner ? 'Requires Owner Permission' :  
         'Set Course CID'}  
      </button>  
        </div>  
      </div>  

      {/* 进度控制 */}  
      <div className="mb-4 p-4 bg-blue-100 rounded">  
        <h2 className="font-bold mb-2">Progress Control</h2>  
        <div className="flex gap-4">  
          <button  
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"  
            onClick={() => handleSetProgress(50)}  
            disabled={isPending || isConfirming}  
          >  
            Set 50%  
          </button>  
          <button  
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"  
            onClick={() => handleSetProgress(100)}  
            disabled={isPending || isConfirming}  
          >  
            Set 100%  
          </button>  
        </div>  
      </div>  

      {/* NFT铸造按钮 */}  
      <div className="mb-4">  
        <button  
          className={`px-4 py-2 rounded ${  
            isPending || isConfirming || !address || !displayCID  
              ? 'bg-gray-400'  
              : 'bg-green-500 hover:bg-green-600'  
          } text-white`}  
          onClick={handleCheckAndMint}  
          disabled={isPending || isConfirming || !address || !displayCID}  
        >  
          {isPending ? 'Sending...' :  
           isConfirming ? 'Confirming...' :  
           !displayCID ? 'Set CID First' :  
           'Check Progress & Mint NFT'}  
        </button>  
      </div>  

      {/* 交易日志 */}  
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
    </div>  
  );  
}