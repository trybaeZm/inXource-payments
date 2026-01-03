import PhoneVerification from "@/components/payment/PayForm"
import { Suspense } from "react"

const Page = () => {
    return (
        <>
            <Suspense fallback={<>Loading...</>}>
                <PhoneVerification />
            </Suspense>
        </>
    )
}

export default Page