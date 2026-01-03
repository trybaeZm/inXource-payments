import CustomerInfoForm from "@/components/CustomerInfo"
import { Suspense } from "react"

 const Page = ()=> {
    return (
        <>
        <Suspense>
            <CustomerInfoForm/>
        </Suspense>
        </>
    )
}

export default Page