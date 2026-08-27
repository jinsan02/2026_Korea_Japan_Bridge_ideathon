# GitHub → 웹 URL 배포

코드는 이미 GitHub `main` 에 올라가 있습니다. 배포 경로는 두 가지입니다 —
**저장소 연결**(§2) 또는 **로컬에서 바로**(§2-B). 둘 다 Vercel 이고, 결과는 같습니다.
남은 것은 **호스팅 연결과 키 등록**이고, 둘 다 본인 계정으로 하셔야 합니다.

저장소: `https://github.com/jinsan02/2026_Korea_Japan_Bridge_ideathon`

## 0. 먼저 — GitHub Pages 로는 안 됩니다

이 앱은 정적 사이트가 아닙니다. 서버에서 도는 부분이 세 군데 있습니다.

- `/api/analyze` — API 키가 여기에만 존재합니다. 브라우저로 내려가면 안 됩니다.
- `/api/logs` — 이벤트 기록
- `middleware.ts` — `/admin` 차단

GitHub Pages 는 정적 파일만 서빙하므로 이 셋이 전부 죽습니다. **Vercel** 을
쓰세요 — Next.js 를 만든 회사고, GitHub 저장소를 연결하는 방식이라
"v0 로 만든다"와는 다릅니다. 우리가 쓴 코드를 그대로 빌드해서 올립니다.

---

## 1. OpenAI 플랫폼 설정

> 키는 **직접** 발급받아 **Vercel 화면에 직접** 입력하세요.
> 저에게 키를 보내지 마시고, 코드·README·채팅 어디에도 붙여넣지 마세요.

### 1-1. 결제 등록 (이게 없으면 키가 있어도 401/429 가 납니다)

1. https://platform.openai.com 로그인
2. 좌측 하단 톱니바퀴 → **Billing**
3. **Add payment method** 로 카드 등록
4. **Add to credit balance** 로 최소 금액 충전 (선불식입니다)

### 1-2. 지출 상한을 반드시 걸어 두세요 ⚠️

공개 URL 에 키를 연결하는 것이므로, 상한이 없으면 사고가 그대로 청구됩니다.

1. **Billing → Limits**
2. **Budget limit** 을 낮게 설정 (시연용이면 $5~10 로 충분합니다)
3. **Email notification threshold** 도 함께 설정

### 1-3. 키 발급

1. https://platform.openai.com/api-keys
2. **Create new secret key**
3. Name: `ai-door-demo` (구분용)
4. Permissions: **Restricted** → `Model capabilities` 만 `Write` 로 두고 나머지는 `None`
5. **한 번만 보여줍니다.** 복사해서 다음 단계에 바로 붙여넣으세요

### 1-4. 쓸 수 있는 모델 확인 ⚠️ 중요

`.env.example` 의 모델명(`gpt-5.6-luna`, `gpt-5.6-terra`)이 **계정에서 실제로
쓸 수 있는지 확인된 적이 없습니다.** 배포 후 반드시 한 번 눌러 보세요.

안 되면 https://platform.openai.com/docs/models 에서 이미지 입력을 지원하는
모델 ID 를 확인하고, Vercel 의 `OPENAI_MODEL` 값만 바꾸면 됩니다. 코드는
고칠 것이 없습니다 — 모델 ID 는 환경변수에만 있습니다.

---

## 2. Vercel 배포

### 2-1. 저장소 연결

1. https://vercel.com → **Continue with GitHub** 로 가입/로그인
2. **Add New… → Project**
3. `2026_Korea_Japan_Bridge_ideathon` 옆 **Import**
4. 설정은 **건드리지 마세요**. Next.js 가 자동 감지되고, 앱이 저장소 루트에
   있으므로 Root Directory 도 그대로 두면 됩니다.

### 2-2. 환경변수 등록 (Deploy 누르기 전에)

같은 화면의 **Environment Variables** 에서 하나씩 추가합니다.

| Name | Value | 비고 |
|---|---|---|
| `AI_PROVIDER` | `openai` | 예시 문서만 쓸 거면 `fixture` |
| `OPENAI_API_KEY` | 1-3 에서 받은 키 | 여기에만 붙여넣습니다 |
| `OPENAI_MODEL` | `gpt-5.6-luna` | 1-4 에서 확인한 값 |
| `OPENAI_FALLBACK_MODEL` | `gpt-5.6-terra` | 재분석용 |
| `ADMIN_CODE` | 아무 긴 문자열 | 비우면 관리자 화면이 막힙니다 |
| `ANALYZE_RATE_LIMIT_PER_MINUTE` | `10` | 비용 폭주 방지 |

**넣지 마세요:** `OLLAMA_*` (클라우드에서 로컬 모델은 안 돕니다),
`ALLOW_CLIENT_PROVIDER_OVERRIDE` (production 기본값 `false` 가 맞습니다 —
`true` 로 두면 방문자가 OpenAI 모드를 강제로 켜서 키를 쓸 수 있습니다).

### 2-3. Deploy

**Deploy** 를 누르면 2~3분 뒤 `https://<프로젝트명>.vercel.app` 이 나옵니다.
클린 클론에서 `npm ci` + `npm run build` 가 통과하는 것은 확인해 두었습니다.

### 2-4. 함수 실행 시간 ⚠️

사진 한 장을 비전 모델로 읽는 데 20~40초가 걸립니다. 코드에
`maxDuration = 60` 을 선언해 두었지만, **무료(Hobby) 플랜은 함수 상한이
그보다 짧습니다.** 무료 플랜이면 실제 사진 분석은 중간에 끊길 수 있습니다.

