# EduOofa API Architecture

## 1. API Style

EduOofa should use REST-style route handlers in Next.js 15 for Phase 2, with typed request validation and service-layer boundaries. Server actions may be used for tightly scoped form submissions, but public contracts should be implemented as route handlers.

Base path:

```text
/api/v1
```

## 2. API Design Principles

- Validate all inputs at route boundaries.
- Keep business logic in domain services, not route handlers.
- Return consistent error shapes.
- Use cursor pagination for large collections.
- Use stable slugs for public college/course pages.
- Use role and resource-level authorization in every private route.
- Make payment webhooks idempotent.
- Keep admin endpoints separate from public/student endpoints.

## 3. Response Envelope

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Error shape:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```

## 4. Public APIs

- `GET /api/v1/colleges`
- `GET /api/v1/colleges/:slug`
- `GET /api/v1/colleges/:slug/courses`
- `GET /api/v1/colleges/:slug/reviews`
- `GET /api/v1/courses`
- `GET /api/v1/search`
- `POST /api/v1/compare`
- `GET /api/v1/rankings`

## 5. Student APIs

- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `GET /api/v1/me/preferences`
- `PUT /api/v1/me/preferences`
- `GET /api/v1/me/saved-colleges`
- `POST /api/v1/me/saved-colleges`
- `DELETE /api/v1/me/saved-colleges/:collegeId`
- `GET /api/v1/me/applications`
- `POST /api/v1/applications`
- `GET /api/v1/applications/:id`
- `POST /api/v1/reviews`
- `GET /api/v1/me/bookings`
- `POST /api/v1/bookings`
- `POST /api/v1/reports/college-comparison`
- `GET /api/v1/me/recommendations`

## 6. Counselor APIs

- `GET /api/v1/counselor/leads`
- `GET /api/v1/counselor/students/:id`
- `PATCH /api/v1/counselor/students/:id/pipeline`
- `GET /api/v1/counselor/tasks`
- `POST /api/v1/counselor/tasks`
- `PATCH /api/v1/counselor/tasks/:id`
- `POST /api/v1/counselor/notes`
- `POST /api/v1/counselor/call-logs`
- `GET /api/v1/counselor/bookings`
- `PUT /api/v1/counselor/availability`
- `POST /api/v1/counselor/recommendations`

## 7. Admin APIs

- `GET /api/v1/admin/colleges`
- `POST /api/v1/admin/colleges`
- `PATCH /api/v1/admin/colleges/:id`
- `POST /api/v1/admin/colleges/:id/media`
- `GET /api/v1/admin/courses`
- `POST /api/v1/admin/courses`
- `PATCH /api/v1/admin/courses/:id`
- `GET /api/v1/admin/applications`
- `PATCH /api/v1/admin/applications/:id`
- `GET /api/v1/admin/reviews`
- `PATCH /api/v1/admin/reviews/:id/moderation`
- `GET /api/v1/admin/counselors`
- `POST /api/v1/admin/counselor-assignments`
- `GET /api/v1/admin/analytics`
- `GET /api/v1/admin/revenue`
- `GET /api/v1/admin/partner-links`
- `POST /api/v1/admin/partner-links`
- `PATCH /api/v1/admin/partner-links/:id`

## 8. Super Admin APIs

- `GET /api/v1/super-admin/users`
- `POST /api/v1/super-admin/users`
- `PATCH /api/v1/super-admin/users/:id`
- `GET /api/v1/super-admin/settings`
- `PATCH /api/v1/super-admin/settings`
- `GET /api/v1/super-admin/audit-logs`
- `GET /api/v1/super-admin/integrations`
- `PATCH /api/v1/super-admin/integrations/:key`

## 9. Payment APIs

- `POST /api/v1/payments/razorpay/order`
- `POST /api/v1/payments/razorpay/verify`
- `POST /api/v1/webhooks/razorpay`
- `GET /api/v1/me/payments`

## 10. File APIs

- `POST /api/v1/files/presign-upload`
- `GET /api/v1/files/:id/signed-url`
- `DELETE /api/v1/files/:id`

## 11. AI APIs

- `POST /api/v1/ai/recommendations`
- `GET /api/v1/ai/recommendations/:id`
- `POST /api/v1/ai/shortlist`
- `POST /api/v1/ai/compare-summary`

## 12. API Modules

Implementation should organize APIs around services:

- `authService`
- `collegeService`
- `courseService`
- `searchService`
- `comparisonService`
- `applicationService`
- `reviewService`
- `crmService`
- `bookingService`
- `paymentService`
- `fileService`
- `analyticsService`
- `recommendationService`
- `auditService`

