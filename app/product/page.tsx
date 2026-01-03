import ProductSelectionForm from "@/components/payment/product/ProductForm"
import { Suspense } from "react"

const Page = () => {
    return (
        <>
            <Suspense fallback={<>Loading...</>}>
                <ProductSelectionForm />
            </Suspense>
        </>
    )
}

export default Page