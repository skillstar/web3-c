'use client'  
import CourseCard from "@/components/CourseCard"  
import { useCourses } from "@/hooks/useCourses"  
import { useTokenBalance } from "@/hooks/useTokenBalance"  
import { useAllowance } from "@/hooks/useAllowance"  
import { YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import { useAtom } from 'jotai'  
import { allowanceAtom, allowanceLoadingAtom } from '@/atoms/allowanceAtom'  

type CourseListProps = {  
  className?: string  
}  

const CourseList = ({ className = "" }: CourseListProps) => {  
  // 使用分离的 hooks  
  const {  
    courses,  
    isLoading: isCoursesLoading,  
  } = useCourses()  

  const {  
    balance: walletBalance,  
    isLoading: isBalanceLoading,  
  } = useTokenBalance()  

  // 使用 jotai 获取 allowance 状态  
  const [globalApprovedAmount] = useAtom(allowanceAtom)  
  const [isAllowanceLoading] = useAtom(allowanceLoadingAtom)  
  
  // 初始化 allowance  
  const { refetchAllowance } = useAllowance(YDCOURSE_CONTRACT.address as `0x${string}`)  

  // 合并课程加载状态和其他状态  
  const isDataLoading = isBalanceLoading || isAllowanceLoading  
 const isInitialLoading = isCoursesLoading  
  const isRefreshing = (!isCoursesLoading && (isBalanceLoading || isAllowanceLoading)) 
  
   return (  
    <div className={className}>  
      <h2 className="text-center text-3xl font-bold mb-4 mt-32 text-primary-light border-b-2 border-primary-light pb-2">  
        POPULAR COURSES  
      </h2>  
      <p className="text-center text-gray-500 text-sm mb-4">  
        Find the best courses tailored for you  
      </p>  
      
      {isInitialLoading ? (  
        <div className="flex justify-center items-center py-8">  
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light" />  
        </div>  
      ) : (  
        <ul className={`mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>  
          {courses && courses.length > 0 ? (  
            courses.map((course) => (  
              <CourseCard  
                key={course._id}  
                post={course}   
                walletBalance={Number(walletBalance) || 0}  
                onApproveSuccess={refetchAllowance}  
                isBalanceLoading={isBalanceLoading}   
              />  
            ))  
          ) : (  
            <p className="col-span-full text-center text-gray-500 py-8">  
              No courses found  
            </p>  
          )}  
        </ul>  
      )}  

      {/* 修改底部加载指示器的条件 */}  
      {isRefreshing && (  
        <div className="flex justify-center items-center py-4 mt-4">  
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-light border-t-transparent" />  
        </div>  
      )}  
    </div>  
  )  
}  
   

export default CourseList