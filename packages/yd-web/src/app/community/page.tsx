"use client"
import Footer from "@/app/components/Footer";
import Header from "@/app/components/header";
export default function CommunityPage() {  
  return (  
   <div className="relative min-h-screen bg-dark-light text-gray-900 p-6">
      <Header />
      <div className="container mx-auto mt-20">  
        <h1 className="text-4xl font-bold mb-8 text-primary">Web3 College Community</h1>  
        
        <div className="grid md:grid-cols-2 gap-8">  
          {/* Learning Progress Section */}  
          <div className="bg-dark rounded-lg p-6 shadow-custom-lg">  
            <h2 className="text-2xl font-semibold text-accent-purple mb-4">My Learning Progress</h2>  
            <div className="space-y-4">  
              <div className="flex items-center">  
                <div   
                    className="radial-progress text-primary mr-4 [--value:75]"   
                    style={{position: 'relative'}}  
                    role="progressbar"  
                >  
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">  
                    75%  
                    </span>  
                </div> 
                <div>  
                  <h3 className="font-medium text-gray-300">Blockchain Fundamentals</h3>  
                  <p className="text-sm text-gray-400">12/16 Modules Completed</p>  
                </div>  
              </div>  
              <div className="flex items-center">  
                 <div   
                    className="radial-progress text-accent-blue mr-4 [--value:45]"   
                    style={{position: 'relative'}}  
                    role="progressbar"  
                >  
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">  
                    45%  
                    </span>  
                </div>  
                <div>  
                  <h3 className="font-medium  text-gray-300">Smart Contract Development</h3>  
                  <p className="text-sm text-gray-400">7/16 Modules Completed</p>  
                </div>  
              </div>  
            </div>  
          </div>  

          {/* Community Forums Section */}  
          <div className="bg-dark rounded-lg p-6 shadow-custom-lg">  
            <h2 className="text-2xl font-semibold text-accent-purple mb-4">Community Forums</h2>  
            <div className="space-y-4">  
              <div className="card bg-dark-lighter shadow-sm">  
                <div className="card-body">  
                  <h3 className="card-title text-primary">Blockchain Discussions</h3>  
                  <p className="text-sm">Active Threads: 24</p>  
                </div>  
              </div>  
              <div className="card bg-dark-lighter shadow-sm">  
                <div className="card-body">  
                  <h3 className="card-title text-accent-blue">Web3 Development</h3>  
                  <p className="text-sm">Active Threads: 18</p>  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
      </div>  
       <Footer />
    </div>
  )  
}  