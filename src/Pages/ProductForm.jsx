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
        // navigation('/');
      }
    });
  };
  
  if (!companyProducts) {
    return <div style={spinnerStyle}>Loading products...</div>;
  }


  return (
    <div className="bg-gray-800 text-white font-sans h-screen m-0 flex justify-center items-center">
      <div className="bg-gray-700 p-8 rounded-xl shadow-md w-full max-w-md">
        {company && (
          <div className="mt-4 flex justify-center">
            <img
              src={
                company.logo_url
                  ? company.logo_url
                  : 'https://imageplaceholder.net/600x400/eeeeee/131313?text=Your+logo'
              }
              alt="Business Logo"
              className="h-28 w-28 rounded-full border border-gray-300 object-cover mb-5"
            />
          </div>
        )}
        <h2 className="text-center text-[#00b4d8] mb-5 text-xl font-semibold">Select Product</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="productId" className="block mt-4 mb-1 font-bold text-[#e0f7fa]">
            Product
          </label>
          <select
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-[#415a77] text-white text-base focus:outline-none"
          >
            <option value="">-- Select a Product --</option>
            {companyProducts &&
              companyProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ZMW {product.price}
                </option>
              ))}
          </select>

          <label htmlFor="quantity" className="block mt-4 mb-1 font-bold text-[#e0f7fa]">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-3 py-2 rounded-md bg-[#415a77] text-white text-base focus:outline-none"
          />

          <label htmlFor="location" className="block mt-4 mb-1 font-bold text-[#e0f7fa]">
            Delivery Location (optional)
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-[#415a77] text-white text-base focus:outline-none"
          />

          <p className="text-[#90e0ef] mt-3">
            Total Price: <strong>ZMW {totalPrice.toFixed(2)}</strong>
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`mt-5 w-full py-3 rounded-md font-bold transition-colors duration-300 ${loading
                ? 'bg-[#80d0e3] text-[#0d1b2a] opacity-70 cursor-not-allowed'
                : 'bg-[#00b4d8] text-[#0d1b2a] hover:bg-[#009ac1] cursor-pointer'
              }`}
          >
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductSelectionForm;
