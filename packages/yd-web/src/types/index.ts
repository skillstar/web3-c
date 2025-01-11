export interface CourseTypeCard {  
    _id: string;  
    _createdAt: string;  
    views: number;  
    title: string;  
    category: string;  
    description: string; 
    price: number; 
    image: string;  
  }  


  export interface HistoryRecord {  
  date: string;  
  type: 'course-completed' | 'note-published' | 'quiz-passed' | 'discussion';  
  courseTitle?: string;  
  quizTitle?: string;  
  miningReward: number;  
} 

// 用户基本信息  
export interface User {  
  username: string;  
  walletAddress: string;  
  joinedAt: string;  
  totalLearningHours: number;  
  totalPoints: number;  
  totalNFTs: number;  
  nftAvatar: string;  
}  

// 课程信息  
export interface Course {  
  courseId: number;  
  title: string;  
  progress: number;  
}  

// NFT信息  
export interface NFT {  
  nftId: number;  
  title: string;  
  imageUrl: string;  
  nftMintedTimestamp: string;  
}  

// 完整的用户数据响应接口  
export interface UserData {  
  user: User;  
  courses: Course[];  
  nfts: NFT[];  
  history: HistoryRecord[];  
}