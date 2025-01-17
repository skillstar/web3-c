// app/test/api/page.tsx  
'use client'  

import { useState, useEffect } from 'react'  

export default function TestAPI() {  
  const [testResult, setTestResult] = useState<any>(null)  
  const [error, setError] = useState<string | null>(null)  
  const [loading, setLoading] = useState(false)  

  const testAPI = async () => {  
    setLoading(true)  
    setError(null)  
    try {  
      const response = await fetch('/api/proxy/test')  
      const data = await response.json()  
      
      if (!response.ok) {  
        throw new Error(data.error || 'API request failed')  
      }  
      
      setTestResult(data)  
    } catch (error: any) {  
      setError(error.message)  
    } finally {  
      setLoading(false)  
    }  
  }  

  return (  
    <div className="p-4 max-w-4xl mx-auto">  
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>  
      
      <div className="mb-4">  
        <button  
          className={`px-4 py-2 rounded ${  
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'  
          } text-white`}  
          onClick={testAPI}  
          disabled={loading}  
        >  
          {loading ? 'Testing...' : 'Test API Connection'}  
        </button>  
      </div>  

      {error && (  
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">  
          Error: {error}  
        </div>  
      )}  

      {testResult && (  
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">  
          <h2 className="font-bold mb-2">API Response:</h2>  
          <pre className="whitespace-pre-wrap">  
            {JSON.stringify(testResult, null, 2)}  
          </pre>  
        </div>  
      )}  
    </div>  
  )  
}