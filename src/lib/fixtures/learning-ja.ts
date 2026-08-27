/**
 * Japanese manuals and practice sheets for the two demo tracks.
 *
 * Built through `localiseTutorial` / `localisePractice`, so the step order,
 * the question ids, which option is correct and which page block each hint
 * highlights all come from the Korean original and cannot drift.
 *
 * Only the two visible tracks are translated. The hidden health-checkup and
 * welfare documents stay Korean-only: they are not reachable from the picker,
 * and inventing Japanese for a document nobody can open would be work that
 * cannot be checked.
 */
import { localisePractice, localiseTutorial } from './localise-learning';
import { taxPractice, waterPractice } from './practice';
import { taxTutorial, utilityTutorial } from './tutorials';

export const taxTutorialJa = localiseTutorial(taxTutorial, {
  language: 'ja',
  title: '税金の 通知書が 届いた ときに 確認する 順番',
  purpose:
    '税金の 通知書は いくらを いつまでに 払うかを 知らせる 紙です。順番に 見れば むずかしく ありません。',
  checkOrder: [
    {
      title: 'どの 税金か 確認する',
      instruction: '「税目」の 欄を 見ます。',
      reason: '財産税か 自動車税かで、聞く 部署が ちがいます。',
    },
    {
      title: '自分あてで 合っているか 見る',
      instruction: '「課税対象」の 欄が 自分の 家、自分の 車か 見ます。',
      reason: '住所が 似ていて 他人の 通知書が 届く ことが あります。',
    },
    {
      title: '日付が いくつ あるか 数える',
      instruction: '「納期内」と「納期後」の 二つの 行を さがします。',
      reason:
        '一枚に 日付が 二つ あります。一つだと 思うと 金額を まちがえて 払います。',
    },
    {
      title: '自分が 払う 日の ほうの 金額を 見る',
      instruction: '今日 払うなら「納期内」の 行の 金額です。',
      reason: '二つの 金額は ちがいます。遅れると 下の 金額に なります。',
    },
    {
      title: '電子納付番号と 口座番号を 区別する',
      instruction: '「電子納付番号」は この 通知書 一枚だけの 番号です。',
      reason:
        '口座番号では ありません。この 番号に 送金しろと 言われたら 詐欺です。',
    },
    {
      title: 'おかしければ 払う 前に 聞く',
      instruction: '通知書に 印刷された 担当課の 番号に 電話します。',
      reason:
        '一度 払うと 戻すのが 大変です。ショートメールの 番号は 使わないで ください。',
    },
  ],
  keyTerms: [
    {
      term: '納期限',
      easyExplanation: 'この 日までに 払うと いう ことです。',
      translatedTerm: '납부기한',
    },
    {
      term: '加算金',
      easyExplanation: '期限を 過ぎると 増える お金です。',
      translatedTerm: '가산금',
    },
    {
      term: '税目',
      easyExplanation: 'どの 種類の 税金かを 言います。',
      translatedTerm: '세목',
    },
    {
      term: '電子納付番号',
      easyExplanation: '払う ときに 使う 番号です。口座番号では ありません。',
      translatedTerm: '전자납부번호',
    },
    {
      term: '異議申立',
      easyExplanation: '内容が ちがうと 思う ときに、見直しを 求める ことです。',
    },
  ],
  commonWarnings: [
    'ショートメールの リンクから すぐ 払わないで ください。',
    '個人の 口座に 送れと 言われたら 詐欺かも しれません。',
    '金額が 通知書と ちがう ときは 払わずに 先に 確認します。',
    'もう 払ったと 思う ときは、もう一度 払う 前に 担当課に 聞きます。',
  ],
  officialVerificationGuide: [
    '通知書の 下に ある 担当課の 番号を 確かめます。',
    '番号が ない ときは 役所の 名前で 検索して 公式サイトで さがします。',
    '電話では「通知書が 届いたので 内容を 確認したい」と 言えば 大丈夫です。',
  ],
});

