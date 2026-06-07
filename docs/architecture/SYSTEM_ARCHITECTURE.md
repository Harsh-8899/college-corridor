# EduOofa System Architecture

## 1. Architecture Overview

EduOofa will use a modular monolith architecture for the initial production release, built with Next.js 15, TypeScript, PostgreSQL, Prisma, NextAuth, Tailwind CSS, Shadcn UI, Razorpay, and AWS S3.

This keeps product development fast while preserving clean module boundaries for later extraction into services if traffic or team size requires it.

## 2. Runtime Components

- Web application: Next.js 15 App Router.
- UI layer: React Server Components, Client Components where interactivity is required, Tailwind CSS, Shadcn UI.
- API layer: Next.js Route Handlers under `/api`.
- Authentication: NextAuth with credentials and OAuth-ready architecture.
- Authorization: role-based access control plus resource-level ownership checks.
- Database: PostgreSQL.
- ORM: Prisma.
- File storage: AWS S3 for college images, documents, PDFs, and user uploads.
- Payments: Razorpay for mentorship bookings and paid services.
- Background jobs: queue-ready design for emails, reminders, PDF generation, indexing, recommendations, and analytics aggregation.
- Search: PostgreSQL full-text search for MVP, with optional Meilisearch/OpenSearch migration later.
- AI engine: recommendation service module using rules plus model-assisted ranking and explanation.

## 3. Logical Modules

- Auth and identity.
- Student profile and preferences.
- College catalog.
- Course catalog.
- Search and comparison.
- Applications.
- Reviews and moderation.
- Counselor CRM.
- Mentorship booking.
- Payments and invoices.
- Admin operations.
- Analytics and revenue tracking.
- AI recommendation engine.
- Notifications.
- File and PDF management.
- Audit logging.

## 4. High-Level Request Flow

1. User accesses Next.js page.
2. NextAuth session is resolved.
3. Page or API route checks role and permissions.
4. Server action or route handler validates request input.
5. Domain service executes business logic.
6. Prisma reads/writes PostgreSQL.
7. S3/Razorpay/AI services are called only through integration adapters.
8. Response is returned to UI.
9. Important mutations write audit logs and analytics events.

## 5. Data Flow

- College data enters through admin dashboard, imports, or partner feeds.
- Student profile and behavior data enters through student actions.
- Applications and bookings generate operational records.
- Analytics events are captured from views, searches, shortlists, applications, bookings, and payments.
- AI recommendations consume normalized student profile data and college/course facts.
- Admin analytics consume event and transactional data.

## 6. Deployment Architecture

Recommended production setup:

- Next.js app hosted on Vercel, AWS ECS, or AWS Amplify.
- PostgreSQL hosted on AWS RDS or Supabase.
- S3 bucket for private and public assets.
- CloudFront CDN for static assets and public college media.
- Secrets in platform secret manager.
- Scheduled jobs via Vercel Cron, AWS EventBridge, or a worker process.
- Observability using Sentry, OpenTelemetry-compatible logs, and platform metrics.

## 7. Security Architecture

- Passwords never stored directly; use NextAuth-compatible password hashing only if credentials login is enabled.
- RBAC enforced in server-only permission helpers.
- Resource ownership checks for student records, applications, bookings, saved colleges, and reports.
- Admin and super admin actions require audit logging.
- S3 private assets use signed URLs.
- Razorpay webhooks verified with signature validation.
- API validation with Zod in implementation phase.
- Rate limiting for login, search, reviews, bookings, applications, and AI endpoints.

## 8. Scalability Plan

MVP:

- PostgreSQL indexes for search, filters, slugs, foreign keys, status fields, and timestamps.
- Read-optimized college profile queries.
- Cached public college pages.
- Denormalized analytics summaries for dashboards.

Later:

- Search service extraction.
- Background job workers.
- Recommendation feature store.
- CDN-backed PDF reports.
- Event streaming for analytics.
- Separate admin and public APIs if required.

## 9. Availability and Resilience

- Idempotent payment webhook handling.
- Retry-safe notification jobs.
- Soft deletes for important business records.
- Audit logs for sensitive changes.
- Database backups and point-in-time recovery.
- Graceful fallback when AI recommendation service is unavailable.

## 10. Core Integrations

- NextAuth: authentication sessions and providers.
- Razorpay: orders, payments, refunds, webhooks.
- AWS S3: images, files, generated reports.
- Email/SMS provider: notifications and reminders, provider to be selected.
- AI provider: recommendation explanations and ranking support, provider to be selected.

