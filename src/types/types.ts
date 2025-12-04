export type CustomerType = {
    business_id: string
    name: string
    email: string
    phone: number
    location: string
    gender: string
}

export type userTypes = {
    business_id: string
    int_business_id: string
    id: string
    customer_id: string
    name: string
    email: string
    phone: number
}

export type companyInfoType = {
    id: string
    name: string
    logo_url: string
    hasWallet: boolean
    business_name: string
}
export type payloadType = {
    transactionId?: string
    totalAmount: number;
    userDetails: userTypes
    formData: {
        sammarized_notes: string
        location: string
    }
    totalPartialPrice: number
    items: {
        orderId: string
        product_id: string
        quantity: number
        price: number
    }
    token: string | undefined
}

export type selectedImagesType = {
    name: string
    file: File
    url: string
}

export type companyProductsType = {
    id: string;
    name: string;
    price: number;
    partialPayment: number;
    imageName: string;
    description: string; // ✅ required field
    promo?: Promotion | null; // 👈 FIX

}

export interface CheckoutData {
    description?: string
    image?: File | null
    specialInstructions?: string
}

export type Promotion = {
    id: string;
    type: 'individual' | 'all';
    productIds: string[];  // array of product ids
    name: string;
    discount: number;      // percentage e.g. 20 means 20%
    start_date: string;     // ISO string
    end_date: string;       // ISO string
};

export type CartItem = {
    id: string;
    name: string;
    price: number;
    partialPayment: number;
    image: string;
    quantity: number;
    specialInstructions?: string
    description?: string;
    images?: File | null;

    // ⭐ PROMO DATA
    hasPromo?: boolean
    promoPercentage?: number
    originalPrice?: number
}
export type OrderType = {
    id: string;
    order_id: number;
    business_id: string;
    int_business_id: number;
    customer_id: string;
    int_customer_id: number;
    total_amount: number;
    order_status: string;
    created_at: string;
    delivery_location: string | null;
};

export type PaymentReturnType = {
    success: string;
    paymentStatus: paymentStatus
    data: string
}

export type paymentStatus = {
    status: string
}

export type FormData = {
    location: string
    productId: string
    quantity: number
    summarized_notes: string
}


export type ResponseFromPayApi = {
    orderNumber: string,
    data: {
        token: string,
        paymentLink: string,
        transaction: {
            base_amount: number,
            currency: string
        },
    }
}

export type StatusPayload = {
    amount: number,
    paymentMethod: string
}

export interface PaymentStatusData {
    payload: StatusPayload
    paymentStatus: {
        responsecode: number;
        responsemessage: string;
    };
}

export interface SubscriptionHistory {
    haveWallet: boolean
}

export type PaymentData = {
    paymentMethod: string
    amount: string
}

export interface Order {
    id?: string;
    order_id?: number;
    business_id?: string;
    customer_id?: string;
    total_amount: number;
    order_status?: string;
    created_at?: string;
    customers?: {
        name?: string;
    };
}