export const utilityTutorialJa = localiseTutorial(utilityTutorial, {
  language: 'ja',
  title: '公共料金の 払込票が 届いた ときに 確認する 順番',
  purpose:
    'ガスや 水道の 用紙は、いくらを いつまでに、どこで 払えるかを 知らせる 紙です。払える 場所が 多いので むずかしく 感じるだけです。',
  checkOrder: [
    {
      title: 'どの 会社から 来たか 見る',
      instruction: '用紙の 一番上の 会社名を 見ます。',
      reason: 'ガスと 水道は 会社が ちがいます。聞く 先も ちがいます。',
    },
    {
      title: '遅れると どう なるか 読んで おく',
      instruction: '「延滞」または「延滞利息」と 書かれた 行を さがします。',
      reason:
        '遅れると お金が 増えますが、いくらかは 書いて いない ことが 多いです。その ときは 電話で 聞きます。',
    },
    {
      title: '払える 方法が いくつ あるか 数える',
      instruction: '「お支払い方法」の 下の 行を 数えます。',
      reason:
        'いくつ 書いて あっても 一つ だけで 大丈夫です。二か所で 払うと 二回 出ていきます。',
    },
    {
      title: 'バーコードが あるか 見る',
      instruction: '用紙の 下に 縞模様が あるか 確かめます。',
      reason:
        'バーコードが あれば レジや スマホの アプリが 読みます。番号を 打たなくて すみます。',
    },
    {
      title: 'アプリで 払うなら 先に 残高を 見る',
      instruction: 'アプリの 画面の「残高」を 見ます。',
      reason:
        'アプリの お金は 口座の お金では なく、先に 入れて おいた お金です。足りないと 払えません。',
    },
    {
      title: '「今すぐ払う」と「予約」を 区別する',
      instruction: '「今すぐ支払う」と「支払い予約」は ちがう ボタンです。',
      reason:
        '予約は まだ 払って いません。そして 一度 払うと アプリでは 取り消せません。',
    },
  ],
  keyTerms: [
    {
      term: '払込票',
      easyExplanation: '料金を 払う ための 紙です。この 紙 ごと 出します。',
      translatedTerm: '납부용지',
    },
    {
      term: 'ご請求金額',
      easyExplanation: '今回 払う お金です。',
      translatedTerm: '청구금액',
    },
    {
      term: 'お支払期限',
      easyExplanation: 'この 日までに 払うと いう ことです。',
      translatedTerm: '납부기한',
    },
    {
      term: '延滞利息',
      easyExplanation: '遅れて 払うと 増える お金です。',
      translatedTerm: '연체료',
    },
    {
      term: '口座振替',
      easyExplanation: '一度 申し込むと 次から 口座から 自動で 引かれます。',
      translatedTerm: '자동이체',
    },
    {
      term: '支払い予約',
      easyExplanation:
        'アプリで 払う 日を 先に 決めて おく ことです。まだ 払って いません。',
      translatedTerm: '결제 예약',
    },
  ],
  commonWarnings: [
    'アプリで「今すぐ支払う」を 押すと、たいてい 取り消せません。先に 金額を 見て ください。',
    '「支払い予約」は まだ 払って いません。その 日に 残高が 必要です。',
    'ショートメールの リンクでは なく、用紙の バーコードか 公式の アプリを 使います。',
    '一枚の 用紙を コンビニでも アプリでも 払うと 二回 出ていきます。一か所 だけに して ください。',
  ],
  officialVerificationGuide: [
    '用紙に 書かれた お客さまセンターの 番号を 確かめます。',
    '電話で「用紙が 届いたので 金額を 確認したい」と 言えば 大丈夫です。',
    'アプリの 画面が わからない ときは、押さずに 先に 聞きます。',
  ],
});

export const taxPracticeJa = localisePractice(taxPractice, {
  language: 'ja',
  title: '自動車税の お知らせで 練習する',
  topic: '地方税の お知らせで 納期限と 払い方',
  questions: {
    'q-deadline': {
      prompt: 'この 書類の 納期限は いつですか。',
      options: [
        {
          text: '2026年12月16日',
          feedback: '正解です。「納付期限」の 行に 書いて あります。',
        },
        {
          text: '2026年9月30日',
          feedback: 'その 日付は この 書類に ありません。表を もう一度 見て ください。',
        },
        {
          text: '書類に 書いて ありません',
          feedback: '表の 中に 期限が あります。もう一度 さがして ください。',
        },
      ],
      hints: {
        location: '書類の 真ん中の 表の 下の ほうを 見て ください。',
        keyword: '「納付期限」と 書かれた 行を さがして ください。',
        answer:
          'ここに「納付期限: 2026年12月16日」と 書いて あります。ですから 答えは 12月16日です。',
      },
      explanation:
        '期限は 書いて ある とおりに 読めば 大丈夫です。記憶や 見当に たよらないで ください。',
    },
    'q-amount': {
      prompt: 'いくら 払いますか。',
      options: [
        { text: '52,300ウォン', feedback: '正解です。「納付税額」の 行の 金額です。' },
        {
          text: '86,400ウォン',
          feedback: 'それは 前の 書類の 金額です。この 書類を もう一度 見て ください。',
        },
        {
          text: '加算金を 足して 計算します',
          feedback: '加算金は 期限を 過ぎた 後の 話です。今 払う 金額は 表に あります。',
        },
      ],
      hints: {
        location: '表の 期限の すぐ 上の 行を 見て ください。',
        keyword: '「納付税額」と 書かれた 行を さがして ください。',
        answer: 'ここに「納付税額: 52,300ウォン」と 書いて あります。',
      },
      explanation:
        '金額と 期限は いつも 同じ 表に 並んで います。二つ いっしょに 確認して ください。',
    },
    'q-safe-payment': {
      prompt:
        'ショートメールで「この リンクから すぐ 払って ください」と 来ました。どう しますか。',
      options: [
        {
          text: '書類に ある 区役所の 番号に 先に 確認する',
          feedback: '正解です。公式の 道すじで 先に 確かめるのが 安全です。',
        },
        {
          text: 'リンクを 押して すぐ 払う',
          feedback:
            'ショートメールの リンクは 詐欺かも しれません。リンクから 払わないで ください。',
        },
        {
          text: '家族に リンクを 代わりに 押して もらう',
          feedback: '他の 人が 押しても 危険は 同じです。先に 役所へ 確認します。',
        },
      ],
      hints: {
        location: '書類の 下の ほうに 何が 書いて あるか 見て ください。',
        keyword: '「問い合わせ」の 行と「納付方法」の 行を さがして ください。',
        answer:
          '書類には「納付方法: 銀行の 窓口 または 公式の 納付サイト」と 区役所の 問い合わせ先が あります。ショートメールの リンクでは なく この 道すじを 使います。',
      },
      explanation:
        '公式の 連絡先は 書類に 印刷されて います。あとから 届いた 番号や リンクより そちらが 確かです。',
    },
  },
});

