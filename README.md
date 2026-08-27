# AI Door — Web MVP

> AI Door의 목표는 사용자가 AI에게 계속 의존하게 만드는 것이 아니라,
> 같은 유형의 문서를 다음에는 스스로 이해하고 처리할 수 있도록 돕는 것입니다.

고령자가 행정문서나 요금 용지를 촬영하면, 무엇부터 할지 **선택지 3개**를 주고 →
쉬운 말로 단계별로 함께 해결하고 → 그 경험을 **문서 유형별 매뉴얼**로 정리하고 →
개인정보 없는 **유사 합성문서로 복습**하며 → AI 도움을 점차 줄여가는 서비스입니다.

행사 주제: **An AI world where no one is left behind.**

### 두 개의 시연 트랙

두 시연은 서로 다른 사람의 서로 다른 상황입니다. 언어 전환은 번역일 뿐,
한 사람이 두 문서를 다루는 것이 아닙니다.

| | 트랙 1 | 트랙 2 |
|---|---|---|
| 사용자 | 한국 고령자 | 일본 고령자 |
| 문서 | 지방세 납세고지서 | 가스요금 払込票 → 결제앱 화면 |
| 진짜 어려운 것 | 납기 내/후 두 날짜와 두 금액, 전자납부번호와 계좌번호 혼동, 가산세 계산식 | 바코드 결제 개념, 앱 잔액과 통장 잔액의 차이, 「지금 내기」와 「예약」, 이중 납부 |

**설명하지 않는 것:** "8,181엔이 낼 금액입니다". 일본 고령자는 엔화를 압니다.
숫자를 읽어 주는 것은 도움이 아니라 무례입니다. 각 트랙은 **그 당사자가 실제로
막히는 지점**만 설명합니다.

---

## 1. 빠른 시작

```bash
npm install
npm run dev
```

http://localhost:3000 이 열립니다.

**API 키가 없어도 전체 흐름이 동작합니다.** 기본값이 `AI_PROVIDER=fixture` 이며,
사전 검증된 합성문서의 분석 결과를 사용합니다.

예시 문서를 일부러 고른 경우에는 배지를 띄우지 않습니다 — 대신 **문서 그림 자체에
"합성문서입니다"가 인쇄되어** 있고, 그 문구가 없으면 테스트가 실패합니다. 반대로
실제 제공자가 **실패해서** 예시로 내려앉은 경우에는 이유와 함께 경고가 뜹니다.

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드 결과 실행 |
| `npm run typecheck` | TypeScript 검사 |
| `npm test` | 핵심 로직 테스트 (73개) |

Node.js 18.18 이상이 필요합니다 (검증 환경: Node 24.19.0, npm 11.17.0).

---

## 2. 분석 모드 3가지

`/admin?key=<ADMIN_CODE>` 에서 전환합니다. 홈에는 링크가 없습니다 — 관리자
화면은 공개 URL에서 분리되어 있습니다 (§ 2.3).

| 모드 | 설명 | 인터넷 | 권장 용도 |
|---|---|---|---|
| **온라인 기본 모드** — OpenAI | Responses API + 이미지 입력 | 필요 | 실제 분석 시연, Q&A |
| **로컬 모드** — Qwen3-VL 4B | Ollama, 8GB VRAM에서 안정 | 불필요 | 오프라인 시연 |
| **예시 문서 모드** — Fixture | 네트워크 호출 없음 | 불필요 | 발표 비상 대비 |

Qwen3-VL 8B 옵션은 제거했습니다. 8GB 카드에서 라이브 시연 기본값이 될 수
없었고, 남겨 두면 발표 직전에 누를 수 있는 버튼만 하나 늘어납니다.

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

`/admin` 화면이 Ollama 연결 상태와 설치된 모델 목록을 보여줍니다.

> **8B를 라이브 시연 기본값으로 쓰지 마세요.** 8GB VRAM에서는 이미지와 긴 문맥을
> 함께 처리할 때 일부 연산이 시스템 RAM/CPU로 넘어가 응답이 크게 느려질 수 있습니다.
> 전원 연결 + 다른 GPU 프로그램 종료 + 사전 테스트를 마친 경우에만 사용하세요.

### 2.3 예시 문서 모드와 관리자 화면 분리

- **환경변수**: `AI_PROVIDER=fixture`
- **화면**: `/admin?key=<ADMIN_CODE>` → `예시 문서 모드`
- **자동 전환**: 키가 없거나 제공자를 쓸 수 없으면 서버가 자동으로 fixture를 사용합니다.
- **실패 후 전환**: 실제 분석이 실패하면 사용자에게 물어보고 **동의를 받은 뒤에만**
  예시 결과로 전환하며, 이때는 이유와 함께 경고를 띄웁니다.

정직성은 배지가 아니라 문서에 붙여 두었습니다. 예시 문서를 일부러 고른 경우엔
화면 배지가 없지만 **문서 그림 자체에 "합성문서입니다"가 인쇄**되어 있고, 그 문구가
빠지면 `tests/privacy.test.ts` 가 실패합니다. 스타일로 지울 수 없는 위치입니다.

#### 공개 URL로 배포할 때

`ADMIN_CODE` 를 설정하면 `/admin`, `GET /api/logs`, `/api/status` 가 막힙니다.
비워 두면 개발에서는 열리고 production 에서는 닫힙니다(fail shut).

```bash
ADMIN_CODE=아무_긴_문자열
ANALYZE_RATE_LIMIT_PER_MINUTE=10
```

접속은 `https://<도메인>/admin?key=<코드>` 이고, 한 번 들어가면 쿠키로 기억하므로
코드가 URL과 화면 녹화에 남지 않습니다.

두 가지를 분명히 해 둡니다. **`ADMIN_CODE` 는 인증이 아니라 가림막입니다** — 코드를
아는 사람은 전부 볼 수 있습니다. 그 뒤에 있는 데이터는 이벤트 로그뿐이고 스키마가
개인정보를 애초에 거부하므로, 막고 있는 것은 "지나가는 사람이 클릭 수를 내려받는 것"
이지 유출이 아닙니다. **속도 제한도 인스턴스별 메모리 기준**이라 반복 호출로 인한
비용 폭주를 막을 뿐, 분산 공격을 막지 못합니다.

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
| `/confirm` | 무엇부터 도와드릴까요 — **선택지 3개** (§ 3.3) |
| `/solve` | **1단계: 지금 같이 해결하기** (한 번에 하나씩) |
| `/solve/complete` | 완료 + 복습 예약 |
| `/result` | 전체 결과 (요약 → 날짜 → 금액 → 행동 3개 → 주의 → 연락처) |
| `/evidence` | **Evidence Lens** — 원문 인용 + 문서 위 위치 강조 |
| `/contact` | 공식 연락처 (문서에 적힌 것만) |
| `/tutorial` | **2단계: 나의 문서 매뉴얼** |
| `/practice` | **3–4단계: 혼자 해보기 + 고정 3단계 힌트** |
| `/practice/result` | 혼자 맞힌 것 / 힌트 쓴 것 / 다음에 기억할 내용 |
| `/history` | 지난 연습 기록 |
| `/admin` | 모드·모델·실험 조건·이벤트 로그 (`ADMIN_CODE` 필요) |

### 3.2 도움 감소 4단계

| 단계 | 동작 |
|---|---|
| `guided` (따라 하기) | 힌트 1(위치)이 처음부터 화면에 있음 |
| `hinted` (힌트 연습) | 사용자가 먼저 답하고, 막히면 힌트 요청 |
| `solo` (혼자 해보기) | AI는 질문만. 제출 후에만 정답 확인 |
| `final_check` (마지막 확인만) | 사용자가 먼저 해석, AI는 빠진 것만 확인 |

한 단계씩만 내려가며, **직접 힌트를 요청하지 않고 2/3 이상 정답**일 때만 내려갑니다.
힘들게 통과한 회차에서 도움을 줄이면 연습한 것을 벌주는 셈이 되기 때문입니다.

### 3.3 확인 화면의 선택지 3개

예전에는 `이 문서는 X로 보입니다. 맞나요?` 에 네/아니요를 물었습니다. 그건 순서가
거꾸로입니다. 분류가 맞는지 판단할 수 있는 사람이라면 이 앱이 필요 없고, 네/아니요는
다음에 할 일을 하나도 주지 않습니다.

지금은 무엇을 찾았는지 말한 뒤, **할 수 있는 일 세 가지**를 내놓습니다. 선택지는
분석 결과에서 만들어지므로 실제 API 결과에도 똑같이 적용됩니다.

| 문서 | 나오는 선택지 |
|---|---|
| 지방세 고지서 (납부수단 6개) | 납부 메뉴 찾기 · 어디에 적혀 있는지 보기 · 순서대로 같이 확인하기 |
| 가스요금 용지 (납부수단 6개) | 납부 메뉴 찾기 · 어디에 적혀 있는지 보기 · 순서대로 같이 확인하기 |
| 결제앱 화면 (납부수단 없음) | **버튼 위치 안내받기** · 얼마를 언제까지인지 보기 · **결제 순서 확인하기** |

