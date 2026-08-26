"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AdminTopbarProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function AdminTopbar({ name, email, avatarUrl }: AdminTopbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" aria-hidden />
            </Button>
          }
        />
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
          </SheetHeader>
          <AdminSidebar
            name={name}
            email={email}
            avatarUrl={avatarUrl}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="ms-auto flex items-center gap-2">
        <AdminThemeToggle />
      </div>
    </header>
  );
}
