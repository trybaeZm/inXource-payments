import { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "../../../../Components/ui/dialog"
import {
    CreditCard,
    Image as ImageIcon,
    FileText,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Upload,
    X,
    Loader2,
    ShoppingCart
} from 'lucide-react'

interface CheckoutPopupProps {
    isOpen: boolean
    onClose: () => void
    cartItems: any[]
    onCheckout: (checkoutData: CheckoutData) => Promise<void>
    company: any
}

export interface CheckoutData {
    description?: string
    image?: File | null
    specialInstructions?: string
}

const CheckoutPopup = ({ isOpen, onClose, cartItems, onCheckout, company }: CheckoutPopupProps) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [description, setDescription] = useState('')
    const [specialInstructions, setSpecialInstructions] = useState('')
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const removeImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
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
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
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
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            ZMW {(item.price * item.quantity).toFixed(2)}
                                        </p>
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
            <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl p-0 z-[9999] overflow-hidden">
                {/* Header with Steps */}
                <DialogHeader className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Checkout Process
                    </DialogTitle>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mt-4">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all duration-300 ${currentStep >= step.number
                                        ? 'bg-blue-500 border-blue-500 text-white'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {currentStep > step.number ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        step.icon
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 h-0.5 mx-2 ${currentStep > step.number
                                            ? 'bg-blue-500'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                        }`} />
                                )}
                            </div>
                        ))}
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
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
            </DialogContent>
        </Dialog>
    )
}

export default CheckoutPopup