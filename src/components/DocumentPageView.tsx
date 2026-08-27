'use client';

/**
 * Renders a synthetic document as SVG, optionally highlighting one block.
 *
 * The highlight is driven by the same coordinates the fixture used to build its
 * evidence bounding box, so "원문 위치 보기" always lands on the right line.
 */
import type { Region } from '@/lib/analysis/schema';
import type {
  BlockStyle,
  SyntheticDocumentPage,
} from '@/lib/fixtures/document-page';
import { maskText } from '@/lib/privacy/mask';

interface DocumentPageViewProps {
  page: SyntheticDocumentPage;
  /** Normalised rect to highlight, e.g. from evidence.region. */
  highlight?: Region | null;
  /** Accessible description of the page. */
  label: string;
  /**
   * Star out personal-data-shaped strings before drawing.
   *
   * Practice pages are already written with ●●● in place of names and numbers;
   * this is a second pass so that a page edited later cannot quietly start
   * showing a number-shaped value on the review screen.
   */
  mask?: boolean;
}

const STYLE_ATTRS: Record<
  BlockStyle,
  { size: number; weight: number; fill: string; letterSpacing?: number }
> = {
  org: { size: 30, weight: 700, fill: '#1b2027' },
  title: { size: 36, weight: 700, fill: '#1b2027' },
  subtitle: { size: 20, weight: 400, fill: '#4a5560' },
  sectionLabel: { size: 22, weight: 700, fill: '#1b2027' },
  fieldLabel: { size: 22, weight: 600, fill: '#4a5560' },
  fieldValue: { size: 24, weight: 500, fill: '#1b2027' },
  fieldValueStrong: { size: 28, weight: 700, fill: '#1b2027' },
  body: { size: 21, weight: 400, fill: '#1b2027' },
  fine: { size: 17, weight: 400, fill: '#6b7785' },
  amountHuge: { size: 58, weight: 700, fill: '#1b2027' },
  onFill: { size: 24, weight: 700, fill: '#ffffff' },
};

/**
 * Deterministic bar widths for a fake barcode.
 *
 * A barcode on a payment slip is the thing the whole Japanese scenario turns
 * on, so it has to look like one - but it must not encode anything, hence a
 * fixed pseudo-random pattern rather than a real symbology.
 */
function barcodeBars(width: number): { x: number; w: number }[] {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  let seed = 7;
  while (x < width - 4) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const w = 2 + (seed % 3) * 2;
    bars.push({ x, w });
    x += w + 2 + ((seed >> 8) % 3);
  }
  return bars;
}

export function DocumentPageView({
  page,
  highlight,
  label,
  mask = false,
}: DocumentPageViewProps) {
  return (
    <div className="doc-frame">
      <svg
        viewBox={`0 0 ${page.width} ${page.height}`}
        role="img"
        aria-label={label}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Paper. Fixed light colours: this is a picture of a piece of paper,
            so it stays paper-coloured in dark mode rather than inverting. */}
        <rect
          x="0"
          y="0"
          width={page.width}
          height={page.height}
          fill={page.background ?? '#ffffff'}
        />
        <rect
          x="0"
          y="0"
          width={page.width}
          height={page.height}
          fill="none"
          stroke="#d5dbe1"
          strokeWidth="2"
        />

        {(page.shapes ?? []).map((shape) => {
          if (shape.kind === 'barcode') {
            return (
              <g key={shape.id}>
                <rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill="#ffffff"
                />
                {barcodeBars(shape.width).map((bar, index) => (
                  <rect
                    key={`${shape.id}-${index}`}
                    x={shape.x + bar.x}
                    y={shape.y}
                    width={bar.w}
                    height={shape.height}
                    fill="#1b2027"
                  />
                ))}
              </g>
            );
          }
          const fill =
            shape.kind === 'outline'
              ? 'none'
              : (shape.fill ?? (shape.kind === 'button' ? '#10508c' : '#eef2f6'));
          return (
            <rect
              key={shape.id}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              rx={shape.kind === 'button' ? 12 : 6}
              fill={fill}
              stroke={shape.kind === 'outline' ? '#8c98a4' : 'none'}
              strokeWidth={shape.kind === 'outline' ? 2 : 0}
            />
          );
        })}

        {page.rules.map((y) => (
          <line
            key={`rule-${y}`}
            x1={56}
            y1={y}
            x2={page.width - 56}
            y2={y}
            stroke="#d5dbe1"
            strokeWidth="2"
          />
        ))}

        {highlight ? (
          <g>
            <rect
              x={highlight.x * page.width - 8}
              y={highlight.y * page.height - 4}
              width={highlight.width * page.width + 16}
              height={highlight.height * page.height + 8}
              fill="#ffe680"
              fillOpacity="0.55"
              stroke="#a01b1b"
              strokeWidth="4"
              rx="8"
            />
          </g>
        ) : null}

        {page.blocks.map((block) => {
          const style = STYLE_ATTRS[block.style];
          return (
            <text
              key={block.id}
              x={block.x}
              y={block.y + style.size}
              fontSize={style.size}
              fontWeight={style.weight}
              fill={style.fill}
              fontFamily="'Malgun Gothic', 'Noto Sans KR', 'Noto Sans JP', sans-serif"
            >
              {mask ? maskText(block.text) : block.text}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
