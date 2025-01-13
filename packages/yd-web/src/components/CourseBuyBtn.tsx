'use client'  
import { useState, useEffect, useMemo } from 'react'  
import { Button } from "@/app/components/ui/button"  
import { ShoppingBasket, Loader2 } from "lucide-react"  
import ConfettiButton from "@/app/components/ui/ConfettiButton"  
import { cn } from "@/utils"  
import {   
  useAccount,  
  useWriteContract,   
  useWaitForTransactionReceipt,   
  usePublicClient,  
} from 'wagmi'  
import { YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import { type Hash } from 'viem'  
import { useAtom } from 'jotai'  
import { allowanceAtom, allowanceLoadingAtom } from '@/atoms/allowanceAtom'  
import { useAlert } from '@/contexts/AlertContext'  
import { usePurchaseHistory } from '@/hooks/usePurchaseHistory'  
import { useTokenBalance } from '@/hooks/useTokenBalance'  


// 错误类型定义  
interface CourseError {  
  name: string  
  args: any[]  
}  

interface PurchaseCourseButtonProps {  
  courseId: string  
  price: number  
  title: string  
  onPurchaseSuccess?: () => void  
  onPurchaseError?: (error: Error) => void  
}  

// 解析合约错误  
const parseContractError = (error: any): CourseError | null => {  
  try {  
    const errorMessage = error.message || error.details || error  
    
    const patterns = {  
      CourseAlreadyPurchased: /CourseAlreadyPurchased\(uint256 courseId, address buyer\)\s*\((\d+), (0x[a-fA-F0-9]+)\)/,  
      CourseNotActive: /CourseNotActive\(uint256 courseId, string name\)\s*\((\d+), "([^"]+)"\)/,  
      InvalidCourseId: /InvalidCourseId\(uint256 courseId, uint256 maxCourseId\)\s*\((\d+), (\d+)\)/,  
      InsufficientAllowance: /InsufficientAllowance\(uint256 required, uint256 actual\)\s*\((\d+), (\d+)\)/,  
      InsufficientBalance: /InsufficientBalance\(address account, uint256 required, uint256 actual\)\s*\((0x[a-fA-F0-9]+), (\d+), (\d+)\)/,  
      TokenTransferFailed: /TokenTransferFailed\(address from, address to, uint256 amount\)\s*\((0x[a-fA-F0-9]+), (0x[a-fA-F0-9]+), (\d+)\)/  
    }  

    for (const [errorName, pattern] of Object.entries(patterns)) {  
      const match = errorMessage.match(pattern)  
      if (match) {  
        return {  
          name: errorName,  
          args: match.slice(1)  
        }  
      }  
    }  
    
    return null  
  } catch (e) {  
    console.error('Error parsing contract error:', e)  
    return null  
  }  
}  

// 获取用户友好的错误消息  
const getErrorMessage = (error: CourseError): string => {  
  switch (error.name) {  
    case 'CourseAlreadyPurchased':  
      return `You have already purchased course #${error.args[0]}`  
    case 'CourseNotActive':  
      return `Course #${error.args[0]} (${error.args[1]}) is not currently active`  
    case 'InvalidCourseId':  
      return `Invalid course ID ${error.args[0]} (max: ${error.args[1]})`  
    case 'InsufficientAllowance':  
      return `Insufficient allowance. Required: ${error.args[0]} YD, Current: ${error.args[1]} YD`  
    case 'InsufficientBalance':  
      return `Insufficient balance. Required: ${error.args[1]} YD, Current: ${error.args[2]} YD`  
    case 'TokenTransferFailed':  
      return `Token transfer failed. Amount: ${error.args[2]} YD`  
    default:  
      return 'An unknown error occurred'  
  }  
}  

