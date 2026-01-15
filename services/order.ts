
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



export const makeOrderByMainUser = async (cartItems: CartItem[], user: userTypes, business: companyInfoType, checkoutData: CheckoutData) => {
    const userData = await getCustomersById(user.id)

    if (!userData) {
        console.error("User not found or error fetching user data");
        return false;
    }

    const userID = userData.id

    let totalAmount = 0
    let partialAmountTotal = 0

    // Calculate totals and format products
    const products = cartItems.map(item => {
        totalAmount += (item.price * item.quantity);
        partialAmountTotal += (item.partialPayment * item.quantity);

        return {
            product_id: item.id,
            quantity: item.quantity,
            description: item.description,
            specialInstructions: item.specialInstructions
        };
    });

    console.log(totalAmount, products)

    const newOrder = {
        business_id: business.id,
        customer_id: userID,
        total_amount: totalAmount,
        delivery_location: checkoutData.specialInstructions,
        order_status: "pending",
        sammarized_notes: checkoutData.description,
        order_payment_status: business?.hasWallet ? "pending" : "completed",
        products: products,
        partialAmountTotal: business?.hasWallet ? partialAmountTotal : 0
    }

    const orderCreateResponse = await createOrder(newOrder)

    if (!orderCreateResponse) {
        return false
    }

    try {
        const uploadPromises: Promise<any>[] = [];

        // Upload main order image if exists
        if (checkoutData.image) {
            const mainImageUpload = supabase.storage
                .from('uploaded-files')
                .upload(
                    `orders/${orderCreateResponse.id}/${checkoutData.image.name}`,
                    checkoutData.image
                )
                .then(({ data, error }) => {
                    if (error) console.error("Error uploading main image:", error);
                    else console.log("Main image uploaded:", data);
                });

            uploadPromises.push(mainImageUpload);
        } else {
            console.log('No main image to upload');
        }

        // Upload product images
        const productImageUploads = cartItems.map(product => {
            const image = product.images; // optional File | null
            if (image) {
                console.log("Uploading image for product:", product.id);
                return supabase.storage
                    .from('uploaded-files')
                    .upload(
                        `orders/${orderCreateResponse.id}/products/${product.id}/${image.name}`,
                        image
                    )
                    .then(({ data, error }) => {
                        if (error) console.error(`Failed to upload image for product ${product.id}:`, error);
                        else console.log(`Image uploaded for product ${product.id}:`, data);
                    });
            }
            return Promise.resolve();
        });

        uploadPromises.push(...productImageUploads);

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        return orderCreateResponse

    } catch (error) {
        console.error("Error in post-order processing:", error)
        // Check if we should return the order even if uploads fail. 
        // usually yes, as the order itself is created.
        return orderCreateResponse
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