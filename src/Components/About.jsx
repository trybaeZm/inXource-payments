import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="py-16 bg-white text-gray-800">
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="max-w-7xl mx-auto px-6"
      >
        {/* Section Heading */}
        <h2 className="text-3xl font-bold text-center mb-6">
          About <span className="text-amber-400">Sleek Stream Media</span>
        </h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto">
          At Sleek Stream Media, we specialize in crafting dynamic, results-driven campaigns that amplify your brand’s online presence. Our dedicated team of experts combines creativity, strategy, and cutting-edge tools to transform your social media into a powerhouse of engagement and growth.
        </p>

        {/* Vision and Mission Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Vision Card */}
          <div
            className="p-6 bg-gray-50 rounded-lg shadow transition transform hover:-translate-y-1 hover:shadow-md"
            role="region"
            aria-labelledby="vision-heading"
          >
            <h3
              id="vision-heading"
              className="text-xl font-semibold text-gray-800"
            >
              Our Vision
            </h3>
            <p className="mt-3 text-gray-600">
              To be the leading digital agency that inspires brands to connect, engage, and thrive in the ever-evolving digital landscape.
            </p>
          </div>

          {/* Mission Card */}
          <div
            className="p-6 bg-gray-50 rounded-lg shadow transition transform hover:-translate-y-1 hover:shadow-md"
            role="region"
            aria-labelledby="mission-heading"
          >
            <h3
              id="mission-heading"
              className="text-xl font-semibold text-gray-800"
            >
              Our Mission
            </h3>
            <p className="mt-3 text-gray-600">
              To empower businesses by delivering innovative strategies and personalized solutions that drive meaningful results and lasting success.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
