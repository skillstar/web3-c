'use client'  

const DEFAULT_IMAGES = [  
  "https://i.seadn.io/gcs/files/6d5f2df1cb886b2b0cfb8231bcaceb75.jpg?auto=format&dpr=1&h=500&fr=1",  
  "https://i.seadn.io/s/raw/files/93365a2dd8e50ea072f0defa1295160d.jpg?auto=format&dpr=1&h=500&fr=1"  
];  

const CourseList = () => {  
  return (  
    <div className="container mx-auto px-4 py-8">  
      <h2 className="text-center text-3xl font-bold mb-4 text-primary">  
        6 courses  
      </h2>  

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">  
        {[  
          {  
            title: "Web3 Full-Stack Development Certificate",  
            image: DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)],  
            description: "Learn to build full-stack applications on the blockchain.",  
            tags: ["Blockchain", "Web3"]  
          },  
          {  
            title: "Next.js Full-Stack Development Certificate",  
            image: DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)],  
            description: "Master Next.js for building server-rendered React applications.",  
            tags: ["React", "Next.js"]  
          },  
          {  
            title: "Blockchain Fundamentals Certificate",  
            image: DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)],  
            description: "Understand the core concepts of blockchain technology.",  
            tags: ["Blockchain", "Fundamentals"]  
          },  
          {  
            title: "Smart Contract Development Certificate",  
            image: DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)],  
            description: "Learn to develop and deploy smart contracts on Ethereum.",  
            tags: ["Smart Contracts", "Ethereum"]  
          },  
          {  
            title: "DeFi & Web3 Certificate",  
            image: DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)],  
            description: "Explore decentralized finance and its applications.",  
            tags: ["DeFi", "Web3"]  
          },  
          {  
            title: "Advanced React Certificate",  
            image: DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)],  
            description: "Deep dive into advanced React concepts and patterns.",  
            tags: ["React", "Advanced"]  
          },  
        ].map((course, index) => (  
          <div key={index} className="card bg-base-100 w-full shadow-xl">  
            <figure>  
              <img  
                src={course.image}  
                alt={course.title}  
                className="w-full h-48 object-cover"  
              />  
            </figure>  
            <div className="card-body">  
              <h2 className="card-title">  
                {course.title}  
                <div className="badge badge-primary">NEW</div>  
              </h2>  
              <p>{course.description}</p>  
              <div className="card-actions justify-end">  
                {course.tags.map((tag, idx) => (  
                  <div key={idx} className="badge badge-outline">{tag}</div>  
                ))}  
              </div>  
            </div>  
          </div>  
        ))}  
      </div>  
    </div>  
  )  
}  

export default CourseList