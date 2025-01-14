// hooks/useCourses.ts  
import { useAccount, useReadContract, useReadContracts } from 'wagmi'  
import { YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import { useCallback, useMemo } from 'react'  
import { type Abi } from 'viem'  
import { CourseTypeCard } from "@/types"  

// 链上课程数据接口  
interface ChainCourse {  
  name: string  
  price: number  // 整数价格  
  isActive: boolean  
  description: string  
}  

// 扩展 CourseTypeCard 接口  
export interface CombinedCourse extends CourseTypeCard {  
  name: string  
  price: number  // 整数价格  
  isActive: boolean  
  description: string  
}  

export const DEFAULT_IMAGES = [  
  "https://i.seadn.io/gcs/files/6d5f2df1cb886b2b0cfb8231bcaceb75.jpg?auto=format&dpr=1&h=500&fr=1",  
  "https://i.seadn.io/s/raw/files/93365a2dd8e50ea072f0defa1295160d.jpg?auto=format&dpr=1&h=500&fr=1"  
]  

const CATEGORIES = [  
  "Web Development",  
  "Backend",  
  "Data Science",  
  "Design",  
  "Cloud Computing"  
]  

export function useCourses() {  
  const { isConnected } = useAccount()  

  // 读取课程总数  
  const {  
    data: courseCount,  
    isError: isCountError,  
    isLoading: isCountLoading,  
    refetch: refetchCourseCount  
  } = useReadContract({  
    address: YDCOURSE_CONTRACT.address as `0x${string}`,  
    abi: YDCOURSE_CONTRACT.abi as Abi,  
    functionName: 'courseCount'  
  })  

  // 构建课程请求  
  const courseRequests = useMemo(() => {  
    if (!courseCount) return []  
    return Array.from({ length: Number(courseCount) }, (_, i) => ({  
      address: YDCOURSE_CONTRACT.address as `0x${string}`,  
      abi: YDCOURSE_CONTRACT.abi as Abi,  
      functionName: 'getCourse',  
      args: [i + 1],  
    }))  
  }, [courseCount])  

  // 读取所有课程  
  const {  
    data: coursesData,  
    isLoading: isCoursesLoading,  
    isError: isCoursesError,  
    refetch: refetchCourses  
  } = useReadContracts({  
    contracts: courseRequests,  
  })  

  // 刷新课程列表  
  const refreshCourses = useCallback(async () => {  
    try {  
      await refetchCourseCount()  
      await refetchCourses()  
    } catch (error) {  
      console.error('Error refreshing courses:', error)  
    }  
  }, [refetchCourseCount, refetchCourses])  

  // 合并链上数据和UI数据  
  const courses = useMemo(() => {  
    if (!coursesData || !courseCount) {  
      return [] as CombinedCourse[]  
    }  

    return coursesData.reduce<CombinedCourse[]>((acc, result, index) => {  
      if (!result?.result) return acc  

      const courseData = result.result as ChainCourse  
      const courseId = (index + 1).toString()  

      const combinedCourse: CombinedCourse = {  
        _id: courseId,  
        _createdAt: new Date().toISOString(),  
        views: Math.floor(Math.random() * 100) + 1,  
        category: CATEGORIES[index % CATEGORIES.length],  
        image: DEFAULT_IMAGES[index % DEFAULT_IMAGES.length],  
        name: courseData.name,  
        price: Number(courseData.price), // 直接使用整数价格  
        isActive: courseData.isActive,  
        description: courseData.description  
      }  

      return [...acc, combinedCourse]  
    }, [])  
  }, [coursesData, courseCount])  

  // 获取单个课程  
  const getCourseById = useCallback((id: string): CombinedCourse | undefined => {  
    return courses.find(course => course._id === id)  
  }, [courses])  

  return {  
    courses,  
    courseCount: courseCount ? Number(courseCount) : 0,  
    isLoading: isCountLoading || isCoursesLoading,  
    isError: isCountError || isCoursesError,  
    isConnected,  
    refreshCourses,  
    getCourseById,  
  }  
}