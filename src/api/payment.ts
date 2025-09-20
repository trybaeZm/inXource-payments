import { supabase } from "../services/supabaseClient";
import Swal from "sweetalert2";
import type { CustomerType, FormData, payloadType, PaymentStatusData, ResponseFromPayApi, selectedImagesType } from "../types/types";
import axios from "axios";

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

  async saveOrder({ payload, selectedImages }: { payload: payloadType, selectedImages: selectedImagesType[] }) {
    const body = {
      business_id: payload.userDetails.business_id,
      int_business_id: payload.userDetails.int_business_id,
      customer_id: payload.userDetails.id,
      int_customer_id: payload.userDetails.customer_id,
      total_amount: payload.totalAmount,
      partialAmountTotal: payload.totalPartialPrice,
      order_status: "pending",
      order_payment_status: "pending",
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

  async updateSaveStatus(orderToken: string | undefined): Promise<boolean> {
    console.log("Updating order status for id:", orderToken);
    // Fire the update call
    return new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ order_payment_status: 'completed' }) // 👈 pass an object
          .eq('transaction_id', orderToken)
          .select();

        console.log("Update response:", { data, error });


        // If Supabase tells you there was an error, throw it so callers can catch
        if (error) {
          console.error("Failed to update order status:", error);
          reject(false)
        }

        // Optionally, check that data is non-empty
        if (!data) {
          console.warn("No rows were updated for id:", orderToken);
          reject(false)
        }

        if (data) {
          console.log("rows updated for id:", orderToken);
          resolve(true)
        }

        console.log("Update success for order id:", orderToken, data);

        reject(false);

      } catch (err) {
        console.error("Error updating order status:", err);
        reject(false)
      }
    });
  }

  async createTransaction(
    id: string,
    quantity: FormData,
  ): Promise<{ data: ResponseFromPayApi | null; error: string | null }> {
    console.log("Creating transaction...");
    console.log("payload", quantity);

    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
        partialPayment,
        name,
        id,
        orders(quantity),
        stock_table(quantity)
      `)
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Product not found");

      // Sum up stock quantities
      const stockIn =
        data.stock_table?.reduce((acc, cur) => acc + (cur.quantity || 0), 0) || 0;

      // Sum up order quantities
      const stockOut =
        data.orders?.reduce((acc, cur) => acc + (cur.quantity || 0), 0) || 0;

      // Remaining stock
      const totalStockRemaining = stockIn - stockOut;

      if (totalStockRemaining < quantity.quantity) {
        Swal.fire("Out of Stock", "Not enough stock available!", "error");
        throw new Error("Insufficient stock");
      }

      console.log("Purchase can proceed");
      const apiUrl = paymentUrl + "/getToken";

      const description = "payment for " + data.name;
      const amount = data.partialPayment * quantity.quantity;

      // console.log("description", description);
      // console.log("amount", amount);

      // ✅ Await axios response
      const res = await axios.post(apiUrl, {
        description,
        amount,
      });

      if (res.status !== 200) {
        throw new Error(`Payment API failed: ${res.status}`);
      }

      console.log("res", res.data);

      // Return token data
      return { data: res.data, error: null };

    } catch (err: any) {
      console.error("Error in createTransaction:", err);
      return { data: null, error: err.message || "Unknown error" };
    }
  }

  async processPayment({ payload, selectedImages }: { payload: payloadType, selectedImages: selectedImagesType[] }) {
    const orderResponse = await this.saveOrder({ payload, selectedImages })

    if (orderResponse) {
      console.log("Processing payment with payload:", payload);

      const preparedPayload = {
        phoneNumber: payload?.userDetails?.phone,
        order_id: orderResponse.id
      };

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
  async checkPaymentStatus(orderId: string | undefined): Promise<{ data: PaymentStatusData | null; error: boolean | null }> {

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${paymentUrl}/checkPayment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ordertoken: orderId }),
        });

        return response.json().then((data) => {
          resolve({ data, error: null });
        });

      } catch (error: unknown) {
        console.error("Error checking payment status:", error);
        reject({ data: null, error: (error as Error).message || "Unknown error" });
      }
    })
  }


}



export default new Payment();