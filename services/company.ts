import { companyInfoType } from "@/types/types"
import { supabase } from "./supabaseClient"

export class CompanyService {
    getBusinessDetails = async (name: string): Promise<companyInfoType | null> => {
        console.log("getting store data for: ", name)
        try {
            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("business_name", name)
                .single()

            if (error) {
                return null
            }

            console.log("data collected: ", data)
            return data
        } catch (error) {

            console.log(error)
            return null
        }
    }
}