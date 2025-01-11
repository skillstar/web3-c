'use client'   
import CourseCard from "@/components/CourseCard";  
import { CourseTypeCard } from "@/types";  
import { mockCourses } from "@/mock/courseMockData";  
import { useReadContract, useAccount } from 'wagmi'  
import { YDTOKEN_CONTRACT, YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  

type CourseListProps = {  
  className?: string;  
};  

const CourseList = ({ className = "" }: CourseListProps) => {  
  const { address } = useAccount();  
  
  // 获取代币余额  
  const { data: balanceData } = useReadContract({  
    address: YDTOKEN_CONTRACT.address,  
    abi: YDTOKEN_CONTRACT.abi,  
    functionName: 'balanceOf',  
    args: address ? [address] : undefined,  
  })  

  // 获取授权额度  
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({  
    address: YDTOKEN_CONTRACT.address,  
    abi: YDTOKEN_CONTRACT.abi,  
    functionName: 'allowance',  
    args: address ? [address, YDCOURSE_CONTRACT.address] : undefined,  
  })  

  // 转换余额和授权额度为数字  
  const walletBalance = balanceData ? Number(balanceData) : 0;  
  const globalApprovedAmount = allowanceData ? Number(allowanceData) : 0;  

  return (  
    <div className={className}>  
      <h2 className="text-center text-3xl font-bold mb-4 mt-32 text-primary-light border-b-2 border-primary-light pb-2">  
        POPULAR COURSES  
      </h2>  
      <p className="text-center text-gray-500 text-sm mb-4">  
        Find the best courses tailored for you  
      </p>  
      <ul  
        className={`mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}  
      >  
        {mockCourses?.length > 0 ? (  
          mockCourses.map((post: CourseTypeCard) => (  
            <CourseCard   
              key={post._id}   
              post={post}   
              globalApprovedAmount={globalApprovedAmount}  
              walletBalance={walletBalance}  
              onApproveSuccess={refetchAllowance}  
            />  
          ))  
        ) : (  
          <p className="col-span-full text-center text-gray-500 py-8">  
            No courses found  
          </p>  
        )}  
      </ul>  
    </div>  
  );  
};  

export default CourseList;