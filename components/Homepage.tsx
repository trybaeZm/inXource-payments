'use client'
import { motion } from 'framer-motion';
import { ShieldCheckIcon, BoltIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const handleScroll = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Grid pattern SVG as a constant to avoid base64 encoding issues
  const gridPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 30m-28 0a28 28 0 1 1 56 0 28 28 0 1 1-56 0' stroke='rgba(255,255,255,0.05)' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`;

  const features = [
    { 
      icon: BoltIcon, 
      text: "Instant Processing", 
      desc: "Quick payment completion" 
    },
    { 
      icon: ShieldCheckIcon, 
      text: "Bank-Level Security", 
      desc: "Your data is protected" 
    },
    { 
      icon: LockClosedIcon, 
      text: "Encrypted Transactions", 
      desc: "All payments are secure" 
    }
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-gray-900 py-20 px-6 sm:px-10 lg:px-20 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: gridPattern }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-700"
        >
          <ShieldCheckIcon className="w-5 h-5 text-amber-400 mr-2" />
          <span className="text-sm text-gray-300">Secure Payment Processing</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white"
        >
          Fast, Secure &{' '}
          <span className="relative inline-block">
            <span className="text-amber-400 relative z-10">Simple Payments</span>
            <motion.span 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute bottom-2 left-0 h-3 bg-amber-400/30 -rotate-2 -z-0"
            ></motion.span>
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed"
        >
          You've been sent a payment request. Use your preferred payment method to complete your transaction safely in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <button
            className="group relative flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-amber-500/25 hover:shadow-xl"
            onClick={() => handleScroll('payment')}
          >
            <BoltIcon className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
            Pay Now
            <span className="absolute inset-0 -z-10 bg-amber-300 rounded-lg blur-md group-hover:blur-lg transition-all duration-300 opacity-70 group-hover:opacity-100"></span>
          </button>
          
          <button
            className="flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 text-white font-medium py-4 px-8 rounded-lg border border-gray-700 transition-colors duration-300 backdrop-blur-sm"
            onClick={() => handleScroll('features')}
          >
            <LockClosedIcon className="w-5 h-5 mr-2" />
            Learn More
          </button>
        </motion.div>

        {/* Features highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-amber-400/30 transition-colors duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-400/10 rounded-lg mb-3">
                <feature.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-medium mb-1">{feature.text}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HomePage;