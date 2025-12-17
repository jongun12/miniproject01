# Gemini Rules / AI Context

This file contains context and rules for AI assistants continuing work on the Intelligent LMS project.

## 1. Architecture & Patterns
- **Service Layer Pattern**: 
    - **Crucial**: Complex logic MUST be placed in `services.py` within each app, NOT in views.
    - Example: `attendance/services.py` handles Geofencing/TOTP, `grades/services.py` handles Pandas logic.
    - Views should only handle Request/Response parsing and permission checks.
- **DTO/Serializers**: Use DRF Serializers for validation.
- **Model Constraints**:
    - Use `JSONField` for flexible data schemas (like Grade details).
    - Use `SoftDeleteModel` (in `courses/models.py`) for archiving entities instead of hard deletion.

## 2. Tech Stack Specifics
- **Pandas/Numpy**: Use for any heavy calculation or aggregation. Do not do complex math in Python loops.
- **Redis**: Used for:
    - Celery Broker.
    - Caching TOTP secrets (Key format: `attendance_secret:{course_id}`).
- **Geofencing**: Logic is manual Haversine format in `attendance.services`.
    - Note: `Course` location is currently mocked/hardcoded in `attendance/views.py`. **Priority Fix**: Move `lat`/`lon` to `Course` model.

## 3. Deployment / Infrastructure
- **Docker**: The source of truth for running the app is `docker-compose.yml`.
- **Environment**: `.env.dev` contains development secrets. PROD would use `.env.prod`.

## 4. Testing
- Use `pytest` for testing.
- Write tests in `tests/` directory or `app/tests.py`.
- Mock external services (Redis) where possible in unit tests.

## 5. Next Immediate Tasks (High Priority)
1. **Course Location**: Add `lat` and `lon` fields to `courses.models.Course`. Update `attendance.views` to use these fields instead of hardcoded values.
2. **Expand Tests**: Create `test_grades.py` to verify Pandas calculations.
3. **Frontend**: Request user preference for Frontend stack before starting.
