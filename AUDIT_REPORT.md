# College Corridor Audit Report

Date: 2026-06-08

## Scope

This audit reviewed the repository structure, Prisma schema, authentication, public website, lead generation, CRM/dashboard architecture, security posture, missing features, and technical debt. No application code was modified.

## Executive Summary

The project is a Next.js 15 prototype for a college discovery and admissions platform. It has a broad Prisma schema and planning docs for discovery, comparison, applications, counseling, CRM, bookings, payments, AI recommendations, PDFs, audit logs, analytics, and notifications.

The current implementation is not yet aligned with the requested College Corridor target state:

- Branding still uses `EduOofa` in metadata, navigation, seeded users, docs, and package name.
- Public navigation exposes internal links for Admin, Counselor, and CRM.
- Public login exposes Student, Counselor, Admin, and Super Admin demo login buttons.
- Internal routes currently exist as `/admin`, `/counselor`, `/crm`, and `/super-admin`; requested routes are `/internal/admin`, `/internal/counselor`, and `/internal/crm`.
- There is no real route protection for internal pages.
- Authentication is demo-only and allows role selection without passwords or database lookup.
- Lead capture exists, but the premium unlock is client-side localStorage and unlocks even if the database write fails.
- Dashboards and catalog pages use static demo data rather than Prisma-backed services.

## Project Structure

Current structure:

- `src/app/(public)`: public home, login, college listing, college details, comparison.
- `src/app/(admin)`: admin, CRM, and super-admin prototype pages.
- `src/app/(counselor)`: counselor prototype page.
- `src/app/api/auth/[...nextauth]`: NextAuth route.
- `src/app/api/v1/leads`: lead creation route.
- `src/components`: UI, navigation, lead gate, college card, dashboard stat card.
- `src/lib/data`: static college and dashboard demo data.
- `src/lib/db`: Prisma client.
- `src/lib/auth`: NextAuth options.
- `prisma`: schema, migration, and seed script.
- `docs`: planning documents for product, API, system architecture, CRM, admin, AI, bookings, roadmap.

Gaps:

- No `src/features/*`, service layer, validators layer, permission helpers, or server modules despite docs proposing them.
- No route groups for student account workflows.
- No `/internal/*` routes.
- Static data is mixed into production-facing pages through `src/lib/data/*`.
- Existing docs describe an earlier brand and phase model, not the current requested College Corridor implementation.

## Prisma Schema

The Prisma schema is broad and suitable as a starting domain model. It includes:

- Users, NextAuth accounts, sessions, verification tokens.
- Student profiles, academics, entrance exams, preferences.
- Counselor profiles and availability.
- Colleges, campuses, courses, college-course offerings, fees, placements, rankings, scholarships.
- Reviews, saved colleges, applications.
- Counselor assignments, leads, CRM notes, CRM tasks, call logs.
- Mentorship bookings, payments, partner links.
- Recommendations, PDF reports, file assets, analytics events, audit logs, notifications, system settings.

Issues:

- The schema header says it is a planning artifact and says not to run migrations, but a migration already exists.
- `Application.counselorId`, `CrmNote.studentId`, `CrmTask.studentId`, `CrmTask.counselorId`, `CallLog.studentId`, and `CallLog.counselorId` are stored as strings without explicit Prisma relations to `User`.
- `Lead.createdStudentUserId` is a string without a relation.
- Lead uniqueness/deduplication is not enforced. This may create duplicate CRM records for the same phone/email/source.
- Lead consent fields are missing for communication, privacy acceptance, or recommendation consent.
- No explicit audit relation for many sensitive mutations yet because services are not implemented.
- No schema-level model for lead gate unlock sessions or gated access grants; current unlock behavior is frontend-only.

## Authentication

Current state:

- NextAuth is configured with a credentials provider.
- The provider returns one of four hardcoded demo users.
- The login page displays role-based demo buttons for Student, Counselor, Admin, and Super Admin.
- JWT session stores `role`.

Security and requirement gaps:

- Public login violates the requirement that only Student login/register should be visible.
- Any visitor can request internal roles by selecting demo role credentials.
- `authorize` accepts a match by either email or role, so role input alone can select a privileged demo user.
- No database-backed user lookup, password verification, OAuth provider, email verification, or registration flow.
- No middleware or server-side page guard checks roles before rendering internal pages.
- No centralized permission helpers.
- No student-only public auth boundary.

Key references:

- `src/app/(public)/login/page.tsx:7` exposes all roles.
- `src/app/(public)/login/page.tsx:27` signs in using selected role.
- `src/lib/auth/options.ts:4` hardcodes privileged demo users.
- `src/lib/auth/options.ts:28` matches by email or role.

## Public Website

Implemented:

- Home page with college discovery messaging.
- College listing page.
- College details page.
- Comparison page.
- Premium gates for PDF, detailed comparison, placement insights, scholarships, AI summary, and counseling booking.
- Lead form captures name, phone, email, city, course, interested college, source page, selected colleges, and content key.

Gaps:

- Branding is still `EduOofa`, not `College Corridor`.
- Public nav exposes internal Admin, Counselor, and CRM links.
- Public login exposes internal roles.
- No student registration page.
- Search/filter UI is present but not functional.
- College data is static and only includes four sample colleges.
- Apply, save college, PDF download, AI recommendation, and booking actions are not real workflows.
- There is no account area for students.

Key references:

