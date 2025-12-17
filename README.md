# 지능형 LMS (학습 관리 시스템)

위치 기반 출석 체크, 벡터화된 성적 분석, 역할 기반 접근 제어 기능을 갖춘 견고한 AI 기반 학습 관리 시스템 백엔드입니다.

## 🚀 주요 기능

- **출석 추적 (Attendance)**: 
    - **동적 지오펜싱 (Dynamic Geofencing)**: 
        - 강의실의 위도/경도(`latitude`, `longitude`)를 DB에 설정.
        - `Redis` 캐싱을 통해 출석 체크 시 DB 부하 최소화 (O(1) 조회).
        - 반경(`allowed_radius`) 내 학생 위치 검증.
    - **QR/TOTP**: 보안 체크인을 위한 시간 기반 일회용 비밀번호 토큰.
- **성적 분석 (Analytics)**:
    - 유연한 성적 세부 항목(퀴즈, 중간, 기말 등)을 `JSONB`로 저장.
    - `Pandas`를 활용한 벡터화된 통계 분석 (평균, 표준 편차 등).
- **보안 (Security)**:
    - JWT (SimpleJWT) 인증.
    - 역할 기반 접근 제어 (학생, 교수, 관리자).

## 🛠 기술 스택

- **Backend**: Django 5, DRF
- **Database**: PostgreSQL 15
- **Cache/Broker**: Redis 7
- **Data Science**: Pandas, NumPy
- **Infrastructure**: Docker, Nginx

## 🏁 시작하기

### 사전 요구사항
- Docker 및 Docker Compose

### 앱 실행 방법

1. **컨테이너 빌드 및 실행**:
   ```bash
   docker-compose up --build
   ```

2. **마이그레이션 실행**:
   **중요**: `users` 앱의 마이그레이션이 먼저 적용되어야 할 수 있습니다.
   ```bash
   # 혹시 오류가 난다면 users 먼저 실행
   docker-compose exec web python manage.py migrate users
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
- `users/`: 사용자 모델 및 인증 (Role: Student, Professor).
- `attendance/`: **서비스 핵심**. 지오펜싱(Haversine), Redis 캐싱, QR 로직.
- `grades/`: 성적 관리 및 Pandas 분석 서비스.
- `courses/`: 강의 관리 및 Location 정보 포함.
