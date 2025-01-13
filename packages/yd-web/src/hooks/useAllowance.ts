// hooks/useAllowance.ts  
import { useAccount, useReadContract } from 'wagmi'  
import { YDTOKEN_CONTRACT } from '@/app/abi/contractConfig'  
import { useCallback, useEffect } from 'react'  
import { type Abi } from 'viem'  
import { useAtom } from 'jotai'  
import { allowanceAtom, allowanceLoadingAtom } from '@/atoms/allowanceAtom'  

export function useAllowance(spenderAddress: `0x${string}`) {  
  const { address } = useAccount()  
  const [allowance, setAllowance] = useAtom(allowanceAtom)  
  const [isAllowanceLoading, setIsAllowanceLoading] = useAtom(allowanceLoadingAtom)  
  
  const {   
    data: allowanceData,   
    refetch: refetchAllowance,  
    isError: isAllowanceError,  
    isLoading,  
    status  
  } = useReadContract({  
    address: YDTOKEN_CONTRACT.address as `0x${string}`,  
    abi: YDTOKEN_CONTRACT.abi as Abi,  
    functionName: 'allowance',  
    args: address ? [address, spenderAddress] : undefined,  
    query: {  
      enabled: Boolean(address && spenderAddress),  
      refetchInterval: 2000,  
    },  
  })  

  // 使用 useEffect 来处理状态更新  
  useEffect(() => {  
    if (status === 'pending') {  
      setIsAllowanceLoading(true)  
    } else {  
      setIsAllowanceLoading(false)  
    }  

    if (status === 'success' && allowanceData) {  
      setAllowance(BigInt(allowanceData.toString())) // 转换为 BigInt  
    }  
  }, [status, allowanceData, setAllowance, setIsAllowanceLoading])  

  // 转换授权额度为数字  
  const formatAllowance = useCallback((rawAllowance: bigint | undefined | null): number => {  
    if (!rawAllowance) return 0  
    return Number(rawAllowance) // BigInt 转 number  
  }, [])  

  // 检查是否有足够的授权额度  
  const hasEnoughAllowance = useCallback((requiredAmount: number): boolean => {  
    if (!allowanceData) return false  
    const currentAllowance = formatAllowance(allowanceData as bigint)  
    return currentAllowance >= requiredAmount  
  }, [allowanceData, formatAllowance])  

  return {  
    allowance,  
    refetchAllowance,  
    isAllowanceError,  
    isAllowanceLoading: isLoading || isAllowanceLoading,  
    formatAllowance,  
    hasEnoughAllowance  
  }  
}  

export type AllowanceHook = ReturnType<typeof useAllowance>