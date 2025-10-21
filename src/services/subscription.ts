
import { SubscriptionHistory } from "../types/types"
import { supabase } from "./supabaseClient"

export const getSubhistory = async (businessId: string): Promise<SubscriptionHistory | null> => {
    try {
        const { data, error } = await supabase
            .from("businesses_owners")
            .select("user_id")
            .eq("business_id", businessId)
            .single()
        if (data) {
            const user_id = data.user_id
            try {
                const { data, error } = await supabase
                    .from("sunhistory")
                    .select("*")
                    .eq('userid', user_id)
                    .eq('isactive', true)
                    .single()

                if (data) {

                    return data
                }
                if (error) {
                    return null
                }
            } catch (error) {
                console.log(error)
                return null
            }
        }
        if (error) {
            return null
        }
    } catch (error) {
        console.log(error)
        return null
    }
    return null
}

export const checkSubBusinsess = async (id: string) => {
    let user_id = ""
    try {
        const { data, error } = await supabase
            .from("business_owners")
            .select("user_id")
            .eq("business_id", id)
            .single()

        if (data) {
            user_id = data.user_id;
            try {
                const { data, error } = await supabase
                    .from("sunhistory")
                    .select("registeredBusinesses")
                    .eq("userid", user_id)
                    .eq("isactive", true)
                    .single()

                if (data) {
                    // console.log(data)-
                    if (data.registeredBusinesses.includes(id)) {
                        return true
                    } else {
                        return false
                    }
                }
                if (error) {
                    return false
                }
            } catch (error) {
                console.log(error)
                return false
            }
        }
        if (error) {
            console.log(error)
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}