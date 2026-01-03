
import { SubscriptionHistory } from "../types/types"
import { supabase } from "./supabaseClient"

export const getSubhistory = async (businessId: string): Promise<SubscriptionHistory[] | null> => {
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
                    .eq('paidfor', true)

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
export function isStillValid(
    creationDate: string | Date,
    duration: number,
    period: "days" | "year"
): boolean {
    const created = new Date(creationDate);
    const now = new Date();

    if (isNaN(created.getTime())) return false; // invalid date safety check

    const expiry = new Date(created);

    if (period === "days") {
        expiry.setDate(expiry.getDate() + duration);
    } else if (period === "year") {
        expiry.setFullYear(expiry.getFullYear() + duration);
    }

    return now <= expiry;
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
                    .select("*, subscriptionTable(*)")
                    .eq("userid", user_id)
                    .eq("paidfor", true)
                    .order("created_at", { ascending: false })

                if (data) {
                    const filteredData = data.filter((sub) => {
                        const duration = sub.subscriptionTable?.duration_in_days || 0;
                        return isStillValid(sub.created_at, duration, sub.subscriptionTable.period);
                    });

                    if (filteredData[0].registeredBusinesses.includes(id)) {
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