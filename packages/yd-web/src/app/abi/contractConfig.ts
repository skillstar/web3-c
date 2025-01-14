import YdTokenABI from './YdToken.json'
import YdCourseABI from './YdCourse.json'
import YdNFTABI from './CourseNFT.json'
import CourseProgressABI from './CourseProgress.json'
import CourseProgressAggregatorABI from './CourseProgressAggregator.json'


//购买YD token
export const YDTOKEN_CONTRACT = {
    address: "0xF342495D353A8219E29825704Be6EC943164945d",
    abi: YdTokenABI.abi
} as const;

export const YDCOURSE_CONTRACT = {
    address: "0xBa91cd76B3FAb4488f6A723a3Ef2e17F15fb0141",
    abi: YdCourseABI.abi
} as const;

//CourseProgressAggregator (进度追踪)  
export const CPA_CONTRACT = {
    address: "0x4F51626f276715b6c660C33B2552C47f1618b572",
    abi: CourseProgressAggregatorABI.abi
} as const;
//CourseProgress (业务逻辑处理)
export const CP_CONTRACT = {
    address: "0xfdd46167C51062f2b1A8d713f0aac16746Ad4593",
    abi: CourseProgressABI.abi
} as const;
//CourseNFT (NFT铸造) 
export const NFT_CONTRACT = {
    address: "0x7121f1DBB04b6C4694Dc9DFe770432847A06Bf3d",
    abi: YdNFTABI.abi
} as const; 

// 检查类型是否生成  
import type { YdToken } from './typechain-types/index'  
export type { YdToken }  