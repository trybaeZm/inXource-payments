import PayStatus from "@/components/PayStatus"
import { Suspense } from "react"

const Page = () => {
    return (
        <>
            <Suspense fallback={<>Loading...</>}>
                <PayStatus />
            </Suspense>
        </>
    )
}

export default Page