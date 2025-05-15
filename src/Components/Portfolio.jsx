// import { motion } from "framer-motion";
// import React, { useState, useEffect } from "react";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import Model from "../assets/IMG-20241206-WA0017.jpg";
// import Model2 from "../assets/IMG-20241206-WA0013.jpg";
// import Model3 from "../assets/IMG-20241206-WA0015.jpg";
// import Model4 from "../assets/IMG-20241206-WA0012.jpg";
// import Model5 from "../assets/IMG-20241206-WA0009.jpg";
// import Model6 from "../assets/IMG-20241206-WA0018.jpg";

// const Portfolio = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const projects = [
//     { title: "Luxury Fashion Campaign", image: Model2 },
//     { title: "Tech Innovators Ad", image: Model3 },
//     { title: "Global Reach Awareness", image: Model4 },
//     { title: "Eco-Friendly Brand Launch", image: Model5 },
//     { title: "Creative Product Marketing", image: Model6 },
//     { title: "Social Impact Campaign", image: Model },
//   ];

//   useEffect(() => {
//     // Simulate an API delay for loading
//     const timer = setTimeout(() => setIsLoading(false), 2000); // 2 seconds
//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <section id="portfolio" className="py-16 bg-white text-gray-800">
//       <div className="max-w-7xl mx-auto px-6">
//         {/* Section Title */}
//         <h2 className="text-3xl font-bold text-center mb-6">
//           Our <span className="text-amber-400">Portfolio</span>
//         </h2>
//         <p className="text-center text-gray-600 mb-10">
//           Discover the creative projects that showcase our expertise in delivering exceptional results.
//         </p>

//         {/* Projects Grid */}
//         <div className="grid md:grid-cols-3 gap-6">
//           {projects.map((project, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0 }}
//               whileInView={{ opacity: 1 }}
//               transition={{ delay: index * 0.2, duration: 0.6 }}
//               viewport={{ once: true }}
//               className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition duration-300"
//             >
//               {/* Image Skeleton */}
//               {isLoading ? (
//                 <Skeleton height={192} className="rounded-lg" />
//               ) : (
//                 <img
//                   src={project.image}
//                   alt={project.title}
//                   className="w-full h-48 object-cover rounded-lg"
//                 />
//               )}

//               {/* Title Skeleton */}
//               <h3 className="mt-4 text-xl font-semibold text-gray-800">
//                 {isLoading ? <Skeleton width="60%" /> : project.title}
//               </h3>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Portfolio;


import React from 'react'

const Portfolio = () => {
  return (
    <div>Portfolio</div>
  )
}

export default Portfolio