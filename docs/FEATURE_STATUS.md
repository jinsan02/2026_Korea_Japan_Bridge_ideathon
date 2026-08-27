# 구현 상태 구분표

발표에서 이 구분을 그대로 설명하세요. 연출된 기능을 실제 기능처럼 말하면 안 됩니다.

## ✅ 실제로 작동하는 기능

| 기능 | 위치 | 비고 |
|---|---|---|
| 촬영·이미지 업로드 | `/capture` | 모바일 후면 카메라 직접 열림 |
| 이미지 축소·EXIF 제거·회전 보정 | `src/lib/util/image.ts` | 브라우저에서 처리 후 전송 |
| Fixture Demo 분석 | `src/lib/providers/fixture.ts` | 네트워크 호출 없음 |
| OpenAI 실제 분석 | `src/lib/providers/openai.ts` | Responses API, `store:false` |
| Ollama 로컬 분석 | `src/lib/providers/ollama.ts` | qwen3-vl:4b |
| JSON Schema 검증 + 1회 재시도 | `providers/index.ts` | zod 강제 |
| 안전 규칙 강제 | `analysis/harden.ts` | 근거 없는 값 확정 금지 |
| 문서 종류 확인·직접 변경 | `/confirm` | 사용자 정정 가능 |
| 단계별 함께 해결 (6단계) | `/solve` | 확인했어요 / 잘 모르겠어요 / 다시 설명 / 원문 보기 |
| 행동카드 최대 3개 | `/result` | 준비물·방법·하지 말 것·근거 포함 |
| Evidence Lens 원문 위치 강조 | `/evidence`, `/solve` | 좌표 정렬 검증됨 |
| 공식 연락처 (문서 기재분만) | `/contact` | 전화 걸기 전 확인창 |
| 기한 달력 저장 (.ics) | `/result` | RFC 5545 |
| 문서 유형별 매뉴얼 | `/tutorial` | 3종 |
| 유사 합성문서 복습 | `/practice` | 3종, 값이 다른 연습본 |
| 고정 3단계 힌트 | `/practice` | 위치 → 단어 → 정답 |
| 도움 수준 자동 감소 | `learning/progress.ts` | localStorage |
| 연습 결과·지난 기록 | `/practice/result`, `/history` | 점수·등급 아님 |
| 음성 읽기 | 전 화면 | 브라우저 SpeechSynthesis |
| 한국어·일본어 전환 | 전 화면 | 타입 강제 사전 |
| 글자 크기 3단계 | `/lab` | root font-size 배율 |
| A/B/C 조건 전환 | `/lab` | feature flag |
| 비식별 이벤트 로그 + CSV/JSON 내려받기 | `/api/logs` | strict 스키마 |
| Provider 상태 조회 | `/api/status` | 키 유무·Ollama 연결 |

## 🎬 연출(시뮬레이션)이며 그렇게 설명해야 하는 것

| 항목 | 실제 동작 | 발표 시 표현 |
|---|---|---|
| 분석 중 4단계 진행 표시 | 타이머 기반 애니메이션. 서버 실제 단계를 추적하지 않음 | "진행 상황을 쉬운 말로 안내하는 화면입니다" |
| 복습 알림 | localStorage에 예정 시간 저장 후 재접속 시 카드 표시. **푸시 알림 아님** | "이 브라우저에서만 동작하는 시연용 알림입니다" |
| `(시연용) 지금이 저녁이라고 하고 보기` | 예약 시간을 즉시 도래시키는 데모 버튼 | 화면 문구 그대로 읽으면 됩니다 |
| Fixture 분석 결과 | 사전 작성된 검증 결과 | "사전 정의된 응답을 사용한 프로토타입" |

## ❌ 구현하지 않은 것 (있는 것처럼 말하지 마세요)

- **온디바이스 개인정보 마스킹** — 동의 화면에서 미구현임을 명시함
- 실제 세금 납부·송금·공공기관 신청 제출
- 법률 자문, 의료 진단
- 개인정보 영구 저장, 사용자 계정
- 파인튜닝, 개인화 학습 모델, 적응형 힌트 노출 시점 예측
- 인지능력 평가, 사용자 등급·점수
- 얼굴 인식, 생체정보 수집
- 실제 기관 데이터베이스 자동 연동
- 문자(SMS) 공유로 진입하는 경로
- PaddleOCR / Hybrid Provider (인터페이스만 설계됨)
- 서버 측 요청 빈도 제한 (구조만 준비, 미적용)

## 후속 작업 후보

1. PaddleOCRProvider + HybridProvider 구현
2. 온디바이스 마스킹 (WASM OCR + 좌표 기반 블러)
3. 실제 푸시 알림 (Web Push)
4. 문서 유형 확장 (공공요금·연금·법원)
5. 한·일 고령자 각 5명 이상 과업 테스트 후 A/B/C 결과 반영
