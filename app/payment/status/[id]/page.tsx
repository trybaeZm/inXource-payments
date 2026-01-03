import PayStatus from "@/components/PayStatus"
import { Suspense } from "react"

const Page = () => {
    return (
        <>
            <Suspense>
                <PayStatus />
            </Suspense>
        </>
    )
}

export default Page