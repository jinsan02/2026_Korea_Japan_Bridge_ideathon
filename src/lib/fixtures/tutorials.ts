/**
 * Document-type manuals - "오늘 배운 방법".
 *
 * These are the durable output of solving a document. Not "your tax was
 * 86,400원" but "here is the order you check a tax notice in, and why". That is
 * what transfers to the next envelope; a memorised figure does not.
 *
 * Nothing here contains personal data or any value from a user's own document.
 * Korean and Japanese label differences are carried in `keyTerms`, because the
 * same task uses different words on each side of the strait.
 */
import type { DocumentTypeId } from '@/lib/analysis/schema';
import type { DocumentTutorial } from '@/lib/learning/types';

const taxTutorial: DocumentTutorial = {
  documentType: 'tax_notice',
  country: 'KR',
  language: 'ko',
  title: '세금 안내문을 받았을 때 확인하는 순서',
  purpose:
    '세금 안내문은 얼마를 언제까지 내야 하는지 알려주는 문서입니다. 순서대로 보면 어렵지 않습니다.',
  checkOrder: [
    {
      order: 1,
      title: '어떤 세금인지 확인하기',
      instruction: '문서 위쪽의 제목과 "세목" 칸을 보세요.',
      reason: '재산세인지 자동차세인지에 따라 문의할 부서가 다릅니다.',
      exampleLabel: '세목',
    },
    {
      order: 2,
      title: '누가 내는 세금인지 확인하기',
      instruction: '"과세 대상"이나 받는 사람 이름을 보세요.',
      reason: '내 앞으로 온 것이 맞는지 먼저 확인해야 합니다.',
      exampleLabel: '과세 대상',
    },
    {
      order: 3,
      title: '납부 금액 확인하기',
      instruction: '"납부 세액" 칸의 숫자를 보세요.',
      reason: '금액이 예상과 다르면 납부하기 전에 물어봐야 합니다.',
      exampleLabel: '납부 세액',
    },
    {
      order: 4,
      title: '납부기한 확인하기',
      instruction: '"납부 기한" 칸의 날짜를 보고 달력에 적어 두세요.',
      reason: '기한이 지나면 가산금이 붙습니다. 가장 중요한 날짜입니다.',
      exampleLabel: '납부 기한',
    },
    {
      order: 5,
      title: '납부 방법 확인하기',
      instruction: '"납부 방법" 안내와 전자납부번호를 확인하세요.',
      reason: '공식 경로로 납부해야 안전합니다.',
      exampleLabel: '전자납부번호',
    },
    {
      order: 6,
      title: '궁금하면 공식 문의처로 확인하기',
      instruction: '문서 아래쪽의 담당 부서 전화번호로 물어보세요.',
      reason: '문자로 온 번호가 아니라 고지서에 적힌 번호가 안전합니다.',
      exampleLabel: '문의처',
    },
  ],
  keyTerms: [
    {
      term: '납부기한',
      easyExplanation: '이 날짜까지 내야 한다는 뜻입니다.',
      translatedTerm: '納期限',
    },
    {
      term: '가산금',
      easyExplanation: '기한이 지나면 더 붙는 돈입니다.',
      translatedTerm: '延滞金',
    },
    {
      term: '세목',
      easyExplanation: '어떤 종류의 세금인지를 말합니다.',
      translatedTerm: '税目',
    },
    {
      term: '전자납부번호',
      easyExplanation: '납부할 때 쓰는 번호입니다. 계좌번호가 아닙니다.',
      translatedTerm: '納付番号',
    },
    {
      term: '이의신청',
      easyExplanation: '내용이 잘못됐다고 생각할 때 다시 봐 달라고 하는 것입니다.',
    },
  ],
  commonWarnings: [
    '문자에 있는 링크로 바로 납부하지 마세요.',
    '개인 계좌로 보내라고 하면 사기일 수 있습니다.',
    '금액이 고지서와 다르면 납부하지 말고 먼저 확인하세요.',
    '이미 납부한 것 같으면 다시 내기 전에 담당 부서에 물어보세요.',
  ],
  officialVerificationGuide: [
    '고지서 아래쪽에 적힌 담당 부서 번호를 확인합니다.',
    '문서에 번호가 없으면 기관 이름을 검색해 공식 홈페이지에서 찾습니다.',
    '전화할 때 "고지서를 받았는데 내용을 확인하고 싶다"고 말하면 됩니다.',
  ],
  practiceScenarioIds: ['practice-kr-tax-auto'],
};

