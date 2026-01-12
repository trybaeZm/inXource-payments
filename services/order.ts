
import { Console } from "console";
import { CartItem, CheckoutData, companyInfoType, Order, userTypes } from "../types/types";
import { getCustomersById } from "./customer";
import { supabase } from "./supabaseClient";

export const makeOrder = async () => {

}

export const updateOrderToken = async (orderID?: string, token?: string) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ orderToken: token })
            .eq('id', orderID)
            .select()
            .single();

        if (error) {
            console.error("Error updating order:", error.message);
            return null;
        }
        console.log("order: ", data)
        return data;
    } catch (err) {
        console.error("Unexpected error updating order:", err);
        return null;
    }
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

interface OrderNotificationParams {
    userId: string;
    businessId: string;
    orderId: string;
    products: CartItem[];
    orderedAt: string;
}

export async function createOrderNotification(params: OrderNotificationParams) {
    const { userId, businessId, orderId, products, orderedAt } = params;

    // 1. Improved Product Summary Logic
    const totalItems = products.reduce((sum, item) => sum + item.quantity, 0);
    const primaryProduct = products[0].name;
    const otherItemsCount = totalItems - products[0].quantity;

    // 2. Human-Centric Message Construction
    // Example: "You've received a new order for 'Blue Widget' and 3 other items. Total: ZMW 450.00"
    let itemSummary = `${products[0].quantity}x ${primaryProduct}`;
    if (products.length > 1 || otherItemsCount > 0) {
        const additionalCount = products.length - 1;
        itemSummary += ` and ${additionalCount} other item${additionalCount > 1 ? 's' : ''}`;
    }

    const totalAmount = products.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Focus on the action and the value, removing brackets and raw IDs
    const message = `A new order has been placed for ${itemSummary}. Total value: ZMW ${totalAmount.toLocaleString()}. Received on ${new Date(
        orderedAt
    ).toLocaleDateString(undefined, { dateStyle: 'medium' })}.`;

    const { data, error } = await supabase.from("notifications").insert({
        user_id: userId,
        business_id: businessId,
        title: "New Order Received", // Changed from "Placed" to "Received" for a business context
        message: message,
        notification_type: "order",
        priority: "normal",
        status: "unread",
        category: "order",
        action_url: `/orders/${orderId}`,
        action_label: "View Order Details",
        metadata: {
            orderId, // We keep the ID here for the system to use when clicking the notification
            totalAmount,
            items: products.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                partialPayment: item.partialPayment,
                specialInstructions: item.specialInstructions,
                description: item.description,
            })),
        },
        tags: ["order", "new"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    if (error) {
        console.error("Failed to create notification:", error);
        throw error;
    }

    return data;
}