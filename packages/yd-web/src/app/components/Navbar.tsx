import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <img className="h-8 w-auto" src="/logo.svg" alt="Logo" />
            </a>
          </div>

          {/* 主导航 */}
          <div className="hidden md:flex items-center space-x-8">
            {/* 课程市场 */}
            <a
              href="/courses"
              className="text-gray-700 hover:text-green-500 transition-colors"
            >
              课程市场
            </a>

            {/* 代币系统 */}
            <div className="relative group">
              <a
                href="/tokens"
                className="text-gray-700 hover:text-green-500 transition-colors"
              >
                代币系统
              </a>
              <div className="absolute hidden group-hover:block w-48 py-2 bg-white shadow-lg rounded-md mt-2">
                <a
                  href="/tokens/buy"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  购买代币
                </a>
                <a
                  href="/tokens/balance"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  代币余额
                </a>
                <a
                  href="/tokens/history"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  交易记录
                </a>
              </div>
            </div>

            {/* 学习中心 */}
            <div className="relative group">
              <a
                href="/learning"
                className="text-gray-700 hover:text-green-500 transition-colors"
              >
                学习中心
              </a>
              <div className="absolute hidden group-hover:block w-48 py-2 bg-white shadow-lg rounded-md mt-2">
                <a
                  href="/learning/my-courses"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  我的课程
                </a>
                <a
                  href="/learning/progress"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  学习进度
                </a>
                <a
                  href="/learning/certificates"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  我的证书
                </a>
              </div>
            </div>

            {/* 帮助中心 */}
            <a
              href="/help"
              className="text-gray-700 hover:text-green-500 transition-colors"
            >
              帮助中心
            </a>
          </div>

          {/* 用户区域 */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700">
              代币余额: <span className="text-green-500">1000</span>
            </span>
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-green-500">
                <img
                  className="h-8 w-8 rounded-full"
                  src="/avatar-placeholder.png"
                  alt="User avatar"
                />
                <span>用户名</span>
              </button>
              <div className="absolute right-0 hidden group-hover:block w-48 py-2 bg-white shadow-lg rounded-md mt-2">
                <a
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  个人资料
                </a>
                <a
                  href="/orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  订单记录
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  账户设置
                </a>
                <hr className="my-1" />
                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  退出登录
                </button>
              </div>
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-green-500">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
