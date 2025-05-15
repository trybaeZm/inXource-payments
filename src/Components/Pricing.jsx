import React from "react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "Free",
      features: [
        "Manage 1 Social Media Campaign",
        "5 Ad Creatives per Month",
        "Basic Performance Analytics",
      ],
      cta: "Get Started",
    },
    {
      name: "Growth",
      price: "$49/month",
      features: [
        "Manage Up to 3 Campaigns",
        "20 Ad Creatives per Month",
        "Detailed Performance Reports",
        "Priority Support",
      ],
      cta: "Choose Growth",
      popular: true,
    },
    {
      name: "Pro",
      price: "$99/month",
      features: [
        "Manage Unlimited Campaigns",
        "Unlimited Ad Creatives",
        "Advanced Performance Analytics",
        "24/7 Dedicated Support",
        "Custom Ad Strategies",
      ],
      cta: "Go Pro",
    },
  ];

  const selectOption = (plan) => {
    navigate("/payment", { state: { plan } });
  };

  return (
    <section id="pricing" className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Pricing <span className="text-amber-400">Plans</span>
        </h2>
        <p className="text-center text-gray-500 mb-12">
          Empower your business with our tailored advertising solutions. Pick a plan that matches your goals and scale your impact!
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`border ${
                plan.popular
                  ? "border-amber-400 bg-amber-50 shadow-lg"
                  : "border-gray-200 bg-white"
              } rounded-lg p-6`}
            >
              {plan.popular && (
                <span className="text-sm text-black bg-amber-400 px-3 py-1 rounded-full uppercase mb-4 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-semibold text-gray-800">{plan.name}</h3>
              <p className="text-4xl font-bold text-gray-800 my-4">{plan.price}</p>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <span className="text-green-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full py-2 px-4 rounded-lg ${
                  plan.popular ? "text-black" : "text-white"
                } ${plan.popular ? "bg-amber-400" : "bg-gray-800"} hover:opacity-90`}
                onClick={() => {
                  selectOption(plan);
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
