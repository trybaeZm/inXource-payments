import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleIcon, PhotoIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../Components/ui/dialog"
import PaymentService from '../api/payment';
import { useLocation, useNavigate } from 'react-router-dom';

import type { companyProductsType, FormData, payloadType, selectedImagesType, userTypes } from '../types/types';

const ProductSelectionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [companyProducts, setCompanyProducts] = useState<companyProductsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<selectedImagesType[]>([]);
  const [loadingConfirmation, setLoadingConfirmation] = useState(false);
  const [productId, setProductId] = useState('');
  const [openProductCard, setOpenProductCard] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<companyProductsType | null>(null);

  const companyInfoString = sessionStorage.getItem('companyInfo');
  const company = companyInfoString ? JSON.parse(companyInfoString) : null;

  // Handle image selection
  const handleDivClick = () => {
    if (selectedImages.length >= 3) {
      Swal.fire("Limit Reached", "You can only upload a maximum of 3 images.", "info");
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files: File[] = Array.from(event.target.files ?? []);
    const remainingSlots: number = 3 - selectedImages.length;

    const newImages = files
      .filter((file: File) => file.type.startsWith('image/'))
      .slice(0, remainingSlots)
      .map((file: File) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        file: file,
      }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    event.target.value = ''; // clear input
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Fetch company products
  const fetchCompanyProduct = async () => {
    try {
      const res = await PaymentService.getProductInfoByBusiness(company.business_id);
      setCompanyProducts(res ?? []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Swal.fire('Error', errorMessage, 'error');
      console.error('Error fetching company info:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProduct();
  }, []);

  // Form state and handlers
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    location: '',
    summarized_notes: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedProduct || !formData.quantity) return 0;
    return parseFloat(formData.quantity) * selectedProduct.price;
  };

  const calculatePartial = () => {
    if (!selectedProduct || !formData.quantity) return 0;
    return parseFloat(formData.quantity) * selectedProduct.partialPayment;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!productId) {
      Swal.fire('Selection Required', 'Please select a product to continue', 'warning');
      return;
    }

    setUploadLoading(true);

    const userDetails: userTypes = location.state?.data;

    try {
      const response = await PaymentService.createTransaction(productId, formData as unknown as FormData);
      
      if (response) {
        Swal.fire({
          title: 'Confirm Order',
          html: `<div class="text-left">
            <p class="mb-2"><strong>Product:</strong> ${selectedProduct?.name || ''}</p>
            <p class="mb-2"><strong>Quantity:</strong> ${formData.quantity}</p>
            <p class="mb-2"><strong>Total Amount:</strong> ZMW ${calculateTotal().toFixed(2)}</p>
            <p class="mb-2"><strong>Initial Payment:</strong> ZMW ${calculatePartial().toFixed(2)}</p>
            <p class="text-sm mt-3">Customer will pay the initial amount now and the remainder upon completion/delivery.</p>
          </div>`,
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Proceed to Payment',
          confirmButtonColor: '#3b82f6',
          cancelButtonText: 'Cancel',
          showLoaderOnConfirm: true,
          allowOutsideClick: () => !Swal.isLoading(),
          preConfirm: async (): Promise<void> => {
            try {
              setLoadingConfirmation(true);
              
              let payload: payloadType = {
                totalAmount: calculateTotal(),
                userDetails: userDetails as userTypes,
                formData: {
                  sammarized_notes: formData.summarized_notes,
                  location: formData.location
                },
                totalPartialPrice: calculatePartial(),
                items: {
                  orderId: '',
                  product_id: productId,
                  quantity: parseInt(formData.quantity) || 0,
                  price: selectedProduct?.partialPayment || 0,
                },
                transactionId: response.data?.orderNumber,
                token: response.data?.data.token,
              };

              const orderResponse = await PaymentService.saveOrder({ payload, selectedImages });
              if (orderResponse) {
                console.log("Order saved successfully", orderResponse);
              }

              PaymentService.redirectToPayment(response.data?.data.paymentLink);
            } catch (error: unknown) {
              console.log('Payment Error:', error);
              throw new Error('Payment processing failed');
            }
          }
        }).then((result) => {
          if (result.isConfirmed) {
            // Payment was successful
          }
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  // Product Image Component
  const ImageComponent = ({ product }: { product: companyProductsType }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const getImages = async () => {
        try {
          const res = await PaymentService.getProductImages(product.id, product.imageName);
          if (res && res.length > 0) {
            setImageUrl(res);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      getImages();
    }, [product.id, product.imageName]);

    return (
      <div className="rounded-md mb-2 flex items-center justify-center overflow-hidden h-32 bg-gray-100">
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-full w-full"></div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <PhotoIcon className="w-8 h-8" />
            <span className="text-xs mt-1">No Image</span>
          </div>
        )}
      </div>
    );
  };

  // Product Selection Dialog
  const ProductPopup = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    return (
      <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
        <DialogContent className="w-full max-w-4xl text-gray-200 bg-gray-800 rounded-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Select a Product
            </DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-y-auto max-h-[70vh] mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              {companyProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setProductId(product.id);
                    setSelectedProduct(product);
                    setFormData(prev => ({ ...prev, productId: product.id }));
                    onClose();
                  }}
                  className={`relative p-4 rounded-lg transition-all duration-200 ${
                    productId === product.id 
                      ? "ring-2 ring-blue-500 bg-blue-500/10" 
                      : "bg-gray-700/50 hover:bg-gray-700/80"
                  }`}
                >
                  {productId === product.id && (
                    <CheckCircleIcon className="text-blue-500 size-6 absolute right-3 top-3" />
                  )}

                  <ImageComponent product={product} />
                  
                  <div className="flex flex-col items-start mt-3">
                    <div className="text-white text-sm font-medium truncate w-full">{product.name}</div>
                    <div className="flex justify-between w-full mt-1">
                      <div className="text-white font-bold text-md">ZMW {product.price.toFixed(2)}</div>
                      {product.partialPayment > 0 && (
                        <div className="text-xs text-blue-300">
                          Pay ZMW {product.partialPayment.toFixed(2)} now
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-300">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-700 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {company && (
            <div className="flex justify-center mb-4">
              <img
                src={company.logo_url || 'https://imageplaceholder.net/600x400/eeeeee/131313?text=Your+logo'}
                alt="Business Logo"
                className="h-20 w-20 rounded-full border-2 border-gray-600 object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white mb-2">Place Your Order</h1>
          <p className="text-gray-400">Select a product and provide order details</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Product Selection */}
              <div className="mb-6">
                <label className="block text-gray-200 font-medium mb-2">
                  Select Product *
                </label>
                <button 
                  type="button" 
                  onClick={() => setOpenProductCard(true)}
                  className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <ShoppingCartIcon className="w-5 h-5 text-blue-400 mr-2" />
                    <span>
                      {selectedProduct 
                        ? selectedProduct.name 
                        : "Choose a product"
                      }
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">Click to select</span>
                </button>
                
                <ProductPopup 
                  open={openProductCard} 
                  onClose={() => setOpenProductCard(false)} 
                />

                {selectedProduct && (
                  <div className="mt-3 p-3 bg-gray-700 rounded-lg flex items-center">
                    <div className="flex-1">
                      <p className="text-white font-medium">{selectedProduct.name}</p>
                      <p className="text-gray-400 text-sm">ZMW {selectedProduct.price.toFixed(2)} each</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setProductId('');
                        setSelectedProduct(null);
                        setFormData(prev => ({ ...prev, productId: '' }));
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-gray-200 font-medium mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-gray-200 font-medium mb-2">
                  Product Images (Optional)
                </label>
                <p className="text-gray-400 text-sm mb-3">Upload up to 3 images for reference</p>
                
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFilesChange}
                  className="hidden"
                />
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-28 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {selectedImages.length < 3 && (
                    <div
                      onClick={handleDivClick}
                      className="border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center h-28 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <PhotoIcon className="w-8 h-8 text-gray-500 mb-1" />
                      <span className="text-xs text-gray-400">Add Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Location */}
              <div className="mb-6">
                <label htmlFor="location" className="block text-gray-200 font-medium mb-2">
                  Delivery Location (Optional)
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter delivery address"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="summarized_notes" className="block text-gray-200 font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="summarized_notes"
                  name="summarized_notes"
                  value={formData.summarized_notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any special instructions or requirements..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Order Summary */}
              {selectedProduct && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Product</span>
                      <span className="text-white">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity</span>
                      <span className="text-white">{formData.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Unit Price</span>
                      <span className="text-white">ZMW {selectedProduct.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                      <span className="text-gray-400">Total Amount</span>
                      <span className="text-white font-bold">ZMW {calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400">Initial Payment</span>
                      <span className="text-blue-400 font-medium">ZMW {calculatePartial().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploadLoading || !productId}
                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
                  uploadLoading || !productId
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500 cursor-pointer'
                }`}
              >
                {uploadLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Loading Overlay for Payment Processing */}
      {loadingConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <h3 className="text-white text-lg font-medium mb-2">Processing Payment</h3>
              <p className="text-gray-400 text-center">Please wait while we redirect you to the payment gateway...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelectionForm;