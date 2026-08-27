/**
 * Japanese readings of the two demo documents.
 *
 * Built with `localise`, so every number, date, evidence link and confidence
 * is the Korean version's - only the words a person reads are different. If a
 * row is added to a demo analysis and no Japanese wording is supplied for it,
 * the build fails rather than the toggle showing a blank label on stage.
 *
 * The two demos are separate tracks, and translation is all that crosses
 * between them. Track 1 is a Korean pensioner with a Korean tax notice; its
 * Japanese version exists so a Japanese speaker can follow along, not because
 * a Japanese reader would ever receive that notice. Track 2 is a Japanese
 * pensioner with a Japanese gas bill, and its Japanese text is the original -
 * the Korean is the translation.
 *
 * Written in やさしい日本語: short sentences, common words, spaces between
 * phrases, and no honorific compression that a non-native reader has to unpack.
 */
import type { ModelAnalysis } from '@/lib/analysis/schema';

import { krTaxAnalysisKo } from './demo-kr-tax';
import { jpAppAnalysisKo, jpGasAnalysisKo } from './demo-jp-utility';
import { localise } from './localise';

/** The Korean tax notice, followed along by a Japanese speaker. */
export const krTaxAnalysisJa: ModelAnalysis = localise(krTaxAnalysisKo, {
  language: 'ja',
  documentTypeLabel: '地方税の 納税通知書 (韓国)',
  title: '2026年 定期分 財産税の 納税通知書',
  summary: '財産税 86,400ウォンを 9月30日までに 払う 通知です。',
  dates: {
    'd-inside': '納期内',
    'd-after': '納期後',
  },
  amounts: {
    'am-inside': '納期内の 税額',
  },
  actions: {
    'act-dates': {
      title: '日付が 二つ ある わけ',
      description: '9月30日までは 86,400ウォンです。過ぎると 金額が 変わります。',
      requiredItems: ['納税通知書'],
      method: ['上の 欄が 納期内、下の 欄が 納期後です。'],
    },
    'act-paynum': {
      title: '電子納付番号で 払う',
      description: 'これは 口座番号では ありません。この 通知書だけの 番号です。',
      requiredItems: ['納税通知書'],
      method: [
        '窓口なら 通知書を そのまま 出します。',
        'ATMや ネットは この 番号を 入れます。',
      ],
    },
    'act-contact': {
      title: 'おかしいと 思ったら 払う 前に 聞く',
      description: '一度 払うと 戻すのが 大変です。先に 税務課へ 電話します。',
      requiredItems: ['納税通知書'],
      method: ['通知書の 下に ある 問い合わせ先に 電話します。'],
    },
  },
  payments: {
    'pay-bank': { label: '全国の 銀行の 窓口', note: '通知書を そのまま 出します' },
    'pay-post': { label: '郵便局の 窓口', note: null },
    'pay-atm': { label: 'ATM', note: '電子納付番号を 入れます' },
    'pay-net': { label: 'インターネットバンキング', note: null },
    'pay-portal': { label: 'WeTax (自治体の 納付サイト)', note: '07:00~23:30' },
    'pay-card': { label: 'クレジットカード', note: null },
  },
  warnings: {
    'two-deadlines':
      'この 通知書には 日付が 二つ あります。9月30日を 過ぎると 払う 金額が 変わります。',
  },
  evidence: {
    'ev-type': '納税通知書 兼 領収証です。払うと この 紙が 領収証に なります。',
    'ev-amount': '9月30日までに 払った ときだけ この 金額です。',
    'ev-deadline': '本来の 期限です。この 日までが 一番 安く すみます。',
    'ev-afterdate': '遅れて 払う ときの 日付です。金額が 増えます。',
    'ev-after-blank': '遅れた ときの 金額は 数字が なく、裏面を 見てと だけ あります。',
    'ev-paynum': '口座番号では ありません。この 通知書 一枚だけの 番号です。',
    'ev-place': 'ここでは 通知書を そのまま 出せば 係の 人が やって くれます。',
    'ev-epay': 'WeTaxは 地方税を 払う 公式の サイトの 名前です。',
    'ev-surcharge': '加算税は 遅れた ときに 増える お金です。割合が 一か所 空いて います。',
    'ev-contact': '通知書に 印刷された 番号です。ショートメールの 番号より 安全です。',
  },
  translations: {
    'ev-type': '地方税の 納税通知書 兼 領収証',
    'ev-amount': '納期内の 税額 86,400ウォン',
    'ev-deadline': '納期内: 2026.09.30まで',
    'ev-afterdate': '納期後: 2026.10.31まで',
    'ev-after-blank': '納期後の 税額: 裏面の 日別金額を ご覧ください',
    'ev-paynum': '電子納付番号 0000-0000-0000-0000',
    'ev-place': '全国の 銀行、郵便局の 窓口で 払えます。',
    'ev-epay': '電子納付: ネットバンキング · ATM · WeTax(07:00~23:30) · クレジットカード',
    'ev-surcharge': '期限を 過ぎると 地方税額の 3%が 加わり、1か月ごとに (   )%が 追加されます。',
    'ev-contact': '電話 02-0000-0000',
  },
  uncertainty: [
    '遅れて 払う ときの 金額は 通知書に 書いて ありません。',
    '加算税の 割合が 一か所 空いて いて、いくらか わかりません。',
  ],
});