export const PurchaseCourseButton = ({  
  courseId,  
  price,  
  title,  
  onPurchaseSuccess,  
  onPurchaseError,  
}: PurchaseCourseButtonProps) => {  
  const { address } = useAccount()  
  const [isPurchased, setIsPurchased] = useState(false)  
  const { showAlert } = useAlert()  
  const publicClient = usePublicClient()  
  const { hasPurchased, fetchPurchaseHistory } = usePurchaseHistory()  
  
  // 使用 hooks  
  const { balance, rawBalance, refetchBalance } = useTokenBalance()  
  const [globalApprovedAmount] = useAtom(allowanceAtom)  
  const [isAllowanceLoading] = useAtom(allowanceLoadingAtom)  

  // Contract writes  
  const { writeContract, data: hash, isPending, status } = useWriteContract()  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })  

  // 检查是否需要授权  
  const needsApproval = useMemo(() => {  
    return globalApprovedAmount < price  
  }, [globalApprovedAmount, price])  

  // 监听购买事件  
  const watchPurchaseEvent = async (txHash: Hash) => {  
    try {  
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })  
      
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
      })  

      if (logs.length > 0) {  
        const successMessage = `Successfully purchased course "${title}" for ${price} YD`  
        showAlert(successMessage, 'success')  
        
        // 刷新数据  
        refetchBalance()  
        fetchPurchaseHistory()  
        onPurchaseSuccess?.()  
      }  
    } catch (error: any) {  
      console.error('Event watching error:', error)  
      showAlert('Failed to confirm purchase', 'error')  
    }  
  }  

  // 模拟购买交易  
  const simulatePurchase = async () => {  
    if (!address) {  
      showAlert('Please connect wallet first', 'error')  
      return false  
    }  

    try {  
      await publicClient.simulateContract({  
        address: YDCOURSE_CONTRACT.address,  
        abi: YDCOURSE_CONTRACT.abi,  
        functionName: 'purchaseCourse',  
        args: [BigInt(courseId)],  
        account: address,  
      })  
      return true  
    } catch (error: any) {  
      const parsedError = parseContractError(error)  
      
      if (parsedError) {  
        const errorMessage = getErrorMessage(parsedError)  
        showAlert(errorMessage, 'error')  
        
        if (parsedError.name === 'CourseAlreadyPurchased') {  
          setIsPurchased(true)  
        }  
        
        return false  
      }  
      
      showAlert(`Purchase simulation failed: ${error.message}`, 'error')  
      return false  
    }  
  }  

  // 处理购买  
  const handlePurchase = async () => {  
    if (!address) {  
      showAlert('Please connect wallet first', 'error')  
      return  
    }  

    const hasEnoughBalance = rawBalance !== undefined && rawBalance >= BigInt(price)  
    
    if (!hasEnoughBalance) {  
      showAlert('Insufficient balance', 'error')  
      return  
    }  

    if (needsApproval) {  
      showAlert('Insufficient allowance. Please approve first.', 'error')  
      return  
    }  

    if (isPurchased) {  
      showAlert('You already own this course', 'warning')  
      return  
    }  

    try {  
      const canProceed = await simulatePurchase()  
      if (!canProceed) return  

      writeContract({  
        address: YDCOURSE_CONTRACT.address,  
        abi: YDCOURSE_CONTRACT.abi,  
        functionName: 'purchaseCourse',  
        args: [BigInt(courseId)],  
      })  
    } catch (error: any) {  
      const parsedError = parseContractError(error)  
      if (parsedError) {  
        showAlert(getErrorMessage(parsedError), 'error')  
      } else if (error.message.includes('user rejected transaction')) {  
        showAlert('Transaction was rejected by user', 'error')  
      } else {  
        showAlert(`Purchase failed: ${error.message}`, 'error')  
      }  
      onPurchaseError?.(error)  
    }  
  }  

  // 检查购买状态  
  const checkPurchaseStatus = async () => {  
    if (!address) return  
    
    try {  
      const purchased = await hasPurchased(BigInt(courseId))  
      setIsPurchased(purchased)  
      if (purchased) {  
        showAlert('You have already purchased this course', 'warning')  
      }  
    } catch (error: any) {  
      showAlert(`Failed to check purchase status: ${error.message}`, 'error')  
    }  
  }  

  // 监听交易状态  
  useEffect(() => {  
    if (hash) {  
      watchPurchaseEvent(hash)  
    }  
  }, [hash])  

  useEffect(() => {  
    if (status === 'success') {  
      refetchBalance()  
      fetchPurchaseHistory()  
      checkPurchaseStatus()  
    } else if (status === 'error') {  
      showAlert('Transaction failed. Please try again', 'error')  
    }  
  }, [status])  

  // 初始化检查  
  useEffect(() => {  
    if (address) {  
      checkPurchaseStatus()  
    }  
  }, [address])  

  const isLoading = isPending || isConfirming || isAllowanceLoading  
  const isDisabled = !address || isLoading || isPurchased || needsApproval  

  return (  
    <Button   
      className="course-card_btn group/button flex-1"  
      disabled={isDisabled}  
      asChild  
    >  
      <ConfettiButton  
        className={cn(  
          "flex items-center justify-center gap-2 px-4 py-2 rounded-full w-full",  
          isDisabled  
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"  
            : "bg-black text-white hover:bg-primary-dark"  
        )}  
        onClick={handlePurchase}  
        confettiText={`Successfully purchased ${title}!`}  
      >  
      {isLoading ? (  
        <>  
            <Loader2   
              className={cn(  
                "h-4 w-4 animate-spin",  
                isPending ? "text-state-error" :   
                isConfirming ? "text-state-warning" :   
                "text-state-info"  
              )}   
            />  
            <span>  
              {isPending ? 'Buy' :   
              isConfirming ? 'Buy' :   
              'Buy'}  
            </span>  
          </>  
        ) : (  
          <>  
            <ShoppingBasket className="h-4 w-4" />  
            <span>Buy</span>  
          </>  
        )}  
      </ConfettiButton>  
    </Button>  
  )  
}  