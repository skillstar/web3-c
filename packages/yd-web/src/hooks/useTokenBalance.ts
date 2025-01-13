// hooks/useTokenBalance.ts
import { useAccount, useReadContract } from 'wagmi'
import { YDTOKEN_CONTRACT } from '@/app/abi/contractConfig'
import { useCallback } from 'react'

export function useTokenBalance() {
  const { address } = useAccount()

  // 获取代币余额
  const { 
    data: balanceData, 
    refetch: refetchBalance,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useReadContract({
    address: YDTOKEN_CONTRACT.address,
    abi: YDTOKEN_CONTRACT.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  }) as { 
    data: bigint | undefined,
    refetch: () => void,
    isError: boolean,
    isLoading: boolean 
  }

  // 获取代币精度
  const { data: decimals } = useReadContract({
    address: YDTOKEN_CONTRACT.address,
    abi: YDTOKEN_CONTRACT.abi,
    functionName: 'decimals',
  }) as { data: number }

  // 获取代币符号
  const { data: symbol } = useReadContract({
    address: YDTOKEN_CONTRACT.address,
    abi: YDTOKEN_CONTRACT.abi,
    functionName: 'symbol',
  }) as { data: string }

  // 转换余额为人类可读格式
  const formatBalance = useCallback((rawBalance: bigint | undefined): number => {
    if (!rawBalance || typeof decimals !== 'number') return 0
    return Number(rawBalance) / Math.pow(10, decimals)
  }, [decimals])
  return {
    // 基础数据
    balance: formatBalance(balanceData),
    rawBalance: balanceData,
    symbol: symbol || 'YD',
    decimals: decimals || 18,
    
    // 状态
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    
    // 操作方法
    refetchBalance,
    
    // 工具方法
    formatBalance,
  }
}

// 为 Hook 返回值定义类型
export type TokenBalanceHook = ReturnType<typeof useTokenBalance>