# EduOofa User Roles and Permissions

## 1. Role Model

EduOofa uses role-based access control with four primary roles:

- Student.
- Counselor.
- Admin.
- Super Admin.

Each user has one primary role in the initial release. Future releases may support multiple roles per user through role assignments.

## 2. Student

Can:

- Manage own profile and preferences.
- Search and view public college/course data.
- Save colleges.
- Compare colleges.
- Apply to colleges/courses.
- Book mentorship sessions.
- Download own PDF reports.
- View own applications, bookings, payments, and recommendations.
- Submit reviews.

Cannot:

- Access other students' private data.
- Approve reviews.
- Edit college/course data.
- Access revenue or analytics dashboards.

## 3. Counselor

Can:

- View assigned students/leads.
- View assigned student profiles, preferences, shortlists, applications, bookings, and CRM history.
- Add notes, tasks, reminders, call logs, session notes, and recommendations.
- Manage own availability.
- Join and complete mentorship sessions.
- Update assigned application follow-up fields.

Cannot:

- View unassigned student private data unless granted by admin.
- Modify master college/course data.
- Approve reviews globally.
- Access platform-wide revenue settings.

## 4. Admin

Can:

- Manage colleges, courses, fees, placements, seats, rankings, scholarships, admission details, eligibility, hostel details, and partner links.
- Manage applications.
- Assign students to counselors.
- Moderate reviews.
- Manage counselor records and schedules.
- View analytics and revenue dashboards.
- Manage sponsored listings and partner college links.

Cannot:

- Change super admin settings.
- Delete audit logs.
- Modify global billing/security policies unless permitted.

## 5. Super Admin

Can:

- Full platform access.
- Manage admins and counselors.
- Configure permissions, system settings, platform fees, payment settings, AI settings, and integrations.
- View all analytics, revenue, and audit logs.
- Override admin decisions.

Cannot:

- Bypass audit logging for sensitive operations.

## 6. Permission Categories

- `college.read`
- `college.manage`
- `course.manage`
- `application.read_own`
- `application.manage_assigned`
- `application.manage_all`
- `review.create`
- `review.moderate`
- `crm.manage_assigned`
- `booking.create`
- `booking.manage_own`
- `booking.manage_all`
- `payment.read_own`
- `payment.manage_all`
- `analytics.read`
- `revenue.read`
- `user.manage`
- `settings.manage`
- `audit.read`

## 7. Access Control Rule

Every protected API route must validate:

1. Authenticated session.
2. Required role or permission.
3. Resource ownership or assignment.
4. Record status where relevant.

