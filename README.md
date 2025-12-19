# 지능형 LMS (학습 관리 시스템)

위치 기반 출석 체크, 벡터화된 성적 분석, 역할 기반 접근 제어 기능을 갖춘 견고한 AI 기반 학습 관리 시스템 백엔드입니다.

## 🚀 주요 기능

- **출석 추적 (Attendance)**: 
    - **동적 지오펜싱 (Dynamic Geofencing)**: 
        - 강의실의 위도/경도(`latitude`, `longitude`)를 DB에 설정.
        - `Redis` 캐싱을 통해 출석 체크 시 DB 부하 최소화 (O(1) 조회).
        - 반경(`allowed_radius`) 내 학생 위치 검증.
    - **QR/TOTP**: 30초마다 갱신되는 보안 QR 코드 (카운트다운 타이머 포함).
- **강의 및 시간표 관리 (Course & Scheduling)**:
    - **유연한 시간표**: 강의 당 여러 개의 요일/시간 슬롯 설정 가능.
    - **역할별 대시보드**: 교수(오늘의 강의), 학생(주간 시간표), 관리자(통계/승인) 맞춤 화면 제공.
- **성적 분석 (Analytics)**:
    - 유연한 성적 세부 항목(퀴즈, 중간, 기말 등)을 `JSONB`로 저장.
    - `Pandas`를 활용한 벡터화된 통계 분석 (평균, 표준 편차 등).
- **보안 (Security)**:
    - JWT (SimpleJWT) 인증.
    - 역할 기반 접근 제어 (Admin, Professor, Student 권한 분리 확실).

## 🛠 기술 스택

- **Backend**: Django 5, DRF
- **Database**: PostgreSQL 15
- **Cache/Broker**: Redis 7
- **Data Science**: Pandas, NumPy
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query
- **Infrastructure**: Docker, Nginx

## 🏁 시작하기

### 사전 요구사항
- Docker 및 Docker Compose

### 앱 실행 방법

1. **컨테이너 빌드 및 실행**:
   ```bash
   docker-compose up --build
   ```

2. **마이그레이션 실행 (필수)**:
   **주의**: 코드를 수정했거나 새로운 모델을 추가했다면 Docker 내부 DB에도 반영해야 합니다.
   ```bash
   docker-compose exec web python manage.py migrate
   ```

3. **관리자 계정(Superuser) 생성**:
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

4. **API 접속**:
   - API Root: http://localhost:8000/api/
   - **Swagger 문서**: http://localhost:8000/api/schema/swagger-ui/
   - 관리자 패널: http://localhost:8000/admin/

5. **프론트엔드 실행**:
   ```bash
   cd frontend
   npm install
   npm run dev
   # 접속: http://localhost:5173
   ```

## 📂 프로젝트 구조

- `core/`: 설정 및 구성 파일.
- `users/`: 사용자 모델(AbstractUser) 및 인증 (Role: Student, Professor).
- `attendance/`: **서비스 핵심**. 지오펜싱(Haversine), Redis 캐싱, QR 로직.
- `grades/`: 성적 관리 및 Pandas 분석 서비스.
- `courses/`: 강의 관리, 시간표(`CourseSchedule`) 및 Location 정보.
- `frontend/`: React 기반 SPA (Role-based Dashboard, MapPicker 등).
