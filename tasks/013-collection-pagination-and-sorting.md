# 013 컬렉션 페이지네이션, 정렬

## 1. 목표

컬렉션 목록 API에서 필터 결과를 정렬하고 일부 구간만 조회할 수 있게 한다. 인메모리와 JSON 레코드 저장소는 같은 조회 결과를 제공해야 한다.

## 2. 체크포인트

- [x] 목록 조회 옵션에 단일 필드 정렬과 `offset`·`limit` 페이지네이션 계약을 정의한다.
- [x] 목록 조회 결과에 필터 적용 후 전체 레코드 수(`total`)를 포함한다.
- [x] 인메모리 레코드 저장소에 필터·정렬·페이지네이션을 구현한다.
- [x] JSON 레코드 저장소에 같은 동작을 구현한다.
- [x] HTTP query parameter를 조회 옵션으로 변환하고 잘못된 값은 `400`으로 응답한다.
- [x] 컬렉션 목록 API 문서와 HTTP 계약을 갱신한다.
- [x] 두 저장소의 동작 일관성과 공개 HTTP 동작을 테스트한다.

## 3. 테스트

- `npx vitest run tests/unit/data/db/inMemoryRecordStore.test.ts tests/unit/data/db/jsonFileRecordStore.test.ts tests/unit/application/database/listRecordsUseCase.test.ts` — 36개 통과
- `npx vitest run tests/integration/httpContract.test.ts` — 11개 통과
- `npm test -- --run` — 22개 파일, 101개 테스트 통과
- `npm run build` — 통과

## 4. 세부사항

- 조회 순서는 필터 → 정렬 → `total` 산정 → `offset`·`limit` 적용으로 고정한다.
- HTTP는 `sort=<field>:asc|desc`, `offset=<0 이상의 정수>`, `limit=<1 이상의 정수>`를 지원한다.
- 다중 정렬과 cursor 기반 페이지네이션은 이번 범위에서 제외한다.
- 정렬 값이 같은 레코드는 `id` 오름차순으로 정렬해 페이지 결과를 안정적으로 만든다.