export const waterPracticeJa = localisePractice(waterPractice, {
  language: 'ja',
  title: '水道料金の 用紙で 練習する',
  topic: '公共料金の 用紙で 金額、期限、払える 方法',
  questions: {
    'q-one-route': {
      prompt:
        'コンビニで 払ったのに、家に 帰って アプリで バーコードを また 読み取ると どう なりますか。',
      options: [
        {
          text: '二回 払う ことに なります。一か所 だけに します',
          feedback:
            '正解です。用紙には 払える 場所が いくつも 書いて ありますが、使うのは 一つ だけです。',
        },
        {
          text: '二回目は 自動で 取り消されます',
          feedback:
            'その ような 案内は 用紙に ありません。実際に 二回 引き落とされる ことが あります。',
        },
        {
          text: '早く 処理されます',
          feedback: '早く なりません。同じ 料金を 二回 払う ことに なります。',
        },
      ],
      hints: {
        location: '用紙の 下の「お支払い方法」の ところを 見て ください。',
        keyword: 'コンビニと アプリが べつべつに 書いて あるのを 確かめます。',
        answer:
          '「コンビニ・金融機関の窓口」と「スマホ決済アプリ」は べつの 方法です。両方 すると 二回 払います。',
      },
      explanation:
        '払える 場所が いくつも あるのは 選べと いう ことで、ぜんぶ しろと いう ことでは ありません。',
    },
    'q-deadline': {
      prompt: 'いつまでに 払いますか。',
      options: [
        {
          text: '2026年10月15日',
          feedback: '正解です。「お支払期限」の 行に 書いて あります。',
        },
        {
          text: '2026年4月30日',
          feedback:
            'その 日付は この 用紙に ありません。金額の 右を もう一度 見て ください。',
        },
        {
          text: '用紙に 書いて ありません',
          feedback: '金額の すぐ 右に 書いて あります。もう一度 さがして ください。',
        },
      ],
      hints: {
        location: '金額の すぐ 右を 見て ください。',
        keyword: '「お支払期限」と 書かれた 行を さがして ください。',
        answer:
          '「お支払期限 2026年10月15日」と 書いて あります。支払は 払う、期限は しめきりです。',
      },
      explanation:
        '金額と 期限は ほとんど いつも 並んで います。片方 見つかれば もう片方は すぐ 隣です。',
    },
    'q-payment': {
      prompt: '外に 出るのが むずかしいです。この 用紙で 払える 方法は 何ですか。',
      options: [
        {
          text: 'スマホの 決済アプリで 用紙の バーコードを 読み取る',
          feedback: '正解です。用紙に バーコード読み取りが できると 書いて あります。',
        },
        {
          text: '用紙の お客さま番号を ショートメールで 送る',
          feedback:
            'その 方法は 用紙に ありません。個人の 番号を メールで 送らないで ください。',
        },
        {
          text: '期限が 過ぎるまで 待って まとめて 払う',
          feedback: '期限を 過ぎると 延滞利息が つくと 書いて あります。',
        },
      ],
      hints: {
        location: '用紙の 下の「お支払い方法」の ところを 見て ください。',
        keyword: '「アプリ」や「バーコード」と いう 字を さがして ください。',
        answer:
          '「スマホ決済アプリの バーコード読み取りにも 対応しています」と 書いて あります。アプリで 読み取れば 出かけなくて すみます。',
      },
      explanation:
        '用紙に 書いて ある 方法の 中から 一つ 選べば 大丈夫です。書いて いない 方法は 使わないで ください。',
    },
  },
});