/**
 * The Japanese gas slip, in its own language.
 *
 * This is the version its actual reader sees, so it explains the phone and
 * leaves the yen alone.
 */
export const jpGasAnalysisJa: ModelAnalysis = localise(jpGasAnalysisKo, {
  language: 'ja',
  documentTypeLabel: 'ガス料金の 払込票',
  summary: 'ガス料金 8,181円を 4月30日までに 払う 用紙です。',
  dates: { 'd-due': 'お支払期限' },
  amounts: { 'am-due': 'ご請求金額' },
  actions: {
    'act-one-route': {
      title: '払い方を 一つだけ 選ぶ',
      description: 'コンビニでも アプリでも 払うと、二回 払う ことに なります。',
      requiredItems: ['払込票'],
      method: [
        'コンビニは 用紙ごと レジに 出します。',
        'アプリは 下の バーコードを 読み取ります。どちらか 一つです。',
      ],
    },
    'act-auto': {
      title: '来月から 自動で 引き落とす 申し込み',
      description: '一度 申し込むと 毎月 口座から 自動で 引かれます。',
      requiredItems: ['払込票', '通帳'],
      method: ['用紙の お客さまセンターに 電話して 申し込みます。'],
    },
    'act-late': {
      title: '遅れた ときの 額は 電話で 聞く',
      description: '延滞利息が つくと あるだけで、金額は 書いて ありません。',
      requiredItems: ['払込票'],
      method: ['用紙の お客さまセンターに 電話します。'],
    },
  },
  payments: {
    'pay-cvs': { label: 'コンビニ', note: '用紙を そのまま 出します' },
    'pay-counter': { label: '金融機関の 窓口', note: null },
    'pay-atm': { label: 'ATM', note: null },
    'pay-app': { label: 'スマホ決済アプリ', note: '用紙の バーコードを 読み取ります' },
    'pay-net': { label: 'インターネットバンキング', note: '申し込みが 必要です' },
    'pay-auto': { label: '口座振替', note: '申し込みが 必要です' },
  },
  warnings: {
    'double-payment':
      '一枚の 用紙で コンビニと アプリの 両方で 払うと、二回 払う ことに なります。',
  },
  evidence: {
    'ev-type': 'この 用紙 そのものが 支払いの 手段です。払う 前に 捨てないで ください。',
    'ev-issuer': 'この 料金を 請求した 会社です。問い合わせも ここです。',
    'ev-amount': 'アプリや レジで この 金額が そのまま 出れば 合って います。',
    'ev-deadline': 'この 日を 過ぎると 延滞利息が つきはじめます。',
    'ev-store': 'ここでは 用紙を そのまま 出せば 係の 人が やって くれます。',
    'ev-app': '家からでも 払えると いう ことです。アプリに 入れて おいた お金で 払います。',
    'ev-transfer': '一度 申し込むと 次から 口座から 自動で 引かれます。',
    'ev-late': '遅れると 増えますが、いくらかは 書いて ありません。',
    'ev-contact': '用紙に 印刷された 番号です。問い合わせは ここへ。',
    'ev-barcode': 'この 縞を 機械が 読みます。番号を 手で 入れなくて すみます。',
  },
  // The quotes are already Japanese; a Japanese "translation" of them is noise.
  translations: {
    'ev-type': null,
    'ev-issuer': null,
    'ev-amount': null,
    'ev-deadline': null,
    'ev-store': null,
    'ev-app': null,
    'ev-transfer': null,
    'ev-late': null,
    'ev-contact': null,
    'ev-barcode': null,
  },
  uncertainty: ['遅れた ときの 延滞利息の 金額は 用紙に 書いて ありません。'],
});

