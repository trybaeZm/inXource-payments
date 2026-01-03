import PhoneVerification from "@/components/payment/PayForm"
import { Suspense } from "react"

const Page = () => {
    return (
        <>
            <Suspense>
                <PhoneVerification />
            </Suspense>
        </>
    )
}

export default Page