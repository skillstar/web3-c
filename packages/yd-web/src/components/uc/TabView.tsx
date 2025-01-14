"use client";  
import { useState } from "react";  
import PurchasedCourses from "./PurchasedCourses";  
import NFTCollection from "./NFTCollection";  
import LearningHistory from "./LearningHistory";  
import { NFT, HistoryRecord } from '@/types'  
import { usePurchaseHistory } from '@/hooks/usePurchaseHistory';  

type TabViewProps = {  
  nfts: NFT[];  
  history: HistoryRecord[];  
};  

export default function TabView({ nfts, history }: TabViewProps) {  
  const [activeTab, setActiveTab] = useState<"courses" | "nfts" | "history">("courses");  
  
  const {  
    purchases,  
    courseStats,  
    isLoading,  
    error  
  } = usePurchaseHistory();  

  const tabData = [  
    {  
      key: "courses" as const,  
      label: `My Learning(${courseStats.purchasedCourses})`,  
      content: <PurchasedCourses   
        purchases={purchases}   
        isLoading={isLoading}   
        error={error}  
      />  
    },  
    {  
      key: "nfts" as const,  
      label: `My Certificates(${nfts.length})`,  
      content: <NFTCollection nfts={nfts} />  
    },  
    {  
      key: "history" as const,  
      label: `Study Log(${history.length})`,  
      content: <LearningHistory history={history} />  
    }  
  ];  

  return (  
    <div>  
      <div role="tablist" className="tabs tabs-bordered">  
        {tabData.map((tab) => (  
          <input  
            key={`input-${tab.key}`}  
            type="radio"  
            name="user_tabs"  
            role="tab"  
            className={`tab tab-lifted ${activeTab === tab.key ? 'tab-active' : ''}`}  
            aria-label={tab.label}  
            checked={activeTab === tab.key}  
            onChange={() => setActiveTab(tab.key)}  
          />  
        ))}  
      </div>  
      <div className="mt-4">  
        {tabData.map((tab) => (  
          activeTab === tab.key && (  
            <div key={`content-${tab.key}`}>  
              {tab.content}  
            </div>  
          )  
        ))}  
      </div>  
    </div>  
  );  
}