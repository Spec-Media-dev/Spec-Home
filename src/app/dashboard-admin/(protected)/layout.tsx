import type { Metadata } from "next";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export const metadata: Metadata = {
  title: "SPEC Home | Admin Dashboard",
  description: "Administrative control center for SPEC Home Dubai luxury real estate platform.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d0d0d]">
        {/* Top Header */}
        <AdminHeader />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
