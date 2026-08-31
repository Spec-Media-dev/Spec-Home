"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SpecsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard-admin/property-specs");
  }, [router]);

  return (
    <div className="p-8 text-neutral-400 font-mono text-xs">
      Redirecting to Property Specs Studio...
    </div>
  );
}
