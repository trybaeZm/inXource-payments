import { motion } from "framer-motion";
// import Model3 from "../assets/IMG-20241206-WA0011.jpg";

const Services = () => {
  const services = [
    {
      title: "Creative Campaigns",
      description: "Innovative and captivating ad campaigns to elevate your brand.",
      icon: "💡",
    },
    {
      title: "Social Media Management",
      description: "Comprehensive strategies to boost engagement and presence.",
      icon: "📱",
    },
    {
      title: "Performance Analytics",
      description: "Data-driven insights to maximize ROI and optimize performance.",
      icon: "📊",
    },
    {
      title: "Brand Identity Design",
      description: "Crafting unique and memorable brand visuals and stories.",
      icon: "🎨",
    },
  ];

  return (
    <section id="services" className="py-16 bg-gray-900 text-gray-300">
      <h2 className="text-4xl font-bold text-center mb-12">
        Our <span className="text-amber-400">Services</span>
      </h2>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="lg:ml-5">
          {/* <img
            src={Model3}
            className="rounded-lg"
            alt="Our ad agency services in action"
          /> */}
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 lg:mr-5">
          {services.map((service, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col justify-center items-center p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
            >
              {/* Icon */}
              <div className="text-4xl text-amber-400 mb-4">{service.icon}</div>
              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-2">
                {service.title}
              </h3>
              {/* Description */}
              <p className="text-gray-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
