import ProductSelectionForm from "@/components/payment/product/ProductForm"
import { Suspense } from "react"

 const Page = ()=> {
    return (
        <>
        <Suspense>
            <ProductSelectionForm/>
        </Suspense>
        </>
    )
}

export default Page