# devbox-light-server

앱 개발과 로컬 테스트를 위한 경량 개발 서버입니다. 프로덕션 백엔드보다는 mock 서버에 가깝게 동작하며, 복잡한 인프라 없이 가볍고 이해하기 쉬운 코드를 지향합니다.

## 주요 기능

- DB 컬렉션 — 컬렉션 단위 레코드 CRUD (`/collections`)
- Auth — 토큰 기반 인증 (로그인/인증 확인/로그아웃) (`/auth`)
- 파일 저장소 — 원시 바이너리 파일 업로드/다운로드 (`/files`)
- 시스템 상태 — 상태/업타임 확인 (`/system`)
- 영속화 2모드 — JSON 파일 영속 또는 In-Memory

## 시작하기 (Docker)

[Docker](https://www.docker.com/)가 설치되어 있다면 빌드 후 바로 실행할 수 있습니다. 기본 포트는 3000이며 `PORT` 환경변수로 변경할 수 있습니다.

```bash
docker build -t devbox-light-server .
docker run -p 3000:3000 -v "$(pwd)/.data:/app/.data" devbox-light-server
```

- `.data`를 볼륨으로 마운트해 컨테이너 재시작에도 데이터가 유지됩니다.
- 메모리 모드로 실행하려면 env를 넘깁니다.

```bash
docker run -p 3000:3000 -e PERSISTENCE=memory devbox-light-server
```

컨테이너에는 `/system/status` 기반 healthcheck가 설정되어 있습니다. 다른 포트를 사용할 때는 호스트 포트와 `PORT`를 함께 변경합니다.

```bash
docker run -p 8080:8080 -e PORT=8080 devbox-light-server
```

### 로컬 개발 (Docker 없이)

```bash
npm install
npm run dev      # http://localhost:3000 에서 실행
```

테스트:

```bash
npm test         # Vitest
```

## 설정 및 데이터 영속화

### `PERSISTENCE` — 저장소 모드

`json`(기본) 또는 `memory`. 세 저장소(DB·Auth·파일)는 항상 **한 모드로 묶여** 선택되며, 인메모리와 JSON을 섞어 쓰는 일은 없습니다.

```bash
npm run dev                      # json: .data/ 에 영속 (기본)
PERSISTENCE=memory npm run dev   # memory: 재시작 시 데이터 소실
```

잘못된 값(`PERSISTENCE=foo`)을 넣으면 서버 시작 시 명확한 에러와 함께 종료됩니다.

Docker에서도 동일하게 `-e PERSISTENCE=memory`로 전달할 수 있습니다.

### `DB_DATA_DIR` — 데이터 디렉토리 (기본 `.data`)

json 모드에서 데이터가 저장되는 루트 디렉토리입니다. Docker에서는 이 디렉토리를 볼륨으로 마운트합니다.

```
.data/
├── users.json            # 컬렉션당 하나: { "nextId": N, "records": { "1": { ... }, "2": { ... } } }
├── auth/
│   └── tokens.json       # { "<token>": "<userId>" }
└── files/                # 파일 저장소: <key> 경로 그대로 저장
    └── notes/hello.txt
```

- 컬렉션 파일에 `nextId`가 저장되어 재시작 후에도 ID가 재사용되지 않습니다.
- 파일 쓰기는 임시 파일 작성 후 `rename`하는 원자적 방식으로, 쓰기 중 서버가 죽어도 파일이 손상되지 않습니다.

### `PORT` — 서버 포트 (기본 `3000`)

서버가 수신할 포트입니다. Docker에서는 `-e PORT=8080 -p 8080:8080`처럼 설정합니다.

## API 레퍼런스

모든 엔드포인트(메서드·경로·응답·오류 형식과 curl 예제)는 HTML 문서로 제공됩니다.

### [📄 API 문서 보기 → docs/api.html](docs/api.html)

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/system/status` | 상태 확인 |
| GET | `/system/uptime` | 업타임 확인 |
| GET | `/collections/:collection` | 컬렉션 전체 목록 |
| GET | `/collections/:collection/:id` | 단건 조회 |
| POST | `/collections/:collection` | 레코드 생성 |
| PUT | `/collections/:collection/:id` | 전체 교체 |
| DELETE | `/collections/:collection/:id` | 삭제 |
| POST | `/auth/login` | 로그인 |
| GET | `/auth/me` | 인증된 사용자 확인 |
| POST | `/auth/logout` | 로그아웃 |
| GET | `/files/:key` | 파일 다운로드 |
| PUT | `/files/:key` | 파일 업로드 (최대 50MB) |
| DELETE | `/files/:key` | 파일 삭제 |

모든 응답은 JSON이며, 오류는 `{ "error": "..." }` 형식입니다. 상세 응답·오류 코드·curl 예제는 [docs/api.html](docs/api.html)을 참고하세요.

## 알려진 제한 사항

- **CORS 미지원** — 브라우저에서 다른 포트/도메인의 프론트가 직접 호출하면 차단됩니다
- **로그인은 userId만** — 비밀번호 등 자격 증명이 없고, 토큰에 만료가 없어 `tokens.json`이 계속 쌓입니다
- **JSON 바디 100KB 제한** — `express.json()` 기본값. 큰 레코드는 413 오류
- **파일 응답 고정 `application/octet-stream`** — 확장자별 MIME, Range(부분 요청), ETag 미지원
- **포트 3000 고정** — `src/index.ts`에 하드코딩 (`PORT` env 없음)
- **단일 프로세스 가정** — 같은 디렉토리를 여러 프로세스가 쓰면 마지막 쓰기 기준
- **손상된 파일 발견 시** — 조용히 초기화하지 않고 명시적 에러로 실패

## 개발자 문서

### 디렉토리 구조

```
src/
├── index.ts          # 서버 진입점 (포트 3000)
├── app.ts            # DI 구성 및 라우트 연결
├── runtime.ts        # PERSISTENCE 모드에 따라 스토어 선택
├── system/           # 시스템 상태
├── db/               # 레코드 저장소
├── auth/             # 토큰 저장소·인증 서비스
├── storage/          # 파일 저장소
└── util/             # 공용 JSON 파일 읽기/쓰기 (원자적 쓰기)
```

### 계층 구조

```
Route → Service → Interface → Implementation
```

- Express 관련 코드는 라우트에만 존재
- 비즈니스 로직은 서비스에 존재
- 저장소/DB 구현체는 인터페이스를 통해 교체 가능
- 전역 상태 없이 `app.ts`(와 `runtime.ts`)에서 의존성 주입

### 인터페이스와 구현체

| 인터페이스 | In-Memory 구현 | JSON/로컬 파일 구현 |
|---|---|---|
| `RecordStore` | `InMemoryRecordStore` | `JsonFileRecordStore` |
| `TokenStore` | `InMemoryTokenStore` | `JsonFileTokenStore` |
| `FileStorage` | `InMemoryFileStorage` | `LocalFileStorage` |

`PERSISTENCE=memory` → 위 표 왼쪽 열, `PERSISTENCE=json` → 오른쪽 열이 함께 선택됩니다.

### 영속 구현 동작

- **지연 로드** — 첫 접근 시 컬렉션/파일을 읽어 캐시에 적재
- **write-through** — 변경 시 즉시 디스크에 반영
- **원자적 쓰기** — `<file>.tmp`에 쓴 뒤 `rename`
- **ID 보존** — 컬렉션별 `nextId`를 파일에 저장해 재시작 후에도 유지
- **경로 안전** — 컬렉션명 검증, 파일 키의 경로 탈출 차단

### 프로젝트 가이드

- `AGENTS.md` — 프로젝트 개요·기술·목표
- `.agents/rules/` — 아키텍처·테스트 규칙
- `.agents/skills/` — 작업별 지식
- `.agents/workflows/` — 작업 절차
- `src/<module>/AGENTS.md` — 모듈별 지침
