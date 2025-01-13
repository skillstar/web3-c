'use client'  

import { useState, useEffect } from 'react';  
import { useAccount, usePublicClient } from 'wagmi';  
import { YDCOURSE_CONTRACT } from '@/app/abi/contractConfig';  
import { usePurchaseHistory } from '@/hooks/usePurchaseHistory';  
import type { PurchaseWithCourse } from '@/hooks/usePurchaseHistory'; 


export default function PurchaseHistory() {  
  const { address } = useAccount();  
  const publicClient = usePublicClient();  
 const {   
    purchases,   
    isLoading,   
    error,   
    fetchPurchaseHistory   
  } = usePurchaseHistory();  
  
  const formatTimestamp = (timestamp: bigint) => {  
    return new Date(Number(timestamp) * 1000).toLocaleString();  
  }; 

  return (  
    <div className="p-4 max-w-4xl mx-auto">  
      <div className="flex justify-between items-center mb-6">  
        <h1 className="text-2xl font-bold">My Purchased Courses</h1>  
        {address && !isLoading && purchases.length > 0 && (  
          <button  
            onClick={() => fetchPurchaseHistory()}  
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"  
          >  
            Refresh  
          </button>  
        )}  
      </div>  

      {!address && (  
        <div className="text-center py-8 text-gray-500">  
          Please connect your wallet to view purchase history  
        </div>  
      )}  

      {isLoading && (  
        <div className="text-center py-8">  
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>  
          <p className="mt-2 text-gray-600">Loading purchase history...</p>  
        </div>  
      )}  

      {error && (  
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">  
          Error: {error}  
        </div>  
      )}  

      {address && !isLoading && purchases.length === 0 && (  
        <div className="text-center py-8 text-gray-500">  
          No courses purchased yet  
        </div>  
      )}  

      <div className="grid gap-4">  
        {purchases.map((purchase, index) => (  
          <div  
            key={`${purchase.courseId}-${index}`}  
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"  
          >  
            <div className="flex justify-between items-start">  
              <div className="flex-1">  
                <div className="flex items-center gap-2 mb-2">  
                  <h3 className="text-xl font-semibold">{purchase.course.name}</h3>  
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">  
                    ID: {purchase.courseId.toString()}  
                  </span>  
                </div>  
                <p className="text-gray-600 mb-2">{purchase.course.description}</p>  
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">  
                  <p>  
                    <span className="font-medium">Purchase Date:</span>{' '}  
                    {formatTimestamp(purchase.timestamp)}  
                  </p>  
                  <p>  
                    <span className="font-medium">Price:</span>{' '}  
                    {purchase.price.toString() } YD  
                  </p>  
                  <p>  
                    <span className="font-medium">Status:</span>{' '}  
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${  
                      purchase.course.isActive   
                        ? 'bg-green-100 text-green-800'   
                        : 'bg-red-100 text-red-800'  
                    }`}>  
                      {purchase.course.isActive ? 'Active' : 'Inactive'}  
                    </span>  
                  </p>  
                </div>  
              </div>  
            </div>  
          </div>  
        ))}  
      </div>  

      {purchases.length > 0 && (  
        <div className="mt-4 text-sm text-gray-500 text-right">  
          Total Courses: {purchases.length}  
        </div>  
      )}  
    </div>  
  );  
}