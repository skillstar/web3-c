'use client'  

import { useState, useCallback, useEffect } from 'react'  
import {   
  useWriteContract,   
  useWaitForTransactionReceipt,   
  usePublicClient,  
  useAccount   
} from 'wagmi'  
import { YDCOURSE_CONTRACT } from '@/app/abi/contractConfig'  
import { type Abi } from 'viem'  
import { Loader2, AlertCircle, Pencil, Loader } from 'lucide-react'  

// 添加错误类型定义  
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

// 添加错误信息映射  
const ERROR_MESSAGES: { [key: string]: string } = {  
  UnauthorizedAccess: '没有操作权限',  
  InvalidCourseId: '无效的课程ID',  
  CourseNotActive: '课程未激活',  
  CourseAlreadyPurchased: '课程已购买',  
  TokenTransferFailed: '代币转账失败',  
  InvalidPrice: '无效的价格',  
  InvalidName: '课程名称无效',  
  InsufficientAllowance: '授权额度不足',  
  InsufficientBalance: '余额不足',  
  
  'user rejected': '用户取消了交易',  
  'insufficient funds': '账户余额不足',  
  'network error': '网络连接错误'  
}  

interface EditCourseProps {  
  course: {  
    id: number  
    name: string  
    price: bigint  
    isActive: boolean  
    description: string  
  }  
  onRefreshCourses: () => void  
}  

interface EditFormData {  
  name: string  
  price: string  
  description: string  
  isActive: boolean  
}  

export default function EditCourse({ course, onRefreshCourses }: EditCourseProps) {  
  const [isModalOpen, setIsModalOpen] = useState(false)  
  const [isTransactionPending, setIsTransactionPending] = useState(false) 
  const [errorMessage, setErrorMessage] = useState<string>('')  
  const [formData, setFormData] = useState<EditFormData>({  
    name: course.name,  
    price: course.price.toString(), 
    description: course.description,  
    isActive: course.isActive  
  }) 
    const { isConnected, address } = useAccount()   
    const publicClient = usePublicClient()
  // 合约写入操作  
  const { writeContract: updateCourse, data: updateHash } = useWriteContract()  

  // 等待交易完成  
  const {  
    isLoading: isUpdateLoading,  
    isSuccess: isUpdateSuccess,  
    isError: isUpdateError,  
    error: transactionError,  
    data: transactionData  
  } = useWaitForTransactionReceipt({  
    hash: updateHash,  
  })  

  // 处理错误  
  const handleContractError = useCallback((error: any) => {  
    console.error('Error:', error)  
    setErrorMessage(error?.message || '操作失败')  
  }, [])  

  // 重置表单  
  const resetForm = () => {  
    setFormData({  
      name: course.name,  
      price: course.price.toString(), 
      description: course.description,  
      isActive: course.isActive  
    })  
    setErrorMessage('')  
  }  

  // 处理更新课程  
  const handleUpdateCourse = async (e: React.FormEvent) => {  
  e.preventDefault()  
  setErrorMessage('')  

  if (!address) {  
    setErrorMessage('请先连接钱包')  
    return  
  }  

  try { 
    setIsTransactionPending(true) 
    const price = parseInt(formData.price)
    if (isNaN(price) || price <= 0 || price !== parseFloat(formData.price)) {  
      setErrorMessage('课程价格必须为正整数')  
      return  
    } 
    // 先模拟交易  
    try {  
      await publicClient.simulateContract({  
        address: YDCOURSE_CONTRACT.address as `0x${string}`,  
        abi: YDCOURSE_CONTRACT.abi as Abi,  
        functionName: 'updateCourse',  
        args: [  
          BigInt(course.id),  
          formData.name.trim(),  
          price,  
          formData.isActive,  
          formData.description.trim()  
        ],  
        account: address  
      })  
    } catch (error: any) {
      setIsTransactionPending(false) 
      if (error?.message?.includes('UnauthorizedAccess')) {  
        const matches = error.message.match(/0x[a-fA-F0-9]{40}/g) || []  
        setErrorMessage(`您没有权限修改课程`)  
        return  
      }  
      setErrorMessage(error?.message || '交易失败')  
      return  
    }  

    // 如果模拟成功，执行实际交易  
    await updateCourse({  
      address: YDCOURSE_CONTRACT.address as `0x${string}`,  
      abi: YDCOURSE_CONTRACT.abi as Abi,  
      functionName: 'updateCourse',  
      args: [  
        BigInt(course.id),  
        formData.name.trim(),  
        price,  
        formData.isActive,  
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

  } catch (error: any) {  
     setIsTransactionPending(false) 
     handleContractError(error)  
  }  
} 

  // 监听交易状态  
useEffect(() => {  
  if (!updateHash) return;  

  if (isUpdateSuccess) { 
    setIsTransactionPending(false)   
    onRefreshCourses()  
  }  

  if (isUpdateError) { 
     setIsTransactionPending(false)   
    console.error('交易失败:', transactionError)  
    handleContractError(transactionError)  
  }  
}, [updateHash, isUpdateSuccess, isUpdateError, transactionError, onRefreshCourses]) 

  // 渲染模态框  
  const renderModal = () => {  
    if (!isModalOpen) return null  

    return (  
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">  
        <div className="bg-white rounded-lg p-6 w-full max-w-md">  
          <div className="flex justify-between items-center mb-4">  
            <h2 className="text-xl font-bold">修改课程</h2>  
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

          <form onSubmit={handleUpdateCourse}>  
            <div className="space-y-4">  
              <div>  
                <label className="block text-sm font-medium text-gray-700 mb-1">  
                  课程名称  
                </label>  
                <input  
                  type="text"  
                  value={formData.name}  
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}  
                  className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  
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
                  step="1"  
                  min="1"  
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

              <div className="flex items-center">  
                <input  
                  type="checkbox"  
                  checked={formData.isActive}  
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}  
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"  
                />  
                <label className="ml-2 block text-sm text-gray-900">  
                  课程激活状态  
                </label>  
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
                  disabled={isUpdateLoading}  
                >  
                  {isUpdateLoading ? (  
                    <div className="flex items-center gap-2">  
                      <Loader2 className="animate-spin" size={16} />  
                      处理中...  
                    </div>  
                  ) : (  
                    '确认修改'  
                  )}  
                </button>  
              </div>  
            </div>  
          </form>  
        </div>  
      </div>  
    )  
  }  

  return (  
    <>  
      <button  
        onClick={() => setIsModalOpen(true)}  
        className="text-blue-600 hover:text-blue-800"  
        title="编辑课程" 
        disabled={isTransactionPending}  
      >  
       {isTransactionPending ? (  
        <Loader size={16} className="animate-spin" />  
      ) : (  
        <Pencil size={16} />  
      )}  
      </button>  
      {renderModal()}  
    </>  
  )  
}