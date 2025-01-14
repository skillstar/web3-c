'use client'
import React, { useState, useEffect, useRef } from "react"
import { ChevronsRight, Loader2 } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import ConfettiButton from "@/app/components/ui/ConfettiButton"
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi'
import { parseEther } from "viem"
import { YDTOKEN_CONTRACT } from '@/app/abi/contractConfig'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { formatTokenBalance } from '@/utils/shortenAddress' // 确保你有这个工具函数
import { useAlert } from '@/contexts/AlertContext';  

const EXCHANGE_RATE = 1000 // 1 ETH = 1000 YD

const BuyYD = () => {
  const [ethAmount, setEthAmount] = useState("")
  const [ydAmount, setYdAmount] = useState("")
  const [inputError, setInputError] = useState("") 
  const [isSimulating, setIsSimulating] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>() 
   const { showAlert } = useAlert();    
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient() 

  const { 
    balance: tokenBalance, 
    refetchBalance, 
    isLoading: isBalanceLoading 
  } = useTokenBalance()


  const { writeContract, data: hash, isPending } = useWriteContract() 
   const { isLoading: isConfirming, isSuccess: isConfirmed } =   
    useWaitForTransactionReceipt({  
      hash,  
    })  

     // 模拟交易  
  const simulateTransaction = async (amount: string) => {  
    if (!address) return false  
    
    setIsSimulating(true)  
    try {  
      await publicClient.simulateContract({  
        address: YDTOKEN_CONTRACT.address,  
        abi: YDTOKEN_CONTRACT.abi,  
        functionName: 'buyTokens',  
        value: parseEther(amount),  
        account: address,  
      })  
      return true  
    } catch (error) {  
      console.error('Transaction simulation failed:', error)  
      setInputError('Transaction would fail. Please check your input and try again.')  
      return false  
    } finally {  
      setIsSimulating(false)  
    }  
  }  

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
      
      // 验证最小购买金额  
      if (value && Number(value) < 0.001) {  
        setInputError("Minimum purchase amount is 0.001 ETH")  
      } else {  
        setInputError("")  
      }  
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

 // 自动更新余额  
 useEffect(() => {   
    // 交易开始时  
    if (isPending || isConfirming) {  
      return  
    }  

    // 交易确认后  
    if (isConfirmed && hash) {  
      showAlert(`Purchase successful! Transaction: ${hash}`, 'success')  
      refetchBalance()  
      
      timerRef.current = setTimeout(() => {  
        refetchBalance()  
      }, 3000)  
    }  

    return () => {  
      if (timerRef.current) {  
        clearTimeout(timerRef.current)  
      }  
    }  
  }, [isPending, isConfirming, isConfirmed, refetchBalance, hash])  

const handleBuy = async () => {  
    if (!ethAmount || isNaN(Number(ethAmount))) return  
    
    if (Number(ethAmount) < 0.001) {  
      setInputError("Minimum purchase amount is 0.001 ETH")  
      return  
    }  

    // 先进行交易模拟  
    const isSimulationSuccessful = await simulateTransaction(ethAmount)  
    if (!isSimulationSuccessful) return  

    try {  
      writeContract({  
        ...YDTOKEN_CONTRACT,  
        functionName: 'buyTokens',  
        value: parseEther(ethAmount),  
      })  
    } catch (err) {  
      console.error("Buy tokens failed:", err)  
      setInputError("Transaction failed. Please try again.")  
    }  
  }  
  // 判断按钮是否应该禁用  
  const isButtonDisabled =   
    !ethAmount ||   
    isNaN(Number(ethAmount)) ||   
    Number(ethAmount) <= 0 ||   
    Boolean(inputError) ||   
    isPending ||   
    isConfirming ||   
    isSimulating  

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
            isBalanceLoading || isPending || isConfirming ? (  
              <span className="flex items-center gap-1">  
                <Loader2 className="h-4 w-4 animate-spin" />  
              </span>  
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

      <div className="bg-gray-800 p-4 rounded-lg bg-opacity-60 mt-5">
        <div className="flex items-center">
          <div className="flex flex-col justify-center">
            <p className="text-gray-400 text-sm">You pay</p>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={ethAmount}
                onChange={handleEthChange}
                placeholder="0.0"
                className={`  
        bg-gray-700 text-white w-32 p-1.5 rounded-md   
        focus:outline-none focus:ring-2   
        transition-all duration-200  
        ${inputError   
          ? 'border border-state-error focus:ring-red-500/50'   
          : 'focus:ring-primary-light border border-transparent'  
        }  
      `}  
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
          disabled={isButtonDisabled}  
          className={`${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}  
        >  
          <ConfettiButton  
            className="flex items-center gap-2 px-4 rounded-full"  
            confettiText="Bought!"  
            onClick={handleBuy}  
          >  
            {isSimulating || isPending || isConfirming ? (  
              <span className="flex items-center gap-2">  
                <Loader2 className="h-4 w-4 animate-spin" />  
                Buy  
              </span>  
            ) : (  
              'Buy'  
            )}  
          </ConfettiButton>  
        </Button> 
          </div> 
        </div>
         {inputError && (  
              <p className="text-state-error text-xs mb-4">{inputError}</p>  
            )} 
        <div className="text-sm text-gray-400 mt-6 mb-1">
          Rate: 1 ETH = {EXCHANGE_RATE} YD
        </div>
        <p className="text-sm text-gray-600 border-t border-gray-700 shadow-inner pt-2">
          YD tokens can be used to purchase courses and other services
        </p>
      </div>
    </div>
  )
}

export default BuyYD