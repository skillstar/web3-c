"use client";  
import { useEffect, useState } from "react";  
import UserProfile from "@/components/uc/UserProfile";  
import TabView from "@/components/uc/TabView";  
import Header from "@/app/components/header";  
import Footer from "@/app/components/Footer";  
import { UserData } from '@/types'  

export default function UserCenterPage() {  
  const [userData, setUserData] = useState<UserData | null>(null);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState<string | null>(null);  

  useEffect(() => {  
    const fetchUserData = async () => {  
      try {  
        setLoading(true);  
        setError(null);  
        
        const response = await fetch("/api/user/profile", {  
          cache: "no-store",  
          headers: {  
            "Content-Type": "application/json",  
          },  
        });  

        if (!response.ok) {  
          throw new Error(`HTTP error! status: ${response.status}`);  
        }  

        const data = await response.json();  
        setUserData(data);  
      } catch (err) {  
        console.error("Failed to fetch user data:", err);  
        setError("Failed to load user data. Please try again later.");  
      } finally {  
        setLoading(false);  
      }  
    };  

    fetchUserData();  
  }, []);  

  if (loading) {  
    return (  
      <div className="min-h-screen flex items-center justify-center bg-base-200">  
        <div className="loading loading-spinner loading-lg"></div>  
      </div>  
    );  
  }  

  if (error) {  
    return (  
      <div className="min-h-screen flex items-center justify-center bg-base-200">  
        <div className="alert alert-error">  
          <span>{error}</span>  
          <button   
            className="btn btn-sm btn-ghost"   
            onClick={() => window.location.reload()}  
          >  
            Retry  
          </button>  
        </div>  
      </div>  
    );  
  }  

  if (!userData) {  
    return null;  
  }  

  return (  
    <div className="min-h-screen bg-black pt-20">  
      <Header />  
      
      <main className="container mx-auto px-4 py-8">  
        <div className="mb-8">  
          <UserProfile user={userData.user} />  
        </div>  
        
        <div className=" rounded-lg shadow-lg p-6">  
          <TabView  
            courses={userData.courses}  
            nfts={userData.nfts}  
            history={userData.history}  
          />  
        </div>  
      </main>  

      <Footer />  
    </div>  
  );  
}