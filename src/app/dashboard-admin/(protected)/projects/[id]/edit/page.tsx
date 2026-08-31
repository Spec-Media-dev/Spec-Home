"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditProjectRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard-admin/projects");
  }, [router]);

  return (
    <div className="p-8 text-neutral-400 font-mono text-xs">
      Redirecting to Projects Studio...
    </div>
  );
}
