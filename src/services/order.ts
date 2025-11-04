import { CartItem, Order, userTypes } from "../types/types";
import { getCustomersById } from "./customer";
import { getSubhistory } from "./subscription";
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



export const makeOrderByMainUser = async (Payload: CartItem[], user: userTypes, business: string) => {
    let userData = await getCustomersById(user.id)
    let userID = userData.id
    let SubscriptionHistory = await getSubhistory(business)

    let totalamount = 0
    let partialAmountTotal = 0
    let products = []

    for (let i = 0; i < Payload.length; i++) {
        products.push({ product_id: Payload[i].id, quantity: Payload[i].quantity })

        totalamount += (Payload[i].price * Payload[i].quantity)
        partialAmountTotal += (Payload[i].partialPayment * Payload[i].quantity)
    }

    console.log(totalamount, products)

    let newOrder = {
        business_id: business,
        customer_id: userID,
        total_amount: totalamount,
        delivery_location: "onsight",
        order_status: "pending",
        order_payment_status: SubscriptionHistory?.haveWallet ? "pending" :"completed",
        products: products,
        partialAmountTotal: SubscriptionHistory?.haveWallet ? partialAmountTotal : 0
    }

    let orderCreateResponse = await createOrder(newOrder)

    if (orderCreateResponse) {
        return orderCreateResponse
    } else {
        return false
    }
}