import { motion } from 'framer-motion';
import {  ShieldCheckIcon, BoltIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import '../styles/hero.css';

const Hero = () => {
  const handleScroll = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-gray-700 justify-center py-20 px-6 sm:px-10 lg:px-20 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAzMG0tMjggMGEyOCwyOCAwIDEsMSA1NiwwYTI4LDI4IDAgMSwxIC01NiwwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-20"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-gray-700"
        >
          <ShieldCheckIcon className="w-5 h-5 text-amber-400 mr-2" />
          <span className="text-sm text-gray-300">Secure Payment Processing</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
        >
          Fast, Secure &{' '}
          <span className="relative">
            <span className="text-amber-400 relative z-10">Simple Payments</span>
            <motion.span 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute bottom-0 left-0 h-3 bg-amber-400/30 -rotate-2 -z-0"
            ></motion.span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed"
        >
          You've been sent a payment request. Use your preferred payment method to complete your transaction safely in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <button
            className="group relative flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-amber-500/20 hover:shadow-xl"
            onClick={() => handleScroll('payment')}
          >
            <BoltIcon className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
            Pay Now
            <span className="absolute inset-0 -z-10 bg-amber-300 rounded-lg blur-md group-hover:blur-lg transition-all duration-300 opacity-70 group-hover:opacity-100"></span>
          </button>
          
          <button
            className="flex items-center justify-center bg-transparent hover:bg-gray-800/50 text-white font-medium py-4 px-8 rounded-lg border border-gray-700 transition-colors duration-300 backdrop-blur-sm"
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
          {[
            { icon: BoltIcon, text: "Instant Processing", desc: "Quick payment completion" },
            { icon: ShieldCheckIcon, text: "Bank-Level Security", desc: "Your data is protected" },
            { icon: LockClosedIcon, text: "Encrypted Transactions", desc: "All payments are secure" }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-400/10 rounded-lg mb-3">
                <feature.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-medium mb-1">{feature.text}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

       
      </div>
    </section>
  );
};

export default Hero;