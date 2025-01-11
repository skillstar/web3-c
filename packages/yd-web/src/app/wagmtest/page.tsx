'use client'  

import { useAccount, useReadContract, useReadContracts } from 'wagmi'  
import { YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import { useEffect, useState } from 'react'  
import { type Abi } from 'viem'  

interface CourseResponse {  
  name: string  
  price: bigint  
  isActive: boolean  
  description: string  
}  

interface Course {  
  id: number  
  name: string  
  price: bigint  
  isActive: boolean  
  description: string  
}  

interface Purchase {  
  courseId: bigint  
  timestamp: bigint  
  price: bigint  
}  

export default function TokenPage() {  
  const { address } = useAccount()  
  const [courseIds, setCourseIds] = useState<number[]>([])  

  // 读取课程总数  
  const { data: courseCount } = useReadContract({  
    address: YDCOURSE_CONTRACT.address as `0x${string}`,  
    abi: YDCOURSE_CONTRACT.abi as Abi,  
    functionName: 'courseCount',  
  })  

  // 生成课程 ID 数组  
  useEffect(() => {  
    if (courseCount) {  
      const count = Number(courseCount)  
      setCourseIds(Array.from({ length: count }, (_, i) => i + 1))  
    }  
  }, [courseCount])  

  // 使用 useReadContracts 一次性获取所有课程数据  
  const { data: coursesData, isLoading: isLoadingCourses } = useReadContracts({  
    contracts: courseIds.map(id => ({  
      address: YDCOURSE_CONTRACT.address as `0x${string}`,  
      abi: YDCOURSE_CONTRACT.abi as Abi,  
      functionName: 'getCourse',  
      args: [BigInt(id)] as const,  
    })),  
  })  

  // 读取用户购买记录  
  const { data: userPurchases } = useReadContract({  
    address: YDCOURSE_CONTRACT.address as `0x${string}`,  
    abi: YDCOURSE_CONTRACT.abi as Abi,  
    functionName: 'getUserPurchases',  
    args: address ? [address] : undefined,  
    enabled: !!address,  
  })  

  // 组合课程数据  
  const courses: Course[] = coursesData  
    ? coursesData  
        .map((courseData, index) => {  
          if (!courseData?.result) return null  
          const data = courseData.result as CourseResponse  
          return {  
            id: courseIds[index],  
            name: data.name,  
            price: data.price,  
            isActive: data.isActive,  
            description: data.description,  
          }  
        })  
        .filter((course): course is Course => course !== null)  
    : []  

  // 检查用户是否购买了某个课程  
  const hasPurchased = (courseId: number): boolean => {  
    if (!userPurchases) return false  
    return (userPurchases as Purchase[]).some(  
      (purchase: Purchase) => Number(purchase.courseId) === courseId  
    )  
  }  

  // 格式化价格显示  
  const formatPrice = (price: bigint): string => {  
    return (Number(price) / (10 ** 18)).toString()  
  }  

  return (  
    <div className="p-6 max-w-7xl mx-auto">  
      <div className="mb-8">  
        <h1 className="text-3xl font-bold mb-2">Course Platform</h1>  
        <p className="text-gray-600">Total Courses: {courseCount?.toString() || '0'}</p>  
      </div>  

      {/* 加载状态 */}  
      {isLoadingCourses && (  
        <div className="text-center py-8">  
          <p className="text-gray-600">Loading courses...</p>  
        </div>  
      )}  

      {/* 课程列表 */}  
      {!isLoadingCourses && courses.length > 0 && (  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
          {courses.map((course: Course) => (  
            <div   
              key={course.id}   
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"  
            >  
              <div className="p-4">  
                <div className="flex justify-between items-start mb-2">  
                  <h2 className="text-xl font-semibold">{course.name}</h2>  
                  <span className={`px-2 py-1 rounded text-sm ${  
                    course.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'  
                  }`}>  
                    {course.isActive ? 'Active' : 'Inactive'}  
                  </span>  
                </div>  
                
                <p className="text-gray-600 mb-4 line-clamp-2">  
                  {course.description}  
                </p>  

                <div className="flex justify-between items-center">  
                  <span className="text-lg font-medium">  
                    {formatPrice(course.price)} YD  
                  </span>  
                  {hasPurchased(course.id) ? (  
                    <span className="text-green-600 font-medium">  
                      ✓ Purchased  
                    </span>  
                  ) : (  
                    <button   
                      className={`px-4 py-2 rounded-full ${  
                        course.isActive   
                          ? 'bg-blue-600 text-white hover:bg-blue-700'   
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'  
                      }`}  
                      disabled={!course.isActive}  
                    >  
                      Buy Now  
                    </button>  
                  )}  
                </div>  
              </div>  
            </div>  
          ))}  
        </div>  
      )}  

      {/* 空状态 */}  
      {!isLoadingCourses && courses.length === 0 && (  
        <div className="text-center py-8">  
          <p className="text-gray-600">No courses available</p>  
        </div>  
      )}  

      {/* 用户购买记录 */}  
      {address && userPurchases && (userPurchases as Purchase[]).length > 0 && (  
        <div className="mt-12">  
          <h2 className="text-2xl font-bold mb-4">Your Purchases</h2>  
          <div className="space-y-4">  
            {(userPurchases as Purchase[]).map((purchase: Purchase, index: number) => {  
              const course = courses.find(c => c.id === Number(purchase.courseId))  
              return (  
                <div key={index} className="border rounded-lg p-4">  
                  <div className="flex justify-between items-start">  
                    <div>  
                      <h3 className="text-lg font-medium">  
                        {course?.name || `Course #${purchase.courseId.toString()}`}  
                      </h3>  
                      <p className="text-gray-600">  
                        Purchased on: {new Date(Number(purchase.timestamp) * 1000).toLocaleString()}  
                      </p>  
                    </div>  
                    <span className="text-lg font-medium">  
                      {formatPrice(purchase.price)} YD  
                    </span>  
                  </div>  
                </div>  
              )  
            })}  
          </div>  
        </div>  
      )}  

      {!address && (  
        <div className="mt-8 text-center p-6 bg-gray-50 rounded-lg">  
          <p className="text-gray-600">  
            Connect your wallet to view your purchased courses and make new purchases  
          </p>  
        </div>  
      )}  
    </div>  
  )  
}