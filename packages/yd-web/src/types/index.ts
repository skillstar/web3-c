// 课程类型
export interface CourseTypeCard {  
  _id: string;  
  _createdAt: string;  
  views: number;  
  name: string;  
  category: string;  
  description: string; 
  price: number; 
  image: string;  
}  

// 学习历史记录
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
  nftAvatar: string;  
}  

// 课程信息  
export interface Course {  
  courseId: number;  
  name: string;  
  progress: number;  
}  

// NFT信息  
export interface NFT {  
  nftId: number;  
  title: string;  
  imageUrl: string;  
  nftMintedTimestamp: string;
  courseId: number;  // 添加 courseId
  tokenURI?: string; // 可选的 tokenURI
}  

// 完整的用户数据响应接口  
export interface UserData {  
  user: User;  
  courses: Course[];  
  history: HistoryRecord[];  
}

export interface ProgressUpdateDto {  
  userAddress: string  
  courseId: number  
  progress: number  
  nonce: number  
}  

export interface SignatureResponse {  
  signature: string  
  deadline: number  
  nonce: number  
}

// 新增 NFT 元数据接口（可选）
export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}