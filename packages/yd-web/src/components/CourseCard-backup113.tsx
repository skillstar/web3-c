'use client'  
import { cn, formatDate } from "@/utils"  
import { UserPlus, AArrowUp } from "lucide-react"  
import Link from "next/link"  
import Image from "next/image"  
import { Button } from "@/app/components/ui/button"  
import { Skeleton } from "@/app/components/ui/skeleton"  
import { CourseTypeCard } from "@/types"  
import ConfettiButton from "@/app/components/ui/ConfettiButton"  
import { useState, useEffect } from "react"  
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'  
import { YDTOKEN_CONTRACT, YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import { formatTokenAmount, formatNumber, formatTokenBalance, formatTokenUnits } from '@/utils/shortenAddress'  
import { PurchaseCourseButton } from '@/components/CourseBuyBtn'  
import { useAtom } from 'jotai'  
import { allowanceAtom, allowanceLoadingAtom } from '@/atoms/allowanceAtom'  

interface CourseCardProps {  
  post: CourseTypeCard  
  walletBalance: number  
  onApproveSuccess: () => void  
  isBalanceLoading?: boolean  
}  

const CourseCard = ({  
  post,  
  walletBalance,  
  onApproveSuccess,  
  isBalanceLoading = false,  
}: CourseCardProps) => {  
  // 使用 jotai 获取 allowance 状态  
  const [globalApprovedAmount] = useAtom(allowanceAtom)  
  const [isAllowanceLoading] = useAtom(allowanceLoadingAtom)  

  const {  
    _createdAt,  
    views,  
    name,  
    _id,  
    image,  
    description,  
    price = 99 // YD tokens  
  } = post  

  const [approveAmount, setApproveAmount] = useState('')  
  const [isError, setIsError] = useState(false)  
  const [errorMessage, setErrorMessage] = useState('')  

  // Contract interaction hooks  
  const { writeContract, data: hash, isPending, error } = useWriteContract()  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =   
    useWaitForTransactionReceipt({  
      hash,  
    })  

  // Token related data  
  const { data: decimals } = useReadContract({  
    address: YDTOKEN_CONTRACT.address,  
    abi: YDTOKEN_CONTRACT.abi,  
    functionName: 'decimals',  
  }) as { data: number }  

  const { data: currentPrice } = useReadContract({  
    address: YDTOKEN_CONTRACT.address,  
    abi: YDTOKEN_CONTRACT.abi,  
    functionName: 'getCurrentPrice',  
  }) as { data: bigint }  

  // Token amount conversion  
  const toTokenAmount = (amount: number) => {  
    const tokenDecimals = decimals || 18  
    return BigInt(Math.floor(amount * 10 ** tokenDecimals))  
  }  

  const handleMaxClick = () => {  
    setIsError(false)  
    setErrorMessage('')  
    const maxAmount = Math.max(price, Math.min(walletBalance, price))  
    setApproveAmount(maxAmount.toString())  
  }  

  const handleApprove = async () => {  
    const inputAmount = parseFloat(approveAmount || '0')  
    
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
      const amountInWei = toTokenAmount(inputAmount)  
      
      await writeContract({  
        address: YDTOKEN_CONTRACT.address,  
        abi: YDTOKEN_CONTRACT.abi,  
        functionName: 'approve',  
        args: [YDCOURSE_CONTRACT.address, amountInWei],  
      })  
    } catch (err) {  
      console.error('授权失败:', err)  
      setIsError(true)  
      setErrorMessage(err instanceof Error ? err.message : 'Approval failed. Please try again.')  
    }  
  }  

  useEffect(() => {  
    if (isConfirmed) {  
      onApproveSuccess?.()  
    }  
  }, [isConfirmed, onApproveSuccess])  

  // Calculate ETH price  
  const ethPrice = currentPrice ? Number(currentPrice) / (10 ** (decimals || 18)) : 0  
  const totalEthCost = price * ethPrice 

  return (  
    <li className="course-card group relative overflow-hidden">  
      <div className="flex-between mb-4">  
        <p className="course-card_date text-dark-lighter">  
          {formatDate(_createdAt)}  
        </p>  
        <div className="flex items-center gap-1.5">  
          <UserPlus className="size-5 text-primary" />  
          <span className="text-16-medium group-hover:text-primary/60 transition-colors">  
            {views}  
          </span>  
        </div>  
      </div>  

      <Link href={`/course/${_id}`} className="block hover:text-primary transition-colors mb-4">  
        <h3 className="text-26-semibold line-clamp-1 text-dark-DEFAULT">  
          {name}  
        </h3>  
      </Link>  

      <Link href={`/course/${_id}`} className="block group mb-4">  
        <p className="course-card_desc mb-3">{description}</p>  
        <div className="relative">  
          <Image  
            src={image}  
            alt={name}  
            width={400}  
            height={200}  
            className="course-card_img group-hover:scale-105 transition-transform duration-300"  
          />  
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-[10px]"></div>  
        </div>  
      </Link>  

      <div className="flex justify-between items-center mt-4 mb-4">  
        <div className="text-primary-dark">  
          <span className="text-lg font-bold">{price} YD</span>  
          {currentPrice && (  
            <span className="text-sm ml-2 text-gray-500">  
              ≈ {formatNumber(totalEthCost)} ETH  
            </span>  
          )}  
        </div>  
      </div>  

      <div className="flex-between gap-4">  
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
            onClick={() => (document.getElementById(`modal_approve_${_id}`) as HTMLDialogElement).showModal()}  
          >  
            <AArrowUp className="h-4 w-4" />  
            <span>  
              {isPending ? 'Approving...' :   
               isConfirming ? 'Confirming...' :   
               'Approve'}  
            </span>  
          </ConfettiButton>  
        </Button>  

        <PurchaseCourseButton
          courseId={_id}
          price={price}
          title={name}
        />
      </div>  

      {/* Approve Modal */}  
      <dialog id={`modal_approve_${_id}`} className="modal">  
        <div className="modal-box">  
          <form method="dialog">  
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-primary-dark">✕</button>  
          </form>  
          <div className="text-white space-y-4">  
            <h3 className="font-bold text-lg">Approve YD Tokens</h3>  
            <div>  
              <div className="label">
                {currentPrice && (  
                  <span className="label-text-alt">  
                    Rate: 1 YD = {formatNumber(ethPrice)} ETH  
                  </span>  
                )}  
              </div>
              <div className={`input input-bordered flex items-center gap-2 ${isError ? 'input-error' : ''}`}>  
                <input  
                  type="number"  
                  className="grow text-gray-200"  
                  placeholder="0"  
                  value={approveAmount}  
                  onChange={(e) => {  
                    const value = e.target.value;  
                    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {  
                      setApproveAmount(value);  
                      setIsError(false);  
                      setErrorMessage('');  
                    }  
                  }}  
                  min={price}  
                  max={walletBalance}  
                  step="0.0001"
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
                    formatTokenBalance(walletBalance)  
                  )  
                } YD  
              </span>   
              <span className="label-text-alt">  
                Current Approval: {  
                  isAllowanceLoading || isConfirming ? (  // 添加 isConfirming 条件  
                    <span className="inline-block w-4 h-4 border-2 border-primary-light border-t-transparent rounded-full animate-spin ml-1" />  
                  ) : (  
                    formatTokenUnits(globalApprovedAmount || BigInt(0))  
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
    </li>  
  );  
};  

export const CourseCardSkeleton = () => (  
  <>  
    {[0, 1, 2, 3, 4].map((index: number) => (  
      <li  
        key={cn("skeleton", index)}  
        className="course-card_skeleton animate-pulse"  
      >  
        <Skeleton className="w-full h-full" />  
      </li>  
    ))}  
  </>  
);  

export default CourseCard;