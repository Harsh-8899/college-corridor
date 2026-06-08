import { notFound } from "next/navigation";
import { BarChart3, Bed, BookOpen, CalendarCheck, IndianRupee, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumGate } from "@/components/lead/premium-gate";
import { getCollege } from "@/lib/data/colleges";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CollegeDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const college = getCollege(slug);

  if (!college) {
    notFound();
  }

  return (
    <div className="page-shell space-y-6">
      <section className="rounded-lg border bg-muted/35 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>{college.ownership}</Badge>
              {college.modes.map((mode) => (
                <Badge key={mode}>{mode}</Badge>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-semibold md:text-5xl">{college.name}</h1>
            <p className="mt-3 text-muted-foreground">
              {college.city}, {college.state} · Rank #{college.ranking} · {college.rating}/5 rating
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button>Apply now</Button>
            <Button variant="outline">Save college</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={IndianRupee} title="Fees" value={college.fees} />
        <InfoCard icon={BarChart3} title="Placement rate" value={college.placementRate} />
        <InfoCard icon={Trophy} title="Highest salary" value={college.highestSalary} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Courses offered</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {college.courses.map((course) => (
                <div key={course} className="flex items-center justify-between rounded-md border p-3">
                  <span>{course}</span>
                  <Badge>{college.modes.join(" / ")}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Admission and eligibility</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <p className="text-sm text-muted-foreground">{college.admission}</p>
              <p className="text-sm text-muted-foreground">{college.eligibility}</p>
            </CardContent>
          </Card>
          <PremiumGate
            title="Placement insights are lead-gated"
            description="Submit the lead form to unlock salary statistics, recruiters, and placement trends."
            sourcePage={`/colleges/${college.slug}`}
            contentKey="placement-insights"
            selectedCollegeIds={[college.id]}
          >
            <Card>
              <CardHeader>
                <CardTitle>Placement insights</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <InfoBlock label="Average salary" value={college.averageSalary} />
                <InfoBlock label="Highest salary" value={college.highestSalary} />
                <InfoBlock label="Placement rate" value={college.placementRate} />
              </CardContent>
            </Card>
          </PremiumGate>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex gap-2"><Bed className="h-4 w-4 text-primary" />{college.hostel}</p>
              <p className="flex gap-2"><BookOpen className="h-4 w-4 text-primary" />{college.seats} seats across listed programs</p>
            </CardContent>
          </Card>
          <PremiumGate
            title="Scholarship details"
            description="Scholarship policies unlock after lead capture and are sent to CRM."
            sourcePage={`/colleges/${college.slug}`}
            contentKey="scholarship-details"
            selectedCollegeIds={[college.id]}
          >
            <Card>
              <CardHeader>
                <CardTitle>Scholarships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{college.scholarships}</p>
              </CardContent>
            </Card>
          </PremiumGate>
          <PremiumGate
            title="Counseling booking"
            description="Submit the lead form to book a mentorship session."
            sourcePage={`/colleges/${college.slug}`}
            contentKey="counseling-booking"
            selectedCollegeIds={[college.id]}
          >
            <Card>
              <CardHeader>
                <CardTitle>Mentorship slots</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <CalendarCheck className="h-4 w-4" />
                  Book session
                </Button>
              </CardContent>
            </Card>
          </PremiumGate>
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }: { icon: typeof BarChart3; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

