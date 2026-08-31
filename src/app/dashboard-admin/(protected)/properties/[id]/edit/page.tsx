"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditPropertyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard-admin/properties");
  }, [router]);

  return (
    <div className="p-8 text-neutral-400 font-mono text-xs">
      Redirecting to Properties Studio...
    </div>
  );
}
