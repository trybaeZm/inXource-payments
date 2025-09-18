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
    name: string
    imageName: string
    price: number
    id: string
    partialPayment: number
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
    data:{
    token: string,
    paymentLink: string,
    transaction: {
        base_amount: number,
        currency: string
    },
}}

export interface PaymentStatusData {
    success: boolean; // e.g. "true"
    paymentStatus: {
        data:
        {
            status: number; // e.g. 101
            message: string; // e.g. "Payment token is still pending."
            token: string; // e.g. "F1C8095A"
            orderNumber: string; // e.g. "912670"
            transactionReference: string; // e.g. "407d4845-9584-4ff2-8dcc-886c38"
            amount: string; // e.g. "1.00"
            currency: string; // e.g. "ZMW"
            paymentMethod: string | null; // can be null
            serviceProvider: string | null; // can be null
            account: string | null; // can be null}
        }
    }
}
