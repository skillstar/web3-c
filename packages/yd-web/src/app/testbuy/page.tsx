'use client'  
// pages/TestPurchase.tsx  
import { useState, useEffect, useMemo } from 'react';  
import {  
  useAccount,  
  useReadContract,  
  useWriteContract,  
  useWaitForTransactionReceipt,  
  usePublicClient  
} from 'wagmi';  
import { type Hash } from 'viem';  
import { formatUnits } from 'viem';  
import { YDTOKEN_CONTRACT, YDCOURSE_CONTRACT } from '@/app/abi/contractConfig';  
import PurchaseHistory from "@/components/uc/PurchaseHistory"
import { usePurchaseHistory } from '@/hooks/usePurchaseHistory'; 
import { useAlert } from '@/contexts/AlertContext';  

// 定义课程类型  
interface CourseInfo {  
  name: string;  
  price: bigint;  
  isActive: boolean;  
  description: string;  
}   
interface CourseError {  
  name: string;  
  args: any[];  
} 
// 格式化 YD Token 金额（整数）  
const formatYDAmount = (amount: bigint) => {  
  return amount.toString();  
};  
// 解析合约错误的函数  
const parseContractError = (error: any): CourseError | null => {  
  try {  
    // 提取错误信息  
    const errorMessage = error.message || error.details || error;  
    
    // 常见的错误模式  
    const patterns = {  
      CourseAlreadyPurchased: /CourseAlreadyPurchased\(uint256 courseId, address buyer\)\s*\((\d+), (0x[a-fA-F0-9]+)\)/,  
      CourseNotActive: /CourseNotActive\(uint256 courseId, string name\)\s*\((\d+), "([^"]+)"\)/,  
      InvalidCourseId: /InvalidCourseId\(uint256 courseId, uint256 maxCourseId\)\s*\((\d+), (\d+)\)/,  
      InsufficientAllowance: /InsufficientAllowance\(uint256 required, uint256 actual\)\s*\((\d+), (\d+)\)/,  
      InsufficientBalance: /InsufficientBalance\(address account, uint256 required, uint256 actual\)\s*\((0x[a-fA-F0-9]+), (\d+), (\d+)\)/,  
      TokenTransferFailed: /TokenTransferFailed\(address from, address to, uint256 amount\)\s*\((0x[a-fA-F0-9]+), (0x[a-fA-F0-9]+), (\d+)\)/  
    };  

    // 检查每种错误模式  
    for (const [errorName, pattern] of Object.entries(patterns)) {  
      const match = errorMessage.match(pattern);  
      if (match) {  
        return {  
          name: errorName,  
          args: match.slice(1) // 获取捕获的参数  
        };  
      }  
    }  
    
    return null;  
  } catch (e) {  
    console.error('Error parsing contract error:', e);  
    return null;  
  }  
};  

// 获取用户友好的错误消息  
const getErrorMessage = (error: CourseError): string => {  
  switch (error.name) {  
    case 'CourseAlreadyPurchased':  
      return `You have already purchased course #${error.args[0]}`;  
      
    case 'CourseNotActive':  
      return `Course #${error.args[0]} (${error.args[1]}) is not currently active`;  
      
    case 'InvalidCourseId':  
      return `Invalid course ID ${error.args[0]} (max: ${error.args[1]})`;  
      
    case 'InsufficientAllowance':  
      return `Insufficient allowance. Required: ${formatYDAmount(BigInt(error.args[0]))} YD, Current: ${formatYDAmount(BigInt(error.args[1]))} YD`;  
      
    case 'InsufficientBalance':  
      return `Insufficient balance. Required: ${formatYDAmount(BigInt(error.args[1]))} YD, Current: ${formatYDAmount(BigInt(error.args[2]))} YD`;  
      
    case 'TokenTransferFailed':  
      return `Token transfer failed. Amount: ${formatYDAmount(BigInt(error.args[2]))} YD`;  
      
    default:  
      return 'An unknown error occurred';  
  }  
};  

export default function TestPurchase() {  
  const { address } = useAccount();  
  const publicClient = usePublicClient();  
  const [logs, setLogs] = useState<string[]>([]);  
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);  
   const [isPurchased, setIsPurchased] = useState(false);  
  const {   
    hasPurchased,   
    getCourseInfo,
    fetchPurchaseHistory   
  } = usePurchaseHistory();
    const { showAlert } = useAlert();  

  const loadCourseInfo = async () => {  
  if (!address) return;  

  try {  
    addLog(`Fetching course info for ID ${testCourseId}...`);  
    const course = await getCourseInfo(BigInt(testCourseId));  
    setCourseInfo(course);  
    addLog(`Course info retrieved successfully`, 'success');  
    addLog(`Course name: ${course.name}`);  
    addLog(`Course price: ${course.price.toString()} YD`);  
    addLog(`Course status: ${course.isActive ? 'Active' : 'Inactive'}`);  
  } catch (error: any) {  
    addLog(`Failed to get course info: ${error.message}`, 'error');  
    console.error('Get course error:', error);  
  }  
};  
  // 在组件顶部添加事件监听函数  
const watchPurchaseEvent = async (txHash: Hash) => {  
  try {  
    addLog('Watching for CoursePurchased event...', 'info');  
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });  
    
    const logs = await publicClient.getLogs({  
      address: YDCOURSE_CONTRACT.address,  
      event: {  
        type: 'event',  
        name: 'CoursePurchased',  
        inputs: [  
          { type: 'address', name: 'buyer', indexed: true },  
          { type: 'uint256', name: 'courseId', indexed: true },  
          { type: 'uint256', name: 'price' }  
        ]  
      },  
      fromBlock: receipt.blockNumber,  
      toBlock: receipt.blockNumber  
    });  

    if (logs.length > 0 && courseInfo) {  
      const event = logs[0];  
      const successMessage = `Successfully purchased course "${courseInfo.name}" for ${event.args.price} YD`;  
      
      // 显示成功提示  
      showAlert(successMessage, 'success');  
      
      // 立即刷新数据  
      refetchBalance();  
      refetchAllowance();  
      fetchPurchaseHistory();  
      
      // 更新日志  
      addLog(`Purchase successful! Details:`, 'success');  
      if (event.args.buyer) {  
        addLog(`- Buyer: ${event.args.buyer}`, 'success');  
      }  
      if (event.args.courseId) {  
        addLog(`- Course ID: ${event.args.courseId.toString()}`, 'success');  
      }  
      if (event.args.price) {  
        addLog(`- Price paid: ${formatYDAmount(event.args.price)} YD`, 'success');  
      }  
    }  
  } catch (error: any) {  
    addLog(`Failed to get purchase event: ${error.message}`, 'error');  
    console.error('Event watching error:', error);  
  }  
};  

  // 获取 writeContract  
  const {   
    writeContract,   
    data: hash,   
    isPending,   
    status   
  } = useWriteContract();  

  // 测试参数  
  const testCourseId = 5;  
  const testPrice = 1; // 1 YD Token (整数)  

  // 添加日志  
  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {  
    const timestamp = new Date().toLocaleTimeString();  
    setLogs(prev => [`[${timestamp}] [${type}] ${message}`, ...prev]);  
  };  

  // 读取代币余额和授权额度  
  const { data: balance = BigInt(0), refetch: refetchBalance } = useReadContract({  
    address: YDTOKEN_CONTRACT.address,  
    abi: YDTOKEN_CONTRACT.abi,  
    functionName: 'balanceOf',  
    args: [address!],  
    query: {  
      enabled: !!address,  
    },  
  }) as { data: bigint, refetch: () => void };  

  const { data: allowance = BigInt(0), refetch: refetchAllowance } = useReadContract({  
    address: YDTOKEN_CONTRACT.address,  
    abi: YDTOKEN_CONTRACT.abi,  
    functionName: 'allowance',  
    args: [address!, YDCOURSE_CONTRACT.address],  
    query: {  
      enabled: !!address,  
    },  
  }) as { data: bigint, refetch: () => void };  

  // 等待交易确认  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({   
    hash: hash as Hash | undefined   
  });  

  // 检查是否需要授权  
const needsApproval = useMemo(() => {  
    if (!courseInfo) return true; // 如果没有课程信息，默认需要授权  
    return allowance < courseInfo.price;  
  }, [allowance, courseInfo]); 

  // 模拟授权和购买交易的函数保持不变...  
 // 模拟授权交易  
const simulateApprove = async () => {  
  if (!address || !courseInfo) {  
    addLog('Please connect wallet and wait for course info', 'error');  
    return false;  
  }  
  
  try {  
    addLog(`Simulating approve for ${formatYDAmount(courseInfo.price)} YD...`);  
    
    const simulation = await publicClient.simulateContract({  
      address: YDTOKEN_CONTRACT.address,  
      abi: YDTOKEN_CONTRACT.abi,  
      functionName: 'approve',  
      args: [YDCOURSE_CONTRACT.address, BigInt(0)], // 使用 18 位小数  
      account: address,  
    });  

    addLog('Approve simulation successful', 'success');  
    addLog(`Estimated gas: ${simulation.request.gas}`);  
    return true;  
  } catch (error: any) {  
    addLog(`Approve simulation failed: ${error.message}`, 'error');  
    console.error('Approve simulation error:', error);  
    return false;  
  }  
};  

