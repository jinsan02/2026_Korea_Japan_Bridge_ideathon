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
 *
 * A step earns its place by being something the reader could get wrong. "Find
 * the amount" is not a step - a person who has paid bills for forty years can
 * find the amount. "Count how many dates this notice has" is a step, because
 * a notice with two deadlines and two different totals is where people
 * actually go wrong.
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
      instruction: '"세목" 칸을 보세요.',
      reason: '재산세인지 자동차세인지에 따라 물어볼 부서가 다릅니다.',
      exampleLabel: '세목',
    },
    {
      order: 2,
      title: '내 앞으로 온 것이 맞는지 보기',
      instruction: '"과세 대상" 칸이 내 집, 내 차가 맞는지 보세요.',
      reason: '주소가 비슷해 남의 고지서가 오는 일이 있습니다.',
      exampleLabel: '과세 대상',
    },
    {
      order: 3,
      title: '날짜가 몇 개인지 세어 보기',
      instruction: '"납기 내"와 "납기 후" 두 줄을 찾으세요.',
      reason:
        '고지서 한 장에 날짜가 두 개입니다. 이걸 하나로 보면 금액을 잘못 냅니다.',
      exampleLabel: '납기 내 / 납기 후',
    },
    {
      order: 4,
      title: '내가 낼 날짜 쪽 금액 보기',
      instruction: '오늘 낸다면 "납기 내" 줄의 금액입니다.',
      reason: '두 금액이 다릅니다. 늦게 내면 아래쪽 금액이 됩니다.',
      exampleLabel: '납기 내 세액',
    },
    {
      order: 5,
      title: '전자납부번호와 계좌번호 구분하기',
      instruction: '"전자납부번호"는 이 고지서 한 장에만 쓰는 번호입니다.',
      reason:
        '계좌번호가 아닙니다. 누가 이 번호로 송금하라고 하면 그건 사기입니다.',
      exampleLabel: '전자납부번호',
    },
    {
      order: 6,
      title: '이상하면 내기 전에 물어보기',
      instruction: '고지서에 인쇄된 담당 부서 번호로 전화하세요.',
      reason: '한 번 내면 되돌리기 어렵습니다. 문자로 온 번호는 쓰지 마세요.',
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

const utilityTutorial: DocumentTutorial = {
  documentType: 'utility_bill',
  country: 'JP',
  language: 'ko',
  title: '공공요금 납부용지를 받았을 때 확인하는 순서',
  purpose:
    '가스·수도 요금 용지는 얼마를 언제까지, 어디서 낼 수 있는지 알려주는 종이입니다. 낼 곳이 여러 군데라서 어렵게 느껴질 뿐입니다.',
  checkOrder: [
    {
      order: 1,
      title: '어느 회사에서 온 것인지 보기',
      instruction: '용지 맨 위의 회사 이름을 보세요.',
      reason: '가스와 수도는 회사가 다릅니다. 물어볼 곳도 다릅니다.',
      exampleLabel: '○○ガス / ○○水道局',
    },
    {
      order: 2,
      title: '늦으면 어떻게 되는지 읽어 두기',
      instruction: '"延滞" 또는 "延滞利息"이라고 적힌 줄을 찾으세요.',
      reason:
        '늦으면 돈이 더 붙지만 얼마인지는 대개 적혀 있지 않습니다. 그럴 땐 전화로 묻습니다.',
      exampleLabel: '延滞利息',
    },
    {
      order: 3,
      title: '낼 수 있는 방법이 몇 가지인지 세기',
      instruction: '"お支払い方法" 아래 줄들을 세어 보세요.',
      reason:
        '여러 가지가 적혀 있어도 하나만 하면 됩니다. 두 군데서 내면 두 번 나갑니다.',
      exampleLabel: 'お支払い方法',
    },
    {
      order: 4,
      title: '바코드가 있는지 보기',
      instruction: '용지 아래쪽에 줄무늬가 있는지 확인하세요.',
      reason: '바코드가 있으면 계산대나 휴대폰 앱이 읽습니다. 숫자를 칠 필요가 없습니다.',
      exampleLabel: 'バーコード',
    },
    {
      order: 5,
      title: '앱으로 낼 때는 앱 안의 돈을 먼저 보기',
      instruction: '앱 화면의 "残高"를 보세요.',
      reason:
        '앱의 돈은 통장 돈이 아니라 미리 넣어 둔 돈입니다. 모자라면 결제가 안 됩니다.',
      exampleLabel: 'ご利用可能残高',
    },
    {
      order: 6,
      title: '「지금 내기」와 「예약」 구분하기',
      instruction: '"今すぐ支払う"와 "支払い予約"은 다른 버튼입니다.',
      reason:
        '예약은 아직 낸 것이 아닙니다. 그리고 한 번 내면 앱에서 취소할 수 없습니다.',
      exampleLabel: '今すぐ支払う / 支払い予約',
    },
  ],
  keyTerms: [
    {
      term: '납부용지',
      easyExplanation: '요금을 내라고 보내는 종이입니다. 이 종이 자체를 내면 됩니다.',
      translatedTerm: '払込票',
    },
    {
      term: '청구금액',
      easyExplanation: '이번에 내야 하는 돈입니다.',
      translatedTerm: 'ご請求金額',
    },
    {
      term: '납부기한',
      easyExplanation: '이 날짜까지 내야 한다는 뜻입니다.',
      translatedTerm: 'お支払期限',
    },
    {
      term: '연체료',
      easyExplanation: '늦게 내면 더 붙는 돈입니다.',
      translatedTerm: '延滞利息',
    },
    {
      term: '자동이체',
      easyExplanation: '한 번 신청해 두면 다음부터 통장에서 저절로 빠져나갑니다.',
      translatedTerm: '口座振替',
    },
    {
      term: '결제 예약',
      easyExplanation: '앱에서 낼 날짜를 미리 정해 두는 것입니다. 아직 낸 것은 아닙니다.',
      translatedTerm: '支払い予約',
    },
  ],
  commonWarnings: [
    '앱에서 "지금 결제"를 누르면 대부분 취소할 수 없습니다. 금액을 먼저 보세요.',
    '"결제 예약"은 아직 낸 것이 아닙니다. 그날 잔액이 있어야 합니다.',
    '문자로 온 링크가 아니라 용지의 바코드나 공식 앱을 쓰세요.',
    '한 용지를 편의점에서도 내고 앱에서도 내면 두 번 낼 수 있습니다. 한 곳만 쓰세요.',
  ],
  officialVerificationGuide: [
    '용지에 적힌 고객센터 번호를 확인합니다.',
    '전화해서 "용지를 받았는데 금액을 확인하고 싶다"고 말하면 됩니다.',
    '앱 화면이 이해되지 않으면 결제를 누르지 말고 먼저 물어봅니다.',
  ],
  practiceScenarioIds: ['practice-jp-water'],
};

export const DOCUMENT_TUTORIALS: readonly DocumentTutorial[] = [
  taxTutorial,
  utilityTutorial,
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
