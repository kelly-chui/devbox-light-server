# 009 HTTP API 보완

## 1. 목표

HTTP 오류 형식을 일관되게 만들고, CORS와 multipart 파일 업로드를 지원한다.

## 2. 체크포인트

- [x] 처리되지 않은 오류를 공통 JSON 형식으로 응답한다.
- [x] 설정으로 CORS 허용 출처를 제어한다.
- [x] multipart 요청으로 파일을 업로드한다.
- [x] 오류·CORS·업로드 시나리오를 계약 테스트로 검증한다.
- [x] 새 HTTP 동작을 API 문서에 반영한다.

## 3. 테스트

- JSON 오류 응답, CORS 설정, multipart 파일 업로드

## 4. 세부사항

- JSON 오류 middleware
- 설정 가능한 CORS
- multipart 업로드와 계약 테스트·문서 갱신

## 관련 커밋

- `7b131d4`, `544125a`, `c8d12b6`
