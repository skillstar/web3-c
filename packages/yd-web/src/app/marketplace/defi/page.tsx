
// src/app/marketplace/defi-web3/page.tsx
import React from 'react'

export default function DefiWeb3Page() {
  const courses = [
    {
      title: "DeFi Fundamentals",
      description: "Understand decentralized finance principles",
      level: "Intermediate",
      price: 69.99
    },
    {
      title: "Web3 Ecosystem Mastery",
      description: "Comprehensive Web3 technology landscape",
      level: "Advanced",
      price: 89.99
    }
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-primary text-center">
        DeFi & Web3 Ecosystem
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <div 
            key={index} 
            className="bg-dark-lighter p-6 rounded-lg shadow-custom-lg"
          >
            <h2 className="text-2xl font-semibold text-accent-green mb-4">
              {course.title}
            </h2>
            <p className="text-gray-300 mb-4">{course.description}</p>
            <div className="flex justify-between items-center">
              <span className="badge badge-primary">{course.level}</span>
              <span className="text-xl font-bold text-primary">
                ${course.price}
              </span>
            </div>
            <button className="btn btn-primary w-full mt-4">
              Enroll Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

