# AI Door — Web MVP

> AI Door의 목표는 사용자가 AI에게 계속 의존하게 만드는 것이 아니라,
> 같은 유형의 문서를 다음에는 스스로 이해하고 처리할 수 있도록 돕는 것입니다.

한국·일본 고령자가 세금·건강검진·복지 등 행정문서를 촬영하면,
문서 종류를 확인하고 → 쉬운 말로 단계별로 함께 해결하고 →
그 경험을 **문서 유형별 매뉴얼**로 정리하고 →
개인정보 없는 **유사 합성문서로 복습**하며 → AI 도움을 점차 줄여가는 포용적 AI 서비스입니다.

행사 주제: **An AI world where no one is left behind.**

---

## 1. 빠른 시작

```bash
npm install
npm run dev
```

http://localhost:3000 이 열립니다.

**API 키가 없어도 전체 흐름이 동작합니다.** 기본값이 `AI_PROVIDER=fixture`(안전 시연 모드)이며,
사전 검증된 합성문서 3종의 분석 결과를 사용합니다. 화면에는 항상 `데모 모드` 배지가 표시됩니다.

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드 결과 실행 |
| `npm run typecheck` | TypeScript 검사 |
| `npm test` | 핵심 로직 테스트 (67개) |

Node.js 18.18 이상이 필요합니다 (검증 환경: Node 24.19.0, npm 11.17.0).

---

## 2. 분석 모드 4가지

`/lab` 화면(홈 → 설정과 모델)에서 전환합니다.

| 모드 | 설명 | 인터넷 | 권장 용도 |
|---|---|---|---|
| **온라인 기본 모드** — OpenAI | Responses API + 이미지 입력 | 필요 | 실제 분석 시연, Q&A |
| **빠른 로컬 모드** — Qwen3-VL 4B | Ollama, 8GB VRAM에서 안정 | 불필요 | 오프라인 시연 |
| **고품질 로컬 모드** — Qwen3-VL 8B | 느릴 수 있음, **기본값 아님** | 불필요 | 사전 테스트용 |
| **안전 시연 모드** — Fixture | 네트워크 호출 없음 | 불필요 | 발표 비상 대비 |

### 2.1 OpenAI API 키 설정

1. https://platform.openai.com/ 에 로그인합니다.
2. https://platform.openai.com/api-keys 에서 새 Secret Key를 생성합니다.
3. 프로젝트 폴더에 `.env.local` 파일을 만듭니다 (`.env.example`를 복사).
4. 다음 값을 입력합니다.

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=발급받은_키
OPENAI_MODEL=gpt-5.6-luna
OPENAI_FALLBACK_MODEL=gpt-5.6-terra
```

5. API 키는 다른 사람에게 전송하지 않습니다.
6. GitHub에 커밋하지 않습니다 (`.gitignore`에 `.env*` 포함됨).
7. 키가 노출되면 즉시 폐기하고 새 키를 발급합니다.
8. OpenAI Platform에서 사용 한도와 결제 설정을 확인합니다.

> 모델 ID는 `.env.local`에서만 바뀝니다. 코드 어디에도 하드코딩되어 있지 않습니다.
> 지정된 `gpt-5.6-luna` / `gpt-5.6-terra`가 계정에서 사용 불가하면 환경변수만 교체하세요.
> Responses API를 쓰므로 `openai` SDK는 4.87 이상이 필요합니다 (현재 `^4.104.0`).

### 2.2 Ollama 로컬 모드 설정

```bash
# 1. Ollama 설치: https://ollama.com
# 2. 기본 모델 받기 (RTX 5060 8GB 권장)
ollama pull qwen3-vl:4b

# 3. 선택적 고품질 모델 (기본값으로 쓰지 마세요)
ollama pull qwen3-vl:8b

# 4. 서버 실행
ollama serve
```

`.env.local`:

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3-vl:4b
OLLAMA_NUM_CTX=8192
OLLAMA_KEEP_ALIVE=30m
```

`/lab` 화면이 Ollama 연결 상태와 설치된 모델 목록을 보여줍니다.

> **8B를 라이브 시연 기본값으로 쓰지 마세요.** 8GB VRAM에서는 이미지와 긴 문맥을
> 함께 처리할 때 일부 연산이 시스템 RAM/CPU로 넘어가 응답이 크게 느려질 수 있습니다.
> 전원 연결 + 다른 GPU 프로그램 종료 + 사전 테스트를 마친 경우에만 사용하세요.

### 2.3 Demo Mode 전환

