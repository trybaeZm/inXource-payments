import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../Components/ui/dialog"
import PaymentService from '../api/payment';
// Removed next/image import since it's not available in this project.
import { useLocation, useNavigate } from 'react-router-dom';

import type { companyProductsType, payloadType, PaymentReturnType, selectedImagesType, userTypes } from '../types/types';

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
  const [companyProducts, setCompanyProducts] = useState<companyProductsType[]>();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<selectedImagesType[] | []>([]);
  const [loadingConfirmation, setLoadingConfirmation] = useState(false);
  const [productId, setProductId] = useState('')
  const [openProductCard, setOpenProductCard] = useState(false)

  const handleDivClick = () => {
    if (selectedImages.length >= 3) {
      alert("You can only upload a maximum of 3 images.");
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  interface ImageFile {
    name: string;
    url: string;
    file: File;
  }

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files: File[] = Array.from(event.target.files ?? []);
    const remainingSlots: number = 3 - selectedImages.length;

    const newImages: ImageFile[] = files
      .filter((file: File) => file.type.startsWith('image/'))
      .slice(0, remainingSlots)
      .map((file: File) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        file: file,
      }));

    setSelectedImages((prev: selectedImagesType[]) => [...prev, ...newImages]);
    console.log("Selected images:", newImages);
    event.target.value = ''; // clear input
  };


  const companyInfoString = sessionStorage.getItem('companyInfo');
  const company = companyInfoString ? JSON.parse(companyInfoString) : null;

  const fetchCompanyProduct = async () => {
    console.log('ok')
    try {
      const res = await PaymentService.getProductInfoByBusiness(company.business_id)
      setCompanyProducts(res ?? undefined);
    } catch (error) {
      const errorMessage =
        typeof error === 'object' &&
          error !== null &&
          'message' in error
          ? (error as { message: string }).message
          : String(error);
      Swal.fire('An Error Occured', errorMessage, 'error');
      console.error('Error fetching company info:', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCompanyProduct()
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    location: '',
    summarized_notes: ''
  });


  interface FormDataType {
    productId: string;
    quantity: string;
    location: string;
    summarized_notes: string;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedData: FormDataType = { ...formData, [name]: value };
    setFormData(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setUploadLoading(true)


    const userDetails: userTypes = location.state?.data;
    console.log('User Details:', userDetails);

    const selectedProduct = companyProducts?.find(
      (p) => p.id.toString() === formData.productId
    );



    PaymentService.createTransaction(productId, parseInt(formData.quantity))
      .then((response) => {


        console.log('Transaction Response:', response);


        console.log(loading)

        if (response) {
          const payload: payloadType = {
            totalAmount: parseFloat(formData.quantity) * (companyProducts?.find((e) => e.id === productId)?.price || 0) || 0,
            totalPartialPrice: parseFloat(formData.quantity) * (companyProducts?.find((e) => e.id === productId)?.partialPayment || 0) || 0,
            userDetails: userDetails,
            token: response.token,
            formData: {
              location: formData.location,
              sammarized_notes: formData.summarized_notes
            },
            items: {
              orderId: '', // Set this if you have an orderId, otherwise leave as empty string or generate appropriately
              product_id: productId,
              quantity: parseFloat(formData.quantity),
              price: selectedProduct?.price ?? 0,
            },
          };
          console.log("payload: ", payload)

          setLoading(false);
          // setUploadLoading(false)
          Swal.fire({
            title: 'Confirm Order',
            html: `<p><strong>Product:</strong> ${companyProducts?.filter((e) => e.id == productId)[0].name || ''}</p>
         <p><strong>Quantity:</strong> ${formData.quantity}</p>
         <p><strong>Total amount Payable:</strong> ZMW ${(parseFloat(formData.quantity) * (companyProducts?.find((e) => e.id === productId)?.partialPayment || 0) || 0).toFixed(2)}</p> 
         <p>User is required to inipayment of above amount and the rest upon completion of service and or delivery</p>`

            ,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Place Order',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            preConfirm: async (): Promise<void> => {
              try {
                setUploadLoading(false)
                setLoadingConfirmation(true);

                // initiate payment here
                PaymentService.processPayment({ payload, selectedImages })
                  .then(async (res: PaymentReturnType) => {
                    console.log("data form api:", res);

                    if (res.paymentStatus.status == 'success') {
                      const orderResponse = await PaymentService.updateSaveStatus(res.data);
                      if (orderResponse) {
                        Swal.fire({ title: 'Success', html: 'Order placed successfully!', icon: 'success', confirmButtonText: 'Ok', preConfirm: () => navigation('/') });
                      } else {
                        setLoadingConfirmation(false);
                        Swal.fire('Error', 'Failed to save order for some unknown reason', 'error');
                      }
                    }
                    else if (res.paymentStatus.status == 'failed') {
                      setLoadingConfirmation(false);
                      Swal.fire('Error', 'Payment failed. Please try again.', 'error');
                    }
                  })

                  .catch((error) => {
                    setLoadingConfirmation(false);
                    console.error('Error processing payment:', error);
                    Swal.fire('Error', 'Payment processing failed. Please try again.', 'error');
                  }
                  )
                  .finally(() => {
                    setLoadingConfirmation(false);
                    setLoading(false);
                  });

              } catch (error: unknown) {
                setLoadingConfirmation(false);
                console.log('Payment Error:', error);
                setLoading(false);
                Swal.fire('Error', 'Payment failed. Please try again.', 'error');
              }
            }
          })
            .then((result) => {
              console.log(result)
              setUploadLoading(false)
              if (result.isConfirmed) {
                // navigation('/');
              }
            })
            .finally(() => {
              setUploadLoading(false)
            })
        }
      })
      .catch((error) => {
        const errorMessage =
          typeof error === 'object' &&
            error !== null &&
            'message' in error
            ? (error as { message: string }).message
            : String(error);
        Swal.fire('Error', errorMessage, 'error');
        setLoading(false);
        setUploadLoading(false)
        return;
      })
      .finally(() => {
        setUploadLoading(false)
      })
  };

  const ImageComponent = ({ product }: { product: companyProductsType }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false);


    const getImages = () => {
      PaymentService.getProductImages(product.id, product.imageName)
        .then((res) => {
          console.log("images collected", res)
          if (res && res.length > 0) {
            setImageUrl(res)
          }
        })
        .catch((err) => console.error(err))
        .finally(() => {
          setLoading(false)
        })
    }

    useEffect(() => {
      getImages();
    }, []);

    return (
      <div className=" rounded-md mb-2 flex items-center justify-center overflow-hidden">
        {loading ? (
          <span className="text-gray-400 text-sm">Loading...</span>
        ) : imageUrl ? (
          <img
            src={imageUrl} // ✅ Use the raw URL
            alt="Product image"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span className="text-gray-400 text-sm">No Image</span>
        )}
      </div>
    );
  };

  const ProductPopUp = ({ setProductId, open, onClose }: { setProductId: (id: string) => void, open: boolean, onClose: () => void }) => {
    return (
      <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
        <DialogContent className="w-full text-gray-200 overflow-y-auto z-[9999] bg-gray-800 rounded-lg shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="">
              Select Product
            </DialogTitle>
          </DialogHeader>
          <div className=' h-full overflow-y-auto max-h-[600px]'>
            {/* Product Cards */}
            <div className="grid p-5 lg:grid-cols-3 md:grid-cols-6 sm:grid-cols-4 grid-cols-1 gap-4">
              {companyProducts &&
                companyProducts.map((product) => (
                  <button
                    type="button"
                    onClick={() => {
                      setProductId(product.id); 
                      onClose()
                    }
                    }
                    className={` relative p-2 rounded-md transition ${productId === product.id ? "ring-2 ring-green-500 " : "hover:shadow-lg bg-gray-700/50"}`}
                  >
                    {/* Check Icon */}
                    {productId === product.id && (
                      <CheckCircleIcon className="text-green-500 size-6 absolute right-2 top-2" />
                    )}

                    {/* Product Image */}
                    <ImageComponent product={product} />
                    {/* Product Name */}
                    <div className='flex flex-col items-start'>
                      <div className="text-white text-sm font-light">{product.name} </div>
                      <div className="text-white font-bold text-md">K {product.price.toFixed(2)}</div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };


  return (
    <div className="bg-gray-800 text-white font-sans py-20 min-h-screen m-0 flex justify-center items-center z-[99999]">
      {!companyProducts ?
        <div style={spinnerStyle}>Loading products...</div>
        :
        <>
          {loadingConfirmation ?
            <div className="flex items-center text-white flex-col justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              <div>Processing payment....</div>
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
                <button type='button' onClick={() => setOpenProductCard(true)} className='w-full px-3 py-2 cursor-pointer hover:opacity-[0.7] transition-ease duration-500 rounded-md bg-[#415a77] text-white text-base focus:outline-none'>
                  Select Products
                </button>

                {productId ?
                  <i>
                    you have selected <span className='font-bold'> {companyProducts && companyProducts?.filter((e) => e.id == productId)[0].name}</span>
                  </i>
                  :
                  ''
                }

                <ProductPopUp open={openProductCard} onClose={() => setOpenProductCard(false)} setProductId={setProductId} />

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
                  {selectedImages ?
                    <div className='my-4 flex justify-end'>
                      <button
                        type='button'
                        onClick={handleDivClick}
                        className="p-1 border border-gray-100 dark:border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <PhotoIcon className="w-[20px] dark:text-gray-200" />
                        <span className="ml-2 text-sm text-gray-500">Click to upload images</span>
                      </button>
                    </div>
                    :
                    <div
                      onClick={handleDivClick}
                      className="p-10 border border-gray-100 dark:border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <PhotoIcon className="w-[30px] dark:text-gray-200" />
                    </div>
                  }

                  {/* Image previews */}
                  {selectedImages.length > 0 && (
                    <div className="flex gap-4">
                      {selectedImages.map((img, index) => (
                        <div key={index} className=" grow gap-4 border rounded overflow-hidden">
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
                  Total Price: <strong>ZMW {parseFloat(formData.quantity) * (companyProducts.find((e) => e.id === productId)?.price || 0) || 0}</strong>
                </p>

                <label htmlFor="summarized_notes" className="block mt-4 mb-1 font-bold text-[#e0f7fa]">
                  Summarized Notes (optional)
                </label>
                <textarea
                  id="summarized_notes"
                  name="summarized_notes"
                  value={formData.summarized_notes}
                  onChange={handleChange}
                  rows={5} // sets a fixed height roughly equivalent to 5 lines
                  className="w-full px-3 py-2 rounded-md bg-[#415a77] text-white text-base focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  disabled={uploadLoading}
                  className={`mt-5 w-full py-3 rounded-md font-bold transition-colors duration-300 ${uploadLoading
                    ? 'bg-[#80d0e3] text-[#0d1b2a] opacity-70 cursor-not-allowed'
                    : 'bg-[#00b4d8] text-[#0d1b2a] hover:bg-[#009ac1] cursor-pointer'
                    }`}
                >
                  {uploadLoading ? 'Placing order...' : 'Place Order'}
                </button>
              </form>
            </div>
          }
        </>
      }
    </div>
  );
};
export default ProductSelectionForm;
