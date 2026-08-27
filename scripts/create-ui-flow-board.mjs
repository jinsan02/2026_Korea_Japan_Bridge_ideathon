import sharp from 'sharp';

const [outputPath, locale, ...screenPaths] = process.argv.slice(2);

if (!outputPath || !['ko', 'ja'].includes(locale) || screenPaths.length !== 5) {
  throw new Error(
    'Usage: node create-ui-flow-board.mjs OUTPUT ko|ja SCREEN1 SCREEN2 SCREEN3 SCREEN4 SCREEN5',
  );
}

const copy = {
  ko: {
    kicker: 'AI DOOR · WORKFLOW · KO',
    title: 'AI와 함께 배우고, 다음에는 스스로',
    subtitle: '공문서 이해부터 반복 연습까지 이어지는 포용적 AI 경험',
    stages: [
      ['시작', '도움 방식을 선택해요'],
      ['문서 촬영', '공문서를 보여줘요'],
      ['AI 확인', '종류와 기관을 확인해요'],
      ['같이 해결', '한 단계씩 처리해요'],
      ['혼자 연습', '힌트 없이 다시 해봐요'],
    ],
    paletteTitle: 'Rose White 중심의 명확한 색 체계',
    paletteBody:
      '모든 글자는 검정색 · Light Pink와 Blush Mist는 버튼, 선택, 강조에만 사용',
  },
  ja: {
    kicker: 'AI DOOR · WORKFLOW · JA',
    title: 'AIと いっしょに 学び、つぎは 自分で',
    subtitle: '行政の 書類を 理解して、くり返し 練習する インクルーシブAI',
    stages: [
      ['スタート', '助け方を 選びます'],
      ['書類を 撮影', '書類を 見せます'],
      ['AIで 確認', '種類と 発行元を 確認'],
      ['いっしょに 解決', '一つずつ 進めます'],
      ['自分で 練習', 'ヒントなしで 練習'],
    ],
    paletteTitle: 'Rose Whiteを 中心にした 色の 使い方',
    paletteBody:
      '文字は すべて 黒 · Light Pinkと Blush Mistは ボタン・選択・強調だけ',
  },
}[locale];

const WIDTH = 1920;
const HEIGHT = 1080;
const SCREEN_WIDTH = 270;
const SCREEN_HEIGHT = 399;
const SCREEN_Y = 216;
const FRAME_PADDING = 10;
const FRAME_WIDTH = SCREEN_WIDTH + FRAME_PADDING * 2;
const FRAME_HEIGHT = SCREEN_HEIGHT + FRAME_PADDING * 2;
const GAP = 48;
const TOTAL_WIDTH = FRAME_WIDTH * 5 + GAP * 4;
const START_X = Math.round((WIDTH - TOTAL_WIDTH) / 2);

const palette = [
  ['Rose White', '#FFF8FB', locale === 'ko' ? '메인' : 'メイン'],
  ['Black', '#000000', locale === 'ko' ? '글자' : '文字'],
  ['Light Pink', '#F7C6D9', locale === 'ko' ? '버튼' : 'ボタン'],
  ['Blush Mist', '#FCE7F0', locale === 'ko' ? '선택·강조' : '選択・強調'],
  ['Deep Rose', '#9E2F61', locale === 'ko' ? '선·아이콘' : '線・アイコン'],
  ['Mulberry', '#7A1F49', locale === 'ko' ? '강한 선' : '強い 線'],
];

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const svg = (body) =>
  Buffer.from(`
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .cjk { font-family: "Malgun Gothic", "Yu Gothic", "Meiryo", "Noto Sans CJK KR", "Noto Sans CJK JP", sans-serif; }
      .en { font-family: Inter, Arial, sans-serif; }
    </style>
    ${body}
  </svg>
`);

const roundedMask = Buffer.from(`
  <svg width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${SCREEN_WIDTH}" height="${SCREEN_HEIGHT}" rx="22" fill="white"/>
  </svg>
`);

