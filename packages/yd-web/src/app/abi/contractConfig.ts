import YdTokenABI from './YdToken.json'
import YdCourseABI from './YdCourse.json'

//购买YD token
export const YDTOKEN_CONTRACT = {
    address: "0xF342495D353A8219E29825704Be6EC943164945d",
    abi: YdTokenABI.abi
} as const;

export const YDCOURSE_CONTRACT = {
    address: "0xBa91cd76B3FAb4488f6A723a3Ef2e17F15fb0141",
    abi: YdCourseABI.abi
} as const;

// 检查类型是否生成  
import type { YdToken } from './typechain-types/index'  
export type { YdToken }  