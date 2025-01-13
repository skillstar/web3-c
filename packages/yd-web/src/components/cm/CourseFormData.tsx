'use client'  

import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'  
import { YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import { useCallback, useEffect, useMemo, useState } from 'react'  
import { type Abi } from 'viem'  
import { Loader2, Plus, AlertCircle } from 'lucide-react'

interface AddCourseProps {  
  onRefreshCourses: () => void;  
  onTransactionStatusChange: (isPending: boolean) => void;  
}  

interface ContractError extends Error {  
  cause?: {  
    data?: {  
      args?: any;  
      errorName?: string;  
    };  
    shortMessage?: string;  
    message?: string;  
  };  
} 
// 错误信息映射  
const ERROR_MESSAGES: { [key: string]: string } = {  
  // 合约自定义错误  
  UnauthorizedAccess: '没有操作权限',  
  InvalidCourseId: '无效的课程ID',  
  CourseNotActive: '课程未激活',  
  CourseAlreadyPurchased: '课程已购买',  
  TokenTransferFailed: '代币转账失败',  
  InvalidPrice: '无效的价格',  
  InvalidName: '课程名称无效',  
  InsufficientAllowance: '授权额度不足',  
  InsufficientBalance: '余额不足',  
  
  // 钱包和网络错误  
  'user rejected': '用户取消了交易',  
  'insufficient funds': '账户余额不足',  
  'network error': '网络连接错误'  
}  

interface Course {  
  name: string  
  price: bigint  
  isActive: boolean  
  description: string  
}  

interface CourseWithId extends Course {  
  id: number  
}  

interface CourseFormData {  
  name: string  
  price: string  
  description: string  
}  

export default function AddCourse({ onRefreshCourses, onTransactionStatusChange }: AddCourseProps) { 
  const [isModalOpen, setIsModalOpen] = useState(false)  
  const [errorMessage, setErrorMessage] = useState<string>('')  
  const [formData, setFormData] = useState<CourseFormData>({  
    name: '',  
    price: '',  
    description: ''  
  })  

  const { isConnected, address } = useAccount()  

  // 合约写入操作  
  const { writeContract: addCourse, data: addHash, error: addError } = useWriteContract()  
  
  // 等待交易完成  
  const {   
  isLoading: isAddLoading,   
  isSuccess: isAddSuccess,  
  isError: isAddError,  
  error: transactionError,  
  data: transactionData  
} = useWaitForTransactionReceipt({  
  hash: addHash,  
})   
  

  // 错误处理  
 const handleContractError = useCallback((error: any) => {  
  console.group('错误详细信息')  
  console.error('原始错误:', error)  

  let errorMessage = '操作失败'  

  // 检查错误消息中是否包含自定义错误信息  
  const customErrorMatch = error?.message?.match(/Custom Error '(\w+)\s*\((.*?)\)'/)  
  if (customErrorMatch) {  
    const [_, errorName, errorArgs] = customErrorMatch  
    console.log('解析到自定义错误:', { errorName, errorArgs })  

    // 获取基础错误消息  
    errorMessage = ERROR_MESSAGES[errorName] || errorName  

    // 解析错误参数  
    if (errorArgs) {  
      const args = Object.fromEntries(  
        errorArgs.split(',')  
          .map((arg:string) => arg.trim())  
          .map((arg:string) => {  
            const [key, value] = arg.split('=')  
            return [key, value?.trim()]  
          })  
      )  
      console.log('错误参数:', args)  

      // 根据错误类型添加详细信息  
      switch (errorName) {  
        case 'UnauthorizedAccess':  
          errorMessage += `\n调用者: ${args.caller}\n所有者: ${args.owner}`  
          break  
        case 'InvalidPrice':  
          errorMessage += ` (价格: ${args.price})`  
          break  
        case 'InvalidName':  
          errorMessage += ` (名称: ${args.name})`  
          break  
        case 'InsufficientBalance':  
          errorMessage += ` (需要: ${args.required}, 实际: ${args.actual})`  
          break  
        case 'InsufficientAllowance':  
          errorMessage += ` (需要: ${args.required}, 实际: ${args.actual})`  
          break  
      }  
    }  
  } else if (error?.cause?.data) {  
    // 原有的错误处理逻辑保持不变  
    const errorData = error.cause.data  
    // ... 其余代码保持不变 ...  
  } else if (error?.message) {  
    // 处理其他类型的错误  
    if (error.message.includes('user rejected')) {  
      errorMessage = '用户取消了交易'  
    } else if (error.message.includes('insufficient funds')) {  
      errorMessage = '账户余额不足'  
    } else {  
      // 如果没有匹配到特定错误，保留原始错误信息  
      errorMessage = error.message  
    }  
  }  

  console.log('最终错误消息:', errorMessage)  
  console.groupEnd()  

  setErrorMessage(errorMessage)  
}, [])

  // 监听错误  
 useEffect(() => {  
  if (addError) {  
    console.log('检测到添加错误:', addError)  
    handleContractError(addError)  
  }  
}, [addError, handleContractError]) 

  // 监听成功 
  useEffect(() => {  
  console.log('Modal state:', isModalOpen);  
}, [isModalOpen]);  
// 监听交易状态  
useEffect(() => {  
  // 只在有交易哈希时执行  
  if (!addHash) return;  

  // 设置交易处理状态为 true  
  onTransactionStatusChange(true);  

  console.log("+++++++===",isAddSuccess,transactionData)
  // 监听交易结果  
  if (isAddSuccess && transactionData?.status === "success") {  
    console.log('交易成功，准备关闭弹窗');  
    
    // 使用 setTimeout 确保状态更新在下一个事件循环  
    setTimeout(() => {  
      // 重置表单  
      resetForm();  
      // 关闭模态框  
      setIsModalOpen(false);  
      // 设置交易处理状态为 false  
      onTransactionStatusChange(false);  
      // 刷新课程列表  
      onRefreshCourses();  

      // 显示成功提示  
      const toast = document.getElementById('toast');  
      if (toast) {  
        toast.innerHTML = `  
          <div class="fixed top-4 right-4 flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">  
            <svg class="flex-shrink-0 w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">  
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>  
            </svg>  
            <div class="text-sm font-medium">课程添加成功！</div>  
          </div>  
        `;  
        setTimeout(() => {  
          toast.innerHTML = '';  
        }, 3000);  
      }  
    }, 0);  
  }  

  // 如果交易失败  
  if (isAddError) {  
    console.error('交易失败:', transactionError);  
    handleContractError(transactionError);  
    onTransactionStatusChange(false);  
  }  
}, [addHash, isAddSuccess, isAddError, transactionData, transactionError]);
// 表单验证  
  const validateForm = (data: CourseFormData): boolean => {  
  console.log('验证表单数据:', data)  
  
  if (!data.name.trim()) {  
    console.log('验证失败: 课程名称为空')  
    setErrorMessage('课程名称不能为空')  
    return false  
  }  
  
  const price = parseFloat(data.price)  
  if (isNaN(price) || price <= 0) {  
    console.log('验证失败: 无效价格', price)  
    setErrorMessage('课程价格必须大于0')  
    return false  
  }  
  
  if (!data.description.trim()) {  
    console.log('验证失败: 课程描述为空')  
    setErrorMessage('课程描述不能为空')  
    return false  
  }  
  
  console.log('表单验证通过')  
  return true  
}  

    // 在组件内部  
    const publicClient = usePublicClient()  
  // 处理添加课程
const handleAddCourse = async (e: React.FormEvent) => {  
  e.preventDefault()  
  setErrorMessage('')  
  
  if (!address) {  
    setErrorMessage('请先连接钱包')  
    return  
  }  

  try {  
   const price = BigInt(formData.price) // 直接使用整数 
    
    // 模拟交易验证  
    try {  
      await publicClient.simulateContract({  
        address: YDCOURSE_CONTRACT.address as `0x${string}`,  
        abi: YDCOURSE_CONTRACT.abi as Abi,  
        functionName: 'addCourse',  
        args: [  
          formData.name.trim(),  
          price,  
          formData.description.trim()  
        ],  
        account: address  
      })  
    } catch (error: any) {  
      if (error?.message?.includes('UnauthorizedAccess')) {  
        const matches = error.message.match(/0x[a-fA-F0-9]{40}/g) || []  
        const owner = matches[1]  
        setErrorMessage(`您没有权限添加课程`)  
        return  
      }  
      setErrorMessage(error?.message || '交易失败')  
      return  
    }  

    // 发送实际交易  
    await addCourse({  
      address: YDCOURSE_CONTRACT.address as `0x${string}`,  
      abi: YDCOURSE_CONTRACT.abi as Abi,  
      functionName: 'addCourse',  
      args: [  
        formData.name.trim(),  
        price,  
        formData.description.trim()  
      ],  
    })  

    // 交易发送成功后立即关闭模态框  
    setIsModalOpen(false)  
    resetForm()  
    
    // 显示交易已发送的提示  
    const toast = document.getElementById('toast')  
    if (toast) {  
      toast.innerHTML = `  
        <div class="fixed top-4 right-4 flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">  
          <svg class="flex-shrink-0 w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">  
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>  
          </svg>  
          <div class="text-sm font-medium">交易已发送！</div>  
        </div>  
      `  
      setTimeout(() => {  
        toast.innerHTML = ''  
      }, 3000)  
    }  

    // 设置交易处理状态为 true  
    onTransactionStatusChange(true)  
    
  } catch (error: any) {  
    setErrorMessage(error?.message || '交易失败')  
  }  
}  
//  const handleAddCourse = async (e: React.FormEvent) => {  
//   e.preventDefault()  
//   setErrorMessage('')  
  
//   try {  
//     // 先尝试模拟交易  
//     const priceInWei = BigInt(Math.floor(parseFloat(formData.price) * 1e18))  
    
//     console.group('模拟交易')  
//     try {  
//       const result = await publicClient.simulateContract({  
//         address: YDCOURSE_CONTRACT.address as `0x${string}`,  
//         abi: YDCOURSE_CONTRACT.abi as Abi,  
//         functionName: 'addCourse',  
//         args: [  
//           formData.name.trim(),  
//           priceInWei,  
//           formData.description.trim()  
//         ],  
//       })  
//       console.log('模拟交易结果:', result)  
//     } catch (simulateError) {  
//       console.log('模拟交易错误:', {  
//         error: simulateError 
//       })  
//       throw simulateError  
//     }  
//     console.groupEnd()  

//     // 如果模拟成功，发送实际交易  
//     const tx = await addCourse({  
//       address: YDCOURSE_CONTRACT.address as `0x${string}`,  
//       abi: YDCOURSE_CONTRACT.abi as Abi,  
//       functionName: 'addCourse',  
//       args: [  
//         formData.name.trim(),  
//         priceInWei,  
//         formData.description.trim()  
//       ],  
//     })  
    
//     console.log('交易已发送:', tx)  
//   } catch (error) {  
//     console.error('错误详情:', {  
//       error
//     })  
//     setErrorMessage('交易失败，请查看控制台了解详情')  
//   }  
// }  

  // 重置表单  
  const resetForm = () => {  
    setFormData({  
      name: '',  
      price: '',  
      description: ''  
    })  
    setErrorMessage('')  
  }  

  // 渲染模态框  
  const renderModal = () => {  
    if (!isModalOpen) return null  

    return (  
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">  
        <div className="bg-white rounded-lg p-6 w-full max-w-md">  
          <div className="flex justify-between items-center mb-4">  
            <h2 className="text-xl font-bold">添加课程</h2>  
            <button   
              onClick={() => {  
                setIsModalOpen(false)  
                resetForm()  
              }}  
              className="text-gray-500 hover:text-gray-700"  
            >  
              ✕  
            </button>  
          </div>  

           {errorMessage && (  
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">  
                    <div className="flex items-start gap-3">  
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />  
                    <div className="flex-1">  
                        <p className="text-red-700 whitespace-pre-line font-medium">  
                        {errorMessage}  
                        </p>  
                    </div>  
                    </div>  
                </div>  
            )}  
          <form onSubmit={handleAddCourse}>  
            <div className="space-y-4">  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-1">  
                  课程名称  
                </label>  
                <input  
                  type="text"  
                  value={formData.name}  
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}  
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"  
                  placeholder="请输入课程名称"  
                />  
              </div>  

              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-1">  
                  课程价格 (YD)  
                </label>  
               <input  
                  type="number"  
                  value={formData.price}  
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}  
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                  placeholder="请输入课程价格（整数）"  
                  step="1" // 修改为整数步进  
                  min="1"  // 最小值为 1  
                /> 
              </div>  

              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-1">  
                  课程描述  
                </label>  
                <textarea  
                  value={formData.description}  
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}  
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
                  placeholder="请输入课程描述"  
                  rows={4}  
                />  
              </div>  

              <div className="flex justify-end gap-2">  
                <button  
                  type="button"  
                  onClick={() => {  
                    setIsModalOpen(false)  
                    resetForm()  
                  }}  
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"  
                >  
                  取消  
                </button>  
                <button  
                  type="submit"  
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"  
                  disabled={isAddLoading}  
                >  
                  {isAddLoading ? (  
                    <div className="flex items-center gap-2">  
                      <Loader2 className="animate-spin" size={16} />  
                      处理中...  
                    </div>  
                  ) : (  
                    '确认添加'  
                  )}  
                </button>  
              </div>  
            </div>  
          </form>  
        </div>  
        <div id="toast" className="toast toast-top toast-end"></div>
      </div>  
    )  
  }  

  // 检查连接状态  
  if (!isConnected) {  
    return (  
      <div className="flex items-center justify-center min-h-screen">  
        <p className="text-red-500">请先连接钱包</p>  
      </div>  
    )  
  }  

  return (  
    <>  
      <button  
        onClick={() => setIsModalOpen(true)}  
        className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"  
      >  
        <Plus size={20} />  
        添加课程  
      </button>  
      {renderModal()}  
    </>  
  )  
}