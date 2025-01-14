"use client";  
import { useState, useRef, useEffect } from 'react';  
import { Play, Award, X } from 'lucide-react';  

interface CourseModalProps {  
  isOpen: boolean;  
  onClose: () => void;  
  courseId: string;  
  courseName: string;  
  videoUrl: string;  
}  

// 存储键管理  
const getStorageKeys = (courseId: string) => ({  
  progress: `course-${courseId}-progress`,  
  position: `course-${courseId}-position`,  
  watchTime: `course-${courseId}-watch-time`  
});  

// 视频进度接口  
interface VideoProgress {  
  currentTime: number;  
  duration: number;  
  percentage: number;  
}  

export default function CourseModal({  
  isOpen,  
  onClose,  
  courseId,  
  courseName,  
  videoUrl  
}: CourseModalProps) {  
  const videoRef = useRef<HTMLVideoElement>(null);  
  const [isPlaying, setIsPlaying] = useState(false);  
  const [isLoading, setIsLoading] = useState(true);  
  const [error, setError] = useState<string | null>(null);  
  const [videoProgress, setVideoProgress] = useState<VideoProgress>({  
    currentTime: 0,  
    duration: 0,  
    percentage: 0  
  });  

  const storageKeys = getStorageKeys(courseId);  
  const lastPlayTimeRef = useRef<number>(0);  
  const watchTimeRef = useRef<number>(0);  

  // 工具函数  
  const formatTime = (timeInSeconds: number): string => {  
    const minutes = Math.floor(timeInSeconds / 60);  
    const seconds = Math.floor(timeInSeconds % 60);  
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;  
  };  

  // 存储管理函数  
  const saveToStorage = (key: string, value: number) => {  
    try {  
      localStorage.setItem(key, value.toString());  
    } catch (error) {  
      console.error('Failed to save to storage:', error);  
    }  
  };  

  const getFromStorage = (key: string): number => {  
    try {  
      const value = localStorage.getItem(key);  
      return value ? parseFloat(value) : 0;  
    } catch (error) {  
      console.error('Failed to get from storage:', error);  
      return 0;  
    }  
  };  

  // 进度管理  
  const updateProgress = () => {  
    if (videoRef.current) {  
      const duration = videoRef.current.duration;  
      const watchedTime = watchTimeRef.current;  
      const newProgress = Math.min(Math.round((watchedTime / duration) * 100), 100);  
      
      if (newProgress > videoProgress.percentage) {  
        setVideoProgress(prev => ({ ...prev, percentage: newProgress }));  
        saveToStorage(storageKeys.progress, newProgress);  
      }  
    }  
  };  

  // 视频事件处理  
  const handleTimeUpdate = () => {  
    if (videoRef.current && isPlaying) {  
      const currentTime = videoRef.current.currentTime;  
      const duration = videoRef.current.duration;  
      const percentage = (currentTime / duration) * 100;  

      setVideoProgress({  
        currentTime,  
        duration,  
        percentage  
      });  

      const timeDiff = currentTime - lastPlayTimeRef.current;  
      if (timeDiff > 0) {  
        watchTimeRef.current += timeDiff;  
      }  
      lastPlayTimeRef.current = currentTime;  

      updateProgress();  
      saveToStorage(storageKeys.position, currentTime);  
    }  
  };  

  const handlePlay = async () => {  
    try {  
      if (videoRef.current) {  
        await videoRef.current.play();  
        lastPlayTimeRef.current = videoRef.current.currentTime;  
        setIsPlaying(true);  
      }  
    } catch (err) {  
      console.error('Failed to play:', err);  
      setError('Failed to play video');  
    }  
  };  

  const handlePause = () => {  
    setIsPlaying(false);  
    updateProgress();  
    if (videoRef.current) {  
      saveToStorage(storageKeys.position, videoRef.current.currentTime);  
    }  
  };  

  const handleVideoEnd = () => {  
    setIsPlaying(false);  
    if (videoRef.current) {  
      videoRef.current.currentTime = 0;  
      saveToStorage(storageKeys.position, 0);  
    }  
    updateProgress();  
  };  

  const handleError = () => {  
    setError('Failed to load video');  
    setIsLoading(false);  
    setIsPlaying(false);  
  };  

 // 初始化进度  
  useEffect(() => {  
    if (isOpen && courseId) {  
      const keys = getStorageKeys(courseId);  
      
      // 恢复进度  
      const savedProgress = localStorage.getItem(keys.progress);  
      if (savedProgress) {  
        const progress = parseInt(savedProgress, 10);  
        setVideoProgress(prev => ({  
          ...prev,  
          percentage: progress  
        }));  
      }  

      // 恢复播放位置  
      if (videoRef.current) {  
        const savedPosition = localStorage.getItem(keys.position);  
        if (savedPosition) {  
          const position = parseFloat(savedPosition);  
          videoRef.current.currentTime = position;  
          lastPlayTimeRef.current = position;  
        }  

        // 恢复观看时间  
        const savedWatchTime = localStorage.getItem(keys.watchTime);  
        if (savedWatchTime) {  
          watchTimeRef.current = parseFloat(savedWatchTime);  
        }  
      }  
    }  
  }, [isOpen, courseId]);  

  // 定期保存观看时间  
  useEffect(() => {  
    if (!isOpen) return;  

    const saveInterval = setInterval(() => {  
      if (watchTimeRef.current > 0) {  
        saveToStorage(storageKeys.watchTime, watchTimeRef.current);  
      }  
    }, 5000);  

    return () => {  
      clearInterval(saveInterval);  
      if (watchTimeRef.current > 0) {  
        saveToStorage(storageKeys.watchTime, watchTimeRef.current);  
      }  
    };  
  }, [isOpen, courseId]);  

  // 清理函数  
  useEffect(() => {  
    return () => {  
      if (videoRef.current) {  
        const keys = getStorageKeys(courseId);  
        // 保存最终状态  
        saveToStorage(keys.position, videoRef.current.currentTime);  
        saveToStorage(keys.watchTime, watchTimeRef.current);  
        updateProgress();  
      }  
    };  
  }, [courseId]);  
  // 清理函数  
  const handleClose = () => {  
    if (videoRef.current) {  
      saveToStorage(storageKeys.position, videoRef.current.currentTime);  
      updateProgress();  
      videoRef.current.pause();  
      setIsPlaying(false);  
    }  
    onClose();  
  };  

  if (!isOpen) return null;  

  return (  
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">  
      <button  
        onClick={handleClose}  
        className="absolute top-6 right-6 btn btn-circle bg-dark-lighter border-none hover:bg-dark"  
      >  
        <X size={24} className="text-white" />  
      </button>  

      <div className="bg-dark-light w-full max-w-3xl rounded-lg shadow-xl">  
        <div className="p-4 border-b border-dark-lighter flex items-center justify-between">  
          <div className="space-y-1 flex-1">  
            <h3 className="text-lg font-semibold text-white">  
              {courseName}  
            </h3>  
            <div className="flex items-center gap-2 text-sm">  
              <div className="w-24 h-1.5 bg-dark-lighter rounded-full overflow-hidden">  
                <div  
                  className="h-full bg-accent-purple transition-all duration-300"  
                  style={{ width: `${videoProgress.percentage}%` }}  
                />  
              </div>  
              <span className="text-white/70">  
                {Math.round(videoProgress.percentage)}% Complete  
              </span>  
            </div>  
          </div>  
          
          <button  
            className={`btn btn-sm ${  
              videoProgress.percentage >= 80  
                ? 'bg-accent-purple hover:bg-accent-purple/90'  
                : 'btn-disabled bg-dark-lighter'  
            } gap-2 border-none ml-4`}  
            disabled={videoProgress.percentage < 100}  
          >  
            <Award size={16} />  
            {videoProgress.percentage >= 100 ? 'Claim Certificate' : 'Complete 100%'}  
          </button>  
        </div>  

        <div className="relative aspect-video bg-dark">  
          <video  
            ref={videoRef}  
            className="w-full h-full"  
            controls={isPlaying}  
            src={videoUrl}  
            preload="metadata"  
            onTimeUpdate={handleTimeUpdate}  
            onEnded={handleVideoEnd}  
            onPlay={handlePlay}  
            onPause={handlePause}  
            onLoadedData={() => setIsLoading(false)}  
            onError={handleError}  
            style={{ display: isPlaying ? 'block' : 'none' }}  
          />  

          {!isPlaying && !error && (  
            <div className="absolute inset-0 flex items-center justify-center">  
              <button  
                onClick={handlePlay}  
                className="btn btn-circle btn-lg bg-accent-purple hover:bg-accent-purple/90 border-none"  
              >  
                <Play size={32} className="text-white" />  
              </button>  
            </div>  
          )}  

          {isLoading && isPlaying && (  
            <div className="absolute inset-0 flex items-center justify-center bg-dark/50">  
              <div className="loading loading-spinner loading-lg text-accent-purple"></div>  
            </div>  
          )}  

          {error && (  
            <div className="absolute inset-0 flex items-center justify-center bg-dark">  
              <div className="text-center">  
                <p className="text-error mb-2">{error}</p>  
                <button  
                  className="btn btn-sm bg-accent-purple hover:bg-accent-purple/90 border-none"  
                  onClick={() => {  
                    setError(null);  
                    setIsLoading(true);  
                    if (videoRef.current) {  
                      videoRef.current.load();  
                    }  
                  }}  
                >  
                  Retry  
                </button>  
              </div>  
            </div>  
          )}  
        </div>  

        <div className="p-4 space-y-2">  
          <div className="flex justify-between items-center text-sm text-white/70">  
            <span>  
              {formatTime(videoProgress.currentTime)} / {formatTime(videoProgress.duration)}  
            </span>  
            <span>  
              {Math.round(videoProgress.percentage)}% Watched  
            </span>  
          </div>  
          <div className="w-full h-1 bg-dark-lighter rounded-full overflow-hidden">  
            <div  
              className="h-full bg-accent-purple transition-all duration-300"  
              style={{ width: `${videoProgress.percentage}%` }}  
            />  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}