"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { UserMenu } from "@/components/auth/user-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Check if this is an auto-login redirect (from verify-and-update)
    const params = new URLSearchParams(window.location.search);
    if (params.get("autologin") === "true") {
      setIsAutoLogin(true);
      // Clean up the URL by removing the autologin parameter
      params.delete("autologin");
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  useEffect(() => {
    // If this is an auto-login, wait a bit longer before redirecting
    // to give the session time to be established
    if (isAutoLogin && !session && !isPending) {
      // Wait 100ms before redirecting to give session time to load
      // Reduced for minimal delay
      const timeout = setTimeout(() => {
        if (!session) {
          router.push("/login");
        }
      }, 100);
      return () => clearTimeout(timeout);
    }

    // Normal redirect logic for non-auto-login cases
    if (!isAutoLogin && mounted && !isPending && !session) {
      router.push("/login");
    }
  }, [mounted, isPending, session, router, isAutoLogin]);

  // Don't render anything during SSR hydration to prevent flash
  if (!mounted) {
    return null;
  }

  // Don't render content if not authenticated (redirect will happen via useEffect)
  if (!session && !isPending && !(isAutoLogin && !session)) {
    return null;
  }

  // Always render the desktop layout to prevent layout shift
  // Only the content area changes between loading and loaded states
  const isLoading = isPending || (isAutoLogin && !session);

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>
          {!isLoading && <UserMenu />}
        </header>
        <div className="flex flex-1 flex-col gap-4 bg-gray-50 p-4">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            children
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