- **환경변수**: `AI_PROVIDER=fixture`
- **화면**: `/lab` → `안전 시연 모드 — Fixture Demo`
- **자동 전환**: 키가 없거나 제공자를 쓸 수 없으면 서버가 자동으로 fixture를 사용하고,
  화면에 `데모 모드로 전환됨` 배지와 **이유**를 표시합니다.
- **실패 후 전환**: 실제 분석이 실패하면 사용자에게
  `지금은 온라인 분석이 원활하지 않습니다. 안전한 예시 문서로 계속 체험하시겠어요?`를 묻고,
  **동의를 받은 뒤에만** fixture 결과로 전환합니다.

> Demo Mode 결과를 실제 AI 분석처럼 숨기지 않습니다. 항상 배지 + 문장으로 알립니다.

---

## 3. 핵심 흐름 — 해결에서 독립까지

```
처음 받은 실제 문서
→ AI와 단계별로 함께 해결        (/solve, 6단계)
→ 해결 과정에서 핵심 규칙 학습
→ 문서 유형별 매뉴얼 생성        (/tutorial)
→ 개인정보 없는 유사문서로 복습  (/practice)
→ 고정 3단계 힌트 (위치 → 단어 → 정답)
→ AI 도움 점진적 감소            (guided → hinted → solo → final_check)
→ 다음에는 사용자가 먼저 해결
```

### 3.1 화면

| 경로 | 화면 |
|---|---|
| `/` | 홈 — 지금 같이 해결하기 / 혼자 해보기 / 나의 문서 매뉴얼 / 지난 연습 보기 |
| `/capture` | 촬영·업로드·예시 문서 선택 |
| `/consent` | 개인정보 안내와 동의 (동의 안 해도 예시 문서 체험 가능) |
| `/analyzing` | 분석 중 (쉬운 진행 문구, 취소, 예시 결과 보기) |
| `/confirm` | 문서 종류 확인 — 네 / 아니에요 / 잘 모르겠어요 |
| `/solve` | **1단계: 지금 같이 해결하기** (한 번에 하나씩) |
| `/solve/complete` | 완료 + 복습 예약 |
| `/result` | 전체 결과 (요약 → 날짜 → 금액 → 행동 3개 → 주의 → 연락처) |
| `/evidence` | **Evidence Lens** — 원문 인용 + 문서 위 위치 강조 |
| `/contact` | 공식 연락처 (문서에 적힌 것만) |
| `/tutorial` | **2단계: 나의 문서 매뉴얼** |
| `/practice` | **3–4단계: 혼자 해보기 + 고정 3단계 힌트** |
| `/practice/result` | 혼자 맞힌 것 / 힌트 쓴 것 / 다음에 기억할 내용 |
| `/history` | 지난 연습 기록 |
| `/lab` | 모드·모델·실험 조건·이벤트 로그·글자 크기 |

### 3.2 도움 감소 4단계

| 단계 | 동작 |
|---|---|
| `guided` (따라 하기) | 힌트 1(위치)이 처음부터 화면에 있음 |
| `hinted` (힌트 연습) | 사용자가 먼저 답하고, 막히면 힌트 요청 |
| `solo` (혼자 해보기) | AI는 질문만. 제출 후에만 정답 확인 |
| `final_check` (마지막 확인만) | 사용자가 먼저 해석, AI는 빠진 것만 확인 |

한 단계씩만 내려가며, **직접 힌트를 요청하지 않고 2/3 이상 정답**일 때만 내려갑니다.
힘들게 통과한 회차에서 도움을 줄이면 연습한 것을 벌주는 셈이 되기 때문입니다.

---

## 4. 아키텍처

```
브라우저                     서버 (Next.js Route Handler)         외부
────────                     ──────────────────────────           ────
사진 선택
  ↓ prepareImage()
  · 긴 변 1600px 축소
  · EXIF/GPS 제거
  · 회전 보정
  ↓ base64
POST /api/analyze  ────────► resolveRequestedProvider()
                             ↓
                             DocumentAnalysisProvider
                             ├ OpenAIProvider  ──────────────────► Responses API
                             ├ OllamaProvider  ──────────────────► 127.0.0.1:11434
                             └ FixtureProvider (네트워크 없음)
                             ↓ ModelAnalysisSchema (zod)
                             ↓ needsSecondOpinion()  → 필요시 1회 재분석
                             ↓ hardenAnalysis()      ← 안전 규칙
◄──────────────────────────  AnalysisOutcome
  ↓
화면 렌더 (근거 없는 값은 확정 표시 안 함)
  ↓
POST /api/logs  ───────────► StrictEventSchema → .data/events.ndjson
                             (문서 내용은 스키마상 저장 불가)
```

