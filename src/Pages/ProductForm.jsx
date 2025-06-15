import React, { useState, useEffect, useRef } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
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
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loadingConfirmation, setLoadingConfirmation] = useState(false);


  const handleDivClick = () => {
    if (selectedImages.length >= 3) {
      alert("You can only upload a maximum of 3 images.");
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    const remainingSlots = 3 - selectedImages.length;

    const newImages = files
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remainingSlots)
      .map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        file: file,
      }));

    setSelectedImages(prev => [...prev, ...newImages]);
    console.log("Selected images:", newImages);
    event.target.value = ''; // clear input
  };


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
    console.log('User Details:', userDetails);

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
          setLoadingConfirmation(true);
          PaymentService.processPayment(payload)
            .then(async (res) => {
              console.log(res);
              if (res.paymentStatus.status == 'success') {
                const orderResponse = await PaymentService.saveOrder(payload, selectedImages);
                if (orderResponse) {
                  Swal.fire('Success', 'Order placed successfully!', 'success');
                  try {
                    const orderResponse = await PaymentService.saveOrder(payload, selectedImages);
                    if (orderResponse) {
                      Swal.fire('Success', 'Order placed successfully!', 'success');
                      setLoadingConfirmation(false);
                      setTimeout(() => {
                        navigation('/');
                      }, 2000);
                    } else {
                      setLoadingConfirmation(false);
                      Swal.fire('Error', 'Failed to save order', 'error');
                    }
                  } catch (error) {
                    setLoadingConfirmation(false);
                    Swal.fire('Error', 'Failed to save order', 'error');
                  }
                } else if (res.paymentStatus.status == 'failed') {
                  setLoadingConfirmation(false);
                  Swal.fire('Error', 'Failed to save order', 'error');
                } else {
                  setLoadingConfirmation(false);
                  Swal.fire('Error', 'Failed to save order for some unknown reason', 'error');
                }
              } else {
                setLoadingConfirmation(false);
                Swal.fire('Error', res.message, 'error');
              }
            });
        } catch (error) {
          // console.log(error)
          setLoadingConfirmation(false);
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
    <div className="bg-gray-800 text-white font-sans py-20 min-h-screen m-0 flex justify-center items-center">
      {loadingConfirmation ?
        <div className="flex items-center flex-col justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <div>Loading....</div>
        </div>
        :
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

            <div className="space-y-4">
              {/* Hidden multi-file input */}
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFilesChange}
                className="hidden"
              />

              {/* Upload trigger div */}
              <div
                onClick={handleDivClick}
                className="p-10 border border-gray-100 dark:border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <PhotoIcon className="w-[30px] dark:text-gray-200" />
              </div>

              {/* Image previews */}
              {selectedImages.length > 0 && (
                <div className="flex gap-4">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative grow gap-4 border rounded overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-32 object-cover"
                      />
                      <p className="text-xs text-center p-1 truncate">{img.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
      }
    </div>
  );
};

export default ProductSelectionForm;
