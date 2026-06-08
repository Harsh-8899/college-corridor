import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {delta}
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

