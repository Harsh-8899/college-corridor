# College Corridor Implementation Plan

Date: 2026-06-08

## Goal

Bring the current prototype into alignment with the College Corridor requirements:

- Brand as College Corridor.
- Public website shows Student login/register only.
- No Admin/Counselor/CRM login or navigation visible publicly.
- Internal routes live under `/internal/admin`, `/internal/counselor`, and `/internal/crm`.
- Students can browse colleges freely.
- Detailed comparison, PDF reports, placement insights, AI recommendations, and counseling booking require lead capture.
- Lead capture stores name, phone, email, city, course, and interested college.

No implementation should begin until this plan is approved.

## Phase 1: Route and Brand Alignment

Tasks:

- Replace public-facing `EduOofa` brand text with `College Corridor`.
- Update metadata, nav label, homepage copy, login copy, seed demo names/emails, and storage key naming.
- Remove Admin, Counselor, and CRM links from public navigation.
- Create internal route structure:
  - `/internal/admin`
  - `/internal/counselor`
  - `/internal/crm`
- Move or recreate the existing dashboard pages under the internal routes.
- Redirect old prototype routes (`/admin`, `/counselor`, `/crm`, `/super-admin`) to safe destinations or return 404, depending on business preference.

Acceptance criteria:

- Public nav contains only public/student links.
- Public pages do not reveal internal dashboard URLs.
- Internal dashboards are reachable only at approved `/internal/*` paths.
- Browser title and visible brand read `College Corridor`.

## Phase 2: Authentication and Authorization

Tasks:

- Replace role-selection demo login with student-only public login/register.
- Decide whether the first implementation uses credentials, OAuth, or both.
- Add database-backed user lookup.
- Add password hashing if credentials auth is retained.
- Add student registration flow.
- Add internal login path or protected internal auth entry that is not linked from public navigation.
- Add server-side route protection using middleware and/or server helpers.
- Add centralized role helpers:
  - Student for public/student account routes.
  - Admin for `/internal/admin`.
  - Counselor for `/internal/counselor`.
  - CRM Executive, Admin, or Super Admin for `/internal/crm`, depending on final role mapping.
- Extend role model to include `CRM_EXECUTIVE` if CRM Executive is a separate internal user type.

Acceptance criteria:

- Public login cannot select Admin, Counselor, CRM, or Super Admin.
- Unauthenticated users cannot access internal pages.
- Authenticated students cannot access internal pages.
- Internal users access only their allowed dashboard.
- Auth checks happen server-side, not only through hidden UI.

## Phase 3: Lead Capture Enforcement

Tasks:

- Normalize lead field names to business terminology while preserving Prisma compatibility:
  - Name -> `fullName`
  - Phone -> `phone`
  - Email -> `email`
  - City -> `city`
  - Course -> `courseInterestedIn`
  - Interested College -> `interestedCollegeId` or text fallback
- Add explicit consent fields if required for contact and recommendations.
- Persist lead capture success server-side.
- Replace global localStorage unlock with server-backed unlock grants tied to lead/session/user.
- Do not unlock premium content when the lead API fails.
- Add duplicate detection by normalized phone/email and source/context.
- Add basic rate limiting and abuse controls.
- Update notification links to `/internal/admin`, `/internal/counselor`, and/or `/internal/crm`.

Acceptance criteria:

- Gated content unlocks only after successful lead persistence.
- Refreshing the page preserves valid unlock state.
- Users cannot unlock gated content by localStorage edits alone.
- Duplicate lead submission does not create uncontrolled CRM noise.
- Leads include source page, selected colleges, and unlocked content keys.

## Phase 4: Public College Data and Browsing

Tasks:

- Replace static college data with Prisma-backed public queries.
- Keep browsing free for college listing and basic college details.
- Implement functional search, filters, and sort.
- Align static frontend college IDs with Prisma IDs/slugs.
- Add loading and empty states.
- Keep premium fields out of public responses until lead capture is verified.

Acceptance criteria:

- College list and details load from PostgreSQL.
- Public browse works without login or lead capture.
- Search/filter/sort perform real filtering.
- Premium fields are not included in unauthenticated public data responses unless intentionally public.

## Phase 5: Gated Product Workflows

Tasks:

- Detailed comparison:
  - Free basic comparison remains visible.
  - Detailed fees, placements, scholarships, salary stats, admission probability, and recommendations require lead unlock.
- PDF reports:
  - Add report request endpoint.
  - Generate or stub PDF reports behind server-side unlock validation.
- Placement insights:
  - Add placement insight endpoint backed by `PlacementStat`.
- AI recommendations:
  - Start with deterministic scoring service.
  - Add AI explanation provider later behind an adapter.
- Counseling booking:
  - Add booking intent flow after lead capture.
  - Connect to counselor availability later.

Acceptance criteria:

- Every gated workflow validates unlock state on the server.
- API responses do not expose gated data before lead capture.
- UI clearly prompts for lead capture where required.

## Phase 6: CRM and Dashboard Data

Tasks:

- Connect CRM dashboard to real `Lead` records.
- Add lead list, detail, pipeline update, assignment, notes, tasks, and call logs.
- Implement counselor assignment rules.
- Add Admin lead queue and notifications from real data.
- Add Counselor assigned-lead view with ownership checks.
- Add CRM Executive access if approved as a separate role.
- Add pagination, filtering, and source tracking.

Acceptance criteria:

- Internal dashboards no longer depend on `src/lib/data/dashboard.ts`.
- Counselors see only assigned leads.
- Admin/CRM users can manage lead pipeline according to permissions.
- Notes/tasks/calls persist and appear in lead activity history.

## Phase 7: Admin Foundation

Tasks:

- Add admin CRUD for colleges, campuses, courses, fees, placements, rankings, scholarships, and partner links.
- Add application management shell.
- Add review moderation shell.
- Add audit logging for admin mutations.
- Add analytics event capture for key public actions.

Acceptance criteria:

- Admin can manage catalog data used by public pages.
- Sensitive admin mutations create audit logs.
- Admin routes require admin authorization.

## Phase 8: Hardening and Tests

Tasks:

- Add environment variable validation.
- Add tests for:
  - Auth and role guards.
  - Lead validation and unlock behavior.
  - Internal route protection.
  - Public nav visibility.
  - CRM ownership checks.
- Add lint/typecheck/build verification to the implementation workflow.
- Add rate limiting for auth and lead endpoints.
- Add structured error handling and logging.

Acceptance criteria:

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- Critical auth/lead/route tests pass.

## Recommended First Implementation Batch

After approval, start with the smallest high-impact batch:

1. Brand rename to College Corridor.
2. Public nav cleanup.
3. Student-only public login/register surface.
4. Move dashboards to `/internal/*`.
5. Add server-side internal route protection.
6. Fix lead unlock so failed persistence does not unlock content.
7. Update notification hrefs to internal routes.

This batch resolves the biggest requirement mismatches before deeper CRM, catalog, PDF, AI, and booking work.

## Decisions Needed Before Code Changes

- Should CRM Executive be a distinct Prisma `UserRole` (`CRM_EXECUTIVE`) or should CRM access be an Admin permission?
- Should internal users log in at a hidden `/internal/login`, through the same login form with email/password, or via an invite-only provider?
- Should old routes `/admin`, `/counselor`, `/crm`, and `/super-admin` redirect, 404, or remain temporarily during migration?
- Should lead capture require explicit communication consent at MVP launch?
