"use client"
import Footer from "@/app/components/Footer";
import Header from "@/app/components/header";

export default function ContactPage() {  
  return (  
    <div className="relative min-h-screen bg-dark-light text-gray-900 p-6">
      <Header />
      <div className="container mx-auto max-w-2xl  mt-20">  
        <h1 className="text-4xl font-bold mb-8 text-primary text-center">Contact Web3 College</h1>  
        
        <form className="bg-dark rounded-lg p-8 shadow-custom-xl">  
          <div className="form-control w-full mb-4">  
            <label className="label">  
              <span className="label-text text-white">Your Name</span>  
            </label>  
            <input   
              type="text"   
              placeholder="Enter your name"   
              className="input input-bordered w-full bg-dark-lighter text-white border-accent-green focus:border-primary"   
            />  
          </div>  

          <div className="form-control w-full mb-4">  
            <label className="label">  
              <span className="label-text text-white">Email Address</span>  
            </label>  
            <input   
              type="email"   
              placeholder="Enter your email"   
              className="input input-bordered w-full bg-dark-lighter text-white border-accent-green focus:border-primary"   
            />  
          </div>  

          <div className="form-control w-full mb-4">  
            <label className="label">  
              <span className="label-text text-white">Message</span>  
            </label>  
            <textarea   
              className="textarea textarea-bordered h-24 w-full bg-dark-lighter text-white border-accent-green focus:border-primary"   
              placeholder="Your message here"  
            ></textarea>  
          </div>  

          <div className="form-control mt-6">  
            <button   
              className="btn btn-primary hover:bg-accent-green transition-colors duration-300"  
            >  
              Send Message  
            </button>  
          </div>  
        </form>  

        <div className="mt-8 text-center">  
          <h2 className="text-2xl font-semibold text-accent-purple mb-4">Other Contact Methods</h2>  
          <div className="flex justify-center space-x-4">  
            <a   
              href="mailto:support@web3college.com"   
              className="btn btn-outline btn-accent text-white hover:bg-accent-blue"  
            >  
              Email Support  
            </a>  
            <a   
              href="https://discord.gg/web3college"   
              target="_blank"   
              className="btn btn-outline btn-accent text-white hover:bg-accent-purple"  
            >  
              Discord Community  
            </a>  
          </div>  
        </div>  
      </div>  
       <Footer />
    </div> 
  )  
}  