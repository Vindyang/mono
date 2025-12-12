"use client";

import { InvitationsList } from "@/app/(authenticated)/team/components/invitations-list";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getInvitationsData } from "../componentsaction/actions";
import { Invitation } from "@/lib/types/team";
import { useState, useEffect } from "react";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { invitations, error } = await getInvitationsData();
        
        if (error) {
           toast.error(error);
           return;
        }

        if (invitations) setInvitations(invitations);
      } catch (error) {
        console.error("Failed to fetch invitations", error);
        toast.error("Failed to load invitations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InvitationsList invitations={invitations} />
    </div>
  );
}