const screenBuffers = [];
for (const path of screenPaths) {
  const metadata = await sharp(path).metadata();
  const cropWidth = Math.min(480, metadata.width ?? 480);
  const cropHeight = Math.min(710, metadata.height ?? 710);
  const left = Math.max(0, Math.floor(((metadata.width ?? cropWidth) - cropWidth) / 2));

  const clipped = await sharp(path)
    .extract({ left, top: 0, width: cropWidth, height: cropHeight })
    .resize(SCREEN_WIDTH, SCREEN_HEIGHT, { fit: 'cover', position: 'top' })
    .composite([{ input: roundedMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  screenBuffers.push(clipped);
}

const result = await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 3,
    background: '#FFF8FB',
  },
})
  .composite([
    {
      input: svg(`
        <path d="M0 710 C400 655 665 746 956 702 C1260 656 1530 705 1920 652 L1920 1080 L0 1080 Z" fill="#FFFFFF" opacity="0.7"/>

        <text x="176" y="75" class="en" fill="#000000" font-size="22" font-weight="800" letter-spacing="2">${escapeXml(copy.kicker)}</text>
        <text x="176" y="124" class="cjk" fill="#000000" font-size="42" font-weight="800">${escapeXml(copy.title)}</text>
        <text x="176" y="159" class="cjk" fill="#000000" font-size="21">${escapeXml(copy.subtitle)}</text>

        ${copy.stages
          .map(([title, description], index) => {
            const x = START_X + index * (FRAME_WIDTH + GAP);
            const center = x + FRAME_WIDTH / 2;
            return `
              <circle cx="${x + 22}" cy="194" r="19" fill="#F7C6D9" stroke="#9E2F61" stroke-width="2"/>
              <text x="${x + 22}" y="201" class="en" text-anchor="middle" fill="#000000" font-size="18" font-weight="800">${index + 1}</text>
              <text x="${x + 51}" y="201" class="cjk" fill="#000000" font-size="23" font-weight="800">${escapeXml(title)}</text>
              <rect x="${x}" y="${SCREEN_Y}" width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}" rx="31" fill="#FFF8FB" stroke="#9E2F61" stroke-width="3"/>
              <text x="${center}" y="662" class="cjk" text-anchor="middle" fill="#000000" font-size="18" font-weight="700">${escapeXml(description)}</text>
              ${
                index < 4
                  ? `<path d="M${x + FRAME_WIDTH + 12} 422 H${x + FRAME_WIDTH + GAP - 14}" stroke="#9E2F61" stroke-width="4" stroke-linecap="round"/><path d="M${x + FRAME_WIDTH + GAP - 24} 412 L${x + FRAME_WIDTH + GAP - 14} 422 L${x + FRAME_WIDTH + GAP - 24} 432" fill="none" stroke="#9E2F61" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
                  : ''
              }
            `;
          })
          .join('')}

        <text x="72" y="755" class="en" fill="#000000" font-size="20" font-weight="800" letter-spacing="2">COLOR SYSTEM</text>
        <text x="72" y="793" class="cjk" fill="#000000" font-size="30" font-weight="800">${escapeXml(copy.paletteTitle)}</text>
        <text x="72" y="824" class="cjk" fill="#000000" font-size="18">${escapeXml(copy.paletteBody)}</text>

        ${palette
          .map(([name, code, role], index) => {
            const cardWidth = 276;
            const cardGap = 20;
            const x = 72 + index * (cardWidth + cardGap);
            return `
              <rect x="${x}" y="854" width="${cardWidth}" height="142" rx="20" fill="#FFF8FB" stroke="#D8C5CE" stroke-width="2"/>
              <rect x="${x + 18}" y="874" width="50" height="50" rx="12" fill="${code}" stroke="${code === '#FFF8FB' ? '#D8C5CE' : code}" stroke-width="2"/>
              <text x="${x + 82}" y="896" class="en" fill="#000000" font-size="18" font-weight="800">${name}</text>
              <text x="${x + 82}" y="921" class="cjk" fill="#000000" font-size="15" font-weight="700">${escapeXml(role)}</text>
              <text x="${x + 18}" y="969" class="en" fill="#000000" font-size="22" font-weight="700" letter-spacing="1">${code}</text>
            `;
          })
          .join('')}
      `),
      left: 0,
      top: 0,
    },
    {
      input: await sharp('public/brand/ai-door-mark.png')
        .resize({ width: 86 })
        .png()
        .toBuffer(),
      left: 72,
      top: 48,
    },
    ...screenBuffers.map((input, index) => ({
      input,
      left: START_X + index * (FRAME_WIDTH + GAP) + FRAME_PADDING,
      top: SCREEN_Y + FRAME_PADDING,
    })),
  ])
  .jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
  .toFile(outputPath);

console.log(
  JSON.stringify({ outputPath, locale, width: result.width, height: result.height, size: result.size }),
);