- 유료 플랜이면 그대로 동작합니다.
- 무료 플랜이면 **`AI_PROVIDER=fixture` 로 두고 예시 문서로 시연**하세요.
  전체 흐름이 그대로 돌아가고, 오히려 발표 중 실패 위험이 없습니다.

---

## 2-B. GitHub 없이 로컬에서 바로 배포 (더 빠름)

저장소 연결 없이 **이 폴더를 그대로** 올릴 수 있습니다. Vercel CLI 를 쓰며,
GitHub 를 거치지 않습니다.

```bash
cd C:/KJ_Bridge_Ideathon/AI_Door_Web_MVP
npx vercel login
```

이메일 또는 GitHub 로 로그인합니다 (브라우저가 열립니다).

```bash
npx vercel
```

질문 4개가 나옵니다. **전부 기본값(엔터)** 으로 두면 됩니다 —
프로젝트 루트가 Next.js 앱이라 따로 지정할 것이 없습니다.

- Set up and deploy? → **Y**
- Which scope? → 본인 계정
- Link to existing project? → **N**
- Project name / directory / settings → 엔터

여기까지 하면 **미리보기 URL** 이 나옵니다.

### 환경변수 등록

```bash
npx vercel env add OPENAI_API_KEY production
npx vercel env add AI_PROVIDER production
npx vercel env add OPENAI_MODEL production
npx vercel env add OPENAI_FALLBACK_MODEL production
npx vercel env add ADMIN_CODE production
npx vercel env add ANALYZE_RATE_LIMIT_PER_MINUTE production
```

각 명령이 값을 물어보면 그때 입력합니다. **키는 이 터미널에만 입력하고
파일에 쓰지 마세요.** 값은 § 2-2 표와 같습니다.

### 진짜 URL 만들기

```bash
npx vercel --prod
```

`https://<프로젝트명>.vercel.app` 이 나옵니다. 이게 시연에 쓸 주소입니다.

### 이후 수정했을 때

```bash
npx vercel --prod
```

한 줄이면 다시 올라갑니다. GitHub 푸시가 필요 없습니다.

### 어느 쪽을 쓸까

| | GitHub 연결 (§2) | 로컬 CLI (§2-B) |
|---|---|---|
| 처음 설정 | 웹 화면에서 클릭 | 터미널 명령 몇 줄 |
| 배포 | `git push` 하면 자동 | `npx vercel --prod` 직접 |
| 협업 | 팀원 푸시도 자동 배포 | 각자 로그인 필요 |
| 발표 직전 급수정 | 커밋·푸시·대기 | **바로 올라감** |

혼자 시연하실 거면 **§2-B 가 빠릅니다.** 코드는 이미 GitHub 에도 올라가 있으니
나중에 §2 로 바꿔도 됩니다.

> **참고:** GitHub Pages, Netlify 의 정적 배포, S3 같은 정적 호스팅은 안 됩니다.
> §0 에 적은 대로 서버에서 도는 부분이 세 군데 있습니다.

---

## 3. 배포 직후 점검

`<도메인>` 을 바꿔서 그대로 붙여넣으세요.

```bash
D=https://프로젝트명.vercel.app
curl -s -o /dev/null -w "home   %{http_code}  (200 이어야 함)\n" $D/
curl -s -o /dev/null -w "status %{http_code}  (404 여야 함)\n" $D/api/status
curl -s -o /dev/null -w "logs   %{http_code}  (404 여야 함)\n" $D/api/logs
curl -s $D/admin | grep -c "분석 모드"
```

마지막 줄이 **`0`** 이어야 정상입니다 (관리자 화면이 안 열리고 홈이 나옴).

관리자로 들어갈 때는 브라우저에서 `https://프로젝트명.vercel.app/admin?key=<ADMIN_CODE>`
로 접속합니다. 한 번 들어가면 쿠키로 기억하므로 코드가 URL 에 남지 않습니다.

### 폰에서 확인

1. 예시 문서 두 개를 각각 끝까지 한 번씩
2. `가` 버튼 세 번 → 글자 크기가 순환하는지
3. `🌐 日` → 일본어 전환
4. **`AI_PROVIDER=openai` 라면 실제 사진을 한 장 찍어서 분석시켜 볼 것** —
   모델 ID 가 맞는지 확인하는 유일한 방법입니다

---

## 4. 이후 배포

`main` 에 푸시하면 자동으로 다시 배포됩니다.

```bash
git push origin main
```

환경변수를 바꿨을 때는 자동 재배포가 안 되므로,
Vercel → **Deployments → 맨 위 항목 → ⋯ → Redeploy** 를 눌러야 반영됩니다.

---

## 5. 시연 끝나면

공개 URL 에 키가 연결된 상태를 방치하지 마세요.

1. https://platform.openai.com/api-keys 에서 그 키를 **Revoke**
2. 또는 Vercel 프로젝트를 **Settings → General → Delete Project**

## 6. 알고 넘어가는 것

- `ADMIN_CODE` 는 **인증이 아니라 가림막**입니다. 코드를 아는 사람은 전부
  볼 수 있습니다. 뒤에 있는 데이터는 이벤트 로그뿐이고, 스키마가 개인정보를
  애초에 거부합니다.
- **속도 제한은 인스턴스별 메모리 기준**입니다. 서버리스는 인스턴스가 여러 개
  뜨므로 실제 상한은 설정값보다 느슨합니다. 지출 상한(1-2)이 진짜 방어선입니다.
- **이벤트 로그 파일은 클라우드에 안 남습니다.** 인스턴스 메모리에만 있어
  CSV 를 받으면 그 인스턴스가 본 것만 나옵니다.
