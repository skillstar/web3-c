'use client'  

import { cn, formatDate } from "@/utils";  
import { UserPlus, ShoppingBasket, AArrowUp } from "lucide-react";  
import Link from "next/link";  
import Image from "next/image";  
import { Button } from "@/app/components/ui/button";  
import { Skeleton } from "@/app/components/ui/skeleton";  
import { CourseTypeCard } from "@/types";  
import ConfettiButton from "@/app/components/ui/ConfettiButton";  
import { useState, useEffect } from "react";  
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'  
import { YDTOKEN_CONTRACT, YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import {formatTokenAmount, formatNumber } from '@/utils/shortenAddress'

interface CourseCardProps {  
  post: CourseTypeCard;  
  globalApprovedAmount: number;  
  walletBalance: number;  
  onApproveSuccess: () => void;  
}  

const CourseCard = ({  
  post,  
  globalApprovedAmount,  
  walletBalance,  
  onApproveSuccess  
}: CourseCardProps) => {  
  const {  
    _createdAt,  
    views,  
    title,  
    category,  
    _id,  
    image,  
    description,  
    price = 99 // YD tokens  
  } = post;  

  const [approveAmount, setApproveAmount] = useState('');  
  const [buyModalType, setBuyModalType] = useState<'none' | 'insufficient-approve' | 'already-purchased' | 'success' | 'error'>('none'); 
  const [isError, setIsError] = useState(false);  
  const [errorMessage, setErrorMessage] = useState('');  

    // 获取代币当前价格并指定类型 
    const { data: decimals } = useReadContract({  
      address: YDTOKEN_CONTRACT.address,  
      abi: YDTOKEN_CONTRACT.abi,  
      functionName: 'decimals',  
    }) as { data: number };  
    // 获取代币价格  
      const { data: currentPrice } = useReadContract({  
        address: YDTOKEN_CONTRACT.address,  
        abi: YDTOKEN_CONTRACT.abi,  
        functionName: 'getCurrentPrice',  
      }) as { data: bigint }; 

      // 添加新的合约读取hook
      const { address } = useAccount()   
      const { data: userPurchases } = useReadContract({  
        address: YDCOURSE_CONTRACT.address,  
        abi: YDCOURSE_CONTRACT.abi,  
        functionName: 'getUserPurchases',  
        args: [address ?? '0x0'], // 添加空地址作为默认值   
      }) as { data: Array<{ courseId: bigint, timestamp: bigint, price: bigint }> };   


// 添加代币精度转换函数  
const toTokenAmount = (amount: number) => {  
  const tokenDecimals = decimals || 18;  
  return BigInt(Math.floor(amount * 10 ** tokenDecimals));  
};  

const fromTokenAmount = (amount: bigint) => {  
  const tokenDecimals = decimals || 18;  
  return Number(amount) / (10 ** tokenDecimals);  
}; 

  // 合约写入相关  
  const { writeContract } = useWriteContract()  
  const { data: hash, isPending, error } = useWriteContract()  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =   
    useWaitForTransactionReceipt({  
      hash,  
    })  

 const handleMaxClick = () => {  
  setIsError(false);  
  setErrorMessage('');  
  // 使用较大值确保满足最低授权要求  
  const maxAmount = Math.max(price, Math.min(walletBalance, price));  
  setApproveAmount(maxAmount.toString());  
};  

   const handleApprove = async () => {  
  const inputAmount = parseFloat(approveAmount || '0');  
  
  // 验证输入  
  if (isNaN(inputAmount) || inputAmount <= 0) {  
    setIsError(true);  
    setErrorMessage('Please enter a valid amount');  
    return;  
  }  

  // 验证钱包余额  
  if (inputAmount > walletBalance) {  
    setIsError(true);  
    setErrorMessage(`Insufficient wallet balance. Max available: ${walletBalance} YD`);  
    return;  
  }  

  // 验证最低授权金额  
  if (inputAmount < price) {  
    setIsError(true);  
    setErrorMessage(`Approved amount must be at least ${price} YD`);  
    return;  
  }  

  try {  
    // 转换为代币精度  
    const amountInWei = toTokenAmount(inputAmount);  
    
    await writeContract({  
      address: YDTOKEN_CONTRACT.address,  
      abi: YDTOKEN_CONTRACT.abi,  
      functionName: 'approve',  
      args: [YDCOURSE_CONTRACT.address, amountInWei],  
    });  
  } catch (err) {  
    console.error('授权失败:', err);  
    setIsError(true);  
    setErrorMessage(err instanceof Error ? err.message : 'Approval failed. Please try again.');  
  }  
};  

const handleBuy = async () => {  
  // 首先检查是否已购买  
  if (hasUserPurchased()) {  
    setIsError(true);  
    setErrorMessage('You have already purchased this course');  
    setBuyModalType('already-purchased');  
    (document.getElementById(`modal_buy_${_id}`) as HTMLDialogElement)?.showModal();  
    return;  
  }  

  // 检查授权额度  
  if (globalApprovedAmount < price) {  
    setBuyModalType('insufficient-approve');  
    (document.getElementById(`modal_buy_${_id}`) as HTMLDialogElement)?.showModal();  
    return;  
  }  

  try {  
    writeContract({  
      address: YDCOURSE_CONTRACT.address,  
      abi: YDCOURSE_CONTRACT.abi,  
      functionName: 'purchaseCourse',  
      args: [_id],  
    });  
  } catch (err) {  
    console.error('购买失败:', err);  
    setBuyModalType('error');  
    setIsError(true);  
    setErrorMessage(err instanceof Error ? err.message : 'Purchase failed. Please try again.');  
    (document.getElementById(`modal_buy_${_id}`) as HTMLDialogElement)?.showModal();  
  }  
};

// 添加一个检查函数  
const hasUserPurchased = () => {  
  if (!userPurchases) return false;  
  return userPurchases.some(purchase =>   
   purchase.courseId === BigInt(_id)  
  );  
}; 

  // 监听交易确认  
 useEffect(() => {  
    if (isConfirmed) {  
      setBuyModalType('success');  
      (document.getElementById(`modal_buy_${_id}`) as HTMLDialogElement)?.showModal();  
      onApproveSuccess?.();  
    }  
  }, [isConfirmed, _id, onApproveSuccess]);  
  // 添加useEffect来监听交易确认  
  useEffect(() => {  
    if (isConfirmed) {  
      setBuyModalType('success');  
      (document.getElementById(`modal_buy_${_id}`) as HTMLDialogElement)?.showModal();  
    }  
  }, [isConfirmed]);  
  // 计算ETH价格  
 const ethPrice = currentPrice ? Number(currentPrice) / (10 ** (decimals || 18)) : 0;  
  const totalEthCost = price * ethPrice;  

  return (  
    <li className="course-card group relative overflow-hidden">  
      {/* 课程卡片主体部分保持不变 */}  
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
          {title}  
        </h3>  
      </Link>  

      {/* 课程描述和图片部分保持不变 */}  
      <Link href={`/course/${_id}`} className="block group mb-4">  
        <p className="course-card_desc mb-3">{description}</p>  
        <div className="relative">  
          <Image  
            src={image}  
            alt={title}  
            width={400}  
            height={200}  
            className="course-card_img group-hover:scale-105 transition-transform duration-300"  
          />  
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-[10px]"></div>  
        </div>  
      </Link>  

      {/* 价格显示 */}  
      <div className="flex justify-between items-center mt-4 mb-4">  
        <div className="text-primary-dark">  
          <span className="text-lg font-bold">{price} YD</span>  
          {currentPrice && (  
            <span className="text-sm ml-2 text-gray-500">  
              ≈ { formatNumber(totalEthCost)} ETH  
            </span>  
          )}  
        </div>  
      </div>  

      {/* 操作按钮 */}  
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

    <Button   
      className="course-card_btn group/button flex-1"  
      disabled={globalApprovedAmount < price || isPending || isConfirming}  
      asChild  
    >  
      <ConfettiButton  
        className={cn(  
          "flex items-center justify-center gap-2 px-4 py-2 rounded-full w-full",  
          globalApprovedAmount < price || isPending || isConfirming  
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"  
            : "bg-black text-white hover:bg-primary-dark"  
        )}  
        onClick={handleBuy}  
        confettiText="Bought!"  
      >  
        <ShoppingBasket className="h-4 w-4" />  
        <span>  
          {isPending ? 'Processing...' :   
          isConfirming ? 'Confirming...' :   
          'Buy'}  
        </span>  
      </ConfettiButton>  
    </Button>  
      </div>  

      {/* Approve 模态框 */}  
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
                      // 允许空值和有效数字  
                      if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {  
                        setApproveAmount(value);  
                        setIsError(false);  
                        setErrorMessage('');  
                      }  
                    }}  
                    min={price}  
                    max={walletBalance}  
                    step="1" // 如果代币没有小数位，使用整数步进  
                  />   
                <button  
                  className="badge bg-primary-dark hover:bg-primary-light text-white hover:text-gray-500"  
                  onClick={handleMaxClick}  
                  type="button" // 防止表单提交  
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
                <span className="label-text-alt">Wallet Balance: {walletBalance} YD</span> 
                <span className="label-text-alt">Current Approval: {formatTokenAmount(globalApprovedAmount)} YD</span>  
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
                    {isPending ? 'Approving...' :  
                     isConfirming ? 'Confirming...' :  
                     'Approve'}  
                  </span>  
                </ConfettiButton>  
              </Button>  
            </div>  
          </div>  
        </div>  
      </dialog>  

     {/* Buy 模态框 */}  
      <dialog id={`modal_buy_${_id}`} className="modal">  
        <div className="modal-box">  
          <form method="dialog">  
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-primary-light">✕</button>  
          </form>  

          {buyModalType === 'already-purchased' && (  
            <div className="text-center">  
              <h3 className="font-bold text-lg text-yellow-500">Already Purchased</h3>  
              <p className="py-4 text-gray-300">  
                You have already purchased this course. You can access it in your learning dashboard.  
              </p>  
            </div>  
          )}  

          {buyModalType === 'insufficient-approve' && (  
            <div className="text-center">  
              <h3 className="font-bold text-lg text-state-error">Insufficient Approval</h3>  
              <p className="py-4 text-gray-300">  
                Your approved amount of {approveAmount} YD is less than the course price of {price} YD.  
                Please re-approve a higher amount.  
              </p>  
            </div>  
          )}  

          {buyModalType === 'success' && (  
            <div className="text-center">  
              <h3 className="font-bold text-lg text-primary-dark">Purchase Successful</h3>  
              <p className="py-4 text-gray-300">  
                You have successfully purchased the course: {title}  
              </p>  
              <p className="text-gray-300">  
                Amount deducted: {price} YD  
              </p>  
            </div>  
          )}  

          {buyModalType === 'error' && (  
            <div className="text-center">  
              <h3 className="font-bold text-lg text-red-500">Purchase Failed</h3>  
              <p className="py-4 text-gray-300">  
                {errorMessage}  
              </p>  
            </div>  
          )}  
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