# Gemini Rules / AI Context

This file contains context and rules for AI assistants continuing work on the Intelligent LMS project.

## 1. Architecture & Patterns (Backend)
- **Service Layer Pattern**: 
    - Complex logic MUST be in `services.py`.
    - `attendance/services.py`: Handles Geofencing (Haversine) & TOTP. **Redis Caching** for `course_location`.
- **Data Models**:
    - `Course`: Stores location (`latitude`, `longitude`).
    - `CourseSchedule`: Stores weekly timing. Use `IntegerChoices` for days (0=Mon, 6=Sun) to match Python `datetime`.
    - Use `SoftDeleteModel` for archiving.
- **Docker & Migrations (CRITICAL)**: 
    - Migrations run locally (`python manage.py migrate`) do NOT affect the Docker container's DB volume.
    - **Always** run migrations inside the container: `docker-compose exec web python manage.py migrate`.
- **Serializers**:
    - Use `SerializerMethodField` for related object properties (like `professor_name`) to prevent 500 crashes if data is missing/corrupt.
    - Override `create()` for nested writes (e.g., creating Schedules within Course creation).

## 2. Architecture & Patterns (Frontend)
- **Framework**: React 18, Vite, TypeScript, Tailwind CSS (v3.x).
- **State Management**:
    - **Server State**: `@tanstack/react-query` is MANDATORY for API calls. Keys must be consistent (e.g., `['courses']`, `['dashboard-stats']`).
    - **Client State**: `Zustand` (`store/authStore`) for Auth.
- **Design System**:
    - Use 'Rounded Soft' theme (`rounded-xl`, `shadow-soft`, borders).
    - Role-Based Rendering: Use `user.role` check inside components or `Dashboard.tsx` switch-case.
- **Hooks Rules**:
    - **NEVER** place Hooks (`useQuery`, `useState`) inside conditionals (`if`, `switch`).
    - Always call all Hooks at the top level, then conditionally render the *return* JSX.

## 3. Dynamic Geofencing & caching
- **Workflow**:
    1. Professor creates Course via Frontend `MapPicker` -> DB saves Lat/Lon.
    2. QR Generation -> Cache warm-up in Redis.
    3. Attendance Check -> Redis lookup (O(1)).

## 4. Next Tasks (Prioritized)
1. **User Approval**: Implement Backend logic for Admin to approve/reject `is_active=False` users.
2. **Student Enrollment**: Add "Register for Course" UI for students using the code.
3. **Tests**: Add backend tests now that Models are stable.
