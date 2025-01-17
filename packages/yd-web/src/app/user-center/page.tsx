"use client";  
import { JotaiProvider } from '@/components/common/ClientProviders';  
import { useEffect, useState } from "react"; 
import { useNFTData } from '@/hooks/useNFTData'   
import { useAccount } from 'wagmi'   
import UserProfile from "@/components/uc/UserProfile";  
import TabView from "@/components/uc/TabView";  
import Header from "@/app/components/header";  
import Footer from "@/app/components/Footer";  
import { UserData } from '@/types'  
import UserCenterSkeleton from '@/components/uc/UserCenterSkeleton'

export default function UserCenterPage() {  
  const [userData, setUserData] = useState<UserData | null>(null);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState<string | null>(null);  

  // 模拟数据  
  const mockData: UserData = {  
    user: {  
      username: "Unnamed",  
      walletAddress: "0x123...ABC",  
      joinedAt: "2025-01-10",  
      totalLearningHours: 2773,  
      totalPoints: 388,  
      nftAvatar: "/default-avatar.png",  
    },  
    courses: [  
      { courseId: 1, name: "React Fundamentals: From Beginner to Pro Development", progress: 30 },  
      { courseId: 2, name: "Next.js 14 Comprehensive Guide，Full-Stack Web Development with Next.js", progress: 50 },  
    ],  
    history: [  
      {  
        date: '2024-01-15',  
        type: 'course-completed',  
        courseTitle: 'React Fundamentals',  
        miningReward: 2.5  
      },  
      {  
        date: '2024-01-16',  
        type: 'note-published',  
        miningReward: 1.2  
      },  
      {  
        date: '2024-01-17',  
        type: 'quiz-passed',  
        quizTitle: 'Next.js Advanced',  
        miningReward: 1.8  
      }  
    ],  
  };  

  // 使用 useEffect 来设置数据  
  useEffect(() => {  
    // 模拟API调用  
    const fetchData = async () => {  
      try {  
        setLoading(true);  
        // 这里可以替换为实际的API调用  
        // const response = await fetch('/api/user-data');  
        // const data = await response.json();  
        
        // 使用模拟数据  
        setUserData(mockData);  
        setError(null);  
      } catch (err) {  
        setError(err instanceof Error ? err.message : 'An error occurred');  
      } finally {  
        setLoading(false);  
      }  
    };  

    fetchData();  
  }, []); // 空依赖数组意味着这个效果只在组件挂载时运行一次  
 const { refreshNFTData } = useNFTData()  
  const { address } = useAccount()  

  // 当地址存在时初始化 NFT 数据  
  useEffect(() => {  
    if (address) {  
      refreshNFTData()  
    }  
  }, [address]) // 当地址改变时重新加载  


  // 加载状态  
  if (loading) {  
    return <div className="min-h-screen bg-black pt-20 flex items-center justify-center">  
      <div className="text-white">Loading...</div>  
    </div>;  
  }  

  // 错误状态  
  if (error) {  
    return <div className="min-h-screen bg-black pt-20 flex items-center justify-center">  
      <div className="text-red-500">Error: {error}</div>  
    </div>;  
  }  

  // 如果没有数据  
  if (!userData) {  
    return <div className="min-h-screen bg-black pt-20 flex items-center justify-center">  
      <div className="text-white">No data available</div>  
    </div>;  
  }  

  return (  
     <JotaiProvider>  
    <div className="min-h-screen bg-black pt-20">  
      <Header />  
      
      <main className="container mx-auto px-4 py-8">  
        <div className="mb-8">  
          <UserProfile user={userData.user} />  
        </div>  
        
        <div className="rounded-lg shadow-lg p-6">  
          <TabView  
            history={userData.history}  
          />  
        </div>  
      </main>  

      <Footer />  
    </div>  
    </JotaiProvider>
  );  
}