"use client";  
import { useState } from "react";  
import PurchasedCourses from "./PurchasedCourses";  
import NFTCollection from "./NFTCollection";  
import LearningHistory from "./LearningHistory";  
import {Course, NFT, HistoryRecord } from '@/types'

type TabViewProps = {  
  courses: Course[];  
  nfts: NFT[];  
  history: HistoryRecord[];  
};  

export default function TabView({ courses, nfts, history }: TabViewProps) {  
  const [activeTab, setActiveTab] = useState<"courses" | "nfts" | "history">(  
    "courses"  
  );  

  const tabData = [  
    {   
      key: "courses" as const,   
      label: `My Learning(${courses.length})`,   
      content: <PurchasedCourses courses={courses} />   
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