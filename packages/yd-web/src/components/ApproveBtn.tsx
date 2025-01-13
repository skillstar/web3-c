'use client'  
import { useState, useEffect } from "react"  
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'  
import { YDTOKEN_CONTRACT, YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import { Button } from "@/app/components/ui/button"  
import { cn } from "@/utils"  
import { AArrowUp } from "lucide-react"  
import ConfettiButton from "@/app/components/ui/ConfettiButton"  
import { useAtom } from 'jotai'  
import { allowanceAtom, allowanceLoadingAtom } from '@/atoms/allowanceAtom'  
import { formatNumber } from '@/utils/shortenAddress'  

interface ApproveButtonProps {  
  courseId: string  
  price: number  
  walletBalance: number  
  ethPrice?: number  
  isBalanceLoading: boolean  
  onSuccess?: () => void  
}  

export const ApproveButton = ({  
  courseId,  
  price,  
  walletBalance,  
  ethPrice,  
  isBalanceLoading,  
  onSuccess  
}: ApproveButtonProps) => {  
  const [globalApprovedAmount] = useAtom(allowanceAtom)  
  const [isAllowanceLoading] = useAtom(allowanceLoadingAtom)  

  const [approveAmount, setApproveAmount] = useState('')  
  const [isError, setIsError] = useState(false)  
  const [errorMessage, setErrorMessage] = useState('')  

  const { writeContract, data: hash, isPending, error } = useWriteContract()  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =   
    useWaitForTransactionReceipt({  
      hash,  
    })  

  const handleMaxClick = () => {  
    setIsError(false)  
    setErrorMessage('')  
    const maxAmount = Math.max(price, Math.min(walletBalance, price))  
    setApproveAmount(maxAmount.toString())  
  }  

  const handleApprove = async () => {  
    const inputAmount = parseInt(approveAmount || '0')  
    
    if (isNaN(inputAmount) || inputAmount <= 0) {  
      setIsError(true)  
      setErrorMessage('Please enter a valid amount')  
      return  
    }  

    if (inputAmount > walletBalance) {  
      setIsError(true)  
      setErrorMessage(`Insufficient wallet balance. Max available: ${walletBalance} YD`)  
      return  
    }  

    if (inputAmount < price) {  
      setIsError(true)  
      setErrorMessage(`Approved amount must be at least ${price} YD`)  
      return  
    }  

    try {  
      await writeContract({  
        address: YDTOKEN_CONTRACT.address,  
        abi: YDTOKEN_CONTRACT.abi,  
        functionName: 'approve',  
        args: [YDCOURSE_CONTRACT.address, BigInt(inputAmount)],  
      })  
    } catch (err) {  
      console.error('Authorization failed:', err)  
      setIsError(true)  
      setErrorMessage(err instanceof Error ? err.message : 'Approval failed. Please try again.')  
    }  
  }  

  useEffect(() => {  
    if (isConfirmed) {  
      onSuccess?.()  
    }  
  }, [isConfirmed, onSuccess])  

  return (  
    <>  
      <Button   
        className="course-card_btn group/button flex-1"  
        disabled={isPending || isConfirming}  
        asChild  
      >  
        <ConfettiButton   
          className={cn(  
            "flex items-center justify-center gap-2 px-4 py-2 rounded-full w-full",  
            isPending || isConfirming  
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"  
              : "bg-black text-white hover:bg-primary-dark"  
          )}  
          onClick={() => (document.getElementById(`modal_approve_${courseId}`) as HTMLDialogElement).showModal()}  
        >  
          <AArrowUp className="h-4 w-4" />  
          <span>  
            {isPending ? 'Approving...' :   
             isConfirming ? 'Confirming...' :   
             'Approve'}  
          </span>  
        </ConfettiButton>  
      </Button>  

      {/* Approve Modal */}  
      <dialog id={`modal_approve_${courseId}`} className="modal">  
        <div className="modal-box">  
          <form method="dialog">  
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-primary-dark">✕</button>  
          </form>  
          <div className="text-white space-y-4">  
            <h3 className="font-bold text-lg">Approve YD Tokens</h3>  
            <div>  
              {ethPrice && (  
                <div className="label">  
                  <span className="label-text-alt">  
                    Rate: 1 YD = {formatNumber(ethPrice)} ETH  
                  </span>  
                </div>  
              )}  
              <div className={`input input-bordered flex items-center gap-2 ${isError ? 'input-error' : ''}`}>  
                <input  
                  type="number"  
                  className="grow text-gray-200"  
                  placeholder="0"  
                  value={approveAmount}  
                  onChange={(e) => {  
                    const value = e.target.value  
                    if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) >= 0)) {  
                      setApproveAmount(value)  
                      setIsError(false)  
                      setErrorMessage('')  
                    }  
                  }}  
                  min={price}  
                  max={walletBalance}  
                  step="1"  
                  onWheel={(e) => e.currentTarget.blur()}  
                />  
                <button  
                  className="badge bg-primary-dark hover:bg-primary-light text-white hover:text-gray-500"  
                  onClick={handleMaxClick}  
                  type="button"  
                >  
                  Max  
                </button>  
                <kbd className="font-bold">YD</kbd>  
              </div>  
              {isError && (  
                <div className="label">  
                  <span className="label-text-alt text-error">  
                    {errorMessage}  
                  </span>  
                </div>  
              )}  
              <div className="label text-gray-300">  
                <span className="label-text-alt">Course Price: {price} YD</span>  
                <span className="label-text-alt">  
                  Wallet Balance: {  
                    isBalanceLoading ? (  
                      <span className="inline-block w-4 h-4 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />  
                    ) : (  
                      walletBalance  
                    )  
                  } YD  
                </span>  
                <span className="label-text-alt">  
                  Current Approval: {  
                    isAllowanceLoading || isConfirming ? (  
                      <span className="inline-block w-4 h-4 border-2 border-primary-light border-t-transparent rounded-full animate-spin ml-1" />  
                    ) : (  
                      Number(globalApprovedAmount || BigInt(0))  
                    )  
                  } YD  
                </span>  
              </div>  
            </div>  
            <div className="flex justify-center">  
              <Button  
                className="course-card_btn group/button"  
                disabled={isPending || isConfirming}  
                asChild  
              >  
                <ConfettiButton  
                  className={cn(  
                    "flex items-center gap-2 px-4 py-2 rounded-full",  
                    isPending || isConfirming  
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"  
                      : "bg-black text-white hover:bg-primary-dark"  
                  )}  
                  onClick={handleApprove}  
                >  
                  <span>  
                    {isPending ? 'Approving...' : 'Approve'}  
                  </span>  
                </ConfettiButton>  
              </Button>  
            </div>  
          </div>  
        </div>  
      </dialog>  
    </>  
  )  
}