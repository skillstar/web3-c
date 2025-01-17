
'use client'
import SearchAndLayout from "./components/SearchAndLayout"  
import CourseList from "./components/CourseList"  


const ReactBasicsPage = () => {
  return (
    <div className=" text-white min-h-screen">  
      <SearchAndLayout />  
      <CourseList />  
    </div>  
  )
}

export default ReactBasicsPage

