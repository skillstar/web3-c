
// src/app/marketplace/page.tsx
"use client";
import React from 'react'
import Image from 'next/image'
import IncrementAnimation from "@/components/uc/IncrementAnimation";

export const DEFAULT_IMAGES = [  
  "https://i.seadn.io/gcs/files/6d5f2df1cb886b2b0cfb8231bcaceb75.jpg?auto=format&dpr=1&h=500&fr=1",  
  "https://i.seadn.io/s/raw/files/93365a2dd8e50ea072f0defa1295160d.jpg?auto=format&dpr=1&h=500&fr=1"  
]

function MarketplaceBanner() {
  return (
    <div className="flex gap-8 items-center backdrop-blur-md rounded-lg bg-dark-lighter p-8">
      {/* 左侧图片轮播 */}
      <div className="flex-1">
        <div className="grid md:grid-cols-2 gap-4">
          {DEFAULT_IMAGES.map((img, index) => (
            <Image 
              key={index} 
              src={img} 
              alt={`Course Banner ${index + 1}`} 
              width={300} 
              height={200} 
              className="rounded-lg shadow-custom-lg"
            />
          ))}
        </div>
      </div>

      {/* 右侧文字描述 */}
      <div className="flex-1 space-y-4">
        <h1 className="font-bold text-3xl text-primary">
          Web3 College Marketplace
        </h1>
        <p className="text-gray-300">
          Unlock the future of blockchain education with our comprehensive courses spanning React, Smart Contracts, and DeFi technologies.
        </p>
        
        <div className="flex gap-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              <IncrementAnimation targetValue={50} duration={1000} />+
            </div>
            <div className="text-sm text-gray-400">Courses</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-gray-400">Support</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              <IncrementAnimation targetValue={1000} duration={5000} />+
            </div>
            <div className="text-sm text-gray-400">Students</div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <a 
            href="/marketplace/react" 
            className="btn btn-primary"
          >
            Explore React Courses
          </a>
          <a 
            href="/marketplace/react" 
            className="btn btn-outline btn-accent"
          >
            Smart Contract Track
          </a>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <MarketplaceBanner />

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { 
            title: "React Basics", 
            link: "/marketplace/react",
            description: "Master React for Web3 development",
            icon: "⚛️"
          },
          { 
            title: "Smart Contract", 
            link: "/marketplace/react",
            description: "Learn Solidity and blockchain programming",
            icon: "📜"
          },
          { 
            title: "DeFi & Web3", 
            link: "/marketplace/react",
            description: "Explore decentralized finance ecosystem",
            icon: "💸"
          }
        ].map((category) => (
          <div 
            key={category.title} 
            className="bg-dark-lighter p-6 rounded-lg hover:bg-dark transition-colors group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h2 className="text-2xl font-semibold text-primary mb-2">
              {category.title}
            </h2>
            <p className="text-gray-300 mb-4">{category.description}</p>
            <a 
              href={category.link} 
              className="btn btn-primary btn-outline"
            >
              Explore Courses
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

