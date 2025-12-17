# Gemini Rules / AI Context

This file contains context and rules for AI assistants continuing work on the Intelligent LMS project.

## 1. Architecture & Patterns
- **Service Layer Pattern**: 
    - Complex logic MUST be in `services.py`.
    - `attendance/services.py`: Handles Geofencing (Haversine) & TOTP. Note the **Redis Caching** for `course_location`.
    - `grades/services.py`: Handles Pandas logic.
- **Data Models**:
    - `Course`: Contains `latitude`, `longitude`, `allowed_radius`.
    - `Grade`: Uses `JSONField` for `details`.
    - Use `SoftDeleteModel` for archiving.

## 2. Dynamic Geofencing & caching
- **Workflow**:
    1. Professor generates QR -> `GenerateQRView` -> calls `cache_course_location(course_id)` -> Stores coords in Redis (`course_loc:{id}`).
    2. Student scans QR -> `CheckInView` -> calls `verify_attendance`.
    3. `verify_attendance` checks Redis first. If miss, queries DB and caches it.
- **Rule**: If modifying `Course` location logic, ALWAYS update the `cache_course_location` function in `attendance/services.py`.

## 3. Deployment & Migrations
- **Critical**: The `users` app must have migrations. If you create a new env, ensure `users` migrations are applied (`0001_initial`) BEFORE `admin` or others.
- **Docker**: Always use `docker-compose exec web <command>` to run management commands.

## 4. Frontend Strategy (Upcoming)
- Stack: React + Vite + TypeScript + Tailwind.
- State: React Query (Server), Zustand (Client).
- Maps: Use Kakao/Google Maps API for Course Manager.

## 5. Next Immediate Tasks(Priority Order)
1. **Frontend Init**: Create the React project structure.
2. **Tests**: Add `test_users.py` and `test_grades.py` to ensure stability.
3. **Optimizations**: Gunicorn/Nginx tuning.
