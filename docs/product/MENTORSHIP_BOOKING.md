# EduOofa Mentorship Booking System

## 1. Booking Goals

The mentorship booking system allows students to schedule free or paid counseling sessions with counselors or mentors, with payment support, availability management, reminders, and session outcomes.

## 2. Booking Actors

- Student.
- Counselor or mentor.
- Admin.
- Payment provider.

## 3. Booking Flow

1. Student selects mentorship service.
2. Student picks counselor, topic, date, and time slot.
3. System checks slot availability.
4. If paid, system creates Razorpay order.
5. Student completes payment.
6. System verifies payment and confirms booking.
7. Notifications are sent.
8. Counselor completes session and adds notes.
9. Student can rate session.

## 4. Session Types

- College Shortlisting.
- Application Strategy.
- Course Selection.
- Scholarship Guidance.
- Career Counseling.
- Admission Interview Preparation.
- Document Review, later phase.

## 5. Booking Statuses

- Pending Payment.
- Confirmed.
- Rescheduled.
- Cancelled.
- No Show.
- Completed.
- Refunded.

## 6. Availability

Availability is stored as recurring weekly slots plus exceptions.

Rules:

- Prevent double booking.
- Lock slot during payment window.
- Release slot if payment expires.
- Enforce cancellation policy.
- Support admin override.

## 7. Payment Rules

- Razorpay order created before payment.
- Payment verified server-side.
- Webhooks update payment and booking status.
- Webhooks must be idempotent.
- Refund handling is tracked in payment records.

## 8. Notifications

- Booking confirmation.
- Payment confirmation.
- Reminder 24 hours before session.
- Reminder 1 hour before session.
- Reschedule notification.
- Cancellation notification.
- Post-session feedback request.

## 9. Session Notes

Counselor notes include:

- Summary.
- Recommended colleges.
- Recommended courses.
- Next steps.
- Follow-up date.
- Internal-only notes.

