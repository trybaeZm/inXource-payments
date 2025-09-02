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
    totalAmount:number;
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
    token: string
}

export type selectedImagesType = {
    name: string
    file: File
    url: string
}

export type companyProductsType = {
    name: string
    imageName:string
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
    paymentStatus:  paymentStatus
    data: string
}

export type paymentStatus = {
    status: string
}