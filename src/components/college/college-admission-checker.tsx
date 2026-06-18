"use client";

import { useState } from "react";
import { AdmissionMatchingWizard } from "@/components/home/admission-matching-wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Sparkles, CheckCircle } from "lucide-react";

type CollegeAdmissionCheckerProps = {
  collegeId: string;
  collegeName: string;
  universitiesList: any[];
};

export function CollegeAdmissionChecker({
  collegeId,
  collegeName,
  universitiesList
}: CollegeAdmissionCheckerProps) {
  const [result, setResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-indigo-600/20 shadow-md overflow-hidden bg-slate-50/50">
        <CardHeader className="bg-[#0F172A] text-white p-6">
          <CardTitle className="text-xl font-extrabold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#D4AF37] animate-pulse" />
            Can I Get Admission Here?
          </CardTitle>
          <p className="text-slate-400 text-xs mt-1">
            Evaluate your profile metrics directly against official cutoffs for {collegeName}.
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 bg-white">
          <AdmissionMatchingWizard
            courses={[]}
            universitiesList={universitiesList}
            initialUniversityId={collegeId}
            onSubmitSuccess={(evaluationResult) => {
              setResult(evaluationResult);
              setShowResultModal(true);
            }}
          />
        </CardContent>
      </Card>

      {/* CHANCES RESULT POPUP MODAL */}
      {showResultModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200/80 shadow-2xl bg-white rounded-xl">
            <div className="border-b p-5 flex justify-between items-center bg-slate-950 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Admission Chances for {collegeName}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowResultModal(false)} className="rounded-full text-slate-300 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="text-center p-6 border rounded-xl bg-slate-50 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Admission Probability</p>
                <div className="inline-block">
                  <Badge className={`text-base font-extrabold uppercase px-4 py-1.5 shadow ${
                    result.status === "HIGH_CHANCE" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-300" :
                    result.status === "MODERATE_CHANCE" ? "bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-300" :
                    result.status === "LOW_CHANCE" ? "bg-rose-100 text-rose-800 hover:bg-rose-100 border border-rose-300" :
                    "bg-slate-100 text-slate-800 hover:bg-slate-100 border border-slate-300"
                  }`}>
                    {result.status.replace("_", " ")}
                  </Badge>
                </div>
                
                <p className="font-semibold text-slate-800 text-base leading-relaxed mt-2">{result.message}</p>
                
                {result.reasons && result.reasons.length > 0 && (
                  <div className="text-left text-xs bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-100/50 mt-3 space-y-1">
                    <p className="font-bold">Evaluation Criteria Checklist:</p>
                    <ul className="list-disc list-inside space-y-0.5 font-medium">
                      {result.reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {result.status !== "LOW_CHANCE" ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Congratulations. Based on your profile, you appear eligible for admission.
                  </div>
                  {result.eligibilityRules && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Requirement Details:</strong> {result.eligibilityRules}
                    </p>
                  )}
                  {result.scholarshipRules && (
                    <p className="text-xs text-emerald-700 leading-relaxed font-semibold">
                      <strong>Scholarships Alert:</strong> {result.scholarshipRules}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <Button onClick={() => setShowResultModal(false)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      Apply Now
                    </Button>
                    <Button variant="outline" onClick={() => setShowResultModal(false)} className="flex-1 border-slate-300 font-bold">
                      Talk To Expert
                  </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-5 space-y-3">
                    <p className="font-bold text-slate-800 text-sm">Alternative Recommendations suggested by AI:</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {result.alternatives && result.alternatives.map((alt: any) => (
                        <div key={alt.id} className="p-3 bg-white border border-slate-100 rounded-lg flex items-center gap-3">
                          <img src={alt.logoUrl || "/logos/amity.png"} className="h-8 w-8 object-contain rounded border bg-slate-50 p-0.5" alt="" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs truncate text-slate-900">{alt.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{alt.city}, {alt.state}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <Button onClick={() => setShowResultModal(false)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                      Get Alternative Colleges
                    </Button>
                    <Button variant="outline" onClick={() => setShowResultModal(false)} className="flex-1 border-slate-300 font-bold">
                      Talk To Expert
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
