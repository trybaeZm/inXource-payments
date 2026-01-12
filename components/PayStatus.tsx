'use client'
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Hourglass, ArrowLeft, CreditCard, AlertCircle } from "lucide-react";
import PaymentService from "../api/payment";
import { StatusPayload } from "../types/types";
import { useRouter, useParams, useSearchParams } from 'next/navigation';



// UI states
type UIStatus = "loading" | "success" | "failed" | "pending";

const PayStatus: React.FC = () => {
  const [status, setStatus] = useState<UIStatus>("loading");
  const [paymentDetails, setPaymentDetails] = useState<StatusPayload | null | undefined>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const retries = useRef(0);
  const maxRetries = 15; // ~30s if polling every 2s


  const invoiceId = searchParams.get("bb_invoice_id");
  const token = searchParams.get("token");
  const apistatus = searchParams.get("status");



  const fetchPaymentStatus = async () => {
    setStatus("loading");
    if (!id) return;

    try {
      console.log("Checking payment status for id:", invoiceId);

      const data = await PaymentService.checkPaymentStatus(token);

      setPaymentDetails(data.data?.payload);

      console.log("Payment status code:", apistatus);

      if (apistatus == 'PENDING') {
        setStatus("pending");
        if (retries.current < maxRetries) {
          retries.current++;
          setTimeout(fetchPaymentStatus, 2000);
        } else {
          setStatus("failed");
          setErrorMessage("Payment verification timed out. Please contact support.");
        }
      } else if (apistatus == 'COMPLETE') {
        console.log("Payment completed successfully");
        PaymentService.updateSaveStatus(token)
          .then((res) => {
            setStatus("success");
            setTimeout(() => router.push("/"), 5000);
          }).catch((err) => {
            console.error("Error updating save status:", err);
            setStatus("failed");
            setErrorMessage("Failed to update order status. Please contact support.");
          });
      } else {
        setStatus("failed");
        setErrorMessage(data.data?.paymentStatus?.responsemessage || "Payment failed");
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
      setStatus("failed");
      setErrorMessage("An unexpected error occurred");
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusConfig = (status: UIStatus) => {
    switch (status) {
      case "loading":
        return {
          icon: <Loader2 size={64} className="text-blue-500" />,
          title: "Checking Payment Status",
          description: "Please wait while we verify your payment",
          color: "blue",
        };
      case "pending":
        return {
          icon: <Hourglass size={64} className="text-yellow-500" />,
          title: "Payment Processing",
          description: "Your payment is being processed. This may take a few moments",
          color: "yellow",
        };
      case "success":
        return {
          icon: <CheckCircle2 size={64} className="text-green-500" />,
          title: "Payment Successful!",
          description: "Your payment has been confirmed successfully",
          color: "green",
        };
      case "failed":
        return {
          icon: <XCircle size={64} className="text-red-500" />,
          title: "Payment Failed",
          description: errorMessage || "We couldn't process your payment",
          color: "red",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="min-h-screen bg-gray-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.push("/")}
          className="flex items-center text-gray-100 mb-6 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          <span className="font-medium">Back to Home</span>
        </motion.button>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Status header */}
          {/* Changed bg opacity and increased text contrast */}
          <div className={`bg-${statusConfig.color}-100 py-10 px-6 flex flex-col items-center`}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-4"
            >
              {status === "loading" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  {statusConfig.icon}
                </motion.div>
              ) : (
                statusConfig.icon
              )}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`text-2xl font-black text-${statusConfig.color}-900 text-center mb-2`}
            >
              {statusConfig.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`text-${statusConfig.color}-800 font-medium text-center`}
            >
              {statusConfig.description}
            </motion.p>
          </div>

          {/* Payment details */}
          <div className="p-6 bg-white">
            {paymentDetails && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-6"
              >
                <h3 className="font-bold text-gray-900 mb-3 border-b pb-2">Payment Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Reference ID:</span>
                    <span className="font-bold text-gray-900">{id}</span>
                  </div>
                  {paymentDetails.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Amount:</span>
                      <span className="font-bold text-gray-900">ZMW {paymentDetails.amount}</span>
                    </div>
                  )}
                  {paymentDetails.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Method:</span>
                      <span className="font-bold text-gray-900">{paymentDetails.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Progress indicator for pending payments */}
            {status === "pending" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mb-6"
              >
                <div className="flex items-center mb-2">
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "60%" }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      className="h-full bg-yellow-600 rounded-full"
                    />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 text-center">
                  Checking status ({retries.current}/{maxRetries})
                </p>
              </motion.div>
            )}

            {/* Countdown for success */}
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mb-6"
              >
                <div className="bg-green-100 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-green-900 font-bold text-sm text-center">
                    Redirecting to home in 5 seconds...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Actions based on status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col gap-3"
            >
              {status === "success" && (
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
                >
                  Continue Shopping
                </button>
              )}

              {status === "failed" && (
                <>
                  <button
                    onClick={() => fetchPaymentStatus()}
                    className="w-full bg-red-700 hover:bg-red-800 text-white py-4 rounded-xl font-bold transition-all shadow-md flex items-center justify-center"
                  >
                    <CreditCard size={18} className="mr-2" />
                    Try Payment Again
                  </button>
                  <button
                    className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-800 py-4 rounded-xl font-bold transition-all flex items-center justify-center"
                  >
                    <AlertCircle size={18} className="mr-2" />
                    Contact Support
                  </button>
                </>
              )}

              {status === "pending" && (
                <button
                  onClick={() => router.push("/")}
                  className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-800 py-4 rounded-xl font-bold transition-all"
                >
                  Go to Homepage
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Support footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-100 font-medium">
            Need help? <a href="#" className="text-blue-300 hover:text-blue-200 underline decoration-2 underline-offset-4">Contact support</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PayStatus;