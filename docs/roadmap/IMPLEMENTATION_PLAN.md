# EduOofa Implementation Plan

## 1. Engineering Principles

- Build a modular monolith first.
- Keep domain logic outside route handlers.
- Use server-side validation for every mutation.
- Keep RBAC centralized.
- Prefer Postgres for MVP search before adding a separate search service.
- Use audited admin mutations.
- Keep integrations behind adapters.

## 2. Recommended Phase 2 Order

1. Bootstrap Next.js 15 with TypeScript.
2. Install Tailwind CSS and Shadcn UI.
3. Add Prisma and connect PostgreSQL.
4. Add NextAuth.
5. Implement role and permission helpers.
6. Add base route groups:
   - Public.
   - Student.
   - Counselor.
   - Admin.
   - Super Admin.
7. Add database migration and seed flow.
8. Build shell layouts and navigation.
9. Add basic college catalog CRUD foundation.
10. Add tests for auth, permissions, and key services.

## 3. Suggested Route Groups

```text
src/app/(public)
src/app/(student)
src/app/(counselor)
src/app/(admin)
src/app/(super-admin)
src/app/api/v1
```

## 4. Suggested Feature Modules

```text
src/features/auth
src/features/users
src/features/colleges
src/features/courses
src/features/search
src/features/comparison
src/features/applications
src/features/reviews
src/features/counselor-crm
src/features/bookings
src/features/payments
src/features/recommendations
src/features/analytics
src/features/files
src/features/admin
```

## 5. Testing Plan

- Unit tests for scoring logic, permissions, status transitions, and pricing rules.
- Integration tests for API route handlers.
- Database tests for critical Prisma queries.
- E2E tests for registration, search, save college, compare, apply, book mentorship, admin moderation, and counselor follow-up.

## 6. Production Checklist

- Environment variable validation.
- Database migrations.
- Seed and fixture separation.
- S3 bucket policies.
- Razorpay webhook verification.
- NextAuth secret configuration.
- Rate limiting.
- Error monitoring.
- Structured logs.
- Audit logs.
- Backup and restore procedure.
- Data privacy policy.
- Terms and refund policy.

