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
    logo_url: string
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
}
export type CartItem = {
    id: string;
    name: string;
    price: number;
    partialPayment: number;
    image: string;
    quantity: number;
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