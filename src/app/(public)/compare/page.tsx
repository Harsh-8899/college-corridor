import { Download, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumGate } from "@/components/lead/premium-gate";
import { colleges } from "@/lib/data/colleges";

const compared = colleges.slice(0, 3);

export default function ComparePage() {
  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">College comparison</h1>
          <p className="mt-2 text-muted-foreground">
            Basic comparison is visible. Detailed comparison, PDFs, placements, scholarships, and AI summaries are lead-gated.
          </p>
        </div>
        <PremiumGate
          title="PDF report access"
          description="Submit the lead form to generate downloadable comparison reports."
          sourcePage="/compare"
          contentKey="pdf-report"
          selectedCollegeIds={compared.map((college) => college.id)}
        >
          <Button>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </PremiumGate>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="border-b p-4 font-semibold">Metric</th>
              {compared.map((college) => (
                <th key={college.id} className="border-b p-4 font-semibold">
                  {college.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Location", ...compared.map((college) => `${college.city}, ${college.state}`)],
              ["Fees", ...compared.map((college) => college.fees)],
              ["Ranking", ...compared.map((college) => `#${college.ranking}`)],
              ["Courses", ...compared.map((college) => college.courses.slice(0, 2).join(", "))],
              ["Seats", ...compared.map((college) => String(college.seats))]
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`} className="border-b p-4 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PremiumGate
        title="Detailed comparison locked"
        description="Unlock placement insights, scholarship comparison, salary statistics, admission probability, and AI recommendations."
        sourcePage="/compare"
        contentKey="detailed-comparison"
        selectedCollegeIds={compared.map((college) => college.id)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Placement comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {compared.map((college) => (
                <div key={college.id} className="flex items-center justify-between rounded-md border p-3">
                  <span>{college.name}</span>
                  <Badge>{college.averageSalary}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Greenwood is the strongest target option for technology placements. Riverbend is a cost-effective
                safe option for commerce and computer applications. Northstar is strongest for management outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
      </PremiumGate>
    </div>
  );
}

