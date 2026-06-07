# EduOofa AI College Recommendation Engine

## 1. Objective

The AI recommendation engine suggests suitable colleges and courses for each student using profile data, preferences, eligibility, budget, location, rankings, placements, reviews, admission probability, and course mode.

## 2. Recommendation Inputs

Student inputs:

- Desired course and specialization.
- Academic history.
- Entrance exams and scores.
- Category or quota, where applicable and consented.
- Budget.
- Preferred locations.
- Preferred mode: online, offline, distance.
- Placement expectations.
- Ranking preference.
- Hostel requirement.
- Scholarship need.
- Admission year.
- Risk preference.

College/course inputs:

- Course availability.
- Fees.
- Eligibility criteria.
- Exams accepted.
- Seat intake.
- Placement statistics.
- Salary statistics.
- Rankings.
- Reviews.
- Scholarships.
- Hostel facilities.
- Admission deadlines.
- Location.
- Mode.

## 3. Recommendation Output

Each recommendation should include:

- College.
- Course.
- Match score.
- Admission probability band.
- Category: Stretch, Target, or Safe.
- Explanation.
- Key pros.
- Key concerns.
- Estimated fees.
- Placement highlights.
- Application deadline.
- Suggested next action.

## 4. MVP Ranking Strategy

Use a hybrid scoring model:

- Eligibility filter.
- Hard preference matching.
- Budget fit score.
- Location score.
- Course fit score.
- Placement score.
- Ranking score.
- Review quality score.
- Scholarship fit score.
- Admission probability score.
- Freshness and confidence score.

The AI layer should generate explanations and summarize tradeoffs, while deterministic scoring should remain auditable.

## 5. Scoring Bands

- 85-100: Excellent match.
- 70-84: Strong match.
- 55-69: Moderate match.
- 40-54: Weak match.
- Below 40: Not recommended unless explicitly requested.

Admission probability:

- Stretch: student may be below typical cutoff or competitiveness is high.
- Target: student is close to typical admitted profile.
- Safe: student is comfortably above typical requirements or admissions are broad.

## 6. Guardrails

- Do not guarantee admission.
- Explain uncertainty.
- Show source data used for recommendation.
- Avoid using sensitive attributes unless legally permitted and explicitly consented.
- Log recommendation inputs, model version, and explanation version.
- Provide fallback deterministic recommendations if AI service fails.

## 7. Future Enhancements

- Embedding-based semantic matching.
- Collaborative filtering based on similar student outcomes.
- Partner conversion optimization with fairness constraints.
- Counselor feedback loop.
- Outcome-aware model retraining.
- Regional language explanations.

