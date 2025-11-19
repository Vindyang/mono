"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { UserMenu } from "@/components/auth/user-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>
          <UserMenu />
        </header>
        <div className="flex flex-1 flex-col gap-4 bg-gray-50 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