// 模拟购买交易  
 // 修改错误处理相关的函数  
  const simulatePurchase = async () => {  
    if (!address || !courseInfo) {  
      addLog('Please connect wallet and wait for course info', 'error');  
      showAlert('Please connect wallet and wait for course info', 'error');  
      return false;  
    }  
    
    try {  
      addLog(`Simulating purchase for course ID ${testCourseId}...`);  
      
      const simulation = await publicClient.simulateContract({  
        address: YDCOURSE_CONTRACT.address,  
        abi: YDCOURSE_CONTRACT.abi,  
        functionName: 'purchaseCourse',  
        args: [BigInt(testCourseId)],  
        account: address,  
      });  
  
      addLog('Purchase simulation successful', 'success');  
      return true;  
    } catch (error: any) {  
      const parsedError = parseContractError(error);  
      
      if (parsedError) {  
        const errorMessage = getErrorMessage(parsedError);  
        addLog(errorMessage, 'error');  
        showAlert(errorMessage, 'error');  
        
        // 特殊处理某些错误  
        if (parsedError.name === 'CourseAlreadyPurchased') {  
          setIsPurchased(true);  
        }  
        
        return false;  
      }  
      
      addLog(`Purchase simulation failed: ${error.message}`, 'error');  
      showAlert(`Purchase simulation failed: ${error.message}`, 'error');  
      return false;  
    }  
  };  

// 处理授权  
const handleApprove = async () => {  
  if (!address || !courseInfo) {  
    addLog('Please connect wallet and wait for course info', 'error');  
    return;  
  }  

  try {  
    const canProceed = await simulateApprove();  
    if (!canProceed) {  
      addLog('Cancelled approve due to simulation failure', 'error');  
      return;  
    }  

    addLog(`Sending approve transaction for ${courseInfo.price} YD...`);  
    
    await writeContract({  
      address: YDTOKEN_CONTRACT.address,  
      abi: YDTOKEN_CONTRACT.abi,  
      functionName: 'approve',  
      args: [YDCOURSE_CONTRACT.address, courseInfo.price], // 直接使用整数价格  
    });  

    addLog('Approve transaction sent', 'success');  
  } catch (error: any) {  
    addLog(`Approve failed: ${error.message}`, 'error');  
    console.error('Approve error:', error);  
  }  
};  

// 处理购买  
const handlePurchase = async () => {  
  if (!address || !courseInfo) {  
   const msg = 'Please connect wallet and wait for course info';  
    addLog(msg, 'error');  
    showAlert(msg, 'error');   
    return;  
  }  

  const coursePrice = courseInfo.price;  
  const hasEnoughBalance = balance >= coursePrice;  
  
  if (!hasEnoughBalance) {  
    addLog('Insufficient balance', 'error');  
    return;  
  }  

  if (allowance < coursePrice) {  
    addLog('Insufficient allowance. Please approve first.', 'error');  
    return;  
  }  
  if (isPurchased) {  
        const msg = 'You already own this course';  
        addLog(msg, 'error');  
        showAlert(msg, 'warning');  
        return;  
      } 
  try {  
    const canProceed = await simulatePurchase();  
    if (!canProceed) {  
      addLog('Cancelled purchase due to simulation failure', 'error');  
      return;  
    }  

    addLog(`Sending purchase transaction for course ${testCourseId}...`);  
    
    // 调用 writeContract  
    writeContract({  
      address: YDCOURSE_CONTRACT.address,  
      abi: YDCOURSE_CONTRACT.abi,  
      functionName: 'purchaseCourse',  
      args: [BigInt(testCourseId)],  
    });  

    // 使用 useEffect 监听 hash 变化  
  } catch (error: any) {  
    const parsedError = parseContractError(error);  
    if (parsedError) {  
      const errorMessage = getErrorMessage(parsedError);  
      addLog(errorMessage, 'error');  
      showAlert(errorMessage, 'error');  
    } else if (error.message.includes('user rejected transaction')) {  
        const msg = 'Transaction was rejected by user';  
        addLog(msg, 'error');  
        showAlert(msg, 'error'); 
    } else {  
      const msg = `Purchase failed: ${error.message}`;  
        addLog(msg, 'error');  
        showAlert(msg, 'error');  
    }  
  }  
};  

// 添加检查课程购买状态的函数  
const checkPurchaseStatus = async () => {  
    if (!address) return;  
    
    try {  
      await fetchPurchaseHistory();  
      const purchased = await hasPurchased(BigInt(testCourseId));  
      setIsPurchased(purchased);  
      if (purchased) {  
        addLog(`You have already purchased this course`, 'error');  
        showAlert('You have already purchased this course', 'warning');  
      }  
    } catch (error: any) {  
      const errorMsg = `Failed to check purchase status: ${error.message}`;  
      addLog(errorMsg, 'error');  
      showAlert(errorMsg, 'error');  
    }  
  };  
