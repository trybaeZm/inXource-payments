import React, { useState, useEffect } from 'react';
import PaymentService from '../api/payment';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const PhoneVerification = () => {
  const location = useLocation();
  const navigation = useNavigate();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(true);

  const { alias } = useParams();
  const fetchCompanyInfo = async () => {
    setLoadingCompany(true);

    try {
      // First request: decrypt token
      const tokenResponse = await fetch('http://localhost:3000/api/dycryptToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: alias }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Failed to decrypt token. Status: ${tokenResponse.status}`);
      }

      const decryptedData = await tokenResponse.json();

      if (!decryptedData?.id) {
        throw new Error('Invalid decrypted token data');
      }

      // Second request: fetch company data
      const companyResponse = await fetch('http://localhost:3000/api/fetchCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ business_id: decryptedData.id }),
      });

      if (!companyResponse.ok) {
        throw new Error(`Failed to fetch company data. Status: ${companyResponse.status}`);
      }

      const businessData = await companyResponse.json();

      sessionStorage.setItem('companyInfo', JSON.stringify(businessData.data));
      setCompanyInfo(businessData.data);

    } catch (error) {
      console.error('Error fetching company info:', error);
    } finally {
      setLoadingCompany(false);
    }
  };


  useEffect(() => {
    if (alias) fetchCompanyInfo();
  }, [alias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^(07\d{8}|09\d{8})$/;
    if (!phoneRegex.test(phone)) {
      Swal.fire('Invalid Phone', 'Phone number must start with 07 or 09 and be 10 digits long.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await PaymentService.getCustomerByPhoneAndBusiness(phone, companyInfo.id);
      console.log(res)
      if (res) {
        navigation('/payment/product', { state: { res } });
      } else {
        navigation('/payment/info', {
          state: {
            phone: phone,
            business_id: companyInfo.id
          },
        });
      }
    } catch (error) {
      Swal.fire('Error', 'Error checking customer', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="font-sans bg-gray-800 flex justify-center items-center h-screen m-0">
      {loadingCompany ?
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
        :
        <div className="bg-gray-700 text-white p-8 rounded-xl shadow-md max-w-md w-full">
          {
            companyInfo ? 
            <>
              {companyInfo && (
                <div className="mt-4 mb-2 flex justify-center flex-col items-center">
                  <img
                    src={
                      companyInfo.logo_url
                        ? companyInfo.logo_url
                        : 'https://imageplaceholder.net/600x400/eeeeee/131313?text=Your+logo'
                    }
                    alt="Business Logo"
                    className="h-28 w-28 rounded-full border border-gray-300 object-cover"
                  />
                  <h2 className="mt-2 text-lg font-semibold">{companyInfo.business_name}</h2>
                </div>
              )}
              <h2 className="mb-4 text-xl text-center font-semibold">
                Enter Your Phone Number
              </h2>
              <form className='' onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="phone" className="block text-sm text-gray-200 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0977123456"
                    required
                    className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg text-base hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Checking...' : 'Next'}
                </button>
              </form>
              <div className="text-sm text-gray-500 mt-4 text-center">
                We’ll check if you’ve shopped with us before.
              </div>
            </>
            :
            <>
              <div>
                Error when collecting company information. Please try again later.
              </div>
            </>
          }
        </div>
      }

    </div>
  );
};



export default PhoneVerification;