문서 종류 정정은 아래쪽 조용한 링크로 남아 있습니다. 고르면 그 아래 값들은 방금
사용자가 부정한 전제로 뽑힌 것이므로 재확인 대상으로 표시됩니다.

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
  paymentOptions: PaymentOption[]; // 문서에 적힌 납부수단만, 최대 6개
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
| 납부수단은 문서에 적힌 것만 | 근거 없는 수단은 목록에서 제거하고 경고 |
| 경고 최대 4개 | 심각도순 정렬 후 절단 — 법원·저신뢰 경고가 잘려 나가지 않도록 |
| 법원 문서 | 법률 판단 금지 경고 + 사람 확인 필수 |
| 건강 문서 | 진단 금지 경고 |
| 세금·금액 문서 | "대신 납부하지 않습니다" 고지 |
| 근거 전무 | 신뢰도 0.3 이하로 강등 |
| 낮은 신뢰도 | `requiresHumanVerification = true` |

테스트: `tests/harden.test.ts`.

#### 출력 길이 상한

행동카드 한 장이 최대 1,400자까지 허용되어 있었습니다. 78세가 폰에서 읽을 양이
아닙니다. 지금은 `summary` 120자, `description` 100자, `method` 3개×70자,
`evidence` 10개, `uncertainty` 3개×80자입니다. 행동카드의 `doNotDo` 배열은
없앴습니다 — 금지사항이 해야 할 일과 같은 카드에서 경쟁하면 둘 다 안 읽힙니다.
금지는 `warnings` 로 갑니다.

#### 납부수단 폐쇄형 어휘

`paymentMethod` 는 자유 텍스트가 아니라 11개 중 하나입니다
(`bank_counter` `post_office` `convenience_store` `atm` `internet_banking`
`ars` `credit_card` `online_portal` `barcode_app` `account_transfer`
`help_desk`). **어느 수단이 나오는지는 문서에서** 오고, **각 수단의 설명은
사전에서** 옵니다 — 매번 검증할 필요가 없는 고정 문구이기 때문입니다.
한국 고지서 뒷면과 일본 払込票이 거의 같은 수단을 쓴다는 점이 두 트랙을 비교
가능하게 만드는 지점입니다.

---

## 6. 시연용 합성 문서

실제 개인정보가 포함된 문서는 사용하지 않습니다.
기관명은 `○○`/`△△`, 전화번호는 `0000` 패턴이라 걸리지 않으며, 계좌번호·주민등록번호가 없습니다.

| ID | 문서 | 특징 |
|---|---|---|
| `kr-local-tax` | 한국 지방세 납세고지서 | **트랙 1.** 실제 별지 제8호서식 구조. 납기 내/후 두 날짜 |
| `jp-gas-bill` | 일본 가스요금 払込票 | **트랙 2.** 바코드 있음. 결제앱 화면으로 이어짐 |
| `jp-payment-app` | 결제앱 화면 (`○○ペイ`) | 종이가 아닌 **폰 스크린샷**. 640×1300 캔버스 |
| `jp-health-checkup` | 일본 건강검진 안내문 | 숨김. 동작은 하며 테스트도 통과 |
| `kr-welfare` | 한국 복지 신청 안내문 | 숨김. 금액 미기재 문서 |

숨긴 두 개는 지우지 않았습니다. 남겨 두면 "이 파이프라인이 두 문서에 하드코딩된
것이 아니다"라는 주장이 계속 검증 가능한 상태로 남습니다.

연습용 합성문서(값이 다른 유사본): `practice-kr-tax-auto`(자동차세 52,300원 /
12-16) · `practice-jp-water`(수도요금 6,930엔 / 7-15) · 그 외 숨김 2종.

두 문서 모두 **일부러 빠뜨린 값**이 하나씩 있습니다. 한국 고지서는 납기 후 금액이
"뒷면 참조"이고 가산세 계산식의 비율 한 칸이 비어 있으며, 일본 용지는 연체이자가
붙는다고만 하고 금액이 없습니다. 계산해서 채우지 않고 `uncertainty` 로 보내는
동작이 여기서 보입니다.

문서 그림에 합성 표시가 인쇄되어 있고, 없으면 테스트가 실패합니다.
`○○ペイ` 는 실제 서비스가 아니라 직접 그린 화면이며, 바코드는 아무것도
인코딩하지 않는 고정 패턴입니다.

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

`/admin`에서 조건을 전환합니다. 조사계획서 §4.3 매핑을 따릅니다.

| 조건 | 제공 내용 |
|---|---|
| A | 원본 문서만 |
| B | 쉬운 요약 + 음성 |
| C | AI Door 전체 (단계별 해결·행동카드·근거·연락처·매뉴얼·복습) |