const healthTutorial: DocumentTutorial = {
  documentType: 'health_checkup',
  country: 'JP',
  language: 'ko',
  title: '건강검진 안내문을 받았을 때 확인하는 순서',
  purpose:
    '건강검진 안내문은 검진을 받으라는 안내입니다. 병에 걸렸다는 뜻이 아닙니다.',
  checkOrder: [
    {
      order: 1,
      title: '검진 안내인지 결과 통지인지 확인하기',
      instruction: '제목을 보세요. "안내", "お知らせ"이면 받으러 오라는 뜻입니다.',
      reason: '결과 통지와 혼동하면 불필요하게 걱정하게 됩니다.',
      exampleLabel: '特定健康診査のお知らせ',
    },
    {
      order: 2,
      title: '예약기한 확인하기',
      instruction: '"예약기한" 또는 "予約期限" 칸의 날짜를 보세요.',
      reason: '검진일보다 예약기한이 먼저 옵니다. 이 날짜를 놓치면 못 받습니다.',
      exampleLabel: '予約期限',
    },
    {
      order: 3,
      title: '검진일과 장소 확인하기',
      instruction: '"검진일", "健診日"과 "会場" 칸을 보세요.',
      reason: '날짜와 장소를 함께 확인해야 헛걸음하지 않습니다.',
      exampleLabel: '健診日',
    },
    {
      order: 4,
      title: '준비물과 금식 여부 확인하기',
      instruction: '"持ちもの", "준비물", "食事" 안내를 읽으세요.',
      reason: '금식을 안 지키면 검사를 못 받고 돌아올 수 있습니다.',
      exampleLabel: '当日の持ちもの',
    },
    {
      order: 5,
      title: '비용 확인하기',
      instruction: '"自己負担", "본인부담" 칸을 보세요.',
      reason: '무료인 경우가 많습니다. 돈을 요구하면 먼저 확인해야 합니다.',
      exampleLabel: '自己負担',
    },
    {
      order: 6,
      title: '공식 문의처로 확인하기',
      instruction: '"問い合わせ先", "문의처" 번호로 예약하거나 물어보세요.',
      reason: '약을 드시는 분은 미리 알려야 합니다.',
      exampleLabel: 'お問い合わせ',
    },
  ],
  keyTerms: [
    {
      term: '予約期限',
      easyExplanation: '이 날짜까지 예약해야 한다는 뜻입니다.',
      translatedTerm: '예약기한',
    },
    {
      term: '健診日',
      easyExplanation: '검진을 받는 날입니다.',
      translatedTerm: '검진일',
    },
    {
      term: '持ちもの',
      easyExplanation: '가져가야 하는 물건입니다.',
      translatedTerm: '준비물',
    },
    {
      term: '自己負担',
      easyExplanation: '본인이 내는 돈입니다. "なし"는 없다는 뜻입니다.',
      translatedTerm: '본인부담',
    },
    {
      term: '問い合わせ先',
      easyExplanation: '물어볼 곳, 문의처입니다.',
      translatedTerm: '문의처',
    },
  ],
  commonWarnings: [
    '이 문서는 검진 안내이지 진단서가 아닙니다.',
    '건강 상태에 관한 판단은 AI가 아니라 의료기관에 물어보세요.',
    '복용 중인 약을 스스로 중단하지 마세요. 먼저 알려야 합니다.',
    '금식 시간은 문서에 적힌 대로 지키세요.',
  ],
  officialVerificationGuide: [
    '안내문에 적힌 담당 과의 번호로 전화합니다.',
    '예약할 때 검진일, 시간, 준비물, 금식 시간을 다시 확인합니다.',
    '약을 드시는 경우 그 사실을 예약할 때 말합니다.',
  ],
  practiceScenarioIds: ['practice-jp-health'],
};