### 4.1 Provider 추상화

```ts
interface DocumentAnalysisProvider {
  readonly id: 'openai' | 'ollama' | 'fixture';
  readonly model: string | null;
  analyzeDocument(input: DocumentInput): Promise<ProviderResult>;
}
```

세 구현이 모두 동일한 `DocumentAnalysis` JSON을 반환합니다.
공급자 추가 = `src/lib/providers/`에 파일 하나 + `createProvider()`에 case 하나.
확장 예정: `PaddleOCRProvider`, `HybridProvider`(OCR 텍스트 + LLM 구조화).

### 4.2 재분석 체인

```
OpenAI:  gpt-5.6-luna → 검증 → (불안전할 때만) gpt-5.6-terra → 사용자에게 Fixture 제안
Ollama:  qwen3-vl:4b  → 검증 → 같은 모델로 1회 재시도       → 사용자에게 Fixture 제안
Fixture: 사전 검증된 합성문서 결과
```

재분석 트리거(`needsSecondOpinion`): 문서 종류 판별 실패 · 낮은 신뢰도 ·
날짜/금액 충돌 · 근거 없는 행동카드 · 근거 전무.

### 4.3 폴더 구조

```
src/
├─ app/                     15개 화면 + api/{analyze,logs,status}
├─ components/              AppShell · EvidenceViewer · DocumentPageView · SpeakButton …
├─ lib/
│  ├─ analysis/  schema.ts (DocumentAnalysis) · harden.ts (안전 규칙)
│  ├─ providers/ types · openai · ollama · fixture · prompt(+few-shot) · config
│  ├─ fixtures/  documents(합성문서 3종) · practice(연습본) · tutorials(매뉴얼)
│  ├─ learning/  types · guided(6단계) · progress(localStorage)
│  ├─ experiment/ events(비식별 스키마) · store · conditions(A/B/C)
│  ├─ i18n/      ko · ja
│  ├─ privacy/   mask
│  └─ util/      image · date · ics
└─ tests/        harden · learning · privacy · flow (67 tests)
```

---

## 5. 구조화 출력 스키마

모든 Provider가 반환하는 공통 형식입니다 (`src/lib/analysis/schema.ts`).

```ts
type DocumentAnalysis = {
  language: 'ko' | 'ja' | 'unknown';
  country: 'KR' | 'JP' | 'unknown';
  documentType: string;          // tax_notice | health_checkup | welfare_application | …
  documentTypeLabel: string;
  issuer: string | null;
  title: string;
  summary: string;               // 한 문장
  importantDates: ImportantDate[];
  amounts: AmountItem[];
  recipientActions: ActionCard[]; // 최대 3개
  warnings: WarningItem[];
  officialContacts: ContactItem[];
  evidence: EvidenceItem[];
  uncertainty: string[];
  confidence: number;            // 0–1
  requiresHumanVerification: boolean;
};
```

### 5.1 서버가 강제하는 안전 규칙 (`hardenAnalysis`)

프롬프트는 부탁이고 이 코드는 보장입니다. Fixture를 포함한 **모든** 결과에 적용됩니다.

| 규칙 | 동작 |
|---|---|
| 근거 없으면 확정 없음 | `evidenceIds`가 빈 날짜·금액은 값을 `null`로 만들고 경고 |
| 존재하지 않는 근거 ID | 링크를 제거하고 미확인 처리 |
| 연락처는 추측 금지 | 문서 근거가 없으면 전화번호·URL 삭제, 기관명만 유지 |
| 위험한 URL | `http(s)` 외 프로토콜 제거 |
| 행동카드 최대 3개 | 초과분 절단 |
| 법원 문서 | 법률 판단 금지 경고 + 사람 확인 필수 |
| 건강 문서 | 진단 금지 경고 |
| 세금·금액 문서 | "대신 납부하지 않습니다" 고지 |
| 근거 전무 | 신뢰도 0.3 이하로 강등 |
| 낮은 신뢰도 | `requiresHumanVerification = true` |

테스트: `tests/harden.test.ts` (16개).

---

## 6. 시연용 합성 문서

실제 개인정보가 포함된 문서는 사용하지 않습니다.
기관명은 `○○`/`△△`, 전화번호는 `0000` 패턴이라 걸리지 않으며, 계좌번호·주민등록번호가 없습니다.

