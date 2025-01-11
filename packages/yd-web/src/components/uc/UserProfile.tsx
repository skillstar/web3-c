"use client";  

import { Settings, Wallet } from 'lucide-react';
import EditableAvatar from './EditableAvatar'; 
import { formatAddress } from '@/utils/shortenAddress'

const EthereumIcon = () => (  
  <svg   
    xmlns="http://www.w3.org/2000/svg"   
    width="24"   
    height="24"   
    viewBox="0 0 24 24"   
    fill="none"   
    stroke="currentColor"   
    strokeWidth="2"  
  >  
    <path d="M12 2L2 12l10 10 10-10L12 2z"/>  
    <path d="M12 15V7"/>  
  </svg>  
)  
type UserProfileProps = {
  user: {
    nftAvatar?: string;
    username?: string;
    walletAddress: string;
    joinedAt: string;
    totalLearningHours: number;
    totalPoints: number;
    totalNFTs: number;
  };
};
const address = '0xfdd46167C51062f2b1A8d713f0aac16746Ad4593'; 

export default function UserProfile({ user }: UserProfileProps) {
  const handleEditAvatar = () => {  
    // Avatar edit logic  
    console.log('Edit avatar');  
  }; 
  return (
   <div className="card bg-base-100 shadow-xl mb-6">  
  <div className="card-body flex flex-row items-center space-x-6">  
    {/* Left Side: Avatar and User Info */}  
    <div className="flex items-center space-x-4">  
    <EditableAvatar   
        avatarSrc={user.nftAvatar}   
        onEditAvatar={handleEditAvatar}   
      />  
      <div>  
        <h2 className="text-xl font-bold">{user.username || "Unnamed"}</h2>  
        <p className="text-sm text-gray-500 flex items-center justify-center">
         <Wallet size={15} className='mr-1'/>{formatAddress(address)} Joined: {new Date(user.joinedAt).toLocaleDateString()}  
        </p>  
      </div>  
    </div>  

    {/* Right Side: User Stats and Settings */}  
    <div className="flex-grow">  
      <div className="grid grid-cols-4 gap-4">  
        <div className="text-center">  
          <span className="text-lg font-bold block">{user.totalLearningHours}h</span>  
          <p className="text-sm text-gray-600">Learning Hours</p>  
        </div>  
        <div className="text-center">  
          <span className="text-lg font-bold block">{user.totalNFTs}</span>  
          <p className="text-sm text-gray-600">Certificates</p>  
        </div>  
        <div className="text-center">  
          <span className="text-lg font-bold block">{user.totalPoints}YD</span>  
          <p className="text-sm text-gray-600">Mining Rewards</p>  
        </div>  
        <div>  
          <button className="btn rounded-full">  
            <Settings className="w-5 h-5" />  
            <span>Settings</span>  
          </button>  
        </div>  
      </div>  
    </div>  
  </div>  
</div>
  );
}