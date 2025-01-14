'use client'  

import { useState, useEffect } from 'react';  
import { useAccount, usePublicClient } from 'wagmi';  
import { YDCOURSE_CONTRACT } from '@/app/abi/contractConfig';  

export interface Purchase {  
  courseId: bigint;  
  timestamp: bigint;  
  price: bigint;  
}  

export interface Course {  
  name: string;  
  price: bigint;  
  isActive: boolean;  
  description: string;  
}  

export interface PurchaseWithCourse extends Purchase {  
  course: Course;  
}  

export interface CourseStats {  
  totalCourses: number;  
  purchasedCourses: number;  
  allCourses: Course[];  
}  

export function usePurchaseHistory() {  
  const { address } = useAccount();  
  const publicClient = usePublicClient();  
  const [purchases, setPurchases] = useState<PurchaseWithCourse[]>([]);  
  const [courseStats, setCourseStats] = useState<CourseStats>({  
    totalCourses: 0,  
    purchasedCourses: 0,  
    allCourses: []  
  });  
  const [isLoading, setIsLoading] = useState(false);  
  const [error, setError] = useState<string | null>(null);  

  // 获取单个课程信息  
  const getCourseInfo = async (courseId: bigint): Promise<Course> => {  
    try {  
      const course = await publicClient.readContract({  
        address: YDCOURSE_CONTRACT.address,  
        abi: YDCOURSE_CONTRACT.abi,  
        functionName: 'getCourse',  
        args: [courseId],  
      }) as Course;  

      return course;  
    } catch (error) {  
      console.error(`Error fetching course ${courseId}:`, error);  
      throw error;  
    }  
  };  

  // 获取课程总数  
  const getCourseCount = async (): Promise<number> => {  
    try {  
      const count = await publicClient.readContract({  
        address: YDCOURSE_CONTRACT.address,  
        abi: YDCOURSE_CONTRACT.abi,  
        functionName: 'courseCount',  
      }) as bigint;  

      return Number(count);  
    } catch (error) {  
      console.error('Error fetching course count:', error);  
      throw error;  
    }  
  };  

  // 获取所有课程信息  
  const getAllCourses = async () => {  
    try {  
      const courseCount = await getCourseCount();  
      const courses: Course[] = [];  

      for (let i = 1; i <= courseCount; i++) {  
        const course = await getCourseInfo(BigInt(i));  
        courses.push(course);  
      }  

      return courses;  
    } catch (error) {  
      console.error('Error fetching all courses:', error);  
      throw error;  
    }  
  };  

  // 获取购买历史  
  const fetchPurchaseHistory = async () => {  
    if (!address) return;  

    setIsLoading(true);  
    setError(null);  

    try {  
      // 获取购买历史  
      const purchaseHistory = await publicClient.readContract({  
        address: YDCOURSE_CONTRACT.address,  
        abi: YDCOURSE_CONTRACT.abi,  
        functionName: 'getUserPurchases',  
        args: [address],  
      }) as Purchase[];  

      const purchasesWithCourses = await Promise.all(  
        purchaseHistory.map(async (purchase) => {  
          const course = await getCourseInfo(purchase.courseId);  
          return {  
            ...purchase,  
            course,  
          };  
        })  
      );  

      setPurchases(purchasesWithCourses);  

      // 获取课程统计信息  
      const totalCourses = await getCourseCount();  
      const allCourses = await getAllCourses();  

      setCourseStats({  
        totalCourses,  
        purchasedCourses: purchasesWithCourses.length,  
        allCourses  
      });  

    } catch (error: any) {  
      console.error('Error fetching data:', error);  
      setError(error.message);  
    } finally {  
      setIsLoading(false);  
    }  
  };  

  // 检查是否购买过特定课程  
  const hasPurchased = async (courseId: bigint): Promise<boolean> => {  
    if (!address) return false;  
    try {  
      return purchases.some(purchase =>   
        purchase.courseId.toString() === courseId.toString()  
      );  
    } catch (error) {  
      console.error('Error checking purchase status:', error);  
      return false;  
    }  
  };  

  useEffect(() => {  
    if (address) {  
      fetchPurchaseHistory();  
    } else {  
      setPurchases([]);  
      setCourseStats({  
        totalCourses: 0,  
        purchasedCourses: 0,  
        allCourses: []  
      });  
    }  
  }, [address]);  

  return {  
    purchases,  
    isLoading,  
    error,  
    fetchPurchaseHistory,  
    hasPurchased,  
    getCourseInfo,  
    courseStats,  
    getAllCourses,  
    getCourseCount  
  };  
}