/** The payment app screen, in its own language. */
export const jpAppAnalysisJa: ModelAnalysis = localise(jpAppAnalysisKo, {
  language: 'ja',
  documentTypeLabel: '決済アプリの 画面',
  summary: '今 払うか、日にちを 決めて おくかを 選ぶ 画面です。',
  dates: { 'd-due': 'お支払期限' },
  amounts: {
    'am-due': '払う 金額',
    'am-balance': 'アプリに 入れて ある お金',
  },
  actions: {
    'act-timing': {
      title: '「今すぐ」と「予約」の ちがいを 知る',
      description: '予約は まだ 払って いません。決めた 日に 自動で 出ていきます。',
      requiredItems: [],
      method: [
        '上の 青い ボタンは 押した ときに 出ていきます。',
        '下の ボタンは 日にちを 決めるだけです。',
      ],
    },
    'act-balance': {
      title: 'アプリの お金が 足りるか 見る',
      description: 'これは 口座では なく、アプリに 先に 入れて おいた お金です。',
      requiredItems: [],
      method: ['残高が 払う 金額より 少ないと 先に 入れる 必要が あります。'],
    },
    'act-nocancel': {
      title: '押す 前に 一度 止まる',
      description: 'この アプリは 払った 後は 取り消せないと 書いて あります。',
      requiredItems: ['払込票'],
      method: ['紙の 用紙の 金額と 画面の 金額が 同じか 見てから 押します。'],
    },
  },
  payments: {},
  warnings: {
    'no-cancel': 'この 画面には 払った 後は 取り消せないと 書いて あります。',
  },
  evidence: {
    'ev-screen': '請求書を アプリで 払う 画面です。まだ 払っては いません。',
    'ev-payee': '紙の 用紙に ある 会社と 同じか 確かめる ところです。',
    'ev-amount': '紙の 用紙の 金額と 同じで なければ なりません。ちがえば 押さないで ください。',
    'ev-due': 'いつまでに 払うかです。',
    'ev-balance': '口座の 残高では ありません。アプリに 先に 入れて おいた お金です。',
    'ev-btn-now': '押した ときに お金が 出ていきます。確認の 画面が もう一度 出ない ことも あります。',
    'ev-btn-later': '日にちを 決めるだけです。この ときは まだ お金は 出ていきません。',
    'ev-caution': 'まちがえて 押しても アプリでは 戻せません。会社に 電話する ことに なります。',
    'ev-reserve': '予約を 選ぶと カレンダーが 出ます。その 日に 残高が 必要です。',
  },
  translations: {
    'ev-screen': null,
    'ev-payee': null,
    'ev-amount': null,
    'ev-due': null,
    'ev-balance': null,
    'ev-btn-now': null,
    'ev-btn-later': null,
    'ev-caution': null,
    'ev-reserve': null,
  },
  uncertainty: ['この 画面だけでは まだ 決済は 終わって いません。'],
});
