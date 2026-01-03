'use client'
import { useState, useEffect } from 'react';
import {
  PhotoIcon,
  XMarkIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import PaymentService from '../../../api/payment';
import type { companyProductsType, CartItem, companyInfoType, CheckoutData, Promotion } from '../../../types/types';
import { createOrderNotification, makeOrderByMainUser } from '../../../services/order';
import { getUserData } from '../../../services/sessions';
import CheckoutPopup from './componrnts/CheckoutPopup';
import { PromotionService } from '../../../services/promotion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Cart component
const CartSidebar = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ShoppingCartIcon className="w-6 h-6" />
              Cart ({itemCount})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
                <p className="text-sm mt-1">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{item.name}</h4>
                      <p className="text-blue-400 font-semibold">ZMW {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="text-white font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors ml-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-700 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Total:</span>
                <span className="text-white font-bold text-xl">ZMW {total.toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};





const ProductSelectionForm = () => {
  const [companyProducts, setCompanyProducts] = useState<companyProductsType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<companyProductsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<companyProductsType | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false)
  const promoService = new PromotionService()
  const [companyInfoString, setCompanyInfo] = useState<any>(null);

   useEffect(() => {
    const stored = sessionStorage.getItem('companyInfo');
    if (stored) {
      setCompanyInfo(JSON.parse(stored));
    }
  }, []);
  
  const company: companyInfoType = companyInfoString ? JSON.parse(companyInfoString) : null;

  const userData = getUserData()
  // Fetch company products
  const fetchCompanyProduct = async () => {
    try {
      const res = await PaymentService.getProductInfoByBusiness(company.id);
      setCompanyProducts(
        (res ?? []).map((p: any) => ({
          ...p,
          description: "", // add missing field
        }))
      );
      setFilteredProducts(
        (res ?? []).map((p:any) => ({
          ...p,
          description: "",
        }))
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(companyProducts);
    } else {
      const filtered = companyProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  async function applyPromotion(product: companyProductsType) {
    const promo = await promoService.getActivePromotionForProduct(product.id);

    if (!promo) {
      return {
        hasPromo: false,
        finalPrice: product.price,
        percentage: 0,
        originalPrice: product.price,
      };
    }

    const percentage = promo.discount;
    const discount = (product.price * percentage) / 100;
    const finalPrice = product.price - discount;

    return {
      hasPromo: true,
      finalPrice,
      percentage,
      originalPrice: product.price,
    };
  }



  const addToCart = (product: companyProductsType) => {
    const finalPrice = product.promo
      ? product.price * (1 - product.promo.discount / 100)
      : product.price;

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);

      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: finalPrice,            // 👈 USE DISCOUNTED PRICE
        partialPayment: product.partialPayment,
        image: '',
        quantity: 1,
        description: product.description,
      };

      return [...prev, cartItem];
    });
  };

  const updateCartItemExtras = (
    id: string,
    extras: {
      description?: string;
      specialInstructions?: string;
      imageFile?: File | null;
    }
  ) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
            ...item,
            description: extras.description ?? item.description,
            specialInstructions: extras.specialInstructions ?? item.specialInstructions,
            images: extras.imageFile ?? item.images,
          }
          : item
      )
    );
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const viewProductDetails = (product: companyProductsType) => {
    setSelectedProduct(product);
    setProductDetailOpen(true);
  };

  // Checkout functionality
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire('Cart Empty', 'Please add some products to your cart first.', 'warning');
      return;
    }

    setCartOpen(false);

    // Open the custom checkout popup instead of SweetAlert
    setShowCheckout(true);
  };

  const processCheckout = async (CheckoutData: CheckoutData) => {
    try {
      const response = await makeOrderByMainUser(cartItems, userData, company, CheckoutData)

      if (response) {

        if (company.hasWallet) {
          const responsefromtoken = await PaymentService.createTransaction(response.id)
          if (responsefromtoken.data) {
            await createOrderNotification({
              userId: userData.id,
              businessId: company.id,
              orderId: response.id ?? "",
              products: cartItems,
              orderedAt: new Date().toISOString()
            });
            PaymentService.redirectToPayment(responsefromtoken.data.data.paymentLink)
          }
        } else {
          await createOrderNotification({
            userId: userData.id,
            businessId: company.id,
            orderId: response.id ?? "",
            products: cartItems,
            orderedAt: new Date().toISOString()
          });
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: "Transaction completed successfully",
            confirmButtonColor: '#1A0670',
          }).then(() => {
            PaymentService.redirectToPayment("/")
          });
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      throw error // Re-throw to handle in the popup
    }
  }

  // Product Card Component
  const ProductCard = ({
    product,
    onAddToCart,
    onViewDetails
  }: {
    product: companyProductsType;
    onAddToCart: (product: companyProductsType) => void;
    onViewDetails: (product: companyProductsType) => void;
  }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [promo, setPromo] = useState<Promotion | null>(null);

    useEffect(() => {
      const loadPromo = async () => {
        const p = await promoService.getActivePromotionForProduct(product.id);
        if (p) {
          setPromo(p);
        }
      };

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
      loadPromo();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Product Image */}
        <div className="relative h-48 bg-gray-700">
          {loading ? (
            <div className="animate-pulse bg-gray-600 h-full w-full"></div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onViewDetails({
                ...product,
                promo
              })}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center h-full text-gray-400 cursor-pointer"
              onClick={() => onViewDetails(product)}
            >
              <PhotoIcon className="w-12 h-12 mb-2" />
              <span className="text-sm">No Image</span>
            </div>
          )}

          {/* Partial Payment Badge */}
          {product.partialPayment > 0 && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Pay ZMW {product.partialPayment.toFixed(2)} now
            </div>
          )}.

          {promo && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {promo.discount}% OFF
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3
            className="text-white font-semibold mb-2 cursor-pointer hover:text-blue-400 transition-colors line-clamp-2"
            onClick={() => onViewDetails(product)}
          >
            {product.name}
          </h3>

          <div className="flex items-center justify-between mb-3">
            {promo ? (
              <div>
                <span className="text-sm text-gray-400 line-through mr-2">
                  ZMW {product.price.toFixed(2)}
                </span>

                <span className="text-2xl font-bold text-green-400">
                  ZMW {(product.price * (1 - promo.discount / 100)).toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-white">
                ZMW {product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart({
              ...product,
              promo
            })}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    );
  };



  // Product Detail Modal
  const ProductDetailModal = ({
    product,
    isOpen,
    onClose,
    onAddToCart
  }: {
    product: companyProductsType | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: companyProductsType) => void;
  }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    if (!product) return null;

    const promo = product.promo;
    const discountedPrice = promo
      ? product.price * (1 - promo.discount / 100)
      : product.price;

    useEffect(() => {
      if (product && isOpen) {
        const getImages = async () => {
          try {
            const res = await PaymentService.getProductImages(
              product.id,
              product.imageName
            );
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
      }
    }, []);

    return (
      <Dialog open={isOpen} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {product.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

            {/* Product Image */}
            <div className="relative bg-gray-700 rounded-lg overflow-hidden">
              {/* PROMO BADGE */}
              {promo && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {promo.discount}% OFF
                </div>
              )}

              {loading ? (
                <div className="animate-pulse bg-gray-600 h-80 w-full"></div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-gray-400">
                  <PhotoIcon className="w-16 h-16 mb-4" />
                  <span>No Image Available</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4">

              {/* PRICE AREA */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Price</h3>

                {promo ? (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 line-through text-lg">
                      ZMW {product.price.toFixed(2)}
                    </span>
                    <span className="text-3xl font-bold text-yellow-400">
                      ZMW {discountedPrice.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-blue-400">
                    ZMW {product.price.toFixed(2)}
                  </p>
                )}

                {/* Partial Payment */}
                {product.partialPayment > 0 && (
                  <p className="text-green-400 mt-1">
                    Initial payment: ZMW {product.partialPayment.toFixed(2)}
                  </p>
                )}

                {/* Promo Description */}
                {promo && (
                  <p className="text-sm text-red-400">
                    Promo ends: {new Date(promo.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* DESCRIPTION */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-300">
                  {product.description || 'No description available.'}
                </p>
              </div>

              {/* ADD TO CART */}
              <button
                onClick={() => {
                  onAddToCart({ ...product, promo });
                  onClose();
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add to Cart
              </button>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <CheckoutPopup
        updateCartItemExtras={updateCartItemExtras}
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cartItems}
        onCheckout={processCheckout}
        company={company}
      />
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Company Info */}
            <div className="flex items-center gap-4">
              {company && (
                <img
                  src={company.logo_url || 'https://imageplaceholder.net/600x400/eeeeee/131313?text=Your+logo'}
                  alt="Business Logo"
                  className="h-10 w-10 rounded-full border-2 border-gray-600 object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{company?.name || 'Store'}</h1>
                <p className="text-gray-400 text-sm">Browse our products</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Our Products</h2>
          <p className="text-gray-400">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'No products available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onViewDetails={viewProductDetails}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={productDetailOpen}
        onClose={() => setProductDetailOpen(false)}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default ProductSelectionForm;