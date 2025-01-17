// src/app/api/proxy/progress/signature/route.ts  
import { NextRequest } from 'next/server'  

interface ProgressUpdateRequest {  
  userAddress: string  
  courseId: number  
  progress: number  
  timestamp?: number  
  chainId?: number  
}  

interface APIResponse {  
  data: {  
    signature: string  
    deadline: string  
    nonce?: string  
  }  
}  

export async function POST(request: NextRequest) {  
  try {  
    // 1. 读取和解析请求体  
    const body = await request.json()  
    
    // 2. 验证请求数据  
    const validationResult = validateRequest(body)  
    if (!validationResult.isValid) {  
      return Response.json(  
        {  
          error: 'Invalid request data',  
          details: validationResult.errors,  
          timestamp: new Date().toISOString()  
        },  
        { status: 400 }  
      )  
    }  

    // 3. 验证环境变量  
    if (!process.env.API_URL) {  
      console.error('API_URL is not configured')  
      return Response.json(  
        {  
          error: 'API configuration error',  
          timestamp: new Date().toISOString()  
        },  
        { status: 500 }  
      )  
    }  

    // 4. 准备请求数据  
    const requestData = {  
      ...body,  
      timestamp: body.timestamp || Date.now(),  
      chainId: body.chainId || 1  
    }  

    const targetUrl = `${process.env.API_URL}/progress/signature`  
    console.log('Sending request to:', targetUrl, 'with data:', requestData)  

    // 5. 发送请求  
    const response = await fetch(targetUrl, {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
        'Authorization': process.env.API_KEY ? `Bearer ${process.env.API_KEY}` : '',  
      },  
      body: JSON.stringify(requestData),  
    })  

    const data = await response.json()  

    // 6. 处理错误响应  
    if (!response.ok) {  
      console.error('API error:', data)  
      return Response.json(  
        {  
          error: data.message || 'API request failed',  
          status: response.status,  
          timestamp: new Date().toISOString()  
        },  
        { status: response.status }  
      )  
    }  

    // 7. 验证响应数据  
    if (!validateResponse(data)) {  
      console.error('Invalid API response:', data)  
      return Response.json(  
        {  
          error: 'Invalid API response format',  
          timestamp: new Date().toISOString()  
        },  
        { status: 502 }  
      )  
    }  

    // 8. 返回成功响应  
    return Response.json({  
      ...data,  
      timestamp: new Date().toISOString()  
    })  

  } catch (error: any) {  
    console.error('Proxy error:', error)  
    return Response.json(  
      {  
        error: error.message || 'Internal server error',  
        timestamp: new Date().toISOString()  
      },  
      { status: 500 }  
    )  
  }  
}  

function validateRequest(body: any): { isValid: boolean; errors: string[] } {  
  const errors: string[] = []  

  if (!body || typeof body !== 'object') {  
    return { isValid: false, errors: ['Request body must be an object'] }  
  }  

  // 验证地址  
  if (!body.userAddress || typeof body.userAddress !== 'string') {  
    errors.push('userAddress is required and must be a string')  
  } else if (!/^0x[a-fA-F0-9]{40}$/.test(body.userAddress)) {  
    errors.push('userAddress must be a valid Ethereum address')  
  }  

  // 验证课程 ID  
  if (!Number.isInteger(body.courseId) || body.courseId <= 0) {  
    errors.push('courseId must be a positive integer')  
  }  

  // 验证进度  
  if (typeof body.progress !== 'number' || body.progress < 0 || body.progress > 100) {  
    errors.push('progress must be a number between 0 and 100')  
  }  

  // 验证可选字段  
  if (body.timestamp && !Number.isInteger(body.timestamp)) {  
    errors.push('timestamp must be an integer')  
  }  

  if (body.chainId && !Number.isInteger(body.chainId)) {  
    errors.push('chainId must be an integer')  
  }  

  return {  
    isValid: errors.length === 0,  
    errors  
  }  
}  

function validateResponse(response: any): response is APIResponse {  
  return (  
    response &&  
    typeof response === 'object' &&  
    response.data &&  
    typeof response.data === 'object' &&  
    typeof response.data.signature === 'string' &&  
    typeof response.data.deadline === 'string' &&  
    (!response.data.nonce || typeof response.data.nonce === 'string')  
  )  
}