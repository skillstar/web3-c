"use client"
import React from 'react'
import Header from "@/app/components/header";
import Footer from "@/app/components/Footer";

export default function MarketplaceLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
        <div className="relative min-h-screen bg-dark-light text-gray-900 p-6">
      <Header />
      <main className="container mx-auto p-6 mt-20">
        {children}
      </main>
      <Footer />
    </div> 
  )
}

