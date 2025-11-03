import { supabase } from "../services/supabaseClient";
import Swal from "sweetalert2";
import type { CustomerType, FormData, payloadType, PaymentStatusData, ResponseFromPayApi, selectedImagesType } from "../types/types";
import axios from "axios";
import { getSubhistory } from "../services/subscription";



const companyInfoString = sessionStorage.getItem('companyInfo');
const company = companyInfoString ? JSON.parse(companyInfoString) : null;

const paymentUrl = "https://paymentbackend.inxource.com/api/payment";
// const paymentUrl = "http://localhost:8080/api/payment";

class Payment {

  async addCustomer(customer: CustomerType) {
    const {
      business_id,
      name,
      email,
      phone,
      location,
      gender
    } = customer;

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          name,
          email,
          phone,
          location,
          gender,
          business_id,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding customer:", error.message);
      throw error;
    }

    return data;
  }

  async getCompanyInfo(alias: string) {
    console.log(alias);

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("company_alias", alias)
      .maybeSingle();

    if (error) {
      console.log(error);
      Swal.fire("error", error.message, "error");
    }

    return data;
  }

  async getProductInfoByBusiness(business_id: string) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, partialPayment, imageName")
      .eq("int_business_id", business_id);

    if (error) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
      return null;
    }

    return data;
  }

  async getCustomerByPhoneAndBusiness({ phone, intBusinessId }: { phone: string, intBusinessId: string }): Promise<CustomerType | null> {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const { data, error } = await supabase
            .from("customers")
            .select("*")
            .eq("phone", phone)
            .eq("business_id", intBusinessId)
            .single();

          if (data) {
            console.log("Customer data:", data);
          } else {
            console.log("No customer found with the provided phone and business ID.");
          }

          if (error) {
            console.error("Error fetching customer:", error.message);
            resolve(null);
            return;
          }

          resolve(data);

        } catch (error) {
          reject(error);
          console.error("Error in getCustomerByPhoneAndBusiness:", error);
        }
      })();
    })
  }

  async saveOrder({ payload, selectedImages, hasWallet }: { payload: payloadType, selectedImages: selectedImagesType[], hasWallet: boolean | undefined }) {
    const body = {
      business_id: payload.userDetails.business_id,
      int_business_id: payload.userDetails.int_business_id,
      customer_id: payload.userDetails.id,
      int_customer_id: payload.userDetails.customer_id,
      total_amount: payload.totalAmount,
      partialAmountTotal: payload.totalPartialPrice,
      order_status: "pending",
      order_payment_status: hasWallet ? "pending" : "completed",
      orderToken: payload.token,
      product_id: payload.items.product_id,
      delivery_location: payload?.formData.location || null,
      sammarized_notes: payload?.formData.sammarized_notes,
      transaction_id: payload?.transactionId || null,
    };

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert(body)
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError.message);
        return null;
      }

      const orderId = orderData.id;

      if (Array.isArray(payload.items) && payload.items.length > 0) {
        const orderItems = payload.items.map(item => ({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          console.error("Error saving order items:", itemsError.message);

          const { error: deleteError } = await supabase
            .from("orders")
            .delete()
            .eq("id", orderId);

          if (deleteError) {
            console.error("Rollback failed! Could not delete order:", deleteError.message);
          } else {
            console.warn("Order rolled back due to item insert failure.");
          }

          throw itemsError;
        }
      }


      if (orderData) {
        try {
          // If imageData is provided, insert images into the 'product_images' table
          if (selectedImages) {
            for (const image of selectedImages) {
              const { data, error } = await supabase.storage
                .from('uploaded-files')
                .upload(
                  `orders/${orderData.id}/${image.name}`,
                  image.file
                )

              if (data) {
                console.log(data)
              }

              if (error) {
                console.log(error)
                break;
              }
            }
          }

          return orderData;

        } catch (err: unknown) {
          if (typeof err === "object" && err !== null && "message" in err) {
            console.error("Unexpected error creating order:", err.message || err);
          } else {
            console.error("Unexpected error creating order:", err);
          }
          return null;
        }
      }

      return orderData;


    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        console.error("Unexpected error creating order:", err.message || err);
      } else {
        console.error("Unexpected error creating order:", err);
      }
      return null;
    }
  }
  async updateSaveStatus(orderToken: string | null): Promise<boolean> {
    console.log("Updating order status for id:", orderToken);

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ order_payment_status: 'completed' })
        .eq('transaction_id', orderToken)
        .select();

      console.log("Update response:", { data, error });

      if (error) {
        console.error("Failed to update order status:", error);
        return false;
      }

      if (!data || data.length === 0) {
        console.warn("No rows were updated for id:", orderToken);
        return false;
      }

      console.log("Update success for order id:", orderToken, data);
      return true;

    } catch (err) {
      console.error("Error updating order status:", err);
      return false;
    }
  }

  async createTransaction(
    id?: string,
  ): Promise<{ data: ResponseFromPayApi | null }> {
    console.log("Creating transaction...");

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single()
        
      if (data) {
        console.log("Purchase can proceed");
        const apiUrl = paymentUrl + "/getToken";

        const description = "payment for " + data.name;
        const amount = data.partialAmountTotal;

        // console.log("description", description);
        const res = await axios.post(apiUrl, {
          description,
          amount,
        });

        if (res.status !== 200) {
          throw new Error(`Payment API failed: ${res.status}`);
        }

        console.log("res", res.data);

        // Return token data
        return { data: res.data };
      }

      if (error) {
        return { data: null }
      }
      // console.log("amount", amount);

      // ✅ Await axios response
      return { data: null }

    } catch (err) {
      console.error("Error in createTransaction:", err);
      return { data: null };
    }
  }

  async processPayment({ payload, selectedImages }: { payload: payloadType, selectedImages: selectedImagesType[] }) {

    const response = await getSubhistory(company.id)

    const orderResponse = await this.saveOrder({ payload, selectedImages, hasWallet: response?.haveWallet })

    if (orderResponse) {
      console.log("Processing payment with payload:", payload);

      const preparedPayload = {
        phoneNumber: payload?.userDetails?.phone,
        order_id: orderResponse.id
      };
      if (response?.haveWallet) {
        try {
          const response = await fetch(`${paymentUrl}/initiatePayment`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${payload.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(preparedPayload),
          });
          const result = await response.json();
          if (result?.paymentStatus?.status === "success") {
            // Pass an empty array or the correct images array if available
            // await this.saveOrder( payload );
            Swal.fire("Success", "Your order has been processed!", "success");
          }

          return result;
        } catch (error: unknown) {
          console.error("Error processing payment:", error);
          throw error;
        }
      } else {
        Swal.fire("Success", "Your order has been processed!", "success");
      }
    }
  }

  redirectToPayment(url: string | undefined): void {
    if (!url) return;

    // 🔗 Redirects the current tab to the payment URL
    window.location.href = url;
  }



  // Get all images for a specific product
  getProductImages = async (
    productId: string,
    fileName: string
  ): Promise<string | null> => {
    try {
      const filePath = `products/${productId}/${fileName}`;

      const { data } = supabase.storage
        .from("uploaded-files")
        .getPublicUrl(filePath);

      if (!data) {
        console.error("Error fetching product images:");
        return null;
      }
      return data.publicUrl ?? null;

    } catch (error) {
      console.error("Unexpected error fetching product images:", error);
      return null;
    }
  };

  // Check payment status
  async checkPaymentStatus(orderId: string | null): Promise<{ data: PaymentStatusData | null; error: string | null }> {
    try {
      const response = await fetch(`${paymentUrl}/checkPayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ordertoken: orderId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      return { data, error: null };

    } catch (err: unknown) {
      console.error("Error checking payment status:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return { data: null, error: message };
    }
  }



}



export default new Payment();