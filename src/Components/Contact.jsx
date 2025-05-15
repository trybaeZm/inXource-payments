import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ContactService from '../api/contact';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState(''); // Status message (success, error, loading)
  const [isLoading, setIsLoading] = useState(false); // Show loading state

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    const { name, email, message } = formData;
    if (!name || !email || !message) {
      setStatus('Please fill out all fields.');
      return;
    }

    setStatus(''); // Clear previous status
    setIsLoading(true); // Show loading state

    try {
      // const response = await fetch('http://localhost:4455/api/contact/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      const response = await ContactService.contactSubmission(formData);
      const result = response.data;
      if (response.ok) {
        setStatus('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' }); // Clear form
      } else {
        setStatus(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false); // Remove loading state
    }
  };

  return (
    <section id="contact" className="py-16 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          <span className="text-amber-400">Get</span> In Touch
        </h2>

        {status && (
          <div 
            className={`p-4 text-center rounded-md mb-6 ${
              status.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {status}
          </div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit} 
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 text-sm">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg text-gray-200"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg text-gray-200"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="block mb-2 text-sm">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 bg-gray-800 rounded-lg text-gray-200"
              placeholder="Write your message here"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-black bg-amber-400 hover:bg-amber-500 hover:text-white transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default Contact;