| ID | 문서 | 특징 |
|---|---|---|
| `kr-local-tax` | 한국 지방세 납부 안내문 | **메인 데모.** 86,400원 / 2026-09-30 |
| `jp-health-checkup` | 일본 건강검진 안내문 | 일본어 원문 + 쉬운 한국어 설명, 예약기한·검진일·금식 |
| `kr-welfare` | 한국 복지 신청 안내문 | **금액이 적혀 있지 않음** — 추측하지 않는 동작 시연 |

연습용 합성문서(날짜·금액이 다른 유사본):
`practice-kr-tax-auto`(자동차세 52,300원 / 12-16) · `practice-jp-health` · `practice-kr-welfare`.

모든 화면에 `합성문서` / `연습용 합성문서` 표시가 있습니다.

---

## 7. 보안과 개인정보

| 항목 | 구현 |
|---|---|
| API 키 | 서버 전용. `NEXT_PUBLIC_` 접두사 키 없음 |
| OpenAI 요청 | `store: false` |
| 이미지 저장 | 하지 않음. 요청 동안 메모리에만 존재 |
| 서버 로그 | base64·OCR 원문 출력 없음. 오류는 상태코드/필드 경로만 |
| EXIF·GPS | 브라우저에서 재인코딩하며 제거 |
| 파일 제한 | 형식(JPEG/PNG/WEBP) + 크기(6MB) + 긴 변 1600px |
| 이벤트 로그 | `.strict()` 스키마 — 자유 텍스트 필드 자체가 없음 |
| 결제·제출 | **없음.** 자동 송금·자동 신청 기능 미구현 |
| 법률·의료 판단 | **없음.** 전문기관 연결로 종료 |
| 기관 사칭 | 문서에 없는 연락처는 생성하지 않음 |

> **온디바이스 개인정보 마스킹은 구현되어 있지 않습니다.** 동의 화면에서 그렇게 명시합니다.
> `src/lib/privacy/mask.ts`는 **복습 화면 텍스트**에만 적용되는 패턴 마스킹입니다.

---

## 8. A/B/C 실험 로그

`/lab`에서 조건을 전환합니다. 조사계획서 §4.3 매핑을 따릅니다.

| 조건 | 제공 내용 |
|---|---|
| A | 원본 문서만 |
| B | 쉬운 요약 + 음성 |
| C | AI Door 전체 (단계별 해결·행동카드·근거·연락처·매뉴얼·복습) |

기록되는 비식별 이벤트: 익명 세션 ID, 조건, 문서 유형, 제공자·모델, 단계 완료,
행동카드 선택, 힌트 단계, 정답 여부, 소요 시간, 도움 수준 변화, 자신감·인지부하 응답.

문서 이미지·원문·개인정보는 **스키마상 저장할 수 없습니다** (`tests/privacy.test.ts`가 검증).

내려받기: `/lab` → JSON / CSV, 또는 `GET /api/logs?format=csv`.

### 핵심 지표

```
Independent Completion Rate = 힌트 없이 정답을 맞힌 단계 / 전체 단계
Hint Reduction              = 첫 연습 힌트 수 − 최근 연습 힌트 수
```

> 현재 수치는 **합성 연습 결과**입니다. 실제 사용자 데이터가 없으므로
> "AI 의존도를 감소시켰다"고 단정하지 말고 **"줄이는 것을 목표로 설계했다"**고 표현하세요.

---

## 9. 접근성

본문 20px · 행간 1.7 · 터치 영역 최소 56px · 본문 대비 14.9:1 ·
색상만으로 상태 구분하지 않음(아이콘+글자 병기) · 뒤로가기 위치 고정 ·
한국어·일본어 전환 · 글자 크기 3단계 · 음성 읽기 · `prefers-reduced-motion` 존중 ·
확대 제한 없음(`maximum-scale=5`).

---

## 10. 문서

- [`docs/DEMO_GUIDE.md`](docs/DEMO_GUIDE.md) — 발표 시연 순서, 오류 대응 시나리오, 촬영 체크리스트
- [`docs/FEATURE_STATUS.md`](docs/FEATURE_STATUS.md) — 구현 / 연출 / 미구현 구분표
- [`docs/MODEL_COMPARISON.md`](docs/MODEL_COMPARISON.md) — 모델 비교 결과 기록 양식
- [`docs/HANDOFF.md`](docs/HANDOFF.md) — 다음 작업자 인수인계
