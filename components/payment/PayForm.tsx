'use client'
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIcon, ArrowRightIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import PaymentService from '../../api/payment';
import Swal from 'sweetalert2';
import type { companyInfoType } from '../../types/types';
import { storeUserData } from '../../services/sessions';
import { useParams, useRouter } from 'next/navigation';
import { CompanyService } from '@/services/company';
import { Building2 } from 'lucide-react';

const PhoneVerification = () => {
  const router = useRouter();
  const { alias } = useParams<{ alias: string }>();

  const [companyInfo, setCompanyInfo] = useState<companyInfoType | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [isActive] = useState<boolean | undefined>(true)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(true)

  const companyService = new CompanyService()

  const fetchCompanyInfo = useCallback(async () => {
    setLoadingCompany(true);
    try {
      if (!alias) {
        throw new Error('Invalid decrypted token data');
      }

      const decodedStoreName = decodeURIComponent(alias);
      const companyResponse = await companyService.getBusinessDetails(decodedStoreName)

      if (!companyResponse) {
        throw new Error(`Failed to fetch company data. `);
      }

      sessionStorage.setItem('companyInfo', JSON.stringify(companyResponse));
      setCompanyInfo(companyResponse);

    } catch (error) {
      console.error('Error fetching company info:', error);
      Swal.fire('Error', 'Unable to load company information. Please try again.', 'error');
    } finally {
      setLoadingCompany(false);
    }
  }, [alias]);

  const getImages = useCallback(async (id: string, name: string) => {
    try {
      setImageLoading(true);
      const res = await companyService.getProductImages(id, name);
      if (res && res.length > 0) {
        setImageUrl(res);
      }
    } catch (err) {
      console.error('Error loading business image:', err);
    } finally {
      setImageLoading(false);
    }
  }, []);



  useEffect(() => {
    if (alias) {
      fetchCompanyInfo();
    }
  }, [alias, fetchCompanyInfo]);

  // Only fetch images once companyInfo is available
  useEffect(() => {
    if (companyInfo?.id && companyInfo?.imageName) {
      getImages(companyInfo.id, companyInfo.imageName);
    }
  }, [companyInfo, getImages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const phoneRegex = /^(07\d{8}|09\d{8})$/;

    if (!phoneRegex.test(phone)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Phone Number',
        text: 'Phone number must start with 07 or 09 and be 10 digits long.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    setLoading(true);

    if (!companyInfo) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Company information is missing.',
        confirmButtonColor: '#3b82f6',
      });
      setLoading(false);
      return;
    }

    try {
      const data = await PaymentService.getCustomerByPhoneAndBusiness({
        phone: phone,
        intBusinessId: companyInfo.id
      });

      console.log('User data:', data);

      if (data) {
        storeUserData(data)
        const encodedData = encodeURIComponent(JSON.stringify(data));
        router.push(`/${alias}/product?data=${encodedData}`);
      } else {
        router.push(
          `/payment/${alias}/info?phone=${encodeURIComponent(phone)}&business_id=${companyInfo.id}`
        );
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while checking your phone number.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loadingCompany) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent"
          />
          <p className="mt-4 text-white text-lg">Loading company information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <AnimatePresence>
        {!companyInfo ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800/80 backdrop-blur-md rounded-xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-700"
          >
            <BuildingStorefrontIcon className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-4">Company Not Found</h2>
            <p className="text-gray-300 mb-6">
              We couldn't find the company information. Please check the link and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <>
            {isActive ?
              (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-700"
                >
                  {/* Header with company info */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-center">
                    <motion.div variants={itemVariants} className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-gray-900 flex items-center justify-center mb-4 shadow-lg">
                        {imageUrl && !imageLoading ? (
                          <div
                            className="w-full h-full bg-cover bg-center rounded-xl"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <h1 className="text-2xl font-bold text-white">{companyInfo.business_name}</h1>
                      <p className="text-gray-300 mt-2">Welcome to our payment portal</p>
                    </motion.div>
                  </div>

                  {/* Form section */}
                  <div className="p-6">
                    <motion.h2 variants={itemVariants} className="text-xl font-semibold text-white mb-2 text-center">
                      Enter Your Phone Number
                    </motion.h2>

                    <motion.p variants={itemVariants} className="text-gray-400 text-center mb-6">
                      We'll check if you've shopped with us before
                    </motion.p>

                    <form onSubmit={handleSubmit}>
                      <motion.div variants={itemVariants} className="mb-6">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="07XXXXXXXX or 09XXXXXXXX"
                            required
                            className="pl-10 w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white placeholder-gray-400"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Must start with 07 or 09 and be 10 digits long
                        </p>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <button
                          type="submit"
                          disabled={loading}
                          className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all flex items-center justify-center ${loading
                            ? 'bg-blue-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                            }`}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Checking...
                            </>
                          ) : (
                            <>
                              Continue
                              <ArrowRightIcon className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </button>
                      </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                      <p className="text-sm text-blue-200 text-center">
                        <strong>Why we ask for your phone number:</strong> We use it to find your existing account or create a new one for a faster checkout experience.
                      </p>
                    </motion.div>
                  </div>
                </motion.div>)
              : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-red-900/30 backdrop-blur-md rounded-xl p-8 max-w-md w-full text-center border border-red-700 shadow-xl"
                >
                  <BuildingStorefrontIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-4">Access Restricted</h2>
                  <p className="text-gray-300 mb-6">
                    You don&apos;t have permission to access this business. Please contact the owner or administrator
                    if you believe this is a mistake.
                  </p>
                </motion.div>

              )
            }
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneVerification;