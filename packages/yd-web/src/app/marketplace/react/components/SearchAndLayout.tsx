'use client'  

import { useState } from 'react';  
import { Search, X } from 'lucide-react';  

const SearchAndLayout = () => {  
  const [searchTerm, setSearchTerm] = useState('');  

  const handleClear = () => {  
    setSearchTerm('');  
  };  

  return (  
    <div className="container mx-auto px-4 py-8">  
      <div className="flex items-center justify-between mb-6">  
        {/* 搜索框 */}  
        <div className="flex-1 relative">  
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1">  
            <div className="relative flex items-center">  
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />  
              <input  
                type="text"  
                placeholder="Search 6 courses ..."  
                value={searchTerm}  
                onChange={(e) => setSearchTerm(e.target.value)}  
                className="w-full p-3 pl-10 pr-10 rounded-full bg-transparent text-white placeholder-gray-400 focus:outline-none transition duration-300"  
              />  
              {searchTerm && (  
                <button   
                  onClick={handleClear}  
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition duration-300"  
                >  
                  <X size={20} />  
                </button>  
              )}  
            </div>  
          </div>  
        </div>  

        {/* 排版按钮 */}  
      </div>  
    </div>  
  )  
}  

export default SearchAndLayout;