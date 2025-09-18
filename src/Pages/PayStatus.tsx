import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircleIcon, Hourglass } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PaymentService from "../api/payment";

// API Status codes
enum PaymentStatusCode {
  Success = 100,
  Pending = 101,
}

// UI states
type UIStatus = "loading" | "success" | "failed" | "pending";

// Callback params type
interface PaymentCallbackParams {
  bb_invoice_id: string | null;
  token: string | null;
  status: "COMPLETE" | "FAILED" | "PENDING" | null;
}

const PayStatus: React.FC = () => {
  const [status, setStatus] = useState<UIStatus>("loading");
  const navigation = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const retries = useRef(0);
  const maxRetries = 15; // ~30s if polling every 2s

  // Parse callback query params
  const query = new URLSearchParams(search);
  const callbackParams: PaymentCallbackParams = {
    bb_invoice_id: query.get("bb_invoice_id"),
    token: query.get("token"),
    status: query.get("status") as PaymentCallbackParams["status"],
  };

  const fetchPaymentStatus = async () => {
    setStatus("loading");
    if (!id) return;

    try {
      const data = await PaymentService.checkPaymentStatus(id);

      if (data.error) {
        setStatus("failed");
        return;
      }

      const statusCode = data.data?.paymentStatus?.data?.status;
      console.log("Payment status code:", statusCode);

      if (statusCode === PaymentStatusCode.Pending) {
        setStatus("pending");

        if (retries.current < maxRetries) {
          retries.current++;
          setTimeout(fetchPaymentStatus, 2000);
        } else {
          setStatus("failed"); // timeout
        }
      } else if (statusCode === PaymentStatusCode.Success) {
        setStatus("success");
        PaymentService.updateSaveStatus(id);
        setTimeout(() => navigation("/"), 2000);
      } else {
        setStatus("failed");
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
      setStatus("failed");
    }
  };

  useEffect(() => {
    // If callback gave us a final status → use that immediately
    if (callbackParams.status === "COMPLETE") {
      setStatus("success");
      PaymentService.updateSaveStatus(id!);
      setTimeout(() => navigation("/"), 2000);
    } else if (callbackParams.status === "FAILED") {
      setStatus("failed");
    } else {
      // fallback to API polling
      fetchPaymentStatus();
    }

    return () => {
      retries.current = 0;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {status === "loading" && (
        <>
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={64} className="text-blue-500" />
          </motion.div>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Checking Payment Status...
          </p>
        </>
      )}

      {status === "pending" && (
        <>
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Hourglass size={80} className="text-yellow-500" />
          </motion.div>
          <p className="mt-4 text-lg font-semibold text-yellow-700">
            Payment Pending...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle2 size={80} className="text-green-500" />
          </motion.div>
          <p className="mt-4 text-lg font-semibold text-green-700">
            Payment Successful!
          </p>
        </>
      )}

      {status === "failed" && (
        <>
          <div className="flex flex-col items-center">
            <XCircleIcon size={80} className="text-red-500" />
          </div>
          <p className="mt-4 text-lg font-semibold text-red-700">
            Payment Failed
          </p>
        </>
      )}
    </div>
  );
};

export default PayStatus;
