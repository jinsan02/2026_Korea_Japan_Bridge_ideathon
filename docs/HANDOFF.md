# Codex 인수인계

아래 `프롬프트` 블록 전체를 Codex에 첫 메시지로 붙여 넣으세요.

---

## 프롬프트

```text
당신은 이 프로젝트를 이어받는 풀스택 엔지니어입니다. 처음부터 만들지 말고,
이미 동작하는 코드를 읽고 이어서 작업하세요.

## 0. 위치

작업 폴더 (여기서만 작업):
이 Git 저장소의 루트

참조 자료 (전체 아이디어톤 자료 묶음이 함께 제공된 경우에만 읽기 전용으로 참고):
../00_START_HERE/
../01_CORE_PLAN/
../02_SCENARIO_DEMO/
../03_DATA_RESEARCH/
../06_PRIOR_ART/09_ai_door_kr_jp_similarity_services_patents_KO.md

먼저 다음 순서로 읽으세요.
1. AI_Door_Web_MVP/README.md
2. AI_Door_Web_MVP/docs/FEATURE_STATUS.md   (구현 / 연출 / 미구현 구분)
3. AI_Door_Web_MVP/docs/DEMO_GUIDE.md
4. 00_START_HERE/WEB_MVP_FIRST_PROMPT.md
5. 06_PRIOR_ART/09_...patents_KO.md          (차별화 근거와 특허 주의점)

## 1. 프로젝트가 무엇인가

한·일 고령자가 세금·건강검진·복지 행정문서를 촬영하면
문서 종류 확인 → 단계별로 함께 해결 → 문서 유형별 매뉴얼 생성 →
개인정보 없는 유사 합성문서로 복습 → 고정 3단계 힌트 → AI 도움 점진 감소
로 이어지는 포용적 AI 웹 MVP입니다.

핵심 목표 문장 (README와 발표에 명시되어 있음):
"AI Door의 목표는 사용자가 AI에게 계속 의존하게 만드는 것이 아니라,
같은 유형의 문서를 다음에는 스스로 이해하고 처리할 수 있도록 돕는 것이다."

이것은 OCR 요약기가 아닙니다. 06_PRIOR_ART 조사에 따르면
일본 카미쿠다(쉬운 일본어 변환), YOMITORI DocuTask(기한·할 일 추출),
한국 국민비서(맞춤 알림)가 각 단계를 이미 개별 제공합니다.
차별점은 "이해 → 행동 → 근거 검증 → 자립"을 하나로 잇는 것뿐입니다.
따라서 학습 루프(단계별 해결 / 매뉴얼 / 복습 / 힌트 감소)가 최우선이고,
이 부분을 축소하거나 부가기능으로 취급하지 마세요.

## 2. 현재 상태 (검증 완료)

Node 24.19.0 / npm 11.17.0 환경에서 다음이 모두 통과했습니다.

  npm install      OK (115 packages)
  npx tsc --noEmit OK (오류 0)
  npm test         OK (67 tests, 4 files)
  npm run build    OK (18 routes)
  npm run dev      OK — 브라우저에서 전체 흐름 수동 확인 완료

수동 확인한 것:
- 홈 → 분석 → 확인 → 단계별 해결 6단계 → 완료 화면
- Evidence Lens 하이라이트가 납부기한 행 좌표(y=478)에 정확히 정렬됨
- 복습 3문제 정답 → /practice/result → localStorage에 기록 저장
- 연습 문서가 실제 문서와 다른 값(52,300원 / 12-16 vs 86,400원 / 9-30)
- 개인정보 자리가 ●●● 로 마스킹됨

## 3. 절대 깨뜨리면 안 되는 규칙

이것들은 취향이 아니라 제품의 안전 요구사항입니다. 테스트가 지키고 있습니다.

3.1 근거 없으면 확정 없음
    src/lib/analysis/harden.ts 가 모든 결과(Fixture 포함)에 적용됩니다.
    evidenceIds 가 빈 날짜/금액은 값이 null 로 바뀌고 경고가 붙습니다.
    프롬프트로 부탁하지 말고 이 코드에서 강제하세요.

3.2 연락처는 추측 금지
    문서 근거가 없으면 전화번호·URL을 삭제하고 기관명만 남깁니다.
    가짜 "공식" 번호는 피싱 벡터입니다.

3.3 행동카드 최대 3개

3.4 자동 납부·자동 제출·법률 판단·의료 진단 기능을 추가하지 마세요.

3.5 데모 모드를 숨기지 마세요
    Fixture 결과에는 항상 배지 + 이유 문장이 표시됩니다.
    실제 분석이 실패했을 때는 사용자 동의를 받은 뒤에만 Fixture로 전환합니다
    (src/app/api/analyze/route.ts 의 acceptFixtureFallback).

3.6 이벤트 로그에 자유 텍스트 필드를 추가하지 마세요
    src/lib/experiment/events.ts 의 EventPayloadSchema 는 .strict() 이고
    text/note/content/query 같은 필드가 없습니다.
    tests/privacy.test.ts 가 이 필드들이 거부되는지 검사합니다.

3.7 힌트는 고정 3단계 (위치 → 단어 → 정답)
    개인화 학습 모델이나 힌트 노출 시점 예측을 넣지 마세요.
    일본 SoftBank JP2025045451A(생성AI가 답 대신 힌트만 주고 학습 진행에 맞춰 조절)와
    직접 경쟁하게 됩니다. 06_PRIOR_ART 참고.

3.8 사용자를 점수화하지 마세요
    인지능력 평가, 등급, 퍼센트 배지 금지.
    /history 화면에 "이 화면은 점수나 등급이 아닙니다" 문구가 있습니다.

3.9 매뉴얼(DocumentTutorial)에 특정 문서의 값을 넣지 마세요
    매뉴얼은 방법이지 기록이 아닙니다.
    tests/learning.test.ts 가 86,400 같은 값이 매뉴얼에 없는지 검사합니다.

3.10 API 키는 서버 전용
     NEXT_PUBLIC_ 접두사가 붙은 키 환경변수를 만들지 마세요.
     서버 로그에 base64 이미지나 OCR 원문을 출력하지 마세요.

## 4. 아키텍처 요약

Provider 추상화 (src/lib/providers/):
  interface DocumentAnalysisProvider {
    id: 'openai' | 'ollama' | 'fixture';
    model: string | null;
    analyzeDocument(input: DocumentInput): Promise<ProviderResult>;
  }
  OpenAIProvider  — Responses API, store:false, JSON Schema
  OllamaProvider  — qwen3-vl:4b, num_ctx 8192, temperature 0.1, 이미지 1개
  FixtureProvider — 네트워크 없음

재분석 체인 (src/lib/providers/index.ts):
  openai:  luna → 검증 → (불안전할 때만) terra → 사용자에게 Fixture 제안
  ollama:  4b   → 검증 → 같은 모델 1회 재시도  → 사용자에게 Fixture 제안
  재분석 트리거는 needsSecondOpinion(): 문서종류 불명 / 낮은 신뢰도 /
  날짜·금액 충돌 / 근거 없는 행동카드 / 근거 전무

공통 스키마 (src/lib/analysis/schema.ts): DocumentAnalysis
학습 루프 (src/lib/learning/): types · guided(6단계) · progress(localStorage)
합성문서 (src/lib/fixtures/): documents(3종) · practice(연습본 3종) · tutorials(매뉴얼 3종)

모델 ID는 .env.local 에만 있습니다. 코드에 하드코딩하지 마세요.

## 5. 남은 작업 (우선순위 순)

P1. 실제 API 검증
    OPENAI_API_KEY 를 넣고 온라인 모드로 3개 합성문서를 분석해
    docs/MODEL_COMPARISON.md 표를 채우세요.
    OpenAI 경로와 Ollama 경로는 코드가 완성되어 있으나
    실제 키/서버로 호출 검증은 아직 하지 못했습니다 (개발 환경에 키가 없었음).
    특히 확인할 것:
      - 지정 모델 gpt-5.6-luna / gpt-5.6-terra 가 계정에서 실제 사용 가능한지.
        불가하면 .env.local 의 모델명만 교체하면 됩니다.
      - Responses API 응답의 output_text 파싱이 실제로 동작하는지
      - qwen3-vl:4b 가 ANALYSIS_JSON_SCHEMA 를 실제로 지키는지
        (지키지 못하면 src/lib/providers/prompt.ts 의 few-shot을 늘리세요)

P2. KR-복지 문서 환각 테스트
    kr-welfare 합성문서에는 지원 금액이 적혀 있지 않습니다.
    모델이 "보통 수십만 원" 같은 값을 만들어내는지 각 모드에서 확인하고
    MODEL_COMPARISON.md 에 기록하세요. 이게 발표에서 가장 강한 장면입니다.

P3. 일본어 UI 검수
    src/lib/i18n/ja.ts 는 やさしい日本語로 작성했지만
    일본어 원어민 검수를 받지 않았습니다. 팀의 일본 멤버에게 확인받으세요.

P4. 문서 유형 확장
    공공요금(utility_bill) · 연금(pension_notice) · 법원(court_notice) 은
    스키마에 타입만 있고 fixture / tutorial / practice 가 없습니다.
    추가 방법:
      1) src/lib/fixtures/documents.ts 에 SyntheticDocumentPage + ModelAnalysis
      2) src/lib/fixtures/tutorials.ts 에 DocumentTutorial
      3) src/lib/fixtures/practice.ts 에 PracticeScenario + PRACTICE_PAGES 등록
    tests/learning.test.ts 가 세 개의 정합성을 자동 검사합니다.

P5. PaddleOCRProvider / HybridProvider
    DocumentAnalysisProvider 인터페이스를 그대로 구현하면 됩니다.
    src/lib/providers/index.ts 의 createProvider() 에 case 추가.

P6. 요청 빈도 제한
    구조만 준비되어 있고 적용되어 있지 않습니다 (docs/FEATURE_STATUS.md 참고).

## 6. 명령

  cd <cloned-repository>
  npm install
  npm run dev            # http://localhost:3000
  npm run typecheck
  npm test
  npm run build

코드를 고친 뒤에는 반드시 npm test 와 npx tsc --noEmit 를 돌리세요.
테스트 67개가 안전 규칙과 학습 루프 규칙을 지키고 있습니다.

## 7. 함정

- 다른 복사본이 아니라 이 Git 저장소 루트에서 작업하세요.
- Windows PowerShell 에서는 && 가 동작하지 않습니다. ; 또는 if ($?) { } 를 쓰세요.
- Next.js 는 15.5.24 로 올려두었습니다 (15.1.6 에 CVE-2025-66478). 되돌리지 마세요.
- vitest 는 esbuild postinstall 승인이 필요합니다 (package.json 의 allowScripts).
- src/lib/providers/config.ts 는 'server-only' 를 import 합니다.
  클라이언트 컴포넌트에서 import 하면 빌드가 깨집니다. 그게 의도입니다.
- useSearchParams 를 쓰는 페이지는 Suspense 로 감싸야 빌드가 통과합니다
  (/evidence, /tutorial, /practice 가 그렇게 되어 있습니다).
- 이미지 축소·EXIF 제거는 브라우저(src/lib/util/image.ts)에서 합니다.
  서버로 옮기면 sharp 네이티브 의존이 생깁니다.

## 8. 첫 작업

먼저 코드를 읽고 다음을 짧게 보고하세요.
1) 이해한 현재 구조
2) 3절의 규칙 중 지금 코드가 지키지 못하는 것이 있는지
3) P1부터 시작할 계획

그다음 승인을 기다리지 말고 P1 작업을 시작하세요.
```

---

## 이 문서를 쓴 사람이 남기는 메모

- 세션 중 테스트가 실제 버그 3개를 잡았습니다. 모두 수정됨:
  1. `.ics` DTEND 가 DTSTART 와 같아지는 버그 (UTC 변환으로 하루가 사라짐)
  2. 계좌번호 형태(`1002-345-678901`)가 마스킹되지 않던 버그
  3. `따라 하기` 단계에서 도움 수준이 영원히 낮아지지 않던 버그
     — 자립 루프의 핵심이 막히는 문제였습니다
- 3번 수정 방식: `hintsUsed`(화면에 보인 힌트, 정직한 기록)와
  `hintsRequested`(사용자가 요청한 힌트, 도움 감소 판정 기준)를 분리했습니다.
- 전체 아이디어톤 자료 묶음은 이 저장소 밖에서 별도로 관리됩니다.
  이 저장소만 복제한 환경에서는 위의 선택적 참조 경로가 없을 수 있습니다.
