# 지능형 LMS (학습 관리 시스템)

위치 기반 출석 체크, 벡터화된 성적 분석, 역할 기반 접근 제어 기능을 갖춘 견고한 AI 기반 학습 관리 시스템 백엔드입니다.

## 🚀 주요 기능

- **출석 추적**: 
    - **지오펜싱**: 강의 장소 반경 50m 이내 학생 위치 검증 (`Haversine` 공식 사용).
    - **QR/TOTP**: 보안 체크인을 위한 시간 기반 일회용 비밀번호 토큰 (`Redis` + `PyOTP` 사용).
- **성적 분석**:
    - 유연한 성적 세부 항목 저장을 위한 JSONB 사용.
    - `Pandas`를 활용한 벡터화된 통계 분석 (평균, 표준편차, 최소/최대값).
- **보안**:
    - JWT 인증.
    - 역할 기반 접근 제어 (학생, 교수, 관리자).
- **확장성**:
    - Dockerized 마이크로서비스 아키텍처 (Django, Postgres, Redis, Celery, Nginx).

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

2. **마이그레이션 실행** (최초 1회):
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

## 🧪 테스트 실행

```bash
docker-compose exec web pytest
```

## 📂 프로젝트 구조

- `core/`: 설정 및 구성 파일.
- `users/`: 사용자 모델 및 인증.
- `attendance/`: 지오펜싱 및 QR 출석 구현.
- `grades/`: 성적 관리 및 Pandas 분석.
- `courses/`: 강의 관리.
# miniproject01
