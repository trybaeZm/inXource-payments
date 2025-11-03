import { userTypes } from "../types/types"
import { supabase } from "./supabaseClient"

export const getCustomersById = async (userid: string) => {
    try {
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .eq("id", userid)
            .single()

        if (data) {
            return data
        }

        if (error) {
            return false
        }
    } catch (error) {
        return false
    }
}

