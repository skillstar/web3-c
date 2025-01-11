'use client'  
import React, { useState, useEffect } from "react";  
import { ChevronsRight } from "lucide-react";  
import { Button } from "@/app/components/ui/button";  
import ConfettiButton from "@/app/components/ui/ConfettiButton";  
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'  
import { parseEther } from "viem";  
import { YDTOKEN_CONTRACT } from '@/app/abi/contractConfig'  

const BuyYD = () => {  
  const [amount, setAmount] = useState("0");  
  const [ydAmount, setYdAmount] = useState("0");  
  
  // 获取当前账户  
  const { address, isConnected } = useAccount()  

  // 获取代币余额  
  const { data: balanceData, refetch: refetchBalance } = useReadContract({  
    address: YDTOKEN_CONTRACT.address,  
    abi: YDTOKEN_CONTRACT.abi,  
    functionName: 'balanceOf',  
    args: address ? [address] : undefined, // 只在有地址时传入参数  
  })  

  // 获取当前价格和兑换比例  
  const { data: tokensPerEth } = useReadContract({  
    address: YDTOKEN_CONTRACT.address,  
    abi: YDTOKEN_CONTRACT.abi,  
    functionName: 'TOKENS_PER_ETH',  
  })  

  // 合约写入相关  
  const { writeContract } = useWriteContract()  
  const { data: hash, isPending, error } = useWriteContract()  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =   
    useWaitForTransactionReceipt({  
      hash,  
    })  

  // 监听账户变化和交易确认，更新余额  
  useEffect(() => {  
    if (address) {  
      refetchBalance()  
    }  
  }, [address, refetchBalance])  

  useEffect(() => {  
    if (isConfirmed) {  
      refetchBalance()  
      // 延迟再次刷新以确保更新  
      setTimeout(() => {  
        refetchBalance()  
      }, 2000)  
    }  
  }, [isConfirmed, refetchBalance])  

  // 处理输入金额变化  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {  
    const value = e.target.value  
    setAmount(value)  
    
    if (tokensPerEth && value) {  
      const ethAmount = parseFloat(value)  
      const tokenAmount = ethAmount * Number(tokensPerEth)  
      setYdAmount(tokenAmount.toString())  
    }  
  }  

  // 处理购买  
  const handleBuy = async () => {  
    if (!amount) return  
    
    try {  
      writeContract({  
        address: YDTOKEN_CONTRACT.address,  
        abi: YDTOKEN_CONTRACT.abi,  
        functionName: 'buyTokens',  
        value: parseEther(amount),  
      })  
    } catch (err) {  
      console.error('购买失败:', err)  
    }  
  }  

  // 手动刷新余额  
  const handleRefreshBalance = () => {  
    if (address) {  
      refetchBalance()  
    }  
  }  

  return (  
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg ml-6 mt-6">  
      <div className="flex items-end justify-between">  
        <h2 className="text-2xl font-bold text-primary-dark">Buy YD Tokens</h2>  
        <div className="flex items-center justify-between shadow-md">  
          <div   
            className="flex items-baseline mx-2 cursor-pointer"   
            onClick={handleRefreshBalance}  
            title="Click to refresh balance"  
          >  
            <span className="text-gray-400 text-sm mr-1">Your Balance:</span>  
            <span className="text-accent-purple text-2xl font-bold mr-1">  
              {isConnected ? balanceData?.toString() || "0" : "0"}  
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
                type="number"  
                value={amount}  
                onChange={handleAmountChange}  
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
                type="number"  
                value={ydAmount}  
                readOnly  
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
              disabled={isPending || isConfirming || !amount}  
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

        {/* 错误提示 */}  
        {error && (  
          <p className="text-red-500 text-sm mt-2">  
            Error: {error.message}  
          </p>  
        )}  

        {/* 成功提示 */}  
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
  );  
};  

export default BuyYD;