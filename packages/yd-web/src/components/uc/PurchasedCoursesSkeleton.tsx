export default function PurchasedCoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((item) => (
        <div 
          key={item} 
          className="card bg-base-100 shadow-xl animate-pulse"
        >
          {/* 图片骨架 */}
          <div className="h-48 bg-gray-300 w-full"></div>

          <div className="card-body space-y-3">
            {/* 标题骨架 */}
            <div className="h-6 bg-gray-300 w-3/4 rounded"></div>
            
            {/* 描述骨架 */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 w-full rounded"></div>
              <div className="h-4 bg-gray-300 w-5/6 rounded"></div>
            </div>

            {/* 进度骨架 */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-300 w-1/4 rounded"></div>
                <div className="h-4 bg-gray-300 w-1/4 rounded"></div>
              </div>
              <div className="h-2 bg-gray-300 w-full rounded"></div>
            </div>

            {/* 时间和价格骨架 */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 w-1/2 rounded"></div>
              <div className="h-4 bg-gray-300 w-1/3 rounded"></div>
            </div>

            {/* 按钮骨架 */}
            <div className="flex justify-end gap-2 mt-4">
              <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              <div className="h-10 w-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}