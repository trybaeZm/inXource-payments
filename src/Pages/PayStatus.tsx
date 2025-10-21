import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Hourglass, ArrowLeft, CreditCard, AlertCircle } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PaymentService from "../api/payment";
import { StatusPayload } from "../types/types";




// UI states
type UIStatus = "loading" | "success" | "failed" | "pending";



const PayStatus: React.FC = () => {
  const [status, setStatus] = useState<UIStatus>("loading");
  const [paymentDetails, setPaymentDetails] = useState<StatusPayload | null | undefined>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigation = useNavigate();
  const { id } = useParams<{ id: string }>();
  const retries = useRef(0);
  const maxRetries = 15; // ~30s if polling every 2s

  const [searchParams] = useSearchParams();

  const invoiceId = searchParams.get("bb_invoice_id");
  const token = searchParams.get("token");



  const fetchPaymentStatus = async () => {
    setStatus("loading");
    if (!id) return;

    try {
      console.log("Checking payment status for id:", invoiceId);

      const data = await PaymentService.checkPaymentStatus(token);
      
      setPaymentDetails(data.data?.payload);

      const statusCode = data.data?.paymentStatus?.responsecode;

      console.log("Payment status code:", statusCode);

      if (statusCode === 101) {
        setStatus("pending");
        if (retries.current < maxRetries) {
          retries.current++;
          setTimeout(fetchPaymentStatus, 2000);
        } else {
          setStatus("failed");
          setErrorMessage("Payment verification timed out. Please contact support.");
        }
      } else if (statusCode === 100) {
        PaymentService.updateSaveStatus(invoiceId)
          .then((res) => {
            if (res) {
              setStatus("success");
              setTimeout(() => navigation("/"), 5000);
            }
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
      setErrorMessage( "An unexpected error occurred");
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
          onClick={() => navigation("/")}
          className="flex items-center text-gray-300 mb-6 hover:text-gray-200  transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </motion.button>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-200 rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Status header */}
          <div className={`bg-${statusConfig.color}-50 py-8 px-6 flex flex-col items-center`}>
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
              className={`text-2xl font-bold text-${statusConfig.color}-800 text-center mb-2`}
            >
              {statusConfig.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`text-${statusConfig.color}-600 text-center`}
            >
              {statusConfig.description}
            </motion.p>
          </div>

          {/* Payment details */}
          <div className="p-6">
            {paymentDetails && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-6"
              >
                <h3 className="font-medium text-slate-700 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference ID:</span>
                    <span className="font-medium">{id}</span>
                  </div>
                  {paymentDetails.amount && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount:</span>
                      <span className="font-medium">ZMW {paymentDetails.amount}</span>
                    </div>
                  )}
                  {paymentDetails.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Method:</span>
                      <span className="font-medium">{paymentDetails.paymentMethod}</span>
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
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "60%" }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      className="h-full bg-yellow-500 rounded-full"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Checking payment status ({retries.current}/{maxRetries})
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm text-center">
                    You will be redirected to the home page in 5 seconds
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
                <>
                  {/* <button
                    onClick={() => navigation("/orders")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <CreditCard size={18} className="mr-2" />
                    View My Orders
                  </button> */}
                  <button
                    onClick={() => navigation("/")}
                    className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-medium transition-colors"
                  >
                    Continue Shopping
                  </button>
                </>
              )}

              {status === "failed" && (
                <>
                  <button
                    onClick={() => fetchPaymentStatus()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <CreditCard size={18} className="mr-2" />
                    Try Payment Again
                  </button>
                  <button
                    className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <AlertCircle size={18} className="mr-2" />
                    Contact Support
                  </button>
                </>
              )}

              {status === "pending" && (
                <button
                  onClick={() => navigation("/")}
                  className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-lg font-medium transition-colors"
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
          className="mt-6 text-center text-gray-300 text-sm"
        >
          <p>Need help? <a href="#" className="text-blue-600 hover:underline">Contact our support team</a></p>
        </motion.div>
      </div>
    </div>
  );
};

export default PayStatus;