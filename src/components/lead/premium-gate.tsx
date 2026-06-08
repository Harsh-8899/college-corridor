"use client";

import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadCaptureModal, isPremiumUnlocked } from "@/components/lead/lead-capture-modal";

type PremiumGateProps = {
  title: string;
  description: string;
  sourcePage: string;
  contentKey: string;
  selectedCollegeIds?: string[];
  children: React.ReactNode;
};

export function PremiumGate({
  title,
  description,
  sourcePage,
  contentKey,
  selectedCollegeIds,
  children
}: PremiumGateProps) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(isPremiumUnlocked());
  }, []);

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <Card className="border-dashed bg-muted/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LeadCaptureModal
          triggerLabel="Submit lead form"
          sourcePage={sourcePage}
          contentKey={contentKey}
          selectedCollegeIds={selectedCollegeIds}
          onUnlocked={() => setUnlocked(true)}
        />
      </CardContent>
    </Card>
  );
}

