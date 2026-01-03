import CustomerInfoForm from "@/components/CustomerInfo"
import { Suspense } from "react"

const Page = () => {
    return (
        <>
            <Suspense fallback={<>Loading...</>}>
                <CustomerInfoForm />
            </Suspense>
        </>
    )
}

export default Page