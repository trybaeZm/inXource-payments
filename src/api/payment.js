import axios from "axios";
import { supabase } from "../services/supabaseClient";
import Swal from "sweetalert2";

const paymentUrl = "http://localhost:4455/api/payment";

class Payment {

  async addCustomer(customer) {
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

  async getCompanyInfo(alias) {
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

  async getProductInfoByBusiness(business_id) {
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

  async getCustomerByPhoneAndBusiness(phone, intBusinessId) {
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
        return null;
      }

      return data;

    } catch (error) {
      console.error("Error in getCustomerByPhoneAndBusiness:", error);
    }
  }

  async saveOrder(payload) {
    const body = {
      business_id: payload.userDetails.business_id,
      int_business_id: payload.userDetails.int_business_id,
      customer_id: payload.userDetails.id,
      int_customer_id: payload.userDetails.customer_id,
      total_amount: payload.totalPrice,
      order_status: "pending",
      delivery_location: payload?.formData.location || null
    };

    try {
      const { data, error } = await supabase
        .from("orders")
        .insert(body)
        .select()
        .single();

      if (error) {
        console.error("Error creating order:", error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Unexpected error creating order:", err);
      return null;
    }
  }

  async createTransaction() {
    const apiUrl = paymentUrl + "/getToken";

    // try {
    const response = await fetch(apiUrl, {
      method: "POST",
    });

    const result = await response.json();
    return result;
    // } catch (error) {
    //   Swal.fire("error", error.message, "error");
    // }
  }

  async processPayment(payload) {
    console.log(payload);
    const [firstName = "", ...rest] = (payload?.userDetails.name || "").split(
      " "
    );
    const lastName = rest.join(" ");

    const preparedPayload = {
      description: "test payment",
      customerFirstName: firstName,
      customerLastName: lastName,
      email: payload?.userDetails.email,
      phoneNumber: payload?.userDetails.phone,
      amount: payload.totalPrice,
    };

    try {
      const response = await fetch(
        paymentUrl + "/initiatePayment",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${payload.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preparedPayload),
        }
      );

      const result = await response.json();

      if (result.paymentStatus && result.paymentStatus.status === "success") {
        await this.saveOrder(payload);
        Swal.fire("Success", "Your order is been processed!", "success");
      } else {
        Swal.fire("Error", "Your order was unsuccessfull!", "error");
        return result;
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  }
}

export default new Payment();
