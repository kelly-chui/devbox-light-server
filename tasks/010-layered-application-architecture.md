# 010 계층형 애플리케이션 구조 재편

## 1. 목표

System 런타임 상태, HTTP route, application 유스케이스, domain 계약, data 구현을 명확한 계층으로 분리한다.

## 2. 체크포인트

- [x] System 런타임 상태 접근을 서비스로 분리한다.
- [x] Express route와 middleware를 `api/`로 이동한다.
- [x] 유스케이스를 `application/`으로 이동한다.
- [x] 계약·타입·도메인 오류를 `domain/`으로 이동한다.
- [x] 저장소 구현을 `data/`로 이동한다.
- [x] 계층별 오류를 HTTP 응답으로 변환한다.
- [x] 유스케이스를 작업 단위 파일과 테스트로 분리한다.

## 3. 테스트

- application 유스케이스, data 저장소 구현, API route의 계층 연결

## 4. 세부사항

- System 런타임 상태 서비스
- `api`·`application`·`domain`·`data` 경계 재편
- 계층별 오류 변환
- 동작별 유스케이스와 단위 테스트 분리

## 관련 커밋

- `b0e1d83`, `2c34533`, `9c555ac`, `5233e9f`
