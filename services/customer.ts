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
            console.error(error)
            return false
        }
    } catch (error) {
        console.error(error)
        return false
    }
}

