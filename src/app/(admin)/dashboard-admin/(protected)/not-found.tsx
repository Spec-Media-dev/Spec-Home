import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl font-semibold text-brand-gold">404</p>
      <h1 className="text-xl font-semibold">Record not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This record may have been deleted, or the link is out of date.
      </p>
      <Button nativeButton={false} render={<Link href="/dashboard-admin" />}>
        Back to overview
      </Button>
    </div>
  );
}