기록되는 비식별 이벤트: 익명 세션 ID, 조건, 문서 유형, 제공자·모델, 단계 완료,
행동카드 선택, 힌트 단계, 정답 여부, 소요 시간, 도움 수준 변화, 자신감·인지부하 응답.

문서 이미지·원문·개인정보는 **스키마상 저장할 수 없습니다** (`tests/privacy.test.ts`가 검증).

내려받기: `/admin` → JSON / CSV, 또는 `GET /api/logs?format=csv`.

### 핵심 지표

```
Independent Completion Rate = 힌트 없이 정답을 맞힌 단계 / 전체 단계
Hint Reduction              = 첫 연습 힌트 수 − 최근 연습 힌트 수
```

> 현재 수치는 **합성 연습 결과**입니다. 실제 사용자 데이터가 없으므로
> "AI 의존도를 감소시켰다"고 단정하지 말고 **"줄이는 것을 목표로 설계했다"**고 표현하세요.

---

## 9. 접근성

본문 20px · 행간 1.7 · 터치 영역 최소 56px · 검정 글자/로즈 화이트 대비 약 20.1:1 ·
색상만으로 상태 구분하지 않음(아이콘+글자 병기) · 뒤로가기 위치 고정 ·
음성 읽기 · `prefers-reduced-motion` 존중 · 확대 제한 없음(`maximum-scale=5`).

**헤더는 두 줄입니다.** 첫 줄은 지금 어디이고 어떻게 나가는지(뒤로 · 단계 · 로고),
둘째 줄은 어떻게 읽고 싶은지(글자 크기 · 언어)입니다. 한 줄에 있을 때는
`글자 크기 / 언어 / 뒤로 / 4단계 중 1단계` 가 되어 서로 관계없는 네 가지가 한 문장에
늘어서 있었습니다.

읽기 설정은 작지만 **모든 화면에** 있습니다. 화면을 읽지 못하는 사람은 그것을 고칠
설정 페이지까지 찾아갈 수 없기 때문입니다. 둘 다 버튼 하나로 순환합니다 — 글자 크기는
누를 때마다 커지다가 마지막에서 처음 크기로 돌아오고, 언어 버튼은 **바뀔 언어**를
보여줍니다. 결과 화면이 다른 언어로 되어 있으면 "이 언어로 다시 읽기"를 제안하며,
클라이언트에서 번역하지 않고 그 언어로 다시 분석합니다.

**한국어 조사도 자동으로 고릅니다.** 문서 종류 이름은 모델이 만들기 때문에 문장에
조사를 고정할 수 없습니다 — "고지서**로**"와 "안내문**으로**"가 갈립니다
(`src/lib/i18n/particle.ts`).

---

## 10. 문서

- [`docs/DEMO_GUIDE.md`](docs/DEMO_GUIDE.md) — 발표 시연 순서, 오류 대응 시나리오, 촬영 체크리스트
- [`docs/FEATURE_STATUS.md`](docs/FEATURE_STATUS.md) — 구현 / 연출 / 미구현 구분표
- [`docs/MODEL_COMPARISON.md`](docs/MODEL_COMPARISON.md) — 모델 비교 결과 기록 양식 (**아직 빈 양식**)
- [`docs/PROMPT_TUNING.md`](docs/PROMPT_TUNING.md) — 프롬프트 조정 기록
- [`docs/design/UIUX_REFERENCE_AND_PALETTE.md`](docs/design/UIUX_REFERENCE_AND_PALETTE.md) — Rose White 중심 UI 색 체계와 사용 규칙

---

## 11. 아직 안 된 것

- **실제 API 호출을 검증하지 못했습니다.** OpenAI 키와 Ollama가 이 환경에 없어
  두 경로 모두 코드는 완성했지만 실제 응답으로 확인하지 못했습니다. 특히
  `gpt-5.6-luna` / `gpt-5.6-terra` 가 계정에서 실제로 쓸 수 있는 모델인지
  확인이 필요합니다. 안 되면 `.env.local` 의 모델명만 바꾸면 됩니다.
- `docs/MODEL_COMPARISON.md` 는 빈 양식입니다. 채우기 전에 수치를 인용하지 마세요.
- 일본어 문안은 원어민 검수를 받지 않았습니다 (`src/lib/i18n/ja.ts`,
  `src/lib/fixtures/demo-ja.ts`).
- 효과는 측정되지 않았습니다. "AI 의존도를 **줄이는 것을 목표로 설계했다**"고
  말하고, "줄였다"고 말하지 마세요.
