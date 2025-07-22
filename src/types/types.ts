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
    userDetails: userTypes
    formData: {
        sammarized_notes: string
        location: string
    }
    totalPrice: number
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
    price: number
    id: string
}