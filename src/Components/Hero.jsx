import '../styles/hero.css';
import { motion } from 'framer-motion';

const Hero = () => {
  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="home"
      className="hero_section bg-gray-900 text-white py-20 px-6 sm:px-10 lg:px-20"
    >
      <div className="flex flex-wrap items-center mx-auto">
        <div className="w-full text-center">
          <motion.h1
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold leading-tight mb-4"
          >
            Fast, Secure & Simple <span className="text-amber-400">Payments</span>
          </motion.h1>

          <p className="text-lg lg:text-xl text-gray-400 mb-6">
            You've been sent a payment request. Use your preferred method to complete your transaction safely in seconds.
          </p>

          <button
            className="bg-amber-400 hover:bg-amber-500 hover:text-white text-black font-semibold py-3 px-6 rounded-md transition duration-300"
            onClick={() => handleScroll('payment')}
          >
            Pay Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