const welfareTutorial: DocumentTutorial = {
  documentType: 'welfare_application',
  country: 'KR',
  language: 'ko',
  title: '복지 안내문을 받았을 때 확인하는 순서',
  purpose:
    '복지 안내문은 신청할 수 있는 제도를 알려주는 문서입니다. 자동으로 주어지지 않고 신청해야 합니다.',
  checkOrder: [
    {
      order: 1,
      title: '어떤 제도인지 확인하기',
      instruction: '제목과 "지원 내용" 칸을 보세요.',
      reason: '이름이 비슷한 제도가 많아서 헷갈리기 쉽습니다.',
      exampleLabel: '지원 내용',
    },
    {
      order: 2,
      title: '신청 대상인지 확인하기',
      instruction: '"신청 대상" 칸의 조건을 읽으세요.',
      reason: '조건에 맞지 않으면 신청해도 받을 수 없습니다.',
      exampleLabel: '신청 대상',
    },
    {
      order: 3,
      title: '신청 기한 확인하기',
      instruction: '"신청 기간" 칸의 날짜를 보세요.',
      reason: '기한이 지나면 다음 모집까지 기다려야 합니다.',
      exampleLabel: '신청 기간',
    },
    {
      order: 4,
      title: '준비 서류 확인하기',
      instruction: '"준비하실 서류" 목록을 하나씩 확인하세요.',
      reason: '서류가 빠지면 다시 가야 합니다.',
      exampleLabel: '준비하실 서류',
    },
    {
      order: 5,
      title: '신청 장소 확인하기',
      instruction: '"신청 장소" 칸을 보세요.',
      reason: '주소지 주민센터에서만 되는 경우가 많습니다.',
      exampleLabel: '신청 장소',
    },
    {
      order: 6,
      title: '모르면 주민센터에 물어보기',
      instruction: '"문의처" 번호로 대상이 맞는지 미리 물어보세요.',
      reason: '대상 여부는 기관이 판단합니다. 혼자 단정하지 않아도 됩니다.',
      exampleLabel: '문의처',
    },
  ],
  keyTerms: [
    { term: '신청 대상', easyExplanation: '누가 신청할 수 있는지를 말합니다.' },
    {
      term: '신청 기간',
      easyExplanation: '언제부터 언제까지 신청할 수 있는지입니다.',
    },
    {
      term: '심사',
      easyExplanation: '기관이 조건에 맞는지 확인하는 과정입니다.',
    },
    {
      term: '개별 통지',
      easyExplanation: '결과를 각자에게 따로 알려준다는 뜻입니다.',
    },
    {
      term: '가구원',
      easyExplanation: '함께 사는 가족을 말합니다.',
    },
  ],
  commonWarnings: [
    '지원 금액이 적혀 있지 않으면 짐작하지 마세요. 심사 후에 정해집니다.',
    '신청하지 않으면 자동으로 받을 수 없습니다.',
    '전화로 계좌번호나 주민등록번호를 요구하면 응하지 마세요.',
    '대상이 아닌 것 같아도 주민센터에 한 번 물어보는 것이 좋습니다.',
  ],
  officialVerificationGuide: [
    '안내문에 적힌 주민센터 복지 담당 번호로 전화합니다.',
    '"이 안내문을 받았는데 제가 대상인지 알고 싶다"고 말하면 됩니다.',
    '방문 전에 준비 서류를 다시 한 번 확인합니다.',
  ],
  practiceScenarioIds: ['practice-kr-welfare'],
};

export const DOCUMENT_TUTORIALS: readonly DocumentTutorial[] = [
  taxTutorial,
  healthTutorial,
  welfareTutorial,
];

export function getTutorial(
  documentType: DocumentTypeId,
): DocumentTutorial | undefined {
  return DOCUMENT_TUTORIALS.find(
    (tutorial) => tutorial.documentType === documentType,
  );
}
