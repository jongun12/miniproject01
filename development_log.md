# 개발 일지 - 지능형 LMS (Intelligent LMS)

**날짜:** 2025-12-17
**상태:** 백엔드 알파 (Backend Alpha) / 핵심 로직 고도화 완료

## 1. 개발 현황

### ✅ 개발 완료 (백엔드 및 인프라)
- **인프라 (Infrastructure)**: 
    - Docker 환경 구축 (Web, DB, Redis, Celery, Nginx).
    - 데이터베이스 마이그레이션 구성 완료 (`admin` vs `users` 의존성 문제 해결).
- **핵심 설정 (Core Configuration)**:
    - Django 설정, DRF 프레임워크, JWT 인증, Swagger API 문서화.
- **사용자 관리 (`users`)**:
    - 커스텀 유저 모델 (학생, 교수, 관리자). 역할 기반 권한 제어(RBAC) 구현.
- **출석 관리 (`attendance`)**:
    - **동적 지오펜싱 (Dynamic Geofencing)**: 
        - `Course` 모델에 위도, 경도, 허용 반경 필드 추가.
        - 하드코딩된 좌표를 제거하고 DB에서 동적으로 위치를 조회하도록 로직 변경.
        - **Redis 캐싱**: 출석 체크 시 DB 부하를 막기 위해 강의실 위치 정보를 1시간 동안 Redis에 캐싱 (O(1) 조회 속도).
    - **TOTP/QR 로직**: Redis와 PyOTP를 이용한 1회용 QR 코드 생성 및 검증.
- **성적 관리 (`grades`)**:
    - JSONB를 활용한 유연한 성적 세부 항목 저장.
    - **Pandas**를 이용한 벡터화된 성적 통계 분석 (평균, 표준편차 등).
- **강의 관리 (`courses`)**:
    - 강의 생성 및 소프트 삭제(Soft Deletion) 구현.

### 🚧 미완료 / TODO 리스트 (2단계 - Phase 2)
- **프론트엔드 (Frontend)** - *높은 우선순위*:
    - [ ] React + Vite + TypeScript 프로젝트 초기화.
    - [ ] 상태 관리 설정 (Zustand + React Query).
    - [ ] 대시보드(차트) 및 강의실 관리자(지도 API 연동) 구현.
- **테스트 (QA)**:
    - [ ] `tests/test_users.py`: 인증 및 권한 테스트.
    - [ ] `tests/test_grades.py`: 성적 경계값 분석 및 계산 로직 검증.
    - [ ] 부하 테스트: 100명 이상의 동시 접속 시뮬레이션.
- **데브옵스 (DevOps)**:
    - [ ] Gunicorn 튜닝 (워커 수 조정).
    - [ ] Nginx 최적화 (Client Body Size, Gzip 설정).
    - [ ] CI/CD 파이프라인 구축.

## 2. 일일 개발 저널 (Daily Journal)
**2025-12-17 (심야)**:  
- **기능 구현**: 동적 지오펜싱(Dynamic Geofencing) 로직을 완성했습니다. 기존의 하드코딩된 좌표 방식을 제거하고 DB 연동 방식으로 변경했습니다.
- **이슈 해결**: `ProgrammingError: relation "users_user" does not exist` 오류 해결.
    - *원인*: `users` 앱의 마이그레이션 파일이 없는데 `admin` 앱이 이를 참조하여 발생.
    - *해결*: `makemigrations users`를 수동으로 실행하고 가장 먼저 적용하여 의존성 순환 문제를 해결함.
- **최적화**: 출석 체크 트래픽 폭주에 대비하여, 강의실 위치 정보를 Redis에 캐싱하는 로직을 추가했습니다.
