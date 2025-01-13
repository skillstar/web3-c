'use client'
import React, { useState, useEffect } from "react"
import { ChevronsRight } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import ConfettiButton from "@/app/components/ui/ConfettiButton"
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseEther } from "viem"
import { YDTOKEN_CONTRACT } from '@/app/abi/contractConfig'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { formatTokenBalance } from '@/utils/shortenAddress' // 确保你有这个工具函数

const EXCHANGE_RATE = 1000 // 1 ETH = 1000 YD

const BuyYD = () => {
  const [ethAmount, setEthAmount] = useState("")
  const [ydAmount, setYdAmount] = useState("")
  
  const { address, isConnected } = useAccount()
  const { 
    balance: tokenBalance, 
    refetchBalance, 
    isLoading: isBalanceLoading 
  } = useTokenBalance()


  const { writeContract } = useWriteContract()
  const { data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    })

  // 验证输入是否为有效的数字或小数点
  const isValidNumberInput = (value: string) => {
    if (value === "") return true
    if (value === ".") return true
    return /^\d*\.?\d*$/.test(value)
  }

  // 计算ETH和YD之间的转换
  const convertEthToYd = (eth: string) => {
    if (!eth || eth === "." || isNaN(Number(eth))) return ""
    const ethValue = parseFloat(eth)
    const tokenAmount = ethValue * EXCHANGE_RATE
    return tokenAmount.toString()
  }

  const convertYdToEth = (yd: string) => {
    if (!yd || yd === "." || isNaN(Number(yd))) return ""
    const ydValue = parseFloat(yd)
    const ethAmount = ydValue / EXCHANGE_RATE
    return ethAmount.toString()
  }

  // 处理ETH输入
  const handleEthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (isValidNumberInput(value)) {
      setEthAmount(value)
      setYdAmount(convertEthToYd(value))
    }
  }

  // 处理YD输入
  const handleYdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (isValidNumberInput(value)) {
      setYdAmount(value)
      setEthAmount(convertYdToEth(value))
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
      // 延迟再次刷新以确保数据更新
      setTimeout(() => {
        refetchBalance()
      }, 2000)
    }
  }, [isConfirmed, refetchBalance])

  const handleBuy = async () => {
    if (!ethAmount || isNaN(Number(ethAmount))) return
      console.log("tokenBalance---:",parseEther(ethAmount))
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg ml-6 mt-6">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold text-primary-dark">Buy YD Tokens</h2>
        <div className="flex items-center justify-between shadow-md">
          <div 
            className="flex items-baseline mx-2 cursor-pointer" 
            onClick={refetchBalance}
            title="Click to refresh balance"
          >
            <span className="text-gray-400 text-sm mr-1">Your Balance:</span>
            <span className="text-accent-purple text-1xl font-bold mr-1">
              {isConnected ? (
                isBalanceLoading ? (
                  "loading..."
                ) : (
                  formatTokenBalance(tokenBalance)
                )
              ) : (
                "0"
              )}
            </span>
            <span className="text-gray-200 text-xs">YD</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-gray-800 p-4 rounded-lg bg-opacity-60 mt-5">
        <div className="flex items-center mb-4">
          <div className="flex flex-col justify-center">
            <p className="text-gray-400 text-sm">You pay</p>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={ethAmount}
                onChange={handleEthChange}
                placeholder="0.0"
                className="bg-gray-700 text-white w-32 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              <span className="absolute text-xs text-gray-200 bottom-1 right-1">
                ETH
              </span>
            </div>
          </div>
          <div className="mx-2 mt-4">
            <ChevronsRight className="h-4 w-4 text-primary-light animate-move-right" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-gray-400 text-sm">You get</p>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={ydAmount}
                onChange={handleYdChange}
                placeholder="0.0"
                className="bg-gray-700 text-white w-32 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              <span className="absolute text-xs text-gray-200 bottom-1 right-1">
                YD
              </span>
            </div>
          </div>
          <div className="ml-2 mt-5">
            <Button 
              asChild
              disabled={isPending || isConfirming || !ethAmount || isNaN(Number(ethAmount)) || Number(ethAmount) <= 0}
            >
              <ConfettiButton
                className="flex items-center gap-2 px-4 rounded-full"
                confettiText="Bought!"
                onClick={handleBuy}
              >
                <span>
                  {isPending ? 'Confirming...' : 
                   isConfirming ? 'Processing...' : 
                   'Buy'}
                </span>
              </ConfettiButton>
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-400 mt-2">
          Rate: 1 ETH = {EXCHANGE_RATE} YD
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">
            Error: {error.message}
          </p>
        )}

        {isConfirmed && (
          <p className="text-green-500 text-sm mt-2">
            Purchase successful! Transaction: {hash}
          </p>
        )}

        <p className="text-sm text-gray-600 border-t border-gray-700 shadow-inner pt-2">
          YD tokens can be used to purchase courses and other services
        </p>
      </div>
    </div>
  )
}

export default BuyYD