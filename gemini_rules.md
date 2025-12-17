# Gemini Rules / AI Context

This file contains context and rules for AI assistants continuing work on the Intelligent LMS project.

## 1. Architecture & Patterns (Backend)
- **Service Layer Pattern**: 
    - Complex logic MUST be in `services.py`.
    - `attendance/services.py`: Handles Geofencing (Haversine) & TOTP. **Redis Caching** for `course_location`.
- **Data Models**:
    - `Course`: Stores location (`latitude`, `longitude`).
    - Use `SoftDeleteModel` for archiving.
- **Docker**: Always use `docker-compose exec web <command>` for Django commands.

## 2. Architecture & Patterns (Frontend)
- **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS (Must use v3.x, NOT v4).
- **State Management**:
    - **Server State**: Use `@tanstack/react-query` for all API calls (fetching/mutating). Do not use `useEffect` for data fetching if possible.
    - **Client State**: Use `Zustand` (`store/authStore.ts`) for global UI state like Auth Tokens or Sidebar toggle.
- **Styling**:
    - Use Tailwind CSS utility classes.
    - Design System: 'Rounded Soft' theme (`rounded-xl`, `shadow-soft`).
- **Directory Structure**:
    - `src/components`: Reusable UI components (e.g., `Layout`, `MapPicker`).
    - `src/pages`: Page components (e.g., `Dashboard`, `Courses`).
    - `src/api`: Axios setup (`client.ts`).

## 3. Dynamic Geofencing & caching
- **Workflow**:
    1. Professor creates Course via Frontend `MapPicker` -> DB saves Lat/Lon.
    2. QR Generation -> Cache warm-up in Redis.
    3. Attendance Check -> Redis lookup (O(1)).

## 4. Next Immediate Tasks (QA Focus)
1. **Tests**: Create `test_users.py` (Auth) and `test_grades.py` (Pandas Calc).
2. **E2E Test**: Verify the flow [Login -> Dashboard -> Create Course].
