# 001 서버·테스트 기반 구성

## 1. 목표

TypeScript·Express 기반의 최소 서버를 만들고 ESM·Vitest 개발 환경을 구성한다.

## 2. 체크포인트

- [x] TypeScript 프로젝트와 Express 의존성을 구성한다.
- [x] 앱 생성과 서버 시작을 담당하는 엔트리포인트를 구현한다.
- [x] health endpoint를 제공한다.
- [x] ESM과 Vitest를 사용할 수 있게 설정한다.

## 3. 테스트

- 서버 초기화, health endpoint, TypeScript 빌드

## 4. 세부사항

- Node·TypeScript·Express 설정과 서버 엔트리포인트
- 초기 health endpoint와 namespace 실험
- ESM 전환, Vitest 도입, 서버 구조 초기화
- 초기 health route 구조는 이후 System API 작업으로 대체된다.

## 관련 커밋

- `bb0e1a8`~`2cafdb5`
