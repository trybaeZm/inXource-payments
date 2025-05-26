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

  const { alias } = useParams();

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const info = await PaymentService.getCompanyInfo(alias);

        if (!info) {
          Swal.fire('error', 'Error fetching company details.', 'error');
          navigation('/')
        }

        sessionStorage.setItem('companyInfo', JSON.stringify(info))
        setCompanyInfo(info);
      } catch (error) {
        console.error('Error fetching company info:', error.message);
      } finally {
        setLoading(false);
      }
    };

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
      const res = await PaymentService.getCustomerByPhoneAndBusiness(phone, companyInfo.business_id);

      if (res) {
        navigation('/payment/product', { state: { res } });
      } else {
        navigation('/payment/info', {
          state: {
            phone: phone,
            business_id: companyInfo.business_id,
            id: companyInfo.id,
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
    <div style={styles.body}>
      <div style={styles.formContainer}>
        {companyInfo && (
          <div className="mt-4 mb-2 flex justify-center flex-col items-center">
            <img
              src={companyInfo.logo_url ? companyInfo.logo_url : 'https://imageplaceholder.net/600x400/eeeeee/131313?text=Your+logo'}
              alt="Business Logo"
              className="h-28 w-28 rounded-full border border-gray-300 object-cover"
            />
            <h2>{companyInfo.business_name}</h2>
          </div>
        )}
        <h2 style={styles.heading}>Enter Your Phone Number</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="phone" style={styles.label}>Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0977123456"
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Checking...' : 'Next'}
          </button>
        </form>
        <div style={styles.note}>We’ll check if you’ve shopped with us before.</div>
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    backgroundColor: '#f9f9f9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    margin: 0
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: '30px 40px',
    borderRadius: '12px',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '100%'
  },
  heading: {
    marginBottom: '15px',
    fontSize: '22px',
    color: '#333',
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#555',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3081f7',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  note: {
    fontSize: '13px',
    color: '#777',
    marginTop: '10px',
    textAlign: 'center'
  }
};

export default PhoneVerification;
