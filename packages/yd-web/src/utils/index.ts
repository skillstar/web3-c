import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/*
clsx 处理  
clsx("text-red-500", false && "hidden", true && "font-bold")  
结果: "text-red-500 font-bold"  

twMerge 解决冲突  
twMerge("p-2 p-4")  
结果: "p-4" (后面的覆盖前面的)  

完整流程  
cn("text-red-500", "text-blue-500")  
最终结果: "text-blue-500"  
*/
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//输入：2024-01-15T10:30:00Z  
// 输出：January 15, 2024  
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

//深拷贝对象
export function parseServerActionResponse<T>(response: T) {
  return JSON.parse(JSON.stringify(response));
}


export const getRandomColor = () => {  
  const colors = [  
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',   
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',  
    'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500',  
    'bg-sky-500', 'bg-lime-500', 'bg-amber-500', 'bg-fuchsia-500'  
  ]; 
  return colors[Math.floor(Math.random() * colors.length)];  
};  

export const getAuthorInitial = (name?: string) => {  
  if (!name) return '?';  
  return name.charAt(0).toUpperCase();  
};  