
import { Console } from "console";
import { CartItem, CheckoutData, companyInfoType, Order, userTypes } from "../types/types";
import { getCustomersById } from "./customer";
import { supabase } from "./supabaseClient";

export const makeOrder = async () => {

}


// Create a new order
export async function createOrder(newData: Partial<Order>): Promise<Order | null> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert(newData)
            .select()
            .single();

        if (error) {
            console.error("Error creating order:", error.message);
            return null;
        }
        console.log("order: ", data)
        return data;
    } catch (err) {
        console.error("Unexpected error creating order:", err);
        return null;
    }
}



export const makeOrderByMainUser = async (Payload: CartItem[], user: userTypes, business: companyInfoType, CheckoutData: CheckoutData) => {
    const userData = await getCustomersById(user.id)
    const userID = userData.id

    let totalamount = 0
    let partialAmountTotal = 0
    const products = []

    for (let i = 0; i < Payload.length; i++) {
        products.push({ product_id: Payload[i].id, quantity: Payload[i].quantity, description: Payload[i].description, specialInstructions: Payload[i].specialInstructions })

        totalamount += (Payload[i].price * Payload[i].quantity)
        partialAmountTotal += (Payload[i].partialPayment * Payload[i].quantity)
    }

    console.log(totalamount, products)

    const newOrder = {
        business_id: business.id,
        customer_id: userID,
        total_amount: totalamount,
        delivery_location: CheckoutData.specialInstructions,
        order_status: "pending",
        sammarized_notes: CheckoutData.description,
        order_payment_status: business?.hasWallet ? "pending" : "completed",
        products: products,
        partialAmountTotal: business?.hasWallet ? partialAmountTotal : 0
    }

    const orderCreateResponse = await createOrder(newOrder)

    if (orderCreateResponse) {
        // return orderCreateResponse
        try {
            //upload image for the order
            if (CheckoutData.image) {
                const { data, error } = await supabase.storage
                    .from('uploaded-files')
                    .upload(
                        `orders/${orderCreateResponse.id}/${CheckoutData.image.name}`,
                        CheckoutData.image
                    )

                if (data) {
                    console.log(data)
                    return orderCreateResponse
                }
                if (error) {
                    console.log(error)
                }
            } else {
                console.log('No image to upload')
            }
            for (const product of Payload) {
                const Image = product.images; // optional File | null
                console.log("Uploading image:", Image);

                if (Image) {
                    const { data, error } = await supabase.storage
                        .from('uploaded-files')
                        .upload(
                            `orders/${orderCreateResponse.id}/products/${product.id}/${Image.name}`,
                            Image
                        );

                    if (error) {
                        console.error("Failed to upload image:", error);
                    } else {
                        console.log("Image uploaded successfully:", data);
                    }
                }
            }

            return orderCreateResponse
        } catch (error) {
            console.log(error)
        }
    } else {
        return false
    }
}