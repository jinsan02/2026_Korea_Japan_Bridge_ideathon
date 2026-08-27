/**
 * Japanese dictionary.
 *
 * Written in やさしい日本語: short sentences, everyday words, and a space
 * between phrases so a line is easy to scan. Typed against the Korean
 * dictionary, so adding a key there forces a translation here.
 */
import type { Dictionary } from './ko';

export const ja: Dictionary = {
  appName: 'AI Door',
  tagline: '届いた 書類を わかって、つぎは 自分で',

  common: {
    back: 'もどる',
    close: 'とじる',
    next: 'つぎへ',
    previous: 'まえへ',
    cancel: 'やめる',
    continue: 'つづける',
    confirm: '確認',
    home: 'さいしょへ',
    retry: 'もう一度',
    readAloud: '声で 読む',
    stopReading: '読むのを 止める',
    ttsUnavailable: 'この 機械では 音声で 読めません。',
    step: (current: number, total: number) => `${total}つの うち ${current}つめ`,
    textSize: '文字の 大きさ',
    textSizeNormal: 'ふつう',
    textSizeLarge: '大きい',
    textSizeHuge: 'とても 大きい',
    language: 'ことば',
    showOriginal: '原文を 見る',
    showEasy: 'やさしい 説明を 見る',
  },

  badge: {
    demoMode: 'デモモード',
    demoModeHelp: 'この 画面は 用意した 結果です。本当の AI分析では ありません。',
    liveMode: '本当の AI分析',
    liveModeHelp: 'いま 送った 書類を AIが 分析した 結果です。',
    synthetic: '合成文書',
    syntheticHelp: 'デモのために 作った 書類です。本物では ありません。',
    fellBack: 'デモモードに 切りかわりました',
    provider: {
      openai: 'オンライン分析',
      ollama: 'ローカル分析',
      fixture: 'サンプル文書',
    },
    reason: {
      missing_credentials: 'APIキーが ないので デモモードで お見せします。',
      upload_too_large: '写真が 大きすぎるので デモモードで お見せします。',
      unsupported_type: 'この ファイルは 分析できないので デモモードで お見せします。',
      timeout: 'AIの 返事が おそいので デモモードで お見せします。',
      provider_unreachable: 'AIサーバーに つながらないので デモモードで お見せします。',
      provider_error: 'AIサーバーに 問題が あるので デモモードで お見せします。',
      invalid_json: 'AIの 返事が 読めないので デモモードで お見せします。',
      schema_violation: 'AIの 返事の かたちが 合わないので デモモードで お見せします。',
      unknown_document_type: '書類の 種類が わからないので デモモードで お見せします。',
      conflicting_values: '書類の 中に ちがう 値が あるので デモモードで お見せします。',
      low_confidence: '分析の 結果が はっきり しないので デモモードで お見せします。',
      no_evidence: '原文の 根拠が 見つからないので デモモードで お見せします。',
      unknown: '問題が おきたので デモモードで お見せします。',
    },
  },

  confidence: {
    label: '確認の ようす',
    high: '書類で はっきり 確認できました',
    medium: '書類で 確認しましたが もう一度 見た ほうが 安心です',
    low: '書類で はっきり 確認できませんでした',
  },

  home: {
    eyebrow: 'AIと 学び、つぎは 自分で',
    title: '今日は 何を お手伝い しますか?',
    subtitle: '質問を 書かなくても 大丈夫です。届いた 書類を 見せて ください。',
    journeyLabel: 'AI Doorの 3つの 学び方',
    journeySolve: 'いっしょに',
    journeyPractice: '練習',
    journeyIndependent: '自分で',
    solveTitle: 'いっしょに 解決する',
    solveBody: '新しく 届いた 書類を 撮って、一つずつ いっしょに 確認します。',
    practiceTitle: '自分で やってみる',
    practiceBody: 'まえに 学んだ 書類と にた 練習用の 書類を 自分で ときます。',
    tutorialTitle: 'わたしの 書類マニュアル',
    tutorialBody: '書類の 種類ごとに 確認する 順番を もう一度 見ます。',
    historyTitle: 'これまでの 練習',
    historyBody: '自分で できた ものと ヒントを 使った ものを 見ます。',
    settings: '設定と モデル',
    reviewDue: '練習の 時間に なりました',
    reviewDueBody: (topic: string) => `${topic}を 短く 練習しませんか?`,
    reviewStart: 'いま 練習する',
    reviewDismiss: 'あとで',
    noticeTitle: '本当の 個人情報の 書類は 出さないで ください',
    noticeBody:
      'デモでは 個人情報の ない 合成文書を 使って ください。本当の 書類を 出すと 写真が 外の AIに 送られます。',
  },

  capture: {
    title: '書類を 見せて ください',
    help: '書類 ぜんぶが 画面に 入るように 撮って ください。',
    takePhoto: '書類を 撮る',
    chooseFile: '画像を えらぶ',
    tryExample: 'サンプル文書で ためす',
    demoTitle: 'デモ用の 合成文書',
    demoHelp: '個人情報の ない 書類です。発表の デモに 使って ください。',
    selected: 'えらんだ 書類',
    analyze: 'この 書類で 確認する',
    preparing: '写真を 準備して います',
    errorTooLarge: (mb: number) => `ファイルが 大きすぎます。${mb}MB 以下に して ください。`,
    errorType: '写真ファイル(JPG、PNG、WEBP)だけ 使えます。',
    errorReadFailed: '写真を 読めませんでした。もう一度 お願いします。',
    cameraHint: '撮るボタンを おすと スマホの カメラが ひらきます。',
    privacyHint:
      '写真は この 機械で 小さくして、場所の 情報を 消してから 送ります。',
  },

  consent: {
    title: '書類を 見る まえに お知らせします',
    syntheticTitle: 'いまは 合成文書を 使います',
    syntheticBody:
      'デモでは 個人情報の ない にせの 書類だけ 使います。本当の 住民の 書類は 使いません。',
    uploadTitle: '出した 写真は AIの 分析に 使われます',
    uploadBody:
      'オンラインモードでは 写真が 外の AIサービスに 送られます。マイナンバーや 口座番号が ある 書類は 出さないで ください。',
    localTitle: 'ローカルモードでは 外に 出ません',
    localBody:
      'ローカルモードを えらぶと 写真は この コンピューターの 中の AIだけで 処理されます。',
    storageTitle: '保存は しません',
    storageBody:
      '書類の 写真と 読みとった 文は 保存しません。分析が おわると 消えます。',
    maskingTitle: 'まだ ない 機能も お知らせします',
    maskingBody:
      '機械の 中で 個人情報を 先に かくす 機能は まだ 作って いません。つぎの 段階で 作る 予定です。',
    agree: 'わかりました。つづける',
    declineToDemo: '同意しないで サンプル文書で ためす',
  },

  analyzing: {
    title: '書類を 確認して います',
    subtitle: 'すこし お待ち ください。',
    steps: {
      upload: '書類を 受けとって います。',
      classify: '書類の 種類を 確認して います。',
      dates: '大事な 日付を さがして います。',
      actions: 'することを まとめて います。',
    },
    done: 'おわりました',
    cancel: '分析を やめる',
    takingLong: 'すこし 時間が かかって います。',
    seeExample: 'サンプルの 結果を 見る',
    failedTitle: 'いまは オンライン分析が うまく いきません',
    failedBody: '安全な サンプル文書で つづけますか?',
    failedRetry: 'もう一度',
    failedUseFixture: 'サンプル文書で つづける',
    failedGoBack: 'さいしょへ',
  },

  confirm: {
    question: (type: string) => `この 書類は ${type}の ようです。`,
    from: (issuer: string) => `${issuer}から 届きました。`,
    ask: '合って いますか?',
    yes: 'はい、合って います',
    no: 'ちがいます',
    unsure: 'わかりません',
    changeTitle: '書類の 種類を えらんで ください',
    changeHelp: 'AIが まちがえたら 自分で えらべます。',
    types: {
      tax_notice: '税金',
      health_checkup: '健康診断',
      welfare_application: '福祉',
      utility_bill: '公共料金',
      public_office_notice: '市役所の お知らせ',
      pension_notice: '年金',
      court_notice: '裁判所・行政',
      other: 'そのほか',
      unknown: 'わかりません',
    },
  },

  guided: {
    heading: 'いっしょに 解決する',
    intro: '一度に ぜんぶ 見せません。一つずつ いっしょに 確認します。',
    understood: '確認しました',
    dontKnow: 'わかりません',
    explainAgain: 'もう一度 説明して ください',
    showOriginal: '原文で 見せて ください',
    whereToLook: 'どこを 見ますか',
    hideOriginal: '原文を とじる',

    typeTitle: 'まず どんな 書類か 見ます',
    typeBody: (label: string, issuer: string | null) =>
      issuer
        ? `${issuer}から 届いた ${label}です。`
        : `${label}です。出した ところは 書類で 確認できませんでした。`,
    typeWhere: '書類の 一番上の 名前と 題名を 見て ください。',

    dateTitle: 'つぎに 一番 大事な 日付を さがします',
    dateBody: (label: string, raw: string) => `${label}は ${raw}です。`,
    dateMissing: 'この 書類では 日付を 確認できませんでした。原文を もう一度 見て ください。',
    dateWhere: (label: string) => `表の 中で「${label}」と 書いて ある 行を 見て ください。`,

    amountTitle: '金額を 確認しましょう',
    amountBody: (label: string, raw: string) => `${label}は ${raw}です。`,
    amountMissing: 'この 書類には 金額が 書いて ありません。作りません。',
    amountWhere: (label: string) => `表の 中で「${label}」と 書いて ある 行を 見て ください。`,

    itemsTitle: '何を 用意するか 見ます',
    itemsBody: (items: string[]) => `持ちものは ${items.join('、')}です。`,
    itemsWhere: '表の 下の 持ちものの 案内を 見て ください。',

    actionsTitle: 'することを まとめました',
    actionsBody: (titles: string[]) =>
      titles.length > 0
        ? `できることは ${titles.length}つです。${titles.join(' / ')}`
        : 'この 書類で すぐ することは 見つかりませんでした。',

    contactTitle: 'どこに 聞くか 見ます',
    contactBody: (org: string, dept: string | null, phone: string | null) =>
      phone
        ? `${org}${dept ? ` ${dept}` : ''}、電話 ${phone}です。`
        : `${org}${dept ? ` ${dept}` : ''}です。電話番号は 書類で 確認できませんでした。`,
    contactMissing:
      '書類から 連絡先が 見つかりませんでした。番号を 想像して お伝えする ことは しません。',
    contactWhere: '書類の 下の 問い合わせ先を 見て ください。',

    doneTitle: '今日 することを ぜんぶ 確認しました',
    doneBody: 'あとの 手続きは ご自身で して ください。AIが 代わりに する ことは ありません。',
    finish: '解決しました',
    notYet: 'まだ できて いません',
  },

  complete: {
    title: '今日は AIと いっしょに 解決しました。',
    body: 'つぎは 同じ 種類の 書類を 自分で 確認できるように、短く 練習しませんか?',
    practiceNow: 'いま 練習する',
    practiceLater: 'あとで 練習する',
    tutorialOnly: '今日 学んだ 方法だけ 見る',
    scheduleTitle: 'いつ 練習しますか?',
    tonight: '今日の 夜',
    tomorrow: 'あした',
    scheduled: (label: string) => `${label}に 練習を お知らせします。`,
    scheduleHelp:
      'この ブラウザだけに 残る デモ用の お知らせです。本当の 通知は まだ ありません。',
    fastForward: '(デモ用) 今が 夜だと して 見る',
  },

  result: {
    title: '確認の 結果',
    summary: '一行の まとめ',
    dates: '大事な 日付',
    amounts: '金額',
    actions: 'すること',
    warnings: '注意',
    contacts: '公式の 連絡先',
    evidence: '原文の 根拠',
    uncertainty: '確認が 必要な ところ',
    notInDocument: '書類に 書いて ありません。',
    notInDocumentHelp: '書いて ない ことは 作りません。役所に 聞いて ください。',
    daysLeft: (days: number) => `今日から あと ${days}日 です。`,
    dueToday: '今日が さいごの 日です。',
    overdue: (days: number) => `期限を ${days}日 すぎて います。役所に 聞いて ください。`,
    saveDeadline: '期限を カレンダーに 入れる',
    saveDeadlineDone: 'カレンダーの ファイルを 保存しました。',
    seeEvidence: '根拠を 見る',
    requiredItems: '持ちもの',
    method: 'やり方',
    doNotDo: 'これは しないで ください',
    solveTogether: 'AIと いっしょに 解決する',
    seeTutorial: '今日 学んだ 方法を 見る',
    practiceSimilar: 'にた 書類で 練習する',
    reviewLater: 'あとで 練習する',
  },

  evidence: {
    title: '確認した 根拠',
    subtitle: '答えの もとに なった 原文です。',
    original: '書類に 書いて ある こと',
    translated: 'やさしい ことばで',
    explanation: 'どんな 意味ですか',
    location: '原文の 場所',
    page: (page: number) => `${page}ページ`,
    show: '原文の 場所を 見る',
    hide: '場所の 表示を 消す',
    none: 'この 内容は 原文の 根拠が 見つかりませんでした。',
    noRegion: '原文の 場所を 示せないので ことばだけ お見せします。',
    verifyOfficial: '公式の ところに 確認',
    unverifiedNote: '根拠が ない 内容は 確定した 事実として 表示しません。',
  },

  contact: {
    title: '公式の ところに 確認する',
    subtitle: '書類に 書いて ある 連絡先だけ お見せします。',
    organization: 'ところ',
    department: '担当',
    phone: '電話番号',
    hours: '受付時間',
    call: '電話を かける',
    callConfirmTitle: '電話を かけますか?',
    callConfirmBody: (phone: string) => `${phone} に 電話アプリを ひらきます。`,
    website: '公式サイト',
    openSite: 'サイトを ひらく',
    noneTitle: '書類から 連絡先が 見つかりませんでした',
    noneBody:
      '電話番号を 想像して お伝えする ことは しません。公式サイトで 番号を ご確認ください。',
    askTitle: '確認する ときに 聞く こと',
    howToFindTitle: '番号を 安全に さがす 方法',
  },

  tutorial: {
    listTitle: 'わたしの 書類マニュアル',
    listSubtitle: '経験した 書類の 種類ごとの 確認の 順番です。',
    empty: 'まだ マニュアルが ありません。書類を 一度 解決すると ここに 残ります。',
    emptyAction: 'いっしょに 解決する',
    purpose: 'この 書類は 何ですか',
    checkOrder: '確認する 順番',
    reason: 'どうして ですか',
    exampleLabel: '書類には こう 書いて あります',
    keyTerms: 'むずかしい ことばの 説明',
    japaneseTerm: '日本の 書類では',
    warnings: 'よく ある 問題',
    verification: '公式に 確認する 方法',
    privacyNote:
      'この マニュアルには 名前、住所、本当の 金額などの 個人情報は 入って いません。',
    practice: 'この 方法で 練習する',
    savedNotice: '今日 解決した 方法を マニュアルに 保存しました。',
  },

  practice: {
    title: '自分で やってみる',
    subtitle: '個人情報の ない にた 書類で 練習します。',
    chooseTitle: 'どの 書類で 練習しますか?',
    empty: 'まだ 練習できる 書類が ありません。先に 書類を 一度 解決して ください。',
    maskedNotice: '個人情報は ●●● で かくして あります',
    syntheticNotice: '本当の 書類では なく 新しく 作った 練習用の 書類です',
    yourTurnTitle: '今度は 自分で さがして みましょう',
    yourTurnBody: 'AIは 先に 答えを 言いません。こまった ときだけ ヒントが 出ます。',
    questionCount: (current: number, total: number) => `${total}問の うち ${current}問め`,
    needHint: 'ヒントが ほしいです',
    hintLabel: (step: number) => `ヒント ${step}`,
    hintLocation: 'どこを 見ますか',
    hintKeyword: 'どの ことばを さがしますか',
    hintAnswer: '根拠と 答え',
    noMoreHints: 'さいごの ヒントまで 見ました。',
    correct: '正解です',
    incorrect: 'もう一度 見て ください',
    tryAgain: 'もう一度 えらぶ',
    why: 'どうして ですか',
    nextQuestion: 'つぎの 問題',
    finish: '練習を おわる',

    levelTitle: 'いまの たすけの 量',
    levels: {
      guided: 'まねして やる',
      hinted: 'ヒント 練習',
      solo: '自分で やる',
      final_check: 'さいごの 確認だけ',
    },
    levelHelp: {
      guided: 'AIが 場所と 答えを いっしょに お知らせします。',
      hinted: 'まず 答えて みて、こまったら ヒントを 出します。',
      solo: 'AIは 質問だけ します。出した あとに 答えを 見ます。',
      final_check: 'まず 自分で 確認して、AIは 足りない ところだけ 言います。',
    },
    fadeNotice: 'つぎの 練習から たすけを すこし 減らします。',
    fadeHeld: '今回は たすけの 量を そのままに しました。ゆっくりで 大丈夫です。',
  },

  practiceResult: {
    title: '練習が おわりました',
    independent: '自分で できた もの',
    withHints: 'ヒントを 使った もの',
    remember: 'つぎに おぼえる こと',
    itemCount: (count: number) => `${count}こ`,
    noneIndependent: '今回は ヒントを 使いました。つぎは すこし かんたんに なります。',
    allIndependent: 'ヒントなしで ぜんぶ できました。',
    closing: 'つぎに にた 書類が 届いたら まず 期限から さがして みて ください。',
    againLater: 'また 練習する',
    seeTutorial: 'マニュアルを もう一度 見る',
    backHome: 'さいしょへ',
  },

  history: {
    title: 'これまでの 練習',
    subtitle: '練習した 書類の 種類と 結果です。',
    empty: 'まだ 練習の 記録が ありません。',
    documentType: '書類の 種類',
    when: '練習した とき',
    independentRate: '自分で できた 割合',
    hintsUsed: '使った ヒント',
    hintReduction: 'はじめより 減った ヒント',
    notEnough: '2回 以上 練習すると くらべられます。',
    noScoreNotice:
      'この 画面は 点数や 等級では ありません。つぎに 何を 確認すると よいかを 見る 記録です。',
    clear: '記録を 消す',
    clearConfirm: '練習の 記録を ぜんぶ 消しますか?',
  },

  lab: {
    title: '設定と モデル',
    subtitle: 'デモの 準備と モデル比較の ための 画面です。',
    providerLabel: '分析モード',
    providers: {
      openai: 'オンライン基本モード — OpenAI API',
      ollamaFast: '速い ローカルモード — Qwen3-VL 4B (おすすめ)',
      ollamaQuality: '高品質 ローカルモード — Qwen3-VL 8B (おそい ことが あります)',
      fixture: '安全な デモモード — Fixture Demo',
    },
    providerHelp: {
      openai: 'インターネットが 必要です。写真が 外の AIに 送られます。',
      ollamaFast: 'この コンピューターの 中で 処理します。8GB VRAMで 安定します。',
      ollamaQuality:
        '8GB VRAMでは おそく なる ことが あります。発表の 前に かならず ためして ください。',
      fixture: 'ネットワークが なくても ぜんぶの 流れを 見せられます。',
    },
    qualityWarning:
      '高品質 ローカルモードは 電源に つないで、ほかの GPUプログラムを 閉じた ときだけ 使って ください。ライブデモの 標準には しないで ください。',
    ollamaStatus: 'ローカルサーバーの 状態',
    ollamaReachable: 'つながって います',
    ollamaUnreachable: 'つながって いません。ollama serve が 動いて いるか 確認して ください。',
    installedModels: '入って いる モデル',
    keyStatus: 'APIキー',
    keySet: '設定されて います',
    keyMissing: 'ありません (.env.local に OPENAI_API_KEY を 入れて ください)',
    lastRun: 'さいごの 分析の 記録',
    attempts: '試行',
    elapsed: 'かかった 時間',
    schemaOk: 'スキーマ 通過',
    experimentTitle: '比較の 実験',
    conditionLabel: '実験の 条件',
    eventsTitle: '記録した イベント',
    eventCount: (n: number) => `${n}件`,
    downloadJson: 'JSONで ダウンロード',
    downloadCsv: 'CSVで ダウンロード',
    privacyNote:
      '書類の 画像、原文、個人情報は 記録しません。条件・時間・えらんだ もの・ヒントの 回数だけ 残ります。',
    resetProgress: '学習の 記録を 消す',
    resetProgressConfirm: 'たすけの 量と 練習の 記録を ぜんぶ 消しますか?',
  },

  errors: {
    noResult: '分析の 結果が ありません。さいしょから やり直して ください。',
    startOver: 'さいしょから',
    notFound: '画面が 見つかりません。',
  },

  humanReview: {
    title: '人の 確認が 必要です',
    body: 'この 書類は AIが はっきり 読めませんでした。原文を もう一度 見るか 公式の ところに 聞いて ください。',
  },

  goal: {
    statement:
      'AI Doorの 目標は 使う人が AIに ずっと たよる ことでは なく、同じ 種類の 書類を つぎは 自分で わかって 進められるように する ことです。',
  },
};
