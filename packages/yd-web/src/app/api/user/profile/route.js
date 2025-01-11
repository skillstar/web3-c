import { NextResponse } from "next/server";

// 模拟数据返回
export async function GET() {
  const userData = {
    user: {
      username: "Unnamed",
      walletAddress: "0x123...ABC",
      joinedAt: "2025-01-10",
      totalLearningHours: 2773,
      totalPoints: 388,
      totalNFTs:3,
      nftAvatar: "/default-avatar.png",
    },
    courses: [
      { courseId: 1, title: "React Fundamentals: From Beginner to Pro Development", progress: 30 },
      { courseId: 2, title: "Next.js 14 Comprehensive Guide，Full-Stack Web Development with Next.js", progress: 50 },
    ],
    nfts: [
      { nftId: 1, title: "web3 full-stack development certification #1", imageUrl: "/1.jpg", nftMintedTimestamp: "2025/1/12" },
      { nftId: 2, title: "React Frontend development certification #2", imageUrl: "/1.jpg", nftMintedTimestamp: "2025/6/2" },
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

  return NextResponse.json(userData);
}
