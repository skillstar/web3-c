import { RefreshCw } from 'lucide-react'

function NFTCollectionSkeleton() {
  return (
    <div className="mb-4 p-4 rounded">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">My Certificates</h2>
        <button className="btn btn-sm btn-ghost" disabled>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div 
            key={item} 
            className="bg-gray-100 animate-pulse rounded-lg p-4 space-y-3"
          >
            <div className="h-48 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NFTCollectionSkeleton