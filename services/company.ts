import { companyInfoType } from "@/types/types"
import { supabase } from "./supabaseClient"

export class CompanyService {
    getBusinessDetails = async (name: string): Promise<companyInfoType | null> => {
        const cleanedName = name.trim();
        console.log("getting store data for: ", cleanedName)
        try {
            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .ilike("business_name", cleanedName)
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




    getProductImages = async (
        productId: string | undefined,
        fileName: string | undefined
    ): Promise<string | null> => {
        try {
            const filePath = `business/${productId}/${fileName}`;

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
}