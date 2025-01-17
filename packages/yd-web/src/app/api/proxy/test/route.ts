// app/api/proxy/test/route.ts  
import { NextRequest, NextResponse } from 'next/server'  

export async function GET(request: NextRequest) {  
  // 使用 API_URL 而不是 NEXT_PUBLIC_API_URL，因为这是服务器端代码  
  const apiUrl = process.env.API_URL  
  try {  
    if (!apiUrl) {  
      return NextResponse.json( 
        {   
          error: 'API_URL is not configured',  
          timestamp: new Date().toISOString()  
        },  
        { status: 500 }  
      )  
    }  

    const targetUrl = `${apiUrl}/progress/test`  
    console.log('Fetching from:', targetUrl) // 调试日志  

    const response = await fetch(targetUrl, {  
      method: 'GET',  
      headers: {  
        'Content-Type': 'application/json',  
        // 如果需要添加其他请求头，在这里添加  
      },  
    })  

    const data = await response.json()  

    if (!response.ok) {  
      return NextResponse.json(  
        {   
          error: data.message || 'API request failed',  
          status: response.status,  
          timestamp: new Date().toISOString()  
        },  
        { status: response.status }  
      )  
    }  

    return NextResponse.json({  
      ...data,  
      timestamp: new Date().toISOString()  
    })  

  } catch (error: any) {  
    console.error('Proxy error:', error)  
    return NextResponse.json(  
      {   
        error: error.message || 'Internal server error',  
        timestamp: new Date().toISOString()  
      },  
      { status: 500 }  
    )  
  }  
}