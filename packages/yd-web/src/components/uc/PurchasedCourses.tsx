"use client";  
import { DEFAULT_IMAGES } from '@/hooks/useCourses';  
import { PurchaseWithCourse } from '@/hooks/usePurchaseHistory';  
import { useState, useEffect } from 'react'  
import PurchasedCoursesSkeleton from './PurchasedCoursesSkeleton'
import {  
  BookOpen,  
  Clock,  
  DollarSign,  
  XCircle  
} from "lucide-react";  
import CourseModal from './CourseModal';  

// 添加课程接口  
interface SelectedCourse {  
  id: string;  
  name: string;  
  videoUrl: string;  
}  

interface PurchasedCoursesProps {  
  purchases: PurchaseWithCourse[];  
  isLoading: boolean;  
  error: string | null;  
} 

const formatTimestamp = (timestamp: bigint): string => {  
  const date = new Date(Number(timestamp) * 1000);  
  return date.toLocaleString('en-US', {  
    year: 'numeric',  
    month: 'short',  
    day: 'numeric',  
    hour: '2-digit',  
    minute: '2-digit',  
    second: '2-digit',  
    hour12: true  
  });  
};

// 获取课程进度的函数  
const getCourseProgress = (courseId: string): number => {  
  try {  
    const progress = localStorage.getItem(`course-${courseId}-progress`);  
    return progress ? parseInt(progress, 10) : 0;  
  } catch (error) {  
    console.error('Error reading course progress:', error);  
    return 0;  
  }  
}; 

export default function PurchasedCourses({  
  purchases,  
  isLoading,  
  error  
}: PurchasedCoursesProps) {  
   const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null);  
   // 添加课程进度状态  
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});  

    // 监听 localStorage 变化  
 useEffect(() => {  
  // 初始化所有课程的进度  
  const initProgress = () => {  
    const progress: Record<string, number> = {};  
    purchases.forEach(purchase => {  
      const courseId = purchase.courseId.toString();  
      progress[courseId] = getCourseProgress(courseId);  
    });  
    setCourseProgress(progress);  
  };  

  // 处理存储变化  
  const handleStorageChange = (e: StorageEvent) => {  
    const courseId = e.key?.split('-')[1];  
    const newValue = e.newValue;  

    if (courseId && newValue && e.key?.includes('-progress')) {  
      const progress = parseInt(newValue, 10);  
      if (!isNaN(progress)) {  
        setCourseProgress(prev => ({  
          ...prev,  
          [courseId]: progress  
        }));  
      }  
    }  
  };  

  // 初始化进度  
  initProgress();  

  // 添加存储事件监听器  
  window.addEventListener('storage', handleStorageChange);  

  // 清理函数  
  return () => {  
    window.removeEventListener('storage', handleStorageChange);  
  };  
}, [purchases]);

  // 处理课程选择  
  const handleCourseSelect = (purchase: PurchaseWithCourse) => {  
    const courseId = purchase.courseId.toString();  
    setSelectedCourse({  
      id: courseId,  
      name: purchase.course.name,  
      videoUrl: `/videos/course${courseId}.mp4`  
    });  
  };  

  // 处理模态框关闭  
  const handleModalClose = () => {  
    if (selectedCourse) {  
      const progress = getCourseProgress(selectedCourse.id);  
      setCourseProgress(prev => ({  
        ...prev,  
        [selectedCourse.id]: progress  
      }));  
    }  
    setSelectedCourse(null);  
  }; 

 if (isLoading) {  
  return <PurchasedCoursesSkeleton />;  
} 

  if (error) {  
    return (  
      <div className="flex items-center justify-center min-h-[200px]">  
        <div className="text-error flex items-center gap-2">  
          <XCircle className="h-5 w-5" />  
          <span>{error}</span>  
        </div>  
      </div>  
    );  
  }  

  if (!purchases.length) {  
    return (  
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">  
        <BookOpen className="h-16 w-16 text-base-300" />  
        <p className="text-base-300">No courses purchased yet</p>  
        <button className="btn btn-outline">  
          Browse Courses  
        </button>  
      </div>  
    );  
  }  



  return ( 
    <>  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">  
        {purchases.map((purchase, index) => {  
          const courseId = purchase.courseId.toString();  
          const progress = courseProgress[courseId] || 0;  

          return (  
            <div  
              key={courseId}  
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group"  
            >  
              <figure className="relative overflow-hidden">  
                <img  
                  src={DEFAULT_IMAGES[index % DEFAULT_IMAGES.length]}  
                  alt={purchase.course.name}  
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"  
                />  
                <div className="absolute top-2 right-2">  
                  <div className={`badge ${  
                    purchase.course.isActive  
                      ? 'badge-success'  
                      : 'badge-error'  
                  }`}>  
                    {purchase.course.isActive ? 'Active' : 'Inactive'}  
                  </div>  
                </div>  
              </figure>  

              <div className="card-body">  
                <h3 className="card-title text-lg">  
                  {purchase.course.name}  
                </h3>  
                
                <p className="text-base-content/70 text-sm line-clamp-2">  
                  {purchase.course.description}  
                </p>  

                <div className="space-y-2 my-4">  
                  <div className="flex justify-between text-sm">  
                    <span className="text-base-content/70">Progress</span>  
                    <span className="font-medium">{progress}%</span>  
                  </div>  
                  <progress  
                    className="progress progress-primary w-full"  
                    value={progress}  
                    max="100"  
                  ></progress>  
                </div>  

                <div className="flex flex-col gap-2 text-sm">  
                  <div className="flex items-center gap-2 text-base-content/70">  
                    <Clock size={20} />  
                    <span>{formatTimestamp(purchase.timestamp)}</span>  
                  </div>  
                  <div className="flex items-center gap-2 text-base-content/70">  
                    <span>Cost: </span>  
                    <span className="text-primary font-medium">{purchase.price.toString()} YD</span>  
                  </div>  
                </div>  

                <div className="card-actions justify-end mt-4">  
                  <button  
                    className="btn btn-outline btn-circle hover:bg-primary-light"  
                    onClick={() => {  
                      console.log('View details:', courseId);  
                    }}  
                  >  
                    <BookOpen className="h-4 w-4" />  
                  </button>  
                  <button  
                    className="btn btn-primary flex-1"  
                    onClick={() => handleCourseSelect(purchase)}  
                  >  
                    Continue Learning  
                  </button>  
                </div>  
              </div>  
            </div>  
          );  
        })}  
      </div>  

      {selectedCourse && (  
        <CourseModal  
          key={selectedCourse.id}  
          isOpen={true}  
          onClose={handleModalClose}  
          courseId={selectedCourse.id}  
          courseName={selectedCourse.name}  
          videoUrl={selectedCourse.videoUrl}  
        />  
      )}  
    </>  
  );  
}