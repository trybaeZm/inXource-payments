import { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    CreditCard,
    Image as ImageIcon,
    FileText,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    X,
    Loader2,
    ShoppingCart
} from 'lucide-react'
import { CartItem, CheckoutData } from '@/types/types'

interface extraitemstype {
    description: string;
    specialInstructions: string;
    imageFile: File | null,
}
interface CheckoutPopupProps {
    isOpen: boolean
    updateCartItemExtras: (id: string, extraitemstype: extraitemstype) => void;
    onClose: () => void
    cartItems: CartItem[]
    onCheckout: (checkoutData: CheckoutData) => Promise<void>
    company: any
}



const CheckoutPopup = ({ isOpen, onClose, cartItems, onCheckout, company, updateCartItemExtras }: CheckoutPopupProps) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [description, setDescription] = useState('')
    const [specialInstructions, setSpecialInstructions] = useState('')
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [optionalimagePreview, setOptionalImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const optionalfileInputRef = useRef<HTMLInputElement>(null)

    //optional stuff
    const [optionalDescription, setOptionalDescription] = useState('')
    const [optionalSpecialInstructions, setOptionalSpecialInstructions] = useState('')
    const [optionalselectedImageFile, setoptionalselectedImageFile] = useState<File | null>()
    const [optionaDataProductSelected, setOptionaDataProductSelected] = useState<CartItem | null>(null)

    const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = (e) => setImagePreview(e.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleOptionalImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        // If no file selected → clear optional fields
        if (!file) {
            setoptionalselectedImageFile(null);
            setOptionalImagePreview("");
            return;
        }

        // Accept only images
        if (!file.type.startsWith("image/")) {
            console.warn("Selected file is not an image.");
            return;
        }

        // Save file to optional state
        setoptionalselectedImageFile(file);

        // Generate preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setOptionalImagePreview(result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const removeOptionalImage = () => {
        setOptionalImagePreview("")
        setoptionalselectedImageFile(null)
        if (optionalfileInputRef.current) {
            optionalfileInputRef.current.value = ''
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const checkoutData: CheckoutData = {
                ...(description && { description }),
                ...(selectedImage && { image: selectedImage }),
                ...(specialInstructions && { specialInstructions })
            }

            await onCheckout(checkoutData)
            setCurrentStep(4) // Success step
        } catch (error) {
            console.error('Checkout failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setCurrentStep(1)
        setDescription('')
        setSpecialInstructions('')
        setSelectedImage(null)
        setImagePreview(null)
        onClose()
    }

    const steps = [
        { number: 1, title: 'Order Summary', icon: <ShoppingCart className="w-4 h-4" /> },
        { number: 2, title: 'Add Details', icon: <FileText className="w-4 h-4" /> },
        { number: 3, title: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
        { number: 4, title: 'Complete', icon: <CheckCircle2 className="w-4 h-4" /> }
    ]

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                            <div className="mt-4  p-4 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                                <div className="flex flex-wrap items-start gap-3">
                                    {/* Icon */}
                                    <div className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0">
                                        <svg
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8-4a1 1 0 00-.993.883L9 7v4a1 1 0 001.993.117L11 11V7a1 1 0 00-1-1zm0 8a1 1 0 100 2 1 1 0 000-2z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">Note:</p>
                                        <p className="mt-1 text-yellow-700 dark:text-yellow-300 text-sm break-words">
                                            You can add a <span className="font-semibold">Description</span>,
                                            <span className="font-semibold"> Special Instructions</span>, and an
                                            <span className="font-semibold"> Image</span> to this product. Click the
                                            <span className="font-semibold text-yellow-800 dark:text-yellow-200"> Edit</span> button on the product to add them.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-semibold mt-4 text-gray-900 dark:text-white mb-3">
                                Order Summary ({itemCount} items)
                            </h3>

                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                                                ) : (
                                                    <ShoppingCart className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {item.name}
                                                </p>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setOptionaDataProductSelected(item)}
                                                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
                                            >
                                                Edit
                                            </button>
                                            <p className="font-semibold text-gray-900 dark:text-white w-20 text-right">
                                                ZMW {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-4">
                            <span className="text-gray-900 dark:text-white">Total:</span>
                            <span className="text-blue-600 dark:text-blue-400">ZMW {total.toFixed(2)}</span>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Order Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a description for this order..."
                                rows={3}
                                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                            />
                        </div>

                        {/* Special Instructions */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Special Instructions (Optional — e.g., delivery location)
                            </label>
                            <textarea
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                placeholder="Any special instructions for this order..."
                                rows={2}
                                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Attach Image (Optional)
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*"
                                className="hidden"
                            />

                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-xl border-2 border-green-200 dark:border-green-800"
                                    />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                                >
                                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                                        Click to upload an image
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">
                                Payment Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">Subtotal:</span>
                                    <span className="text-blue-900 dark:text-blue-400">ZMW {total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700 dark:text-blue-300">Items:</span>
                                    <span className="text-blue-900 dark:text-blue-400">{itemCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Payment Method
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {company?.hasWallet ? 'Mobile Money Payment' : 'Cash Payment'}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {company?.hasWallet
                                                ? 'Pay using your Mobile Money balance'
                                                : 'Cash Payment'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {description && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Notes</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
                            </div>
                        )}
                    </div>
                )

            case 4:
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Order Confirmed!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your order has been successfully placed and is being processed.
                            </p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                            <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                                <div className="flex justify-between">
                                    <span>Order Total:</span>
                                    <span className="font-semibold">ZMW {total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Items:</span>
                                    <span>{itemCount} products</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetForm()}>
            {
                isOpen ?
                    <div className="backdrop-blur-xl fixed  top-0 left-0 right-0 bottom-0 bg-[#00000050] justify-center items-center flex flex-col p-0 z-[9999] ">
                        <div className="flex justify-center w-full gap-4 overflow-x-auto  px-2 py-2 flex-wrap">
                            <div className='sm:max-w-[600px] w-[100%] p-4 bg-white/95 dark:bg-gray-800/95 overflow-hidden rounded-2xl shadow-2xl'>
                                {/* Close button */}
                                <div className='flex justify-end'>
                                    <button
                                        onClick={() => onClose()}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4 text-gray-700 dark:text-gray-200"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 
                1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 
                1.414L10 11.414l-4.293 4.293a1 1 0 
                01-1.414-1.414L8.586 10 4.293 5.707a1 1 
                0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                {/* Header with Steps */}
                                <DialogHeader className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                        Checkout Process
                                    </DialogTitle>

                                    {/* Gauge Progress - No Labels */}
                                    <div className="mt-4">
                                        {/* Gauge Bar with Step Indicators */}
                                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                            {/* Progress Fill */}
                                            <div
                                                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out rounded-full"
                                                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                                            ></div>

                                            {/* Step Dots */}
                                            <div className="absolute inset-0 flex justify-between items-center">
                                                {steps.map((step, index) => (
                                                    <div
                                                        key={step.number}
                                                        className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${currentStep >= step.number
                                                            ? 'bg-blue-500 border-blue-500 shadow-sm'
                                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                                                            }`}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </DialogHeader>

                                {/* Content */}
                                <div className="p-6">
                                    {renderStepContent()}
                                </div>

                                {/* Footer with Navigation */}
                                <div className="flex gap-3 p-6 border-t border-gray-200/50 dark:border-gray-700/50">
                                    {currentStep > 1 && currentStep < 4 && (
                                        <button
                                            onClick={() => setCurrentStep(currentStep - 1)}
                                            disabled={loading}
                                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50"
                                        >
                                            <ArrowLeft className="w-4 h-4 inline mr-2" />
                                            Back
                                        </button>
                                    )}

                                    {currentStep < 3 ? (
                                        <button
                                            disabled={optionaDataProductSelected != null}
                                            onClick={() => setCurrentStep(currentStep + 1)}
                                            className="flex-1 px-5 py-3 rounded-xl font-semibold text-white 
              bg-gradient-to-r from-blue-500 to-purple-500 
              shadow-lg transition-all duration-300 transform
              hover:from-blue-600 hover:to-purple-600 hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed 
              disabled:hover:from-blue-500 disabled:hover:to-purple-500 disabled:hover:scale-100"
                                        >
                                            Continue
                                            <ArrowRight className="w-4 h-4 inline ml-2" />
                                        </button>
                                    ) : currentStep === 3 ? (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-lg"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                            ) : (
                                                <CreditCard className="w-4 h-4 inline mr-2" />
                                            )}
                                            {loading ? 'Processing...' : 'Complete Payment'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={resetForm}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                        >
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>

                            {optionaDataProductSelected && (
                                <div className="sm:max-w-[600px] w-[100%]  p-5 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
                                    <div className="space-y-6">
                                        {/* Description */}
                                        <div className="space-y-3 flex flex-col">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Order Description (Optional)
                                            </label>

                                            <textarea
                                                value={optionalDescription}
                                                onChange={(e) => setOptionalDescription(e.target.value)}
                                                placeholder={
                                                    optionaDataProductSelected?.description
                                                        ? `Current: ${optionaDataProductSelected.description}`
                                                        : "Add a description for this order..."
                                                }
                                                rows={3}
                                                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                                            />
                                        </div>

                                        {/* Special Instructions */}
                                        <div className="space-y-3 flex flex-col">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Special Instructions (Optional — e.g., delivery location)
                                            </label>

                                            <textarea
                                                value={optionalSpecialInstructions}
                                                onChange={(e) => setOptionalSpecialInstructions(e.target.value)}
                                                placeholder={
                                                    optionaDataProductSelected?.specialInstructions
                                                        ? `Current: ${optionaDataProductSelected.specialInstructions}`
                                                        : "Any special instructions for this order..."
                                                }
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                                            />
                                        </div>

                                        {/* Image Upload */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Attach Image (Optional)
                                            </label>

                                            <input
                                                type="file"
                                                ref={optionalfileInputRef}
                                                onChange={handleOptionalImageSelect}
                                                accept="image/*"
                                                className="hidden"
                                            />

                                            {optionalimagePreview || optionaDataProductSelected?.images ? (
                                                <div className="relative">
                                                    <img
                                                        src={
                                                            optionalimagePreview ||
                                                            (optionaDataProductSelected?.images
                                                                ? URL.createObjectURL(optionaDataProductSelected.images)
                                                                : "")
                                                        }
                                                        alt="Preview"
                                                        className="w-full h-48 object-cover rounded-xl border-2 border-green-200 dark:border-green-800"
                                                    />

                                                    <button
                                                        onClick={removeOptionalImage}
                                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => optionalfileInputRef.current?.click()}
                                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                                                >
                                                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                                                        Click to upload an image
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                                                        PNG, JPG up to 5MB
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Save / Apply Button */}
                                        <button
                                            onClick={() => {
                                                updateCartItemExtras(optionaDataProductSelected.id, {
                                                    description: optionalDescription,
                                                    specialInstructions: optionalSpecialInstructions,
                                                    imageFile: optionalselectedImageFile || null,
                                                });

                                                console.log(cartItems)
                                                setOptionaDataProductSelected(null);
                                                setOptionalImagePreview("");
                                                setOptionalSpecialInstructions("");
                                                setOptionalDescription("");
                                                setoptionalselectedImageFile(null);
                                            }}
                                            className="w-full py-3 mt-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    :
                    <></>
            }
        </Dialog>

    )
}

export default CheckoutPopup