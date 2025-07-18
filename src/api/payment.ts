import { supabase } from "../services/supabaseClient";
import Swal from "sweetalert2";
import type { CustomerType, payloadType, selectedImagesType } from "../types/types";

const paymentUrl = "https://paymentbackend.inxource.com/api/payment";
// const paymentUrl = "http://localhost:4455/api/payment";

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
      .select("id, name, price")
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
            .maybeSingle();

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
      total_amount: payload.totalPrice,
      order_status: "pending",
      product_id: payload.items.product_id,
      delivery_location: payload?.formData.location || null
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

  async createTransaction(): Promise<{ token: string }> {
    console.log("Creating transaction...");
    return new Promise((resolve, reject) => {
      (async () => {
        try{
          const apiUrl = paymentUrl + "/getToken";
          const response = await fetch(apiUrl, {
            method: "POST",
          });
          // console.log('token here...: ' , response.json())
          resolve(await response.json());
        } catch (err){
          console.error("Error creating transaction:", err);
          reject(err);
        }
      })();
    })
  }

  async processPayment(payload: payloadType) {
    console.log("Processing payment with payload:", payload);

    const [firstName = "", ...rest] = (payload?.userDetails?.name || "").split(" ");
    const lastName = rest.join(" ");

    const preparedPayload = {
      description: "test payment",
      customerFirstName: firstName,
      customerLastName: lastName,
      email: payload?.userDetails?.email,
      phoneNumber: payload?.userDetails?.phone,
      amount: payload.totalPrice,
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

export default new Payment();
