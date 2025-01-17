import PurchasedCoursesSkeleton from '@/components/uc/PurchasedCoursesSkeleton'
export default function UserCenterSkeleton() {
  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header 保持不变 */}
      <header className="absolute top-0 left-0 right-0">
        {/* 可以保留原有的 Header 组件 */}
      </header>

      <main className="container mx-auto px-4 py-8 animate-pulse">
        {/* 用户资料骨架屏 */}
        <div className="mb-8 flex items-center space-x-6">
          {/* 头像 */}
          <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
          
          {/* 用户信息 */}
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        
        {/* 选项卡骨架屏 */}
        <div className="rounded-lg shadow-lg p-6 space-y-6">
          {/* 选项卡标签 */}
          <div className="flex space-x-4 mb-4">
            <div className="h-10 bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-700 rounded w-1/4"></div>
          </div>

          {/* 内容列表骨架 */}
          <PurchasedCoursesSkeleton />
        </div>
      </main>

      {/* Footer 保持不变 */}
      <footer>
        {/* 可以保留原有的 Footer 组件 */}
      </footer>
    </div>
  )
}