import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import PaymentService from '../api/payment';
import { useLocation, useNavigate } from 'react-router-dom';

const spinnerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  color: '#00b4d8',
  fontSize: '1.2rem'
};

const ProductSelectionForm = () => {
  const location = useLocation();
  const navigation = useNavigate();
  const [companyProducts, setCompanyProducts] = useState();
  const [loading, setLoading] = useState(false);

  const company = JSON.parse(sessionStorage.getItem('companyInfo'));

  useEffect(() => {
    const fetchCompanyProduct = async () => {
      try {
        const res = await PaymentService.getProductInfoByBusiness(company.business_id)
        setCompanyProducts(res);
      } catch (error) {
        Swal.fire('An Error Occured', error.message, 'error')
        console.error('Error fetching company info:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (company) fetchCompanyProduct();
  }, []);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    location: ''
  });

  const [totalPrice, setTotalPrice] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    const product = companyProducts?.find(p => p.id.toString() === updatedData.productId);
    if (product && updatedData.quantity) {
      setTotalPrice(product.price * parseFloat(updatedData.quantity));
    } else {
      setTotalPrice(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let userDetails = location.state?.res;

    const selectedProduct = companyProducts?.find(p => p.id.toString() === formData.productId);
    if (!selectedProduct) {
      Swal.fire('Error', 'Please select a product', 'error');
      setLoading(false);
      return;
    }

    let response;
    try {
      response = await PaymentService.createTransaction();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
      setLoading(false);
      return;
    }

    const payload = {
      totalPrice: totalPrice,
      userDetails: userDetails,
      token: response.token,
      product: selectedProduct,
      formData: formData
    };

    setLoading(false);

    Swal.fire({
      title: 'Confirm Order',
      html: `<p><strong>Product:</strong> ${selectedProduct.name}</p>
         <p><strong>Quantity:</strong> ${formData.quantity}</p>
         <p><strong>Total:</strong> ZMW ${totalPrice.toFixed(2)}</p>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Place Order',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          await PaymentService.processPayment(payload);
        } catch (error) {
          Swal.showValidationMessage(`Payment failed: ${error.message}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        navigation('/');
      }
    });
  };

  if (!companyProducts) {
    return <div style={spinnerStyle}>Loading products...</div>;
  }


  return (
    <div style={styles.body}>
      <div style={styles.formContainer}>
        {company && (
          <div className="mt-4 flex justify-center">
            <img
              src={company.logo_url ? company.logo_url : 'https://imageplaceholder.net/600x400/eeeeee/131313?text=Your+logo'}
              alt="Business Logo"
              className="h-28 w-28 rounded-full border border-gray-300 object-cover mb-5"
            />
          </div>
        )}
        <h2 style={styles.heading}>Select Product</h2>
        <form onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="productId">Product</label>
          <select
            style={styles.input}
            name="productId"
            id="productId"
            value={formData.productId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Product --</option>
            {companyProducts && companyProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - ZMW {product.price}
              </option>
            ))}
          </select>

          <label style={styles.label} htmlFor="quantity">Quantity</label>
          <input
            style={styles.input}
            type="number"
            name="quantity"
            id="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />

          <label style={styles.label} htmlFor="quantity">Delivery Location (optional)</label>
          <input
            style={styles.input}
            type="text"
            name="location"
            id="location"
            value={formData.location}
            onChange={handleChange}
            min="1"
          />

          <p style={{ color: '#90e0ef', marginTop: '10px' }}>
            Total Price: <strong>ZMW {totalPrice.toFixed(2)}</strong>
          </p>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = styles.button.backgroundColor;
            }}
            disabled={loading}
          >
            {loading ? 'Placing order...' : 'Place Order'}
          </button>

        </form>
      </div>
    </div>
  );
};

const styles = {
  body: {
    backgroundColor: '#0d1b2a',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    height: '100vh',
    margin: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  formContainer: {
    backgroundColor: '#1b263b',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
    width: '100%',
    maxWidth: '400px'
  },
  heading: {
    textAlign: 'center',
    color: '#00b4d8',
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginTop: '15px',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#e0f7fa'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#415a77',
    color: '#ffffff',
    fontSize: '1rem'
  },
  button: {
    marginTop: '20px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#00b4d8',
    color: '#0d1b2a',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  buttonHover: {
    backgroundColor: '#009ac1'
  },
  buttonDisabled: {
    backgroundColor: '#80d0e3',
    cursor: 'not-allowed',
    opacity: 0.7
  }
};

export default ProductSelectionForm;
