import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { useEffect, useState } from "react";
import { Address } from "viem";
import UpLink from "./ui/UpLink";
import WalletConnect from "./WalletConnect";
import ArrowDown from "./ui/ArrowDown";
const Header = () => {
  const account = useAccount();
  const [userAddress, setUserAddress] = useState<string>("");
  const { data: userBalance } = useBalance({
    address: userAddress as Address,
  });

  useEffect(() => {
    if (account && account.address) {
      setUserAddress(account.address);
    } else {
      setUserAddress("");
    }
  }, [account]);

  return (
    <header className="absolute top-0 left-0 z-10 w-full bg-opacity-70 backdrop-blur-xl transition-opacity duration-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center space-x-12">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.jpg" alt="Logo" className="h-8 w-auto" />
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:block">
              <ul className="flex items-center space-x-8">
                <li>
                  <UpLink
                    text="Marketplace"
                    href="/marketplace"
                    showArrow={false}
                  ></UpLink>
                </li>
                {/* 修改这个下拉菜单部分 */}
                <li className="relative group">
                  {/* 添加一个包装器 div */}
                  <div className="relative py-4">
                    <Link
                      href="/learning"
                      className="flex items-center text-gray-300 hover:text-primary transition-colors"
                    >
                      <span>Learning Center</span>
                      <ArrowDown className="ml-2 transition-transform duration-300 group-hover:rotate-180" />
                    </Link>
                    {/* 添加一个不可见的连接区域 */}
                    <div className="absolute h-3 w-full -bottom-3"></div>
                    {/* 调整下拉菜单的定位和过渡效果 */}
                    <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out left-0 top-[calc(100%-0.75rem)] w-48 pt-4">
                      <div className="bg-black bg-opacity-70 rounded-md border border-dark-lighter shadow-lg py-2">
                        <div className="px-4 py-2">
                          {/* 包装器div来控制padding */}
                          <UpLink
                            text=" My Courses"
                            href="/learning/my-courses"
                            showArrow={false}
                            className="!text-sm" // 只覆盖文字大小
                          />
                        </div>
                        <div className="px-4 py-2">
                          {/* 包装器div来控制padding */}
                          <UpLink
                            text="Learning Progress"
                            href="/learning/progress"
                            showArrow={false}
                            className="!text-sm" // 只覆盖文字大小
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <UpLink showArrow={false}></UpLink>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right Section: RainbowKit Wallet */}
          <div className="flex items-center space-x-6">
            <WalletConnect></WalletConnect>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden absolute right-4 top-4">
        <button className="text-gray-300 hover:text-primary transition-colors">
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
    </header>
  );
};

export default Header;
