import { useAccount, useBalance, useDisconnect,  useSwitchChain } from "wagmi";
import { useEffect, useState, useRef } from "react";
import { Address } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { shortenAddress, formatBalance } from "@/utils/shortenAddress";
import CustomWalletAvatar from "./CustomWalletAvatar";
import Link from 'next/link'
import { LogOut, ChevronRight } from 'lucide-react'  

const WalletConnect = () => {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const { data: userBalance } = useBalance({ address: userAddress as Address });
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setUserAddress(address || "");
  }, [address]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowWalletDetails(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowWalletDetails(false);
    }, 300); // 300ms 的延迟，给用户足够时间移动到菜单
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletDetails(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="cursor-pointer">
        {isConnected && address ? (
          <div className="avatar online">
             <div className="w-8 rounded-full relative overflow-hidden">  
          <img   
            src="/default-avatar.png"  
            alt="Avatar"   
            className="w-full h-full object-cover "  
          /> 
            </div>
          </div>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal, mounted }) => {
              if (!mounted) return null;
              
              return (
                <button
                  onClick={openConnectModal}
                  className="text-gray-400 hover:text-primary-light transition-colors duration-200 px-4 py-2"
                >
                  Connect Wallet
                </button>
              );
            }}
          </ConnectButton.Custom>
        )}
      </div>

      {/* 下拉菜单 */}
      {isConnected && address && showWalletDetails && (
        <div 
          className="absolute right-0 top-[calc(100%+0.5rem)] shadow-lg rounded-md py-4 w-64 bg-black bg-opacity-50 z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="px-4 space-y-3">
            <div className="flex items-center space-x-3 btn-sm">  
      {/* 左侧头像 */}  
      <div className="flex-shrink-0">  
        <div className="w-10 h-10 rounded-full ring ring-primary-light ring-offset-base-100 ring-offset-1  bg-gray-200 overflow-hidden">  
          <img   
             src="/default-avatar.png"  
            alt="User avatar"   
            className="w-full h-full object-cover"  
          />  
        </div>  
      </div>  
 
      {/* 右侧信息 */}  
      <div className="flex flex-col justify-center min-w-0">  
        {/* 上方名字 */}  
        <div className="text-sm font-medium text-gray-300 truncate">  
          John Doe  
        </div>  
        {/* 下方地址 */}  
        <div className="text-xs text-gray-500 truncate">  
            {shortenAddress(address)}
        </div>  
      </div>  
    </div>  

    <div className="text-sm text-primary mb-4">
      <p>Total Learning Time: 0 hrs</p>  
    </div>
            
            <div className="flex items-center justify-between">
               <Link href="/user-center" className="btn btn-sm hover:bg-primary hover:text-black">User Center</Link>
               <Link href="#" className=" btn btn-sm hover:bg-primary hover:text-black">Study Hub</Link>
            </div>

            <button
              onClick={handleDisconnect}
              className="btn btn-xs w-full bg-primary-dark text-dark-lighter text-sm rounded-md hover:bg-primary-light transition-colors duration-200"
            >
              <LogOut size={12} />Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;