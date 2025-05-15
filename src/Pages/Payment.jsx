import React, { useState } from 'react';
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useLocation } from 'react-router-dom';
import PaymentService from '../api/payment';

const PlanPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [iframeModalOpen, setIframeModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");

  const plan = location.state?.plan || {
    name: "Growth",
    price: "$49/month",
    features: [
      "Manage 3 Social Media Platforms",
      "20 Scheduled Posts per Month",
      "Detailed Analytics",
      "Priority Support"
    ],
    cta: "Choose Growth",
    popular: true
  };

  const handlePesapalCheckout = async () => {
    if (!email || !phone) {
      alert("Please provide both email and phone number.");
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(plan.price.replace(/[^0-9.]/g, ""));
      const description = `Payment for ${plan.name} Plan`;

      const payload = {
        amount,
        description,
        email_address: email,
        phone_number: phone,
      };

      const response = await PaymentService.initiatePayment(payload);

      const { redirect_url } = response.data;

      if (redirect_url) {
        setIframeUrl(redirect_url);
        setModalOpen(false); // Close the customer details modal
        setIframeModalOpen(true); // Open the iFrame modal
      } else {
        alert("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Pesapal Checkout Error:", error.response?.data || error.message);
      alert("An error occurred while processing your payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsUpCheckout = () => {
    const phoneNumber = '260975492822';

    const orderDetails = {
      planName: plan.name,
      price: plan.price,
      features: plan.features.join(', '),
    };

    const message = `Hello, I would like to place an order for the *${orderDetails.planName}* plan.\n\nPrice: ${orderDetails.price}\n\nFeatures: ${orderDetails.features}\n\nPlease let me know the next steps.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank'); 
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto p-8 bg-gray-800 rounded-lg shadow-lg">
          
          {/* Plan Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              {plan.name} <span className="text-amber-400">Plan</span>
            </h1>
            <p className="text-xl mt-2">{plan.price}</p>
            {plan.popular && (
              <span className="inline-block bg-amber-400 text-black py-1 px-3 rounded-full text-sm mt-2">
                Most Popular
              </span>
            )}
          </div>

          {/* Features Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What's included?</h2>
            <ul className="space-y-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-3 text-amber-400">✔️</span>
                  <p>{feature}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* WhatsApp Checkout Button */}
          <div className="mt-8 text-center">
            <button 
              className="w-full bg-amber-400 text-black py-3 rounded-lg font-semibold hover:bg-amber-500 transition"
              onClick={handleWhatsUpCheckout}
            >
              Place WhatsApp Order
            </button>
          </div>

          {/* Pesapal Checkout Button */}
          <div className="mt-8 text-center">
            <button 
              className="w-full bg-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => setModalOpen(true)}
            >
              Checkout with Pesapal
            </button>
          </div>
        </div>
      </div>
      
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Enter Your Details</h2>
            <label className="block mb-2 font-semibold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 rounded border border-gray-300 focus:outline-none"
              placeholder="Enter your email"
            />
            <label className="block mb-2 font-semibold">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 mb-4 rounded border border-gray-300 focus:outline-none"
              placeholder="Enter your phone number"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handlePesapalCheckout}
              >
                {loading ? "Processing..." : "Proceed to Pay"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for iFrame */}
      {iframeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="relative bg-white w-full max-w-4xl p-6 rounded-lg">
            <button
              className="absolute top-2 right-2 text-black text-2xl font-bold"
              onClick={() => setIframeModalOpen(false)}
            >
              &times;
            </button>
            <iframe
              src={iframeUrl}
              title="Pesapal Payment"
              className="w-full h-[600px] rounded-lg border-none"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default PlanPage;
