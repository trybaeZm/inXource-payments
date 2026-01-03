import HomePage from "@/components/Homepage";
import Image from "next/image";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<>Loading...</>}>
      <HomePage />
    </Suspense>
  );
}
