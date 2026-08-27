import sharp from 'sharp';

const [outputPath, ...screenPaths] = process.argv.slice(2);

if (!outputPath || screenPaths.length !== 5) {
  throw new Error('Usage: node create-ui-flow-board.mjs OUTPUT SCREEN1 SCREEN2 SCREEN3 SCREEN4 SCREEN5');
}

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

const stages = [
  { title: '시작', description: '도움 방식을 선택해요' },
  { title: '문서 촬영', description: '공문서를 보여줘요' },
  { title: 'AI 확인', description: '종류와 기관을 확인해요' },
  { title: '같이 해결', description: '한 단계씩 처리해요' },
  { title: '혼자 연습', description: '힌트 없이 다시 해봐요' },
];

const palette = [
  { name: 'Light Pink', code: '#F7C6D9', text: '#241C21' },
  { name: 'Rose White', code: '#FFF8FB', text: '#241C21' },
  { name: 'Blush Mist', code: '#FCE7F0', text: '#241C21' },
  { name: 'Deep Rose', code: '#9E2F61', text: '#FFFFFF' },
  { name: 'Mulberry', code: '#7A1F49', text: '#FFFFFF' },
  { name: 'Ink', code: '#241C21', text: '#FFFFFF' },
];

const svg = (body) => Buffer.from(`
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .ko { font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; }
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
  const image = sharp(path);
  const metadata = await image.metadata();
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

const background = await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 3,
    background: '#fff8fb',
  },
})
  .composite([
    {
      input: svg(`
        <circle cx="1810" cy="80" r="190" fill="#FCE7F0"/>
        <circle cx="1740" cy="100" r="96" fill="#F7C6D9" opacity="0.55"/>
        <path d="M0 705 C390 640 630 750 950 694 C1250 642 1500 690 1920 625 L1920 1080 L0 1080 Z" fill="#FFFFFF"/>

        <text x="176" y="75" class="en" fill="#7A1F49" font-size="22" font-weight="800" letter-spacing="2">AI DOOR · USER FLOW</text>
        <text x="176" y="124" class="ko" fill="#241C21" font-size="42" font-weight="800">AI와 함께 배우고, 다음에는 스스로</text>
        <text x="176" y="159" class="ko" fill="#5F4A54" font-size="21">공문서 이해부터 반복 연습까지 이어지는 포용적 AI 경험</text>

        ${stages.map((stage, index) => {
          const x = START_X + index * (FRAME_WIDTH + GAP);
          const center = x + FRAME_WIDTH / 2;
          return `
            <circle cx="${x + 22}" cy="194" r="19" fill="#9E2F61"/>
            <text x="${x + 22}" y="201" class="en" text-anchor="middle" fill="#FFFFFF" font-size="18" font-weight="800">${index + 1}</text>
            <text x="${x + 51}" y="201" class="ko" fill="#241C21" font-size="24" font-weight="800">${stage.title}</text>
            <rect x="${x}" y="${SCREEN_Y}" width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}" rx="31" fill="#FFFFFF" stroke="#F7C6D9" stroke-width="4"/>
            <text x="${center}" y="662" class="ko" text-anchor="middle" fill="#5F4A54" font-size="18" font-weight="700">${stage.description}</text>
            ${index < 4 ? `<path d="M${x + FRAME_WIDTH + 12} 422 H${x + FRAME_WIDTH + GAP - 14}" stroke="#9E2F61" stroke-width="4" stroke-linecap="round"/><path d="M${x + FRAME_WIDTH + GAP - 24} 412 L${x + FRAME_WIDTH + GAP - 14} 422 L${x + FRAME_WIDTH + GAP - 24} 432" fill="none" stroke="#9E2F61" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
          `;
        }).join('')}

        <text x="72" y="747" class="en" fill="#7A1F49" font-size="20" font-weight="800" letter-spacing="2">COLOR SYSTEM</text>
        <text x="72" y="785" class="ko" fill="#241C21" font-size="30" font-weight="800">따뜻하고 신뢰감 있는 Light Pink 팔레트</text>
        <text x="72" y="816" class="ko" fill="#5F4A54" font-size="18">연한 핑크는 배경과 안내, 진한 로즈는 중요한 행동과 높은 대비에 사용합니다.</text>

        ${palette.map((color, index) => {
          const swatchWidth = 276;
          const swatchGap = 20;
          const x = 72 + index * (swatchWidth + swatchGap);
          return `
            <rect x="${x}" y="850" width="${swatchWidth}" height="142" rx="22" fill="${color.code}" ${color.code === '#FFF8FB' ? 'stroke="#E7CFDA" stroke-width="3"' : ''}/>
            <text x="${x + 20}" y="912" class="en" fill="${color.text}" font-size="21" font-weight="800">${color.name}</text>
            <text x="${x + 20}" y="951" class="en" fill="${color.text}" font-size="25" font-weight="700" letter-spacing="1">${color.code}</text>
          `;
        }).join('')}
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

console.log(JSON.stringify({ outputPath, width: background.width, height: background.height, size: background.size }));
