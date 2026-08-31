"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ImagesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard-admin/property-images");
  }, [router]);

  return (
    <div className="p-8 text-neutral-400 font-mono text-xs">
      Redirecting to Property Images Gallery...
    </div>
  );
}