// 在组件顶部添加 useEffect 来监听交易哈希  
useEffect(() => {  
  if (hash) {  
    addLog('Purchase transaction sent', 'success');  
    addLog(`Transaction hash: ${hash}`, 'info');  
    
    // 监听购买事件  
    watchPurchaseEvent(hash);  
  }  
}, [hash]);  
// 在组件顶部添加另一个 useEffect 来监听交易状态  
useEffect(() => {  
  if (status === 'success') {  
    addLog('Transaction successful', 'success');  
    refetchBalance();  
    refetchAllowance();  
  }  
}, [status, refetchBalance, refetchAllowance]); 
useEffect(() => {  
  if (hash) {  
    addLog('Purchase transaction sent', 'success');  
    addLog(`Transaction hash: ${hash}`, 'info');  
    
    // 监听购买事件  
    watchPurchaseEvent(hash);  
  }  
}, [hash]);  

// 初始化数据  
// 确保在购买成功后更新购买历史  
useEffect(() => {  
  if (status === 'success') {  
    // 不需要在这里显示成功消息，因为 watchPurchaseEvent 会处理  
    refetchBalance();  
    refetchAllowance();  
    fetchPurchaseHistory();  
    checkPurchaseStatus();  
  } else if (status === 'error') {  
    const msg = '❌ Transaction failed. Please try again';  
    addLog(msg, 'error');  
    showAlert(msg, 'error');  
  }  
}, [status]);

// 初始化时检查  
useEffect(() => {  
  if (address) {  
    loadCourseInfo();  
    checkPurchaseStatus();  
  }  
}, [address]); 
  return (  
    <div className="p-4 max-w-4xl mx-auto">  
      <h1 className="text-2xl font-bold mb-4">Course Purchase Test Page</h1>  
       <PurchaseHistory />  
       {/* 状态显示 - 使用正确的格式化 */}  
      <div className="mb-4 p-4 bg-gray-100 rounded">  
        <h2 className="font-bold mb-2">Current State</h2>  
        <div className="space-y-2">  
          <p>Your Address: {address || 'Not connected'}</p>  
          <p>YD Token Balance: {formatYDAmount(balance)} YD</p>  
          <p>Current Allowance: {formatYDAmount(allowance)} YD</p>  
          <p>Transaction Status: {status}</p>  
        </div>  
      </div>  

       {/* 测试参数 - 显示人类可读的值 */}  
        <div className="mb-4 p-4 bg-blue-100 rounded">  
        <h2 className="font-bold mb-2">Test Parameters</h2>  
        <div className="space-y-2">  
          <p>Course ID: {testCourseId}</p>  
          <p>Price: {testPrice} YD</p>  
          <p>Course Contract: {YDCOURSE_CONTRACT.address}</p>  
          <p>Token Contract: {YDTOKEN_CONTRACT.address}</p>  
          
          {/* 调试信息 */}  
          <div className="text-sm text-gray-600 mt-2">  
            <p>Raw Allowance: {allowance.toString()}</p>  
          </div>  
        </div>  
      </div>  
 
       {/* 课程信息显示 */}  
      {courseInfo && (  
        <div className="mb-4 p-4 bg-yellow-100 rounded">  
          <h2 className="font-bold mb-2">Course Information</h2>  
          <div className="space-y-2">  
            <p>Name: {courseInfo.name}</p>  
            <p>Price: {formatYDAmount(courseInfo.price)} YD</p>  
            <p>Status: {courseInfo.isActive ? 'Active' : 'Inactive'}</p>  
            <p>Description: {courseInfo.description}</p>   
          </div>  
        </div>  
      )}  
      {/* 操作按钮 */}  
      <div className="flex gap-4 mb-4">  
        <button  
          className={`px-4 py-2 rounded ${  
            isPending || isConfirming || !address  
              ? 'bg-gray-400'   
              : 'bg-blue-500 hover:bg-blue-600'  
          } text-white`}  
          onClick={handleApprove}  
          disabled={isPending || isConfirming || !address}  
        >  
          {isPending ? 'Sending...' :   
           isConfirming ? 'Confirming...' :   
           'Approve YD Token'}  
        </button>  

        <button  
          className={`px-4 py-2 rounded ${  
            isPending || isConfirming || needsApproval || !address  
              ? 'bg-gray-400'  
              : 'bg-green-500 hover:bg-green-600'  
          } text-white`}  
          onClick={handlePurchase}   
          disabled={isPending || isConfirming || needsApproval || !address}  
        >  
          {isPending ? 'Sending...' :  
           isConfirming ? 'Confirming...' :  
           'Purchase Course'}  
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

