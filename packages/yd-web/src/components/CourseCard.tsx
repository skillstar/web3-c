'use client'  
import { cn, formatDate } from "@/utils"  
import { UserPlus } from "lucide-react"  
import Link from "next/link"  
import Image from "next/image"  
import { Skeleton } from "@/app/components/ui/skeleton"  
import { CourseTypeCard } from "@/types"  
import { useReadContract } from 'wagmi'  
import { YDTOKEN_CONTRACT } from '@/app/abi/contractConfig'  
import { formatNumber } from '@/utils/shortenAddress'  
import { ApproveButton } from './ApproveBtn'  
import { PurchaseCourseButton } from './CourseBuyBtn'  

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
  const {  
    _createdAt,  
    views,  
    name,  
    _id,  
    image,  
    description,  
    price = 99 // YD tokens, 整数  
  } = post  

  // 获取当前 ETH 价格  
  const { data: currentPrice } = useReadContract({  
    address: YDTOKEN_CONTRACT.address,  
    abi: YDTOKEN_CONTRACT.abi,  
    functionName: 'getCurrentPrice',  
  }) as { data: bigint }  

  // 计算 ETH 价格  
  const ethPrice = currentPrice ? Number(currentPrice) : 0  
  const totalEthCost = price / 1000 // 将 YD 转换为 ETH  

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
        <ApproveButton  
          courseId={_id}  
          price={price}  
          walletBalance={walletBalance}  
          ethPrice={ethPrice}  
          isBalanceLoading={isBalanceLoading}  
          onSuccess={onApproveSuccess}  
        />  

        <PurchaseCourseButton  
          courseId={_id}  
          price={price}  
          title={name}  
        />  
      </div>  
    </li>  
  )  
}  

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
)  

export default CourseCard