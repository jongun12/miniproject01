# 개발 일지 - 지능형 LMS (Intelligent LMS)

**날짜:** 2025-12-17
**상태:** 베타 (Beta) / 풀스택 구현 완료 (Backend + Frontend)

## 1. 개발 현황

### ✅ 개발 완료 (Full Stack)
- **백엔드 (Backend & Infrastructure)**:
    - Docker 기반 마이크로서비스 (Django, Redis, Celery, Nginx).
    - **지오펜싱(Geofencing)** 출석 로직 (DB 기반 동적 좌표 + Redis 캐싱).
    - Pandas 성적 분석 및 JWT 인증 시스템.
- **프론트엔드 (Frontend)**:
    - **기술 스택**: React 18, Vite, TypeScript, Tailwind CSS.
    - **기능 구현**:
        - **인증(Auth)**: 로그인 UI, JWT 토큰 관리 (`Zustand`), Protected Routes.
        - **대시보드(Dashboard)**: Recharts를 활용한 데이터 시각화 (출석률, 성적).
        - **강의 관리(Course Manager)**: 강의 목록 조회 및 생성, 모의 지도(Mock Map)를 이용한 좌표 설정 UI.
    - **연동**: Vite Proxy 설정을 통해 백엔드 API와 CORS 없이 통신.

### 🚧 미완료 / TODO 리스트 (3단계 - Phase 3)
- **테스트 (QA Expansion)**:
    - [ ] 백엔드: `tests/test_users.py`, `tests/test_grades.py` 추가 필요.
    - [ ] 프론트엔드: Vitest를 이용한 컴포넌트 단위 테스트.
    - [ ] 통합 테스트: 로그인부터 출석 체크까지의 E2E 시나리오 검증.
- **배포 최적화 (DevOps)**:
    - [ ] 프론트엔드 빌드(`npm run build`) 및 Nginx 서빙 설정.
    - [ ] 프로덕션용 `gunicorn` 및 `docker-compose.prod.yml` 구성.

## 2. 일일 개발 저널 (Daily Journal)
**2025-12-17 (심야 - Frontend Sprint)**:  
- **프론트엔드 구축**: Vite + React 기반으로 프로젝트를 초기화하고 'Rounded Soft' 디자인 시스템을 적용했습니다.
- **기능 통합**: Django 백엔드와 React 프론트엔드를 연동했습니다. 
    - Axios 인터셉터를 설정하여 JWT 토큰을 자동으로 헤더에 포함하도록 구현했습니다.
    - 강의 관리 페이지에서 새로운 강의를 생성할 때, 지도 UI(Mock Map)를 통해 위도/경도를 직관적으로 입력받도록 했습니다.
- **이슈 해결**:
    - **Tailwind CSS 버전 충돌**: `v4` 버전이 설치되어 PostCSS 설정과 호환되지 않는 문제 발생. `v3.4.17`로 다운그레이드하여 해결.
    - **PowerShell 실행 권한**: `npm` 실행 시 `PSSecurityException` 발생. `Set-ExecutionPolicy`로 해결 권장.

**2025-12-19 (Backend/Frontend Integration Sprint)**:
- **역할 기반 대시보드(Role-Based Dashboard)**:
    - 사용자 권한(Admin, Professor, Student)에 따라 대시보드 UI를 동적으로 분기 처리.
    - **교수**: '오늘의 강의 일정' (DB 연동), 채점 현황 위젯.
    - **학생**: '주간 시간표' (Grid Layout), 출석률 그래프, 마감 임박 과제 알림.
    - **관리자**: 가입 승인 대기 목록 관리 기능.
- **강의 시간표 관리(Course Schedule Management)**:
    - **DB 설계**: `CourseSchedule` 모델 추가 (요일, 시작/종료 시간). `Course` 모델과 1:N 관계.
    - **기능 구현**:
        - Admin 패널 및 API(`CourseSerializer`)에서 시간표 생성/조회 지원.
        - 프론트엔드 '강의 생성' 모달에 요일/시간 추가 UI 구현.
- **출석 시스템 고도화**:
    - **QR 코드**: 30초 자동 리프레시 및 시각적 카운트다운 타이머 구현 (`AttendanceProfessor.tsx`).
    - React Hooks 규칙 준수(`Rendered more hooks...` 에러)를 위해 컴포넌트 구조 리팩토링.
- **주요 버그 수정**:
    - **500 Internal Server Error**: `CourseViewSet`에서 필터링 시 `ProgrammingError` 발생.
    - **원인**: 로컬에서만 마이그레이션을 수행하고 Docker 컨테이너에는 반영하지 않음.
    - **해결**: `docker-compose exec web python manage.py migrate` 실행으로 해결.
    - **개선**: Serializer에서 `professor` 접근 시 `SerializerMethodField`로 방어 코드 작성하여 안정성 확보.
