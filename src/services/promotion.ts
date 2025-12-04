import { supabase } from "./supabaseClient";


export type PromotionPayload = {
    type: "individual" | "all" | string;
    productIds: any; // JSON
    name: string;
    discount: number;
    startDate: string;
    endDate: string;
};



export class PromotionService {

    // Create a new promotion
    async createPromotion(payload: PromotionPayload) {
        const { data, error } = await supabase
            .from("promotions")
            .insert({
                type: payload.type,
                product_ids: payload.productIds,
                name: payload.name,
                discount: payload.discount,
                start_date: payload.startDate,
                end_date: payload.endDate,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Get all promotions
    async getPromotions() {
        const { data, error } = await supabase
            .from("promotions")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    }

    // Get promotion by ID
    async getPromotionById(id: string) {
        const { data, error } = await supabase
            .from("promotions")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    }

    // Update promotion
    async updatePromotion(id: string, update: Partial<PromotionPayload>) {
        const { data, error } = await supabase
            .from("promotions")
            .update({
                ...(update.type && { type: update.type }),
                ...(update.productIds && { product_ids: update.productIds }),
                ...(update.name && { name: update.name }),
                ...(update.discount && { discount: update.discount }),
                ...(update.startDate && { start_date: update.startDate }),
                ...(update.endDate && { end_date: update.endDate }),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Delete promotion
    async deletePromotion(id: string) {
        const { error } = await supabase
            .from("promotions")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return true;
    }

    // Get active promotions (between startDate and endDate)
    async getActivePromotions(date: string = new Date().toISOString()) {
        const { data, error } = await supabase
            .from("promotions")
            .select("*")
            .lte("start_date", date)
            .gte("end_date", date);

        if (error) throw error;
        return data;
    }

    // Get active promotion for a specific product
    async getActivePromotionForProduct(productId: string) {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from("promotions")
            .select("*")
            .or(`type.eq.all,product_ids.cs.["${productId}"]`) // all promotions or specific one
            .lte("start_date", now)
            .gte("end_date", now)
            .order("discount", { ascending: false }) // highest discount first
            .limit(1);

        if (error) throw error;

        return data?.[0] ?? null;
    }

}
