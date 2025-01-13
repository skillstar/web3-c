'use client'  

import { useAccount, useReadContract, useReadContracts } from 'wagmi'  
import { YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import { useEffect, useMemo, useState, useCallback } from 'react'  
import { type Abi } from 'viem'  
import { Loader2 } from 'lucide-react'  
import AddCourse from '@/components/cm/CourseFormData'
import EditCourse from '@/components/cm/EditCourse'

interface Course {  
  name: string  
  price: bigint  
  isActive: boolean  
  description: string  
}  

interface CourseWithId extends Course {  
  id: number  
}  

export default function CourseManagement() {  
  const { isConnected } = useAccount()  
  // 添加交易处理状态  
  const [isTransactionPending, setIsTransactionPending] = useState(false) 
  // 读取课程总数  
  const {   
    data: courseCount,   
    isError: isCountError,   
    isLoading: isCountLoading,  
    refetch: refetchCourseCount   // 添加 refetch 方法  
  } = useReadContract({  
    address: YDCOURSE_CONTRACT.address as `0x${string}`,  
    abi: YDCOURSE_CONTRACT.abi as Abi,  
    functionName: 'courseCount'  
  })  

  // 构建课程请求  
  const courseRequests = useMemo(() => {  
    if (!courseCount) return []  
    console.log('Building course requests for count:', courseCount)  
    return Array.from({ length: Number(courseCount) }, (_, i) => ({  
      address: YDCOURSE_CONTRACT.address as `0x${string}`,  
      abi: YDCOURSE_CONTRACT.abi as Abi,  
      functionName: 'getCourse',  
      args: [BigInt(i + 1)],  
    }))  
  }, [courseCount])  

  // 读取所有课程  
  const {   
    data: coursesData,   
    isLoading: isCoursesLoading,   
    isError: isCoursesError,  
    refetch: refetchCourses    // 添加 refetch 方法  
  } = useReadContracts({  
    contracts: courseRequests,  
  })  
// 刷新课程列表的回调函数  
  const refreshCourses = useCallback(async () => {  
    console.log('Refreshing courses...')  
    try {  
      // 先刷新课程总数  
      await refetchCourseCount()  
      // 然后刷新课程列表  
      await refetchCourses()  
      console.log('Courses refreshed successfully')  
    } catch (error) {  
      console.error('Error refreshing courses:', error)  
    }  
  }, [refetchCourseCount, refetchCourses])  
  // 处理课程数据  
  const courses = useMemo(() => {  
    if (!coursesData || !courseCount) {  
      console.log('No courses data or count')  
      return []  
    }  

    return coursesData  
      .map((result, index) => {  
        if (!result?.result) {  
          console.log(`No result for course ${index + 1}`)  
          return null  
        }  

        const courseData = result.result as Course  
        console.log(`Course ${index + 1} data:`, courseData)  

        return {  
          id: index + 1,  
          ...courseData  
        }  
      })  
      .filter((course): course is CourseWithId => course !== null)  
  }, [coursesData, courseCount])  

  // 调试日志  
  useEffect(() => {  
    console.log('Contract Address:', YDCOURSE_CONTRACT.address)  
    console.log('Contract ABI:', YDCOURSE_CONTRACT.abi)  
  }, [])  

  useEffect(() => {  
    console.log('Course Count Raw:', courseCount)  
    console.log('Course Count Number:', courseCount ? Number(courseCount) : 0)  
  }, [courseCount])  

  useEffect(() => {  
    console.log('Course Requests:', courseRequests)  
  }, [courseRequests])  

  useEffect(() => {  
    console.log('Courses Raw Data:', coursesData)  
  }, [coursesData])  

  // 检查连接状态  
  if (!isConnected) {  
    return (  
      <div className="flex items-center justify-center min-h-screen">  
        <p className="text-red-500">请先连接钱包</p>  
      </div>  
    )  
  }  

  // 检查错误状态  
  if (isCountError || isCoursesError) {  
    return (  
      <div className="flex items-center justify-center min-h-screen">  
        <p className="text-red-500">加载失败，请检查网络连接后刷新页面</p>  
      </div>  
    )  
  }  

return (  
    <div className="container mx-auto p-4">  
      <div className="flex justify-between items-center mb-6">  
        <div>  
          <h1 className="text-2xl font-bold">课程管理</h1>  
          <p className="text-sm text-gray-500">  
            总课程数: {courseCount ? Number(courseCount).toString() : '加载中...'}  
          </p>  
        </div>  
        <AddCourse   
          onRefreshCourses={refreshCourses}  
          onTransactionStatusChange={setIsTransactionPending}   
        />  
      </div>  

      {/* 初始加载时显示加载状态 */}  
      {(isCountLoading || isCoursesLoading) && !courses.length ? (  
        <div className="flex items-center justify-center py-8">  
          <Loader2 className="animate-spin" size={48} />  
          <p className="ml-2">加载中...</p>  
        </div>  
      ) : courses.length > 0 ? (  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  
          {/* 课程列表 */}  
          {courses.map((course) => (  
            <div key={course.id} className="border rounded-lg p-4 shadow-sm">  
              <div className="flex justify-between items-start mb-2">  
                <h3 className="text-lg font-semibold">{course.name}</h3>  
                <EditCourse   
                  course={course}   
                  onRefreshCourses={refreshCourses} 
                />   
              </div>  
              <p className="text-gray-600 mb-2">{course.description}</p>  
              <p className="text-blue-600 font-semibold">  
                价格: {course.price.toString()} YD  
              </p>  
              <div className="flex items-center mt-2">  
                <span className={`px-2 py-1 rounded-full text-sm ${  
                  course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'  
                }`}>  
                  {course.isActive ? '已激活' : '未激活'}  
                </span>  
              </div>  
            </div>  
          ))}  
        </div>  
      ) : (  
        <div className="text-center py-8">  
          <p className="text-gray-500">暂无课程数据</p>  
        </div>  
      )}  

      {/* 交易处理或数据更新时的加载提示 */}  
      {(isTransactionPending || (isCoursesLoading && courses.length > 0)) && (  
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-2 text-blue-600">  
          <Loader2 className="animate-spin" size={20} />  
          <span className="text-sm font-medium">  
            {isTransactionPending ? '交易处理中...' : '更新数据中...'}  
          </span>  
        </div>  
      )}  
    </div>  
)
}