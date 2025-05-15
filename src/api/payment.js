import axios from "axios";
import { supabase } from "../services/supabaseClient";
import Swal from "sweetalert2";

const url = "https://tumeny.herokuapp.com/api";
const apiKey = "62c5d037-a215-4a2b-ad58-2802b9048d40";
const apiSecret = "fe69a5b014186217320996ebbf4f4a02734536e2";

class Payment {
  async addCustomer(customer) {
    const {
      business_id,
      name,
      email,
      phone,
      location,
      gender,
      int_business_id,
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
          int_business_id,
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
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .eq("int_business_id", intBusinessId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching customer:", error.message);
      return null;
    }

    return data;
  }

  async createTransaction() {
    const apiUrl = "http://localhost:4455/api/payment/getToken";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
      });

      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      Swal.fire("error", error.message, "error");
    }
  }

  async processPayment(body, payload) {
    const res = await this.createTransaction();
    if (!res || !res.token) {
      Swal.fire({
        title: "Error",
        text: "Token generation failed.",
        icon: "error",
      });
      return;
    }

    console.log("payload:", payload)

    const [firstName = "", ...rest] = (payload.name || "").split(" ");
    const lastName = rest.join(" ");

    const preparedPayload = {
      description: "test payment",
      customerFirstName: firstName,
      customerLastName: lastName,
      email: payload.email,
      phoneNumber: payload.phone,
      amount: body,
    };

    try {
      const response = await fetch(
        "http://localhost:4455/api/payment/initiatePayment",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${res.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preparedPayload),
        }
      );

      const result = await response.json();

      if(result.paymentStatus && result.paymentStatus.status === 'success'){
        Swal.fire('Success', 'Your order is been processed!', 'success');
      } else {
        Swal.fire('Error', 'Your order was unsuccessfull!', 'error');
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

  async initiatePayment(body) {
    const res = await axios.post(
      "http://localhost:4455/api/payment/initiate",
      body
    );
    return res;
  }
}

export default new Payment();
