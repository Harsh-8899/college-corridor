import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { College } from "@/lib/data/colleges";

export function CollegeCard({ college }: { college: College }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{college.name}</CardTitle>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {college.city}, {college.state}
            </p>
          </div>
          <Badge>Rank #{college.ranking}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{college.description}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Fees" value={college.fees} />
          <Metric label="Avg salary" value={college.averageSalary} />
          <Metric label="Seats" value={String(college.seats)} />
          <Metric label="Rating" value={`${college.rating} / 5`} icon={<Star className="h-4 w-4" />} />
        </div>
        <div className="flex flex-wrap gap-2">
          {college.modes.map((mode) => (
            <Badge key={mode}>{mode}</Badge>
          ))}
        </div>
        <Button asChild className="w-full">
          <Link href={`/colleges/${college.slug}`}>
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
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

