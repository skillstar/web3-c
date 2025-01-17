
// src/app/marketplace/smart-contract/page.tsx
import React from 'react'

export default function SmartContractPage() {
  const courses = [
    {
      title: "Solidity Smart Contract Basics",
      description: "Introduction to smart contract development",
      level: "Beginner",
      price: 59.99
    },
    {
      title: "Advanced Ethereum Smart Contracts",
      description: "Deep dive into complex smart contract architectures",
      level: "Advanced",
      price: 99.99
    }
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-primary text-center">
        Smart Contract Development
      </h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <div 
            key={index} 
            className="bg-dark-lighter p-6 rounded-lg shadow-custom-lg"
          >
            <h2 className="text-2xl font-semibold text-accent-purple mb-4">
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

