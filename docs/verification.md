# AI Door 검증 기록

검증일: 2026-09-02

검증 커밋: `4995eeb035e9b33caba33ed42c3e223003479abe` (`main`)

원격 대조: 로컬 `origin/main`도 같은 커밋. 이번 세션의 네트워크 fetch는 Windows 자격증명 오류로
완료되지 않았으므로, 원격 최신 상태까지 확인했다는 뜻은 아니다.

## 환경

- Windows
- Node.js `v24.19.0`
- npm `11.17.0`
- Next.js `15.5.24`
- TypeScript `5.7.3`
- Vitest `2.1.8`
- `.env.local` 사용. 파일은 Git에서 제외되며 값은 검증 문서에 기록하지 않음

## 실행 결과

### 자동 테스트

```powershell
npm test
```

결과: 테스트 파일 4개, **80/80 통과**.

| 파일 | 개수 | 실제로 보장하는 범위 |
|---|---:|---|
| `tests/harden.test.ts` | 16 | 근거 없는 날짜·금액·연락처 제거, 위험 URL 제거, 카드 상한, 법률·의료 경고, 재분석 조건 |
| `tests/privacy.test.ts` | 20 | 이벤트 스키마의 자유 텍스트 거부, 패턴 마스킹, 합성문서 표시·가짜 기관/연락처, 일부 한일 문구 회귀 |
| `tests/learning.test.ts` | 24 | 연습·매뉴얼 참조 무결성, 고정 3단계 힌트, 도움 수준 전이, 합성 페이지 레이아웃과 한일 fixture 연결 |
| `tests/flow.test.ts` | 20 | fixture 분석 스키마, 근거 ID, 행동카드, 6단계 흐름, 날짜·ICS·JSON 복구, fixture의 무네트워크 경로 |

이 테스트가 보장하지 않는 것:

- 실제 사진에서의 OCR/문서 구조화 정확도;
- 한국어·일본어 번역 품질 또는 일본어 원어민 자연스러움;
- 고령 사용자 접근성·이해도·과업 성공률;
- 실제 OpenAI/Ollama 제공자의 지속적 품질과 가용성;
- 브라우저 E2E, 실제 휴대폰 카메라, 서버리스 다중 인스턴스 동작;
- 운영 인증, 침투 테스트, API 비용 공격 방어.

### TypeScript 검사

```powershell
npm run typecheck
```

결과: `tsc --noEmit` 종료 코드 0. `strict: true` 구성에서 오류 없음.

### 프로덕션 빌드

기존 `.next` 캐시와 함께 첫 시도는 Next.js 헤더 이후 진행되지 않았다. 캐시를 삭제하지 않고
별도 폴더로 이동한 뒤 다음 명령으로 클린 빌드했다.

```powershell
$env:NEXT_TELEMETRY_DISABLED='1'
npm run build
```

결과: 컴파일, 타입 검사, 페이지 데이터 수집, 정적 페이지 생성 **18/18**, 빌드 추적 완료.
이후 임시 백업 캐시는 제거했다.

### 라우트

소스에 정의된 라우트 파일은 **18개**다: 화면 15개와 API 3개.

| 화면 15개 | API 3개 |
|---|---|
| `/`, `/admin`, `/analyzing`, `/capture`, `/confirm`, `/consent`, `/contact`, `/evidence`, `/history`, `/practice`, `/practice/result`, `/result`, `/solve`, `/solve/complete`, `/tutorial` | `/api/analyze`, `/api/logs`, `/api/status` |

Next.js 빌드 출력에는 위 18개 외에 프레임워크가 생성한 `/_not-found`도 나타난다. 따라서
“애플리케이션이 정의한 18개 라우트”와 “빌드 표의 전체 행 수”를 혼용하지 않는다.

## 보안 설정 대조

- Git이 추적하는 환경 파일은 값이 비어 있는 `.env.example`뿐이다. `.env.local`은 ignore 상태다.
- 현재 파일과 전체 Git 이력에서 `sk-...` 형태의 OpenAI 비밀키 패턴은 발견되지 않았다.
- `NEXT_PUBLIC_*` API 키 변수는 없으며 서버 설정은 `server-only` 모듈에서 읽는다.
- 위 검사는 패턴 기반 점검이며 전문 secret scanner나 침투 테스트를 대체하지 않는다.
- 서버 키가 숨겨져 있어도 익명 `/api/analyze` 호출로 비용이 발생할 수 있으며,
  `ADMIN_CODE`와 인스턴스별 속도 제한은 운영 인증·분산 공격 방어가 아니다.

## 검증 경계

현재 검증은 코드 불변조건과 빌드 가능성을 확인한다. “80/80”은 문서 인식 80건의 정확도가
아니며, 사용자가 80회 성공했다는 뜻도 아니다. 실제 문서·실제 사용자·운영 환경 성과는
`docs/limitations.md`의 미검증 항목으로 남아 있다.