- `src/components/layout/site-nav.tsx:13` exposes Admin.
- `src/components/layout/site-nav.tsx:14` exposes Counselor.
- `src/components/layout/site-nav.tsx:15` exposes CRM.
- `src/components/layout/site-nav.tsx:28` displays old brand.
- `src/app/layout.tsx:6` uses old brand in metadata.

## Lead Generation

Implemented:

- `POST /api/v1/leads` validates required lead fields with Zod.
- Successful lead submission writes a `Lead`.
- Successful lead submission creates role-based Admin and Counselor notifications.
- Public gated surfaces pass source page, selected colleges, and content key.

Issues:

- Client unlock state is `localStorage` under `eduoofa-premium-unlocked`.
- Failed lead persistence still unlocks premium content locally.
- Lead capture can be bypassed by editing localStorage.
- No rate limiting, spam protection, captcha, IP/user-agent capture, consent capture, duplicate detection, or assignment logic.
- Notification hrefs point to `/admin` and `/counselor`, not requested internal routes.
- Interested college uses static IDs like `clg_greenwood`; persisted Prisma colleges use database IDs, so submitted demo IDs may not match real records.

Key references:

- `src/components/lead/lead-capture-modal.tsx:19` uses localStorage unlock key.
- `src/components/lead/lead-capture-modal.tsx:76` unlocks after failed API response.
- `src/app/api/v1/leads/route.ts:5` defines server validation.
- `src/app/api/v1/leads/route.ts:41` creates notifications.
- `src/app/api/v1/leads/route.ts:47` and `src/app/api/v1/leads/route.ts:53` use non-internal hrefs.

## CRM Architecture

Current state:

- CRM dashboard is a static page under `/crm`.
- Counselor dashboard is a static page under `/counselor`.
- Admin dashboard is a static page under `/admin`.
- Dashboard data comes from `src/lib/data/dashboard.ts`.
- Schema supports leads, assignments, notes, tasks, and calls.

Gaps:

- No CRM APIs.
- No counselor assignment workflow.
- No lead detail page.
- No pipeline mutation.
- No notes/tasks/call-log mutations.
- No resource-level access checks for assigned leads.
- No admin queue connected to real lead records.
- No CRM filtering, pagination, ownership, dedupe, export, or activity history.

## Dashboard Architecture

Current state:

- Admin, CRM, Counselor, and Super Admin pages render static cards/tables.
- No nested internal layouts or internal navigation.
- No server-side auth checks.
- No API data loading from Prisma.

Gaps:

- Required internal routes are missing.
- Super Admin is implemented as `/super-admin`, but requested internal routes do not include public exposure of super admin.
- No dashboard-specific shell, breadcrumbs, side navigation, loading/error states, or table architecture.
- No real admin CRUD for colleges, courses, applications, reviews, partner links, analytics, revenue, users, settings, or audit logs.

## Security Issues

High priority:

- Public role escalation via demo login.
- Internal pages are publicly accessible.
- Lead gate can be bypassed with localStorage.
- Failed lead save still unlocks premium content.
- No rate limiting on lead submission or auth.
- No CSRF-specific review for credentials flow and no server-side protected mutations beyond basic Zod validation.

Medium priority:

- No centralized RBAC or resource ownership checks.
- No audit logging for sensitive operations.
- No environment variable validation.
- No request metadata capture for leads or audit logs.
- No input normalization for phone/email/course/city.
- No dedupe or abuse control for lead creation.
- No security headers beyond Next.js defaults.

Lower priority:

- Demo data and old brand names may leak into production.
- Static IDs in frontend data do not line up cleanly with Prisma records.
- Docs and code disagree on phase and implementation state.

## Missing Features Against Requirements

Brand:

- Need replace `EduOofa` with `College Corridor` across app, docs, seed data, package metadata, storage keys, and copy.

Public website:

- Need Student login/register only.
- Need hide all internal role links from public nav.
- Need public college browsing stay free.

Internal routes:

- Need `/internal/admin`.
- Need `/internal/counselor`.
- Need `/internal/crm`.
- Need role guards for each internal section.

Lead generation:

- Required fields are present in the form, but the backend names differ slightly: `fullName`, `courseInterestedIn`, `interestedCollegeId`.
- Need enforce lead capture server-side before detailed comparison, PDF reports, placement insights, AI recommendations, and counseling booking.
- Need persist unlock state against a user/session/lead, not only localStorage.

Platform:

- Student registration and profile.
- Functional search/filter/sort.
- College details from Prisma.
- Detailed comparison engine.
- PDF generation.
- Placement insight service.
- AI recommendation service.
- Counseling booking flow.
- CRM workflows.
- Admin CRUD.
- Application management.
- Payments.
- Audit logs.
- Analytics.
- Tests.

## Technical Debt

- Static prototype pages are mixed with production route names.
- No service layer; route handlers directly call Prisma.
- No test suite currently configured beyond lint/typecheck scripts.
- Planning docs still describe Phase 1 while code has moved into a prototype build.
- Existing root deliverables requested here may conflict by name with `docs/roadmap/IMPLEMENTATION_PLAN.md`; keep root plan as current authoritative remediation plan after approval.
- UI components are usable but minimal; several controls are non-functional placeholders.
- No database-backed catalog queries despite schema and seed.

## Approval Boundary

No code changes have been made as part of this audit. The next step should be implementation only after approval of `IMPLEMENTATION_PLAN.md`.
