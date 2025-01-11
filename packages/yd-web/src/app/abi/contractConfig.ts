import YdTokenABI from './YdToken.json'
import YdCourseABI from './YdCourse.json'

//购买YD token
export const YDTOKEN_CONTRACT = {
    address: "0xF342495D353A8219E29825704Be6EC943164945d",
    abi: YdTokenABI.abi
} as const;

export const YDCOURSE_CONTRACT = {
    address: "0xC277bcbDEa84180b8d14a5bE1cDF43c42D425187",
    abi: YdCourseABI.abi
} as const;

// 检查类型是否生成  
import type { YdToken } from './typechain-types/index'  
export type { YdToken }  