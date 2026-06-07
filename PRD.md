# EduOofa Product Requirements Document

## 1. Product Summary

EduOofa is a college admission discovery, comparison, application, and mentorship platform for students, counselors, partner institutions, admins, and super admins. The product is similar in category to Shiksha, with stronger emphasis on application tracking, counselor CRM workflows, mentorship booking, revenue visibility, and AI-assisted college recommendations.

Phase 1 is planning only. No production code is included in this phase.

## 2. Goals

- Help students discover, compare, shortlist, and apply to colleges and courses.
- Provide reliable college data across fees, placements, rankings, seats, courses, hostels, scholarships, eligibility, admission process, salary statistics, and reviews.
- Allow students to book mentorship sessions and track applications.
- Give counselors a CRM to manage student leads, follow-ups, sessions, applications, and recommendations.
- Give admins tools to manage colleges, courses, reviews, partner links, applications, analytics, and revenue.
- Enable AI-powered recommendations based on student profile, preferences, eligibility, budget, location, rankings, placements, and admission probability.

## 3. Non-Goals for Phase 1

- No frontend implementation.
- No backend implementation.
- No payment integration implementation.
- No AI model integration implementation.
- No production infrastructure provisioning.
- No scraping or data-ingestion jobs.

## 4. Target Users

### Student

Students researching colleges, comparing options, applying to programs, downloading reports, and booking mentorship sessions.

### Counselor

Internal or partner counselors who manage student leads, advise students, recommend colleges, book sessions, and track application progress.

### Admin

Operations users who manage platform content, partner colleges, applications, reviews, analytics, revenue reports, and counselor workflows.

### Super Admin

Platform owner role with full access to system configuration, user management, permissions, audit logs, billing settings, and organization-level controls.

## 5. Key Features

### College Discovery

- Search colleges by name, location, course, specialization, ranking, fees, placement, exam accepted, ownership, mode, and facilities.
- Filter by online, offline, and distance learning courses.
- View college profile pages with admission details, eligibility criteria, fees, placements, seats, reviews, rankings, scholarships, courses, hostel facilities, salary statistics, and partner links.
- Save colleges to shortlist.

### Comparison

- Compare up to 4 colleges.
- Compare fees, placements, rankings, courses, seats, salary statistics, admission process, eligibility, hostel facilities, scholarships, reviews, and application deadlines.
- Download comparison PDF reports.

### Applications

- Apply now from college or course pages.
- Track application status.
- Upload documents in later phases.
- Receive counselor/admin updates.

### Mentorship Booking

- Browse counselor/mentor availability.
- Book paid or free mentorship sessions.
- Integrate Razorpay for payments in implementation phase.
- Support rescheduling, cancellation, meeting links, reminders, and session notes.

### Reviews

- Students can submit reviews.
- Admins moderate, approve, reject, or feature reviews.
- Review dimensions include academics, placements, campus, hostel, faculty, infrastructure, value for money, and overall rating.

### AI Recommendations

- Recommend colleges based on student profile, academic scores, exams, budget, location preferences, course interests, mode preference, admission goals, placement expectations, and risk appetite.
- Explain why each college is recommended.
- Flag stretch, target, and safe options.
- Generate shortlist and comparison suggestions.

## 6. Student Requirements

- Register and login using NextAuth-supported providers.
- Build profile with education history, entrance exams, preferences, budget, location, desired course, mode, and admission year.
- Save colleges and courses.
- Compare colleges.
- Apply to colleges/courses.
- Download PDF reports.
- Book mentorship sessions.
- Track applications and session history.
- View recommendation explanations.

## 7. Admin Requirements

- Manage colleges, campuses, courses, fees, placements, rankings, seats, hostels, scholarships, eligibility, admission details, partner links, images, and documents.
- Manage applications and statuses.
- Manage reviews and moderation.
- Manage counselors, assignments, and workload.
- View analytics for search, college views, leads, applications, bookings, revenue, conversions, and partner performance.
- Track revenue from applications, mentorship bookings, sponsored college links, and partner campaigns.

## 8. Counselor Requirements

- View assigned leads/students.
- Manage student CRM pipeline.
- Add notes, tasks, reminders, call logs, and follow-up status.
- Recommend colleges to students.
- Track applications.
- Manage availability and mentorship bookings.
- Add session notes and outcomes.

## 9. Success Metrics

- Student registration conversion rate.
- Search-to-shortlist conversion.
- Shortlist-to-application conversion.
- Application completion rate.
- Mentorship booking conversion.
- Counselor follow-up completion rate.
- Admin content freshness rate.
- Review approval turnaround time.
- Revenue by source.
- AI recommendation click-through and application conversion.

## 10. Compliance and Trust

- Role-based access control for all private data.
- Audit logging for admin and super admin operations.
- Explicit user consent for communication and recommendations.
- Secure file storage using AWS S3.
- Payment processing via Razorpay without storing card data.
- Data retention and deletion policies to be finalized before production launch.

## 11. Phase 1 Deliverables

- PRD.
- System architecture.
- PostgreSQL database schema design using Prisma.
- API architecture.
- User roles and permission model.
- Admin dashboard design.
- Counselor CRM design.
- Mentorship booking system design.
- AI recommendation engine design.
- Project folder structure.
- Roadmap and implementation plan.

