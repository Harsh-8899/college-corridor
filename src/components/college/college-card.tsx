import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { College } from "@/lib/data/colleges";
import { LeadCaptureModal } from "@/components/lead/lead-capture-modal";

export function CollegeCard({ college }: { college: College }) {
  const defaultCategory = college.modes.includes("Online") 
    ? "ONLINE" 
    : college.modes.includes("Distance") 
      ? "DISTANCE" 
      : "OFFLINE";

  return (
    <Card className="flex flex-col h-full justify-between">
      <div>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="line-clamp-2 text-lg font-bold">{college.name}</CardTitle>
              <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {college.city}, {college.state}
              </p>
            </div>
            <Badge className="shrink-0">Rank #{college.ranking || "N/A"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">{college.description}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="Fees" value={college.fees} />
            <Metric label="Avg salary" value={college.averageSalary} />
            <Metric label="Seats" value={String(college.seats)} />
            <Metric label="Rating" value={`${college.rating} / 5`} icon={<Star className="h-4 w-4 text-amber-500 fill-amber-500" />} />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {college.modes.map((mode) => (
              <Badge variant="secondary" key={mode}>{mode}</Badge>
            ))}
          </div>
        </CardContent>
      </div>
      <CardContent className="pt-0">
        <div className="flex gap-2.5 mt-2">
          <Button asChild variant="outline" className="flex-1 font-medium">
            <Link href={`/colleges/${college.slug}`} className="flex items-center justify-center gap-1">
              Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <div className="flex-1">
            <LeadCaptureModal
              triggerLabel="Apply Now"
              sourcePage="/colleges"
              selectedCollegeIds={[college.id]}
              contentKey={`apply-${college.slug}`}
              initialCategory={defaultCategory}
              triggerClassName="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center font-semibold rounded-md shadow-sm transition-colors text-sm"
              hideIcon={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1 font-medium">
        {icon}
        {value}
      </p>
    </div>
  );
}

