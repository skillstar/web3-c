import { useAccount, useBalance, useDisconnect } from "wagmi";  
import { useEffect, useState } from "react";  
import { Address } from "viem";  
import { ConnectButton } from "@rainbow-me/rainbowkit";  
import { shortenAddress, formatBalance } from "@/utils/shortenAddress";  
import CustomWalletAvatar from "./CustomWalletAvatar";  
import Link from 'next/link'  

const WalletConnect = () => {  
  const { address, isConnected, chainId } = useAccount();  
  const { disconnect } = useDisconnect();  
  const [showWalletDetails, setShowWalletDetails] = useState(false);  
  const [userAddress, setUserAddress] = useState<string>("");  
  const { data: userBalance } = useBalance({ address: userAddress as Address });  

  useEffect(() => {  
    setUserAddress(address || "");  
  }, [address]);  

  const handleDisconnect = () => {  
    disconnect();  
    setShowWalletDetails(false);  
  };  

  return (  
    <div className="relative inline-block">  
      <div   
        className="cursor-pointer"  
        onMouseEnter={() => setShowWalletDetails(true)}  
      >  
        {isConnected && address ? (  
          <div className="avatar online">  
            <div className="w-8 h-8 rounded-full bg-gray-300">  
              <CustomWalletAvatar address={address} size={32} />  
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
          className="absolute right-0 top-[calc(100%+0.5rem)] shadow-lg rounded-md py-4 w-48 bg-black bg-opacity-50 z-50"  
          onMouseEnter={() => setShowWalletDetails(true)}  
          onMouseLeave={() => setShowWalletDetails(false)}  
        >  
          <div className="px-4 space-y-3">  
            <Link   
              href="/user-center"   
              className="block bg-primary-dark text-dark-lighter text-sm py-2 rounded-md text-center  
                hover:bg-accent-purple transition-colors duration-200"  
            >  
              Go to User Center  
            </Link>  
            
            <div className="text-primary-light text-sm">  
              <p className="mb-1">  
                Balance: {formatBalance(userBalance?.formatted, userBalance?.symbol)}  
              </p>  
              <p className="mb-1">  
                Address: {shortenAddress(address)}  
              </p>  
              <p className="mb-1">  
                Chain ID: {chainId}  
              </p>  
            </div>  

            <button  
              onClick={handleDisconnect}  
              className="w-full bg-primary-dark text-dark-lighter text-sm py-2 rounded-md  
                hover:bg-primary-light transition-colors duration-200"  
            >  
              Disconnect  
            </button>  
          </div>  
        </div>  
      )}  
    </div>  
  );  
};  

export default WalletConnect;