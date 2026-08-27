/**
 * Korean dictionary - the reference locale.
 *
 * Writing rules for every string here:
 * - one idea per sentence, and prefer a short sentence to a clause
 * - say what the button does, not what the system does
 * - never state a value the document did not contain
 * - never tell the user they are being assessed
 */
import { euro } from './particle';

export const ko = {
  appName: 'AI Door',
  tagline: '받은 문서를 이해하고, 다음에는 스스로',

  common: {
    back: '뒤로',
    close: '닫기',
    next: '다음',
    previous: '이전',
    cancel: '취소',
    continue: '계속',
    confirm: '확인',
    home: '처음으로',
    retry: '다시 시도',
    readAloud: '소리 내어 읽기',
    stopReading: '읽기 중지',
    ttsUnavailable: '이 기기에서는 음성 읽기를 사용할 수 없습니다.',
    step: (current: number, total: number) => `${total}단계 중 ${current}단계`,
    textSize: '글자 크기',
    textSizeGlyph: '가',
    textSizeNormal: '보통',
    textSizeLarge: '크게',
    textSizeHuge: '아주 크게',
    language: '언어',
    switchLanguage: '언어 바꾸기',
    rereadInLanguage: '이 언어로 다시 읽기',
    rereadNotice: '지금 결과는 다른 언어로 읽은 것입니다.',
    showOriginal: '원문 보기',
    showEasy: '쉬운 설명 보기',
  },

  badge: {
    demoMode: '데모 모드',
    demoModeHelp: '지금 화면은 미리 준비한 결과입니다. 실제 AI 분석이 아닙니다.',
    liveMode: '실제 AI 분석',
    liveModeHelp: '방금 보낸 문서를 AI가 분석한 결과입니다.',
    synthetic: '합성문서',
    syntheticHelp: '시연용으로 만든 가짜 문서입니다. 실제 고지서가 아닙니다.',
    fellBack: '데모 모드로 전환됨',
    provider: {
      openai: '온라인 분석',
      ollama: '로컬 분석',
      fixture: '예시 문서',
    },
    reason: {
      missing_credentials: 'API 키가 없어서 데모 모드로 보여드립니다.',
      upload_too_large: '사진이 너무 커서 데모 모드로 보여드립니다.',
      unsupported_type: '이 파일 형식은 분석할 수 없어 데모 모드로 보여드립니다.',
      timeout: 'AI 응답이 늦어져서 데모 모드로 보여드립니다.',
      provider_unreachable: 'AI 서버에 연결하지 못해 데모 모드로 보여드립니다.',
      provider_error: 'AI 서버에 문제가 있어 데모 모드로 보여드립니다.',
      invalid_json: 'AI 응답을 읽지 못해 데모 모드로 보여드립니다.',
      schema_violation: 'AI 응답 형식이 맞지 않아 데모 모드로 보여드립니다.',
      unknown_document_type: '문서 종류를 알지 못해 데모 모드로 보여드립니다.',
      conflicting_values: '문서에서 서로 다른 값이 보여 데모 모드로 보여드립니다.',
      low_confidence: '분석 결과가 확실하지 않아 데모 모드로 보여드립니다.',
      no_evidence: '원문 근거를 찾지 못해 데모 모드로 보여드립니다.',
      unknown: '문제가 생겨서 데모 모드로 보여드립니다.',
    },
  },

  confidence: {
    label: '확인 상태',
    high: '문서에서 분명하게 확인했습니다',
    medium: '문서에서 확인했지만 다시 보시는 것이 좋습니다',
    low: '문서에서 확실하게 확인하지 못했습니다',
  },

  home: {
    eyebrow: 'AI와 함께 배우고, 다음에는 스스로',
    title: '오늘은 무엇을 도와드릴까요?',
    subtitle: '질문을 쓰지 않아도 돼요. 받은 문서를 보여주세요.',
    journeyLabel: 'AI Door 3단계 학습 여정',
    journeySolve: '같이 해결',
    journeyPractice: '연습',
    journeyIndependent: '혼자 해결',
    solveTitle: '지금 같이 해결하기',
    solveBody: '새로 받은 문서를 촬영하고 단계별로 함께 확인합니다.',
    practiceTitle: '혼자 해보기',
    practiceBody: '전에 배운 문서와 비슷한 연습 문서를 직접 풀어봅니다.',
    tutorialTitle: '나의 문서 매뉴얼',
    tutorialBody: '내가 배운 확인 순서를 다시 봅니다.',
    historyTitle: '지난 연습 보기',
    historyBody: '혼자 맞힌 것과 힌트를 쓴 것을 확인합니다.',
    reviewDue: '복습할 시간이 되었습니다',
    reviewDueBody: (topic: string) => `${topic}을 짧게 연습해 볼까요?`,
    reviewStart: '지금 연습하기',
    reviewDismiss: '나중에',
    noticeTitle: '실제 개인정보 문서는 올리지 마세요',
    noticeBody:
      '시연에는 개인정보가 없는 합성문서를 사용하세요. 실제 문서를 올리면 사진이 외부 AI로 전송됩니다.',
  },

  capture: {
    title: '문서를 보여주세요',
    help: '문서 전체가 화면에 들어오게 찍어 주세요.',
    takePhoto: '문서 촬영',
    chooseFile: '이미지 업로드',
    tryExample: '예시 문서로 체험',
    demoTitle: '예시 상황으로 해보기',
    demoHelp: '아래 문서 중 하나를 고르면 바로 시작합니다.',
    selected: '선택한 문서',
    analyze: '이 문서로 확인하기',
    preparing: '사진을 준비하고 있습니다',
    errorTooLarge: (mb: number) => `파일이 너무 큽니다. ${mb}MB 이하로 올려 주세요.`,
    errorType: '사진 파일(JPG, PNG, WEBP)만 올릴 수 있습니다.',
    errorReadFailed: '사진을 읽지 못했습니다. 다시 시도해 주세요.',
    cameraHint: '촬영 버튼을 누르면 휴대폰 카메라가 열립니다.',
    privacyHint: '사진은 이 기기에서 크기를 줄이고 위치정보를 지운 뒤 전송합니다.',
  },

  consent: {
    title: '문서를 확인하기 전에 알려드립니다',
    syntheticTitle: '지금은 합성문서를 사용합니다',
    syntheticBody:
      '시연에는 개인정보가 없는 가짜 문서만 사용합니다. 실제 주민의 공문서는 사용하지 않습니다.',
    uploadTitle: '올린 사진은 AI 분석에 사용됩니다',
    uploadBody:
      '온라인 모드에서는 사진이 외부 AI 서비스로 전송됩니다. 주민등록번호나 계좌번호가 있는 문서는 올리지 마세요.',
    localTitle: '로컬 모드에서는 밖으로 나가지 않습니다',
    localBody:
      '로컬 모드를 고르면 사진이 이 컴퓨터 안의 AI에서만 처리됩니다.',
    storageTitle: '저장하지 않습니다',
    storageBody:
      '문서 사진과 문서에서 읽은 글은 저장하지 않습니다. 분석이 끝나면 지워집니다.',
    maskingTitle: '아직 없는 기능도 알려드립니다',
    maskingBody:
      '기기 안에서 개인정보를 미리 가리는 기능은 아직 만들지 않았습니다. 다음 단계에서 만들 예정입니다.',
    agree: '이해했습니다. 계속하기',
    declineToDemo: '동의하지 않고 예시 문서로 체험',
  },

  analyzing: {
    title: '문서를 확인하고 있습니다',
    subtitle: '잠시만 기다려 주세요.',
    steps: {
      upload: '문서를 받고 있어요.',
      classify: '문서의 종류를 확인하고 있어요.',
      dates: '중요한 날짜를 찾고 있어요.',
      actions: '해야 할 일을 정리하고 있어요.',
    },
    done: '완료',
    cancel: '분석 취소',
    takingLong: '조금 오래 걸리고 있습니다.',
    seeExample: '예시 결과 보기',
    failedTitle: '지금은 온라인 분석이 원활하지 않습니다',
    failedBody: '안전한 예시 문서로 계속 체험하시겠어요?',
    failedRetry: '다시 시도',
    failedUseFixture: '예시 문서로 계속하기',
    failedGoBack: '처음으로',
  },

  confirm: {
    question: (type: string) => `이 문서는 ${euro(type)} 보입니다.`,
    from: (issuer: string) => `${issuer}에서 보냈습니다.`,
    ask: '무엇부터 도와드릴까요?',
    askHelp: '하나를 고르시면 그것부터 같이 봅니다.',
    wrongType: '문서 종류가 다릅니다',
    yes: '네, 맞아요',
    no: '아니에요',
    unsure: '잘 모르겠어요',
    changeTitle: '문서 종류를 골라 주세요',
    changeHelp: 'AI가 틀렸다면 직접 고르실 수 있습니다.',
    types: {
      tax_notice: '세금',
      health_checkup: '건강검진',
      welfare_application: '복지',
      utility_bill: '공공요금',
      public_office_notice: '주민센터·시청 안내',
      pension_notice: '연금',
      court_notice: '법원·행정',
      other: '기타',
      unknown: '잘 모르겠어요',
    },
  },

  /** The three doors on the confirm screen. */
  entry: {
    payment: {
      title: '납부 메뉴 찾기',
      body: (count: number) => `이 문서로 낼 수 있는 방법 ${count}가지를 보여드립니다.`,
    },
    buttons: {
      title: '버튼 위치 안내받기',
      body: '어느 버튼을 눌러야 하는지 화면에서 짚어 드립니다.',
    },
    where: {
      title: '어디에 적혀 있는지 보기',
      body: '중요한 내용이 문서 어디에 있는지 짚어 드립니다.',
    },
    facts: {
      title: '얼마를 언제까지인지 보기',
      body: '금액과 기한만 먼저 확인합니다.',
    },
    steps: {
      title: '순서대로 같이 확인하기',
      body: '처음부터 끝까지 한 단계씩 함께 봅니다.',
    },
    stepsScreen: {
      title: '결제 순서 확인하기',
      body: '이 화면에서 무엇을 먼저 하는지 한 단계씩 봅니다.',
    },
  },

  /** The three doors on the confirm screen. */
  guided: {
    heading: '지금 같이 해결하기',
    intro: '한 번에 다 보여드리지 않습니다. 하나씩 같이 확인해요.',
    understood: '확인했어요',
    dontKnow: '잘 모르겠어요',
    explainAgain: '다시 설명해 주세요',
    showOriginal: '원문에서 보여주세요',
    whereToLook: '어디를 보면 되나요',
    hideOriginal: '원문 닫기',

    typeTitle: '먼저 어떤 문서인지 볼게요',
    typeBody: (label: string, issuer: string | null) =>
      issuer
        ? `${issuer}에서 보낸 ${label}입니다.`
        : `${label}입니다. 보낸 곳은 문서에서 확인하지 못했습니다.`,
    typeWhere: '문서 맨 위의 기관 이름과 제목을 보세요.',

    dateTitle: '다음으로 가장 중요한 날짜를 찾을게요',
    dateBody: (label: string, raw: string) => `${label}은 ${raw}입니다.`,
    dateMissing: '이 문서에서는 날짜를 확인하지 못했습니다. 원문을 다시 봐 주세요.',
    dateWhere: (label: string) => `표에서 "${label}"이라고 적힌 줄을 보세요.`,

    amountTitle: '이제 금액을 확인해 볼까요',
    amountBody: (label: string, raw: string) => `${label}은 ${raw}입니다.`,
    amountMissing: '이 문서에는 금액이 적혀 있지 않습니다. 만들어내지 않습니다.',
    amountWhere: (label: string) => `표에서 "${label}"이라고 적힌 줄을 보세요.`,

    itemsTitle: '무엇을 준비해야 하는지 볼게요',
    itemsBody: (items: string[]) => `준비물은 ${items.join(', ')}입니다.`,
    itemsWhere: '표 아래쪽의 준비물 안내를 보세요.',

    actionsTitle: '해야 할 일을 정리했어요',
    actionsBody: (titles: string[]) =>
      titles.length > 0
        ? `할 수 있는 일은 ${titles.length}가지입니다. ${titles.join(' / ')}`
        : '이 문서에서 바로 해야 할 일은 찾지 못했습니다.',

    contactTitle: '어디에 물어보면 되는지 볼게요',
    contactBody: (org: string, dept: string | null, phone: string | null) =>
      phone
        ? `${org}${dept ? ` ${dept}` : ''}, 전화 ${phone}입니다.`
        : `${org}${dept ? ` ${dept}` : ''}입니다. 전화번호는 문서에서 확인하지 못했습니다.`,
    contactMissing:
      '문서에서 연락처를 찾지 못했습니다. 번호를 추측해서 알려드리지 않습니다.',
    contactWhere: '문서 아래쪽의 문의처를 보세요.',

    doneTitle: '오늘 할 일을 다 확인했습니다',
    doneBody: '이제 실제 처리는 직접 하시면 됩니다. AI는 대신 하지 않습니다.',
    finish: '해결했어요',
    notYet: '아직 못 했어요',
  },

  complete: {
    title: '오늘은 AI와 함께 해결했습니다.',
    body: '다음에는 같은 종류의 문서를 혼자 확인할 수 있도록 짧게 연습해 볼까요?',
    practiceNow: '지금 연습하기',
    practiceLater: '나중에 연습하기',
    tutorialOnly: '오늘 배운 방법만 보기',
    continueTitle: '바코드를 찍으면 다음 화면이 나옵니다',
    continueBody:
      '휴대폰 앱으로 용지의 바코드를 찍으면 화면이 하나 더 나옵니다. 그 화면도 같이 읽어 드릴까요?',
    continueAction: '앱 화면 사진 보여주기',
    scheduleTitle: '언제 연습할까요?',
    tonight: '오늘 저녁',
    tomorrow: '내일',
    scheduled: (label: string) => `${label}에 연습을 알려드릴게요.`,
    scheduleHelp:
      '이 브라우저에만 저장되는 시연용 알림입니다. 실제 푸시 알림은 아직 없습니다.',
    fastForward: '(시연용) 지금이 저녁이라고 하고 보기',
  },

  result: {
    title: '확인 결과',
    summary: '한 줄 요약',
    dates: '중요한 날짜',
    amounts: '금액',
    actions: '해야 할 일',
    warnings: '주의사항',
    contacts: '공식 연락처',
    evidence: '원문 근거',
    uncertainty: '확인이 필요한 부분',
    notInDocument: '문서에 적혀 있지 않습니다.',
    notInDocumentHelp: '적혀 있지 않은 내용은 만들어내지 않습니다. 기관에 물어보세요.',
    daysLeft: (days: number) => `오늘 기준으로 ${days}일 남았습니다.`,
    dueToday: '오늘이 마지막 날입니다.',
    overdue: (days: number) => `기한이 ${days}일 지났습니다. 기관에 문의하세요.`,
    saveDeadline: '기한을 달력에 저장',
    saveDeadlineDone: '달력 파일을 내려받았습니다.',
    seeEvidence: '근거 보기',
    requiredItems: '준비물',
    method: '하는 방법',
    solveTogether: 'AI와 함께 해결하기',
    seeTutorial: '오늘 배운 방법 보기',
    practiceSimilar: '비슷한 문서 연습하기',
    reviewLater: '나중에 복습하기',
  },

/**
   * Payment rails.
   *
   * The names and the "what you need" lines are ours, not the model's: they
   * are the same for every document, so they belong in the dictionary where
   * they can be checked, rather than in output that has to be re-verified on
   * every run. Only which rails appear, and the label beside each, come from
   * the document.
   */
  payment: {
    title: '낼 수 있는 방법',
    subtitle: '문서에 적혀 있는 방법만 보여드립니다.',
    none: '이 문서에는 내는 방법이 적혀 있지 않습니다.',
    noneHelp: '문서 뒷면을 보시거나 기관에 물어보세요.',
    documentSays: '문서에는 이렇게 적혀 있어요',
    needs: '무엇이 필요한가요',
    methods: {
      bank_counter: '은행 창구',
      post_office: '우체국 창구',
      convenience_store: '편의점',
      atm: '현금인출기 (ATM)',
      internet_banking: '인터넷뱅킹',
      ars: '전화 자동응답 (ARS)',
      credit_card: '신용카드',
      online_portal: '공식 납부 사이트',
      barcode_app: '휴대폰 바코드 앱',
      account_transfer: '자동이체',
      help_desk: '기관 창구 방문',
    },
    help: {
      bank_counter: '문서를 그대로 들고 가면 창구 직원이 해 줍니다.',
      post_office: '문서를 그대로 들고 가면 창구 직원이 해 줍니다.',
      convenience_store: '문서를 그대로 계산대에 내면 됩니다.',
      atm: '카드와 문서의 납부번호가 필요합니다.',
      internet_banking: '은행 앱이나 홈페이지에 로그인해야 합니다.',
      ars: '전화를 걸어 안내 음성을 따라갑니다.',
      credit_card: '카드번호를 넣어야 합니다. 수수료가 붙을 수 있습니다.',
      online_portal: '공식 납부 사이트에 접속해 납부번호를 넣습니다.',
      barcode_app: '휴대폰 앱을 열고 문서의 바코드를 찍습니다.',
      account_transfer: '미리 신청해 두면 다음부터 자동으로 빠져나갑니다.',
      help_desk: '기관에 직접 찾아가서 물어보며 처리합니다.',
    },
  },

  evidence: {
    title: '확인한 근거',
    subtitle: '답을 뒷받침한 원문입니다.',
    original: '문서에 적힌 내용',
    translated: '쉬운 말로',
    explanation: '무슨 뜻인가요',
    location: '원문 위치',
    page: (page: number) => `${page}쪽`,
    show: '원문 위치 보기',
    hide: '위치 표시 끄기',
    none: '이 내용은 원문 근거를 찾지 못했습니다.',
    noRegion: '원문에서 위치를 표시할 수 없어 문구만 보여드립니다.',
    verifyOfficial: '공식 기관에 확인',
    unverifiedNote: '근거가 없는 내용은 확정된 사실로 표시하지 않습니다.',
  },

  contact: {
    title: '공식 기관에 확인하기',
    subtitle: '문서에 적힌 연락처만 보여드립니다.',
    organization: '기관',
    department: '담당 부서',
    phone: '전화번호',
    hours: '운영 시간',
    call: '전화 걸기',
    callConfirmTitle: '전화를 거시겠어요?',
    callConfirmBody: (phone: string) => `${phone} 번호로 전화 앱을 엽니다.`,
    website: '공식 홈페이지',
    openSite: '홈페이지 열기',
    noneTitle: '문서에서 연락처를 찾지 못했습니다',
    noneBody:
      '전화번호를 추측해서 알려드리지 않습니다. 기관의 공식 홈페이지에서 번호를 확인하세요.',
    askTitle: '확인할 때 물어볼 내용',
    howToFindTitle: '번호를 안전하게 찾는 방법',
  },

  tutorial: {
    listTitle: '나의 문서 매뉴얼',
    listSubtitle: '한 번 해결한 문서는 확인 순서가 여기에 남습니다.',
    empty: '아직 매뉴얼이 없습니다. 문서를 한 번 해결하면 여기에 저장됩니다.',
    emptyAction: '지금 같이 해결하기',
    purpose: '이 문서는 무엇인가요',
    checkOrder: '확인하는 순서',
    reason: '왜 그런가요',
    exampleLabel: '문서에 이렇게 적혀 있어요',
    keyTerms: '어려운 말 풀이',
    japaneseTerm: '일본 문서에서는',
    warnings: '자주 생기는 문제',
    verification: '공식 확인 방법',
    privacyNote:
      '이 매뉴얼에는 이름, 주소, 실제 금액 같은 개인정보가 들어 있지 않습니다.',
    practice: '이 방법으로 연습하기',
    savedNotice: '오늘 해결한 방법을 매뉴얼로 저장했습니다.',
  },

  practice: {
    title: '혼자 해보기',
    subtitle: '개인정보가 없는 비슷한 문서로 연습합니다.',
    chooseTitle: '어떤 문서로 연습할까요?',
    empty: '아직 연습할 문서가 없습니다. 먼저 문서를 한 번 해결해 주세요.',
    maskedNotice: '개인정보는 ●●●로 가려져 있습니다',
    syntheticNotice: '실제 문서가 아니라 새로 만든 연습용 문서입니다',
    yourTurnTitle: '이번에는 직접 찾아볼까요?',
    yourTurnBody: 'AI가 먼저 답을 알려주지 않습니다. 막히면 힌트를 받을 수 있습니다.',
    questionCount: (current: number, total: number) => `${total}문제 중 ${current}번`,
    needHint: '힌트가 필요해요',
    hintLabel: (step: number) => `힌트 ${step}`,
    hintLocation: '어디를 볼까요',
    hintKeyword: '어떤 단어를 찾을까요',
    hintAnswer: '근거와 정답',
    noMoreHints: '마지막 힌트까지 보셨습니다.',
    correct: '맞았습니다',
    incorrect: '다시 한 번 보세요',
    tryAgain: '다시 고르기',
    why: '왜 그런가요',
    nextQuestion: '다음 문제',
    finish: '연습 마치기',

    levelTitle: '지금 도움 수준',
    levels: {
      guided: '따라 하기',
      hinted: '힌트 연습',
      solo: '혼자 해보기',
      final_check: '마지막 확인만',
    },
    levelHelp: {
      guided: 'AI가 위치와 답을 함께 알려드립니다.',
      hinted: '먼저 답해 보시고, 막히면 힌트를 드립니다.',
      solo: 'AI는 질문만 합니다. 제출한 뒤에 정답을 확인합니다.',
      final_check: '먼저 직접 확인하시고, AI는 빠진 것만 알려드립니다.',
    },
    fadeNotice: '다음 연습부터는 도움을 조금 줄입니다.',
    fadeHeld: '이번에는 도움 수준을 그대로 두었습니다. 천천히 하셔도 됩니다.',
  },

  practiceResult: {
    title: '연습을 마쳤습니다',
    independent: '혼자 맞힌 것',
    withHints: '힌트를 사용한 것',
    remember: '다음에 기억할 내용',
    itemCount: (count: number) => `${count}개`,
    noneIndependent: '이번에는 힌트를 사용하셨습니다. 다음에는 조금 더 쉬워집니다.',
    allIndependent: '힌트 없이 모두 해내셨습니다.',
    closing: '다음에 비슷한 문서를 받으면 먼저 기한부터 찾아보세요.',
    againLater: '다음에 또 연습하기',
    seeTutorial: '매뉴얼 다시 보기',
    backHome: '처음으로',
  },

  history: {
    title: '지난 연습 보기',
    subtitle: '연습한 문서 종류와 결과입니다.',
    empty: '아직 연습 기록이 없습니다.',
    documentType: '문서 종류',
    when: '연습한 때',
    independentRate: '혼자 맞힌 비율',
    hintsUsed: '사용한 힌트',
    hintReduction: '처음보다 줄어든 힌트',
    notEnough: '두 번 이상 연습하면 비교할 수 있습니다.',
    noScoreNotice:
      '이 화면은 점수나 등급이 아닙니다. 다음에 무엇을 확인하면 좋을지 보여드리는 기록입니다.',
    clear: '기록 지우기',
    clearConfirm: '연습 기록을 모두 지울까요?',
  },

  lab: {
    title: '설정과 모델',
    subtitle: '시연 준비와 모델 비교를 위한 화면입니다.',
    providerLabel: '분석 모드',
    providers: {
      openai: '온라인 기본 모드 — OpenAI API',
      ollamaFast: '로컬 모드 — Qwen3-VL 4B',
      fixture: '예시 문서 모드 — 네트워크 없이 동작',
    },
    providerHelp: {
      openai: '인터넷이 필요합니다. 사진이 외부 AI로 전송됩니다.',
      ollamaFast: '이 컴퓨터 안에서 처리합니다. 8GB VRAM에서 안정적입니다.',
      fixture: '네트워크가 없어도 전체 흐름을 보여줄 수 있습니다.',
    },
    ollamaStatus: 'Ollama 연결',
    ollamaReachable: '연결됨',
    ollamaUnreachable: '연결되지 않음. ollama serve 가 실행 중인지 확인하세요.',
    installedModels: '설치된 모델',
    keyStatus: 'API 키',
    keySet: '설정됨',
    keyMissing: '없음 (.env.local 에 OPENAI_API_KEY 를 넣으세요)',
    lastRun: '마지막 분석 기록',
    attempts: '시도',
    elapsed: '걸린 시간',
    schemaOk: '스키마 통과',
    experimentTitle: '비교 실험',
    conditionLabel: '실험 조건',
    eventsTitle: '기록된 이벤트',
    eventCount: (n: number) => `${n}개`,
    downloadJson: 'JSON 내려받기',
    downloadCsv: 'CSV 내려받기',
    privacyNote:
      '문서 이미지, 문서 원문, 개인정보는 기록하지 않습니다. 조건·시간·선택·힌트 횟수만 남습니다.',
    resetProgress: '학습 기록 초기화',
    resetProgressConfirm: '도움 수준과 연습 기록을 모두 지울까요?',
  },

  errors: {
    noResult: '분석 결과가 없습니다. 처음부터 다시 시작해 주세요.',
    startOver: '처음부터 다시',
    notFound: '화면을 찾을 수 없습니다.',
  },

  humanReview: {
    title: '사람의 확인이 필요합니다',
    body: '이 문서는 AI가 확실하게 읽지 못했습니다. 원문을 다시 보시거나 공식 기관에 문의하세요.',
  },

};

/**
 * Every other locale is checked against the Korean dictionary's shape, so a
 * missing key is a type error rather than a blank label discovered on stage.
 */
export type Dictionary = typeof ko;
