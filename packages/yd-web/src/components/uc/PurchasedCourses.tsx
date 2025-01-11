import { truncateText } from "@/utils/shortenAddress"


type PurchasedCoursesProps = {
  courses: {
    courseId: number;
    title: string;
    progress: number;
  }[];
};

export default function PurchasedCourses({ courses }: PurchasedCoursesProps) {
  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">  
  {courses.map((course) => (  
    <div   
      key={course.courseId}   
      className="card bg-base-100 shadow-md group"  
    >  
      <div className="card-body">  
        <figure className="relative overflow-hidden rounded-t-md">  
          <img   
            src="/1.jpg"   
            className="w-full h-48 object-cover transition-all duration-300 ease-in-out   
                       group-hover:scale-110 group-hover:brightness-90"  
          />  
        </figure>  
       <h3   
        className="card-title"  
        title={course.title}  
      >  
        {truncateText(course.title, 40)}  
      </h3>  
        <p className="text-sm">Learning Progress: {course.progress}%</p>  
        <progress  
          className="progress progress-primary w-full mt-2"  
          value={course.progress}  
          max="100"  
        ></progress>  
        <button className="btn bg-primary-dark text-black hover:text-white  btn-sm mt-4">Continue Learning</button>  
      </div>  
    </div>  
  ))}  
</div>
  );
}