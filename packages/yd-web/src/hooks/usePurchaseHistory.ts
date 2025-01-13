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

export function usePurchaseHistory() {  
  const { address } = useAccount();  
  const publicClient = usePublicClient();  
  const [purchases, setPurchases] = useState<PurchaseWithCourse[]>([]);  
  const [isLoading, setIsLoading] = useState(false);  
  const [error, setError] = useState<string | null>(null);  

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

  const fetchPurchaseHistory = async () => {  
    if (!address) return;  

    setIsLoading(true);  
    setError(null);  

    try {  
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
    } catch (error: any) {  
      console.error('Error fetching purchase history:', error);  
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
    }  
  }, [address]);  

  return {  
    purchases,  
    isLoading,  
    error,  
    fetchPurchaseHistory,  
    hasPurchased,  
    getCourseInfo  
  };  